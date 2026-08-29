module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { text, direction, intensity } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'Type something first.' });
    return;
  }

  if (text.length > 500) {
    res.status(400).json({ error: 'Keep it under 500 characters.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing an API key. Add ANTHROPIC_API_KEY in your hosting provider settings.' });
    return;
  }

  const systemPrompt = buildSystemPrompt(direction, intensity);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: text.trim() }],
      }),
    });

    if (!response.ok) {
      res.status(502).json({ error: 'Translation failed. Try again in a moment.' });
      return;
    }

    const data = await response.json();
    const raw = (data.content || [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    const parsed = parseModelOutput(raw);

    if (!parsed.translation) {
      res.status(502).json({ error: 'Got an empty result. Try again.' });
      return;
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong reaching the translator.' });
  }
}

function buildSystemPrompt(direction, intensity) {
  if (direction === 'toPlain') {
    return [
      'You decode modern internet slang into plain, clear English.',
      'Respond only with strict JSON in this exact shape: {"translation": "...", "comment": "..."}',
      'translation: the plain-English meaning of the input, one or two sentences, no slang, no quotes around it.',
      'comment: one short, dry, funny one-liner reacting to having to decode this, under 15 words, written like a cheeky app narrator.',
      'No preamble, no markdown formatting, no code fences, no extra keys.',
    ].join(' ');
  }

  const flavor = intensity === 'unhinged'
    ? 'Go maximally over the top: dense, exaggerated, borderline unreadable modern internet slang, piling on terms for comic effect.'
    : 'Keep it light: one or two clearly funny slang substitutions, the rest stays very readable.';

  return [
    'You translate plain English into exaggerated, comedic modern internet slang, gently poking fun at extremely-online speech patterns.',
    flavor,
    'Keep it generic-internet and silly. Never invoke or stereotype any real ethnic, cultural, national, or regional group or dialect.',
    'Respond only with strict JSON in this exact shape: {"translation": "...", "comment": "..."}',
    'translation: the slangified version of the input, no quotes around it.',
    'comment: one short, funny one-liner reacting to the translation, under 15 words, written like a cheeky app narrator.',
    'No preamble, no markdown formatting, no code fences, no extra keys.',
  ].join(' ');
}

function parseModelOutput(raw) {
  try {
    const cleaned = raw.replace(/^```json\s*|^```\s*|```$/g, '').trim();
    const obj = JSON.parse(cleaned);
    return {
      translation: String(obj.translation || '').slice(0, 500),
      comment: String(obj.comment || '').slice(0, 200),
    };
  } catch (err) {
    return { translation: raw.slice(0, 500), comment: '' };
  }
}

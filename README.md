# Slanguage

A one-page site that translates plain English into over-the-top modern
slang, or decodes confusing slang back into plain English.

## What's in here

- `index.html` — the whole front end. No build step, no framework.
- `api/translate.js` — a serverless function that calls Claude to do the
  actual translation. Your API key lives here, on the server, never in
  the browser.
- `package.json` — tells the host this is a Node project.

## Deploy it (Vercel, free tier)

1. Go to vercel.com and sign up or log in.
2. Create a new project and upload this folder (or push it to a GitHub
   repo first and import that repo — either works).
3. Before your first deploy, add an environment variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from platform.claude.com (Console → API Keys)
4. Deploy. Vercel will give you a live link like `slanguage.vercel.app`.

Netlify works the same way — same three files, same environment
variable name, add it under Site settings → Environment variables
before deploying.

## Testing it once live

Try a few things:
- A plain sentence, Mild, translate.
- The same sentence, Unhinged, translate.
- Swap direction, paste in a confusing slang phrase, decode.
- Tap Copy and Share to confirm both work on your phone.

## Cost note

Each translation is a small API call, priced per token by Anthropic.
With the current Haiku pricing this is a fraction of a cent per use.
Keep an eye on usage in the Anthropic console early on so nothing
surprises you.

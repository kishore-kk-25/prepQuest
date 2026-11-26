# Deploying

The app is static files plus an **optional** AI server. Pick one option.

## Option A: claude.ai (hosted, AI included)

Publish the files as a claude.ai artifact. Inside claude.ai the app automatically uses:

- Claude for AI (`window.claude.use('sample')`)
- Claude's voice for the tutor (`tts`) and dictation for spoken answers (`dictation`)

Nothing to configure, and no API key needed.

## Option B: GitHub Pages (free, static)

1. Push the repo to GitHub.
2. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then pick `main` and `/ (root)`.
3. Open `https://<user>.github.io/<repo>/`.

On GitHub Pages there is no server, so the app runs in **demo mode**:

- Subject tests work fully: marking from the answer key, lessons from the verified explanations, roadmap and study links.
- Role interviews use 15 general questions with simple scoring.
- The tutor's voice uses the browser's built-in speech (Chrome, Edge and Safari support it).

To add AI, also run Option C somewhere and set `CONFIG.ai.proxyUrl` to its full URL. You'd also need to allow cross-origin requests in `server.js`; the simplest path is to serve the app from that server, as in Option C.

## Option C: your own Node server (AI on any host)

```bash
cp .env.example .env    # add ANTHROPIC_API_KEY
npm run start:env       # or: ANTHROPIC_API_KEY=... npm start
```

`server/server.js` serves the app and exposes `/api/ai`, which forwards prompts to the Anthropic Messages API. It works on any host that runs Node 18+ (Render, Railway, Fly.io, a VPS…). Set `ANTHROPIC_API_KEY` as an environment variable there.

Built-in protections: 20 AI requests per IP per minute, 40,000-character prompt limit, and the key never reaches the browser. For a public launch, add sign-in or a stricter rate limit, because anyone who can open the page can use your key's credit.

## Checking it works

The badge in the top-right of the top bar shows the mode: **AI: Claude**, **AI: connected** or **Demo mode (no AI)**.

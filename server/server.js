// Optional local server: serves the app AND gives it AI outside claude.ai.
//
//   ANTHROPIC_API_KEY=sk-... npm start      →  http://localhost:3000
//
// GET  /api/ai  → {"ok": true}            (the app checks this to turn AI on)
// POST /api/ai  → {"prompt": "..."}  →  {"text": "..."}
//
// No dependencies: uses Node 18+ built-in http and fetch.
// Keep your API key on the server. Never put it in the browser code.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT) || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const MAX_PROMPT = 40_000;          // characters
const LIMIT_PER_MIN = 20;           // AI requests per IP per minute

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/markdown; charset=utf-8' };
const hits = new Map();

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'content-type': type });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function rateLimited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now); hits.set(ip, list);
  return list.length > LIMIT_PER_MIN;
}

async function readBody(req) {
  let data = '';
  for await (const chunk of req) { data += chunk; if (data.length > MAX_PROMPT * 2) throw new Error('Body too large'); }
  return JSON.parse(data || '{}');
}

async function handleAI(req, res) {
  if (req.method === 'GET') return send(res, API_KEY ? 200 : 503, { ok: !!API_KEY });
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!API_KEY) return send(res, 503, { error: 'ANTHROPIC_API_KEY is not set' });
  if (rateLimited(req.socket.remoteAddress)) return send(res, 429, { error: 'Too many requests' });
  try {
    const { prompt } = await readBody(req);
    if (typeof prompt !== 'string' || !prompt || prompt.length > MAX_PROMPT) return send(res, 400, { error: 'Invalid prompt' });
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 8000, messages: [{ role: 'user', content: prompt }] }),
    });
    const j = await r.json();
    if (!r.ok) return send(res, 502, { error: j?.error?.message || 'AI request failed' });
    send(res, 200, { text: (j.content || []).map((c) => c.text || '').join('') });
  } catch (err) {
    send(res, 500, { error: String(err.message || err) });
  }
}

async function handleStatic(req, res) {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = normalize(join(ROOT, path === '/' ? 'index.html' : path));
  if (!file.startsWith(ROOT) || /[\\/](server|node_modules|\.git)[\\/]/.test(file)) return send(res, 404, 'Not found', 'text/plain');
  try {
    send(res, 200, await readFile(file), TYPES[extname(file)] || 'application/octet-stream');
  } catch {
    send(res, 404, 'Not found', 'text/plain');
  }
}

http.createServer((req, res) => (req.url.startsWith('/api/ai') ? handleAI(req, res) : handleStatic(req, res)))
  .listen(PORT, () => console.log(`App running at http://localhost:${PORT}  (AI ${API_KEY ? 'on' : 'off: set ANTHROPIC_API_KEY'})`));

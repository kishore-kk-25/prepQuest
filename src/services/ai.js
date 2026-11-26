// AI adapter. One function, askJSON(), hides which AI backend is used:
//   claude → the Claude artifact runtime (window.claude.use('sample'))
//   proxy  → your own server at CONFIG.ai.proxyUrl (see server/server.js)
//   demo   → no AI; callers fall back to built-in feedback
import { CONFIG } from '../config.js';

let mode = 'demo';
let sample = null;

export const aiMode = () => mode;
export const aiAvailable = () => mode !== 'demo';

export async function initAI() {
  const want = CONFIG.ai.provider;
  if ((want === 'auto' || want === 'claude') && window.claude?.use) {
    try {
      sample = await window.claude.use('sample');
      if (sample) return (mode = 'claude');
    } catch { /* not available here */ }
  }
  if ((want === 'auto' || want === 'proxy') && CONFIG.ai.proxyUrl) {
    try {
      const r = await fetch(CONFIG.ai.proxyUrl, { method: 'GET' });
      const j = await r.json();
      if (r.ok && j.ok) return (mode = 'proxy');
    } catch { /* no proxy running */ }
  }
  return (mode = 'demo');
}

async function rawText(prompt, tier) {
  if (mode === 'claude') {
    const r = await sample(prompt, { modelTier: tier, cache: false });
    return r.text;
  }
  if (mode === 'proxy') {
    const r = await fetch(CONFIG.ai.proxyUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt, tier }),
    });
    if (!r.ok) throw new Error(`AI server error ${r.status}`);
    return (await r.json()).text;
  }
  throw new Error('AI is not available (demo mode)');
}

/** Pull the first JSON object or array out of a model reply. */
export function parseJSON(text) {
  const start = text.search(/[[{]/);
  const end = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
  if (start < 0 || end < start) throw new Error('No JSON in AI reply');
  return JSON.parse(text.slice(start, end + 1));
}

/**
 * Ask the AI and get parsed JSON back. Retries once after a short pause.
 * @param {string} prompt
 * @param {{tier?: 'quick'|'default'|'complex'}} [opts]
 */
export async function askJSON(prompt, { tier = 'default' } = {}) {
  const full = `${prompt}\n\nReply with ONLY valid JSON, no prose, no code fences.`;
  try {
    return parseJSON(await rawText(full, tier));
  } catch (err) {
    if (mode === 'demo' || err?.code === 'not_granted') throw err;
    await new Promise((r) => setTimeout(r, 3000));
    return parseJSON(await rawText(full, tier));
  }
}

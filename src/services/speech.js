// Voice (text-to-speech) and dictation (speech-to-text) adapters.
// Inside claude.ai they use Claude's voice and dictation; on any other host
// they use the browser's Web Speech API. Both return null if nothing works,
// and the UI simply hides the voice / mic buttons.
import { CONFIG } from '../config.js';

/**
 * Voice interface used by the video player:
 *   speak(text, {rate}) → Promise (resolves when finished, rejects if stopped)
 *   stop(), pause(), resume(), setRate(r)
 *   onState(cb(isSpeaking)), onProgress(cb({ms}|{frac}))
 */
export async function createVoice() {
  if (window.claude?.use) {
    try {
      const t = await window.claude.use('tts');
      if (t) {
        return {
          kind: 'claude',
          speak: (text, { rate = 1 } = {}) => t.speak(text.slice(0, 2000), { rate, voice: CONFIG.coach.voice }),
          stop: () => { try { t.stop(); } catch {} },
          pause: () => { try { t.pause(); } catch {} },
          resume: () => { try { t.resume(); } catch {} },
          setRate: (r) => { try { t.setRate(r); } catch {} },
          onState: (cb) => t.onState(({ state }) => cb(state === 'speaking')),
          onProgress: (cb) => t.onPosition(({ ms }) => cb({ ms })),
        };
      }
    } catch { /* fall through */ }
  }
  if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) return webVoice();
  return null;
}

function webVoice() {
  const synth = window.speechSynthesis;
  let stateCb = () => {};
  let progCb = () => {};
  return {
    kind: 'web',
    speak(text, { rate = 1 } = {}) {
      synth.cancel();
      return new Promise((resolve, reject) => {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = rate;
        u.onstart = () => stateCb(true);
        u.onboundary = (e) => progCb({ frac: e.charIndex / Math.max(1, text.length) });
        u.onend = () => { stateCb(false); resolve(); };
        u.onerror = (e) => { stateCb(false); reject({ code: e.error || 'error' }); };
        synth.speak(u);
      });
    },
    stop: () => synth.cancel(),
    pause: () => { synth.pause(); stateCb(false); },
    resume: () => { synth.resume(); stateCb(true); },
    setRate: () => {}, // applies from the next scene
    onState: (cb) => { stateCb = cb; },
    onProgress: (cb) => { progCb = cb; },
  };
}

/**
 * Dictation interface used by the answer box:
 *   start() → Promise, stop() → Promise
 *   onFinal(cb(text)), onPartial(cb(text)), onState(cb(isListening))
 */
export async function createDictation() {
  if (window.claude?.use) {
    try {
      const d = await window.claude.use('dictation');
      if (d) {
        return {
          kind: 'claude',
          start: () => d.start(),
          stop: () => d.stop(),
          onFinal: (cb) => d.onFinal(({ text }) => cb(text)),
          onPartial: (cb) => d.onPartial(({ text }) => cb(text)),
          onState: (cb) => d.onState(({ state }) => cb(state === 'listening')),
        };
      }
    } catch { /* fall through */ }
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.continuous = true;
  rec.interimResults = true;
  let fin = () => {}, part = () => {}, st = () => {};
  rec.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const text = e.results[i][0].transcript;
      e.results[i].isFinal ? fin(text) : part(text);
    }
  };
  rec.onstart = () => st(true);
  rec.onend = () => st(false);
  return {
    kind: 'web',
    start: () => { rec.start(); return Promise.resolve(); },
    stop: () => { rec.stop(); return Promise.resolve(); },
    onFinal: (cb) => { fin = cb; },
    onPartial: (cb) => { part = cb; },
    onState: (cb) => { st = cb; },
  };
}

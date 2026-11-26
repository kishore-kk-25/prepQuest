// The "video" player: a studio stage where the coach teaches scene by scene.
// A scene is { tag, title, bullets[], board[], say, mood, badge?, links? }.
// The coach speaks `say` (voice if available, otherwise timed subtitles),
// while bullets and board lines appear in step with the speech.
import { CONFIG } from '../config.js';
import { esc, scoreColor, linkPill } from './dom.js';
import { createCoach } from './coach.js';

const WPM = 155; // speaking speed used to time subtitles

export function createPlayer(voice) {
  const ov = document.createElement('div');
  ov.className = 'ov hide';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.innerHTML = `
    <div class="player">
      <div class="p-top"><div><b class="p-title"></b><div class="p-sub"></div></div><button class="p-x">Close ✕</button></div>
      <div class="stage"><div class="stage-coach"></div><div class="slide"></div><div class="subs" aria-live="polite"></div></div>
      <div class="p-ctrl">
        <button class="p-prev" aria-label="Previous scene">⏮</button>
        <button class="p-pp" aria-label="Play or pause">❚❚</button>
        <button class="p-next" aria-label="Next scene">⏭</button>
        <div class="p-chap"></div><span class="p-count"></span>
        <select class="p-rate" aria-label="Speed"><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select>
        <button class="p-voice" aria-label="Voice on or off"></button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const q = (s) => ov.querySelector(s);
  const coach = createCoach();
  q('.stage-coach').appendChild(coach.el);

  const S = { scenes: [], i: 0, playing: false, token: 0, ticker: null, elapsed: 0, prog: null, dur: 1, useVoice: false, voiceOn: true, rate: 1, ended: false };

  if (voice) {
    voice.onState((speaking) => { if (S.useVoice) coach.talk(speaking && S.playing); });
    voice.onProgress((p) => { if (S.useVoice) S.prog = p; });
  } else q('.p-voice').classList.add('hide');

  const words = (t) => String(t || '').split(/\s+/).filter(Boolean);

  function renderScene(sc) {
    const slide = q('.slide');
    slide.style.animation = 'none'; void slide.offsetWidth; slide.style.animation = '';
    const badge = sc.badge ? `<span class="pill" style="background:${scoreColor(sc.badge.pct)}">${esc(sc.badge.text)}</span>` : '';
    const board = (sc.board || []).filter(Boolean);
    slide.innerHTML = `
      <div class="slide-tag">${esc(sc.tag || '')} · Scene ${S.i + 1} of ${S.scenes.length} ${badge}</div>
      <h3>${esc(sc.title)}</h3>
      ${board.length ? `<div class="board">${board.map((l) => `<div class="b-line">${esc(l)}</div>`).join('')}</div>` : ''}
      <ul>${(sc.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      ${(sc.links || []).length ? `<div class="slide-links">${sc.links.map(linkPill).join('')}</div>` : ''}`;
    q('.subs').innerHTML = words(sc.say).map((w) => `<span>${esc(w)} </span>`).join('');
  }

  function fraction() {
    if (S.useVoice && S.prog) return S.prog.frac != null ? S.prog.frac : S.prog.ms / S.dur;
    return S.elapsed / S.dur;
  }

  function tick() {
    if (!S.playing) return;
    if (!S.useVoice) { S.elapsed += 100; if (S.elapsed >= S.dur) return finish(S.token); }
    const f = Math.min(1, fraction());
    const ws = [...q('.subs').children];
    const n = Math.ceil(f * ws.length);
    ws.forEach((w, k) => w.classList.toggle('on', k < n));
    const reveal = [...q('.slide').querySelectorAll('.b-line, li')];
    reveal.forEach((el, k) => el.classList.toggle('in', f >= k / (reveal.length + 0.5)));
  }

  function stopAll() {
    S.token++; S.playing = false; clearInterval(S.ticker); coach.talk(false);
    if (voice) voice.stop();
  }

  function run(i) {
    stopAll();
    S.i = Math.max(0, Math.min(i, S.scenes.length - 1));
    S.ended = false;
    const tk = ++S.token, sc = S.scenes[S.i];
    coach.setMood(sc.mood); renderScene(sc);
    S.elapsed = 0; S.prog = null; S.playing = true;
    S.dur = (words(sc.say).length * 60000) / (WPM * S.rate) + 800;
    S.useVoice = !!(voice && S.voiceOn);
    ui(); S.ticker = setInterval(tick, 100);
    if (S.useVoice) {
      voice.speak(String(sc.say || ''), { rate: S.rate }).then(() => finish(tk)).catch((e) => {
        if (tk !== S.token) return;               // stopped on purpose
        if (e?.code === 'not_granted') { voice = null; q('.p-voice').classList.add('hide'); }
        S.useVoice = false; coach.talk(S.playing); // carry on with timed subtitles
      });
    } else coach.talk(true);
  }

  function finish(tk) {
    if (tk !== S.token) return;
    clearInterval(S.ticker); coach.talk(false);
    ov.querySelectorAll('.subs span, .slide li, .b-line').forEach((el) => el.classList.add('on', 'in'));
    if (S.i < S.scenes.length - 1) setTimeout(() => tk === S.token && run(S.i + 1), 900);
    else { S.playing = false; S.ended = true; coach.setMood('happy'); ui(); }
  }

  function pause() {
    if (!S.playing) return;
    S.playing = false; coach.talk(false);
    if (S.useVoice) voice.pause();
    ui();
  }
  function resume() {
    if (S.ended) return run(0);
    S.playing = true;
    if (S.useVoice) voice.resume(); else coach.talk(true);
    ui();
  }

  function ui() {
    q('.p-pp').textContent = S.ended ? '↺' : S.playing ? '❚❚' : '▶';
    q('.p-count').textContent = `${S.i + 1} / ${S.scenes.length}`;
    q('.p-chap').innerHTML = S.scenes.map((s, k) => `<button data-k="${k}" class="${k < S.i ? 'done' : k === S.i ? 'now' : ''}" title="${esc(s.title)}" aria-label="Scene ${k + 1}: ${esc(s.title)}"></button>`).join('');
    q('.p-voice').textContent = S.voiceOn ? '🔊 Voice' : '🔇 Muted';
  }

  function close() { stopAll(); ov.classList.add('hide'); document.body.style.overflow = ''; }

  q('.p-x').onclick = close;
  q('.p-pp').onclick = () => (S.playing ? pause() : resume());
  q('.p-prev').onclick = () => run(S.i - 1);
  q('.p-next').onclick = () => run(S.i + 1);
  q('.p-chap').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) run(Number(b.dataset.k)); });
  q('.p-rate').onchange = (e) => { S.rate = Number(e.target.value); if (S.useVoice) voice.setRate(S.rate); S.dur = (words(S.scenes[S.i].say).length * 60000) / (WPM * S.rate) + 800; };
  q('.p-voice').onclick = () => { S.voiceOn = !S.voiceOn; run(S.i); };
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); if (e.target.closest('.slide a')) pause(); });
  document.addEventListener('keydown', (e) => {
    if (ov.classList.contains('hide')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') run(S.i + 1);
    else if (e.key === 'ArrowLeft') run(S.i - 1);
    else if (e.key === ' ' && e.target.tagName !== 'SELECT') { e.preventDefault(); q('.p-pp').click(); }
  });

  return {
    /** Open the player and start playing. */
    open(scenes, title, subtitle = '') {
      if (!scenes?.length) return;
      S.scenes = scenes;
      q('.p-title').textContent = title || `${CONFIG.coach.name} explains`;
      q('.p-sub').textContent = subtitle;
      ov.classList.remove('hide');
      document.body.style.overflow = 'hidden';
      run(0);
      q('.p-pp').focus();
    },
    close,
  };
}

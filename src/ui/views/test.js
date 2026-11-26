// Step 2: answer the questions. Multiple choice for subjects, text or voice for roles.
// Keyboard: 1–4 or A–D picks an option, ← → move between questions, F flags.
import { isMCQ, answeredCount } from '../../services/session.js';
import { esc, fmtTime } from '../dom.js';

export function renderTest(root, app) {
  const plan = app.plan, mcq = isMCQ(plan), total = plan.questions.length;
  let shownAt = Date.now(), confirmSubmit = false;

  root.innerHTML = `
  <div class="wrap">
    <section class="card">
      <div class="row between"><div class="meta" id="tmeta"></div><div class="meta" id="clock" aria-label="Time spent"></div></div>
      <div class="progress"><i id="bar"></i></div>
      <div class="palette" id="pal" aria-label="Jump to question"></div>
      <div class="meta" id="qmeta"></div>
      <h2 class="q" id="qtext"></h2>
      <p class="hint" id="qhint"></p>
      <div class="opts ${mcq ? '' : 'hide'}" id="opts"></div>
      <div class="${mcq ? 'hide' : ''}" id="textAns">
        <label for="ans">Your answer</label>
        <div class="ansbox"><textarea id="ans" placeholder="Answer as you would out loud. Bullet points are fine."></textarea>
        <button class="mic ${app.dictation ? '' : 'hide'}" id="mic" title="Speak your answer" aria-label="Speak your answer">🎙</button></div>
      </div>
      <div class="row" style="margin-top:16px">
        <button class="btn ghost" id="prev">← Previous</button>
        <button class="btn" id="next">Next →</button>
        <button class="btn ghost" id="flag">⚑ Review later</button>
        <span class="grow"></span>
        <button class="btn play" id="submit">Submit all ${total}</button>
      </div>
      <div class="status" id="status"></div>
      <p class="note">${mcq ? 'Shortcuts: 1–4 to pick, ← → to move, F to flag.' : 'Shortcuts: Ctrl + → / ← to move between questions.'} Your answers save automatically.</p>
    </section>
  </div>`;

  const $ = (s) => root.querySelector(s);
  const persist = () => app.save();

  function leave() { plan.times[plan.current] += (Date.now() - shownAt) / 1000; persist(); }
  function keepText() {
    const v = $('#ans').value.trim();
    plan.answers[plan.current] = v || null;
    persist(); palette();
  }

  function palette() {
    $('#pal').innerHTML = plan.questions.map((_, k) => {
      const a = plan.answers[k] != null && plan.answers[k] !== '';
      return `<button data-k="${k}" class="${a ? 'ans' : ''} ${plan.flags[k] ? 'flag' : ''} ${k === plan.current ? 'now' : ''}" aria-label="Question ${k + 1}${a ? ', answered' : ''}${plan.flags[k] ? ', flagged' : ''}">${k + 1}</button>`;
    }).join('');
    const n = answeredCount(plan);
    $('#tmeta').textContent = `${plan.title} · ${n} of ${total} answered`;
    $('#bar').style.width = `${(n / total) * 100}%`;
  }

  function show() {
    shownAt = Date.now();
    const q = plan.questions[plan.current];
    palette();
    $('#qmeta').textContent = `Question ${plan.current + 1} of ${total} · ${q.section || ''}`;
    $('#qtext').textContent = q.q;
    $('#qhint').textContent = mcq ? `Topic: ${q.topic}` : `Tip: ${q.hint || 'Give a concrete example and end with a result.'}`;
    if (mcq) {
      $('#opts').innerHTML = q.options.map((o, k) => `<button class="opt" data-k="${k}" aria-pressed="${plan.answers[plan.current] === k}"><i>${'ABCD'[k]}</i><span>${esc(o)}</span></button>`).join('');
    } else $('#ans').value = plan.answers[plan.current] || '';
    $('#prev').disabled = plan.current === 0;
    $('#next').classList.toggle('hide', plan.current === total - 1);
    $('#flag').textContent = plan.flags[plan.current] ? '⚑ Flagged' : '⚑ Review later';
    $('#status').textContent = '';
    if (!mcq) $('#ans').focus();
  }

  function go(k) { if (k < 0 || k >= total) return; leave(); plan.current = k; show(); }

  function pick(k) {
    plan.answers[plan.current] = k;
    root.querySelectorAll('.opt').forEach((o) => o.setAttribute('aria-pressed', Number(o.dataset.k) === k));
    persist(); palette();
    if (plan.current < total - 1) setTimeout(() => go(plan.current + 1), 350);
  }

  $('#opts').addEventListener('click', (e) => { const b = e.target.closest('.opt'); if (b) pick(Number(b.dataset.k)); });
  $('#ans').addEventListener('input', keepText);
  $('#pal').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) go(Number(b.dataset.k)); });
  $('#prev').onclick = () => go(plan.current - 1);
  $('#next').onclick = () => go(plan.current + 1);
  $('#flag').onclick = () => { plan.flags[plan.current] = !plan.flags[plan.current]; persist(); show(); };

  // Voice answers
  const d = app.dictation, mic = $('#mic');
  if (d) {
    // main.js registers the dictation listeners once and forwards them here.
    app.onDictation = {
      final: (text) => { const a = $('#ans'); if (!a || !a.isConnected) return; a.value = `${a.value.trim()} ${text}`.trim(); keepText(); },
      partial: (text) => { const s = $('#status'); if (s) s.textContent = `Hearing: ${text}`; },
      state: (on) => { if (!mic.isConnected) return; mic.classList.toggle('on', on); if (!on) $('#status').textContent = ''; },
    };
    mic.onclick = () => {
      if (mic.classList.contains('on')) return d.stop().catch(() => {});
      d.start().catch((e) => { if (e?.code === 'not_granted') mic.classList.add('hide'); });
    };
  }

  $('#submit').onclick = async () => {
    if (d && mic.classList.contains('on')) { try { await d.stop(); } catch {} }
    if (!mcq) keepText();
    const left = total - answeredCount(plan);
    if (left && !confirmSubmit) {
      confirmSubmit = true;
      $('#status').innerHTML = `<span class="err">${left} question${left > 1 ? 's are' : ' is'} unanswered. Press Submit again to continue anyway; they will still be explained.</span>`;
      return;
    }
    leave();
    app.go('assessing');
  };

  const onKey = (e) => {
    if (!root.contains($('#qtext'))) return document.removeEventListener('keydown', onKey);
    if (document.querySelector('.ov:not(.hide)')) return;
    const typing = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
    if (mcq && !typing) {
      const k = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
      if (k >= 0 && e.key.length === 1) return pick(k);
      if (e.key === 'f' || e.key === 'F') return $('#flag').click();
    }
    if (e.key === 'ArrowRight' && (!typing || e.ctrlKey)) go(plan.current + 1);
    if (e.key === 'ArrowLeft' && (!typing || e.ctrlKey)) go(plan.current - 1);
  };
  document.addEventListener('keydown', onKey);

  const clock = setInterval(() => {
    const el = $('#clock'); if (!el) return clearInterval(clock);
    el.textContent = `⏱ ${fmtTime(plan.times.reduce((a, b) => a + b, 0) + (Date.now() - shownAt) / 1000)}`;
  }, 1000);

  show();
}

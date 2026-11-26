// Step 3: review. Overall score, score per section, and a teaching video
// for every question.
import { CONFIG } from '../../config.js';
import { isMCQ, overallPct, sectionStats } from '../../services/session.js';
import { questionScenes } from '../scenes.js';
import { esc, scoreColor, copyText } from '../dom.js';

export function renderResults(root, app) {
  const plan = app.plan, mcq = isMCQ(plan), pct = overallPct(plan), coach = CONFIG.coach.name;
  const correct = plan.results.filter((r) => r.score === 10).length;
  let filter = 'all';

  root.innerHTML = `
  <div class="wrap">
    <section class="card">
      <div class="row between end">
        <div><div class="meta">${esc(mcq ? `${plan.title} test` : `${plan.meta.level} · ${plan.meta.role} · ${plan.meta.round}`)}</div>
          <h2 class="h1">${pct >= 70 ? 'Strong performance' : pct >= 40 ? 'Good base, clear gaps to fix' : 'Lots of room to grow, let\'s fix it'}</h2></div>
        <div class="score-big"><span style="color:${scoreColor(pct)}">${pct}%</span><small>${mcq ? `${correct} of ${plan.results.length} correct` : `average ${(pct / 10).toFixed(1)} / 10`}</small></div>
      </div>
      <div class="bars">${sectionStats(plan).map((s) => `
        <div class="bar"><span>${esc(s.section)}</span><span class="track"><i style="width:${s.pct}%;background:${scoreColor(s.pct)}"></i></span>
        <b>${mcq ? `${s.correct}/${s.n}` : `${s.pct}%`}</b></div>`).join('')}</div>
      <div class="row" style="margin-top:20px">
        <button class="btn play" id="playAll">▶ Watch all ${plan.results.length} lessons</button>
        <button class="btn" id="toRoadmap">See your roadmap →</button>
        <button class="btn ghost" id="copy">Copy report</button>
      </div>
    </section>

    <section class="card">
      <div class="row between"><h2 class="h2">Every question, taught by ${esc(coach)}</h2>
      <div class="chips" id="filter" style="margin:0"><button class="chip on" data-f="all">All</button><button class="chip" data-f="weak">Needs work</button><button class="chip" data-f="good">Strong</button></div></div>
      <div class="qgrid" id="qgrid"></div>
    </section>
  </div>`;

  const $ = (s) => root.querySelector(s);

  function cards() {
    $('#qgrid').innerHTML = plan.results.map((r, i) => {
      const q = plan.questions[i], p = r.score * 10;
      if ((filter === 'weak' && p >= 70) || (filter === 'good' && p < 70)) return '';
      const yours = mcq ? (plan.answers[i] == null ? 'No answer' : q.options[plan.answers[i]]) : (plan.answers[i] || 'No answer');
      const detail = mcq
        ? `<p><b>Correct answer:</b> ${esc(q.options[q.answer])}</p><p>${esc(q.explain)}</p>`
        : `<p><b>Stronger answer:</b> ${esc(r.model_answer || '')}</p>${(r.improve || []).length ? `<p><b>To improve:</b> ${esc(r.improve.join('; '))}</p>` : ''}`;
      return `<article class="qcard">
        <div class="qcard-top"><span>Q${i + 1} · ${esc(q.section || '')}</span><span class="pill" style="background:${scoreColor(p)}">${mcq ? (r.score ? '✓ Correct' : '✗ Wrong') : `${r.score}/10`}</span></div>
        <p>${esc(q.q)}</p>
        <details><summary>Your answer and the explanation</summary><p><b>You:</b> ${esc(yours)}</p>${detail}
          ${(r.study || []).length ? `<p><b>Study:</b> ${esc(r.study.map((s) => s.topic).join(', '))}</p>` : ''}</details>
        <button class="btn play sm" data-video="${i}">▶ ${esc(coach)} teaches this</button>
      </article>`;
    }).join('') || '<p class="hint">Nothing in this filter.</p>';
  }

  $('#filter').addEventListener('click', (e) => {
    const b = e.target.closest('[data-f]'); if (!b) return;
    filter = b.dataset.f;
    root.querySelectorAll('#filter .chip').forEach((c) => c.classList.toggle('on', c === b));
    cards();
  });
  $('#qgrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-video]'); if (!b) return;
    const i = Number(b.dataset.video);
    app.player.open(questionScenes(plan, i), `${coach} teaches question ${i + 1}`, plan.questions[i].q);
  });
  $('#playAll').onclick = () => app.player.open(plan.results.flatMap((_, i) => questionScenes(plan, i)), `All ${plan.results.length} lessons`, 'Use ⏭ or the chapter bar to skip ahead');
  $('#toRoadmap').onclick = () => app.go('roadmap');
  $('#copy').onclick = (e) => copyText(e.currentTarget,
    `${plan.title}: ${pct}%\n${sectionStats(plan).map((s) => `${s.section}: ${s.pct}%`).join('\n')}\n\n` +
    plan.results.map((r, i) => `Q${i + 1} ${mcq ? (r.score ? 'correct' : 'wrong') : `${r.score}/10`}: ${plan.questions[i].q}`).join('\n') +
    `\n\nRoadmap:\n${plan.roadmap.stages.map((s, k) => `${k + 1}. ${s.title} (${s.duration || ''}): ${s.goal || ''}`).join('\n')}`);
  cards();
}

// Step 4: the interactive roadmap. Stages on a trail, tasks to tick, study
// links, and the coach explaining each stage (or the whole plan as a tour).
import { CONFIG } from '../../config.js';
import { getSubject } from '../../data/subjects/index.js';
import { studyLink, safeUrl } from '../../services/resources.js';
import { stageLinks, stageScene, tourScenes } from '../scenes.js';
import { createCoach } from '../coach.js';
import { esc, linkCard } from '../dom.js';

export function renderRoadmap(root, app) {
  const plan = app.plan, rm = plan.roadmap, coach = CONFIG.coach.name;
  const subject = plan.subjectId ? getSubject(plan.subjectId) : null;
  let sel = Math.max(0, rm.stages.findIndex((_, k) => !plan.progress[k]));

  root.innerHTML = `
  <div class="wrap">
    <section class="card">
      <div class="row between end">
        <div><div class="meta">Your personal roadmap · ${esc(plan.title)}</div><h2 class="h1">${esc(rm.headline || 'Your roadmap')}</h2></div>
        <button class="btn play" id="tour">▶ ${esc(coach)}'s roadmap tour</button>
      </div>
      <p class="hint" style="margin-top:10px">${esc(rm.summary || '')}</p>
      <div class="row"><div class="progress grow-bar"><i id="prog"></i></div><span class="meta" id="progTxt" style="margin:0"></span></div>
      <div class="trail" id="trail"></div>
      <div class="stage-box" id="box"></div>
    </section>

    <section class="card">
      <h2 class="h2">Areas to study</h2>
      <div class="study">${(rm.study || []).map((t) => `
        <div class="study-card"><span class="prio ${t.priority === 'High' ? '' : 'm'}">${esc(t.priority || 'Medium')} priority</span>
          <b>${esc(t.topic)}</b><span>${esc(t.why || '')}</span>
          <div class="mini-links">${[studyLink('youtube', `${t.topic} tutorial`, 'YouTube'), studyLink('classcentral', t.topic, 'Free courses'), studyLink('coursera', t.topic, 'Coursera')]
            .map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>`).join('')}</div>
        </div>`).join('')}</div>
      ${subject?.resources?.length ? `<h3 class="h3">Hand-picked for ${esc(subject.name)}</h3>
        <div class="res-grid">${subject.resources.map((r) => linkCard({ label: r.title, url: safeUrl(r.url), provider: r.kind, badge: subject.badge, color: subject.color })).join('')}</div>` : ''}
      <p class="note">Search links open live results on YouTube, Coursera, Class Central and practice sites, so they always show current videos and courses.</p>
      <div class="row" style="margin-top:16px"><button class="btn ghost" id="back">← Back to review</button><button class="btn ghost" id="home">Take another test</button></div>
    </section>
  </div>`;

  const $ = (s) => root.querySelector(s);

  function draw() {
    const n = rm.stages.length, done = rm.stages.filter((_, k) => plan.progress[k]).length;
    $('#prog').style.width = `${(done / n) * 100}%`;
    $('#progTxt').textContent = `${done} of ${n} stages done`;
    $('#trail').innerHTML = rm.stages.map((s, k) => `
      <button class="node ${plan.progress[k] ? 'done' : ''}" data-k="${k}" aria-pressed="${k === sel}">
        <span class="dot">${plan.progress[k] ? '✓' : k + 1}</span><b>${esc(s.title)}</b><small>${esc(s.duration || '')}</small>
      </button>`).join('') + `<div class="node goal" aria-hidden="true"><span class="dot">★</span><b>Interview ready</b><small>Retake the test</small></div>`;

    const s = rm.stages[sel];
    $('#box').innerHTML = `
      <div class="box-coach" id="bc"></div>
      <div>
        <div class="meta" style="margin:0">Stage ${sel + 1} of ${n} · ${esc(s.duration || '')}</div>
        <h3 class="h2">${esc(s.title)}</h3>
        <p style="margin:0">${esc(s.goal || '')}</p>
        <div class="chips">${(s.topics || []).map((t) => `<span class="chip static">${esc(t)}</span>`).join('')}</div>
        <h4>What to do</h4>
        <ul class="tasks">${(s.tasks || []).map((t, j) => `<li><label><input type="checkbox" data-task="${j}" ${plan.progress[`t${sel}-${j}`] ? 'checked' : ''}> <span>${esc(t)}</span></label></li>`).join('')}</ul>
        <h4>Where to study</h4>
        <div class="res-grid">${stageLinks(s).map(linkCard).join('')}</div>
        <div class="row" style="margin-top:16px">
          <button class="btn play sm" id="explain">▶ ${esc(coach)} explains this stage</button>
          <button class="btn ghost sm" id="done">${plan.progress[sel] ? 'Mark as not done' : 'Mark stage done ✓'}</button>
          ${sel < n - 1 ? '<button class="btn ghost sm" id="nextStage">Next stage →</button>' : ''}
        </div>
      </div>`;
    $('#bc').appendChild(createCoach().el);
  }

  $('#trail').addEventListener('click', (e) => { const b = e.target.closest('.node[data-k]'); if (b) { sel = Number(b.dataset.k); draw(); } });
  $('#box').addEventListener('click', (e) => {
    if (e.target.id === 'explain') app.player.open([stageScene(rm.stages[sel], sel)], `Stage ${sel + 1}: ${rm.stages[sel].title}`, `${coach} explains what to do and where to study`);
    if (e.target.id === 'done') { plan.progress[sel] = !plan.progress[sel]; app.save(); draw(); }
    if (e.target.id === 'nextStage') { sel += 1; draw(); }
  });
  $('#box').addEventListener('change', (e) => {
    const j = e.target.dataset.task; if (j == null) return;
    plan.progress[`t${sel}-${j}`] = e.target.checked;
    const s = rm.stages[sel];
    plan.progress[sel] = (s.tasks || []).every((_, k) => plan.progress[`t${sel}-${k}`]);
    app.save(); draw();
  });
  $('#tour').onclick = () => app.player.open(tourScenes(plan), `${coach}'s roadmap tour`, rm.summary || '');
  $('#back').onclick = () => app.go('results');
  $('#home').onclick = () => app.go('home');
  draw();
}

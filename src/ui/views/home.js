// Step 1: choose a test (subject-based or role-based), or reopen a saved plan.
import { CONFIG } from '../../config.js';
import { SUBJECTS, getSubject } from '../../data/subjects/index.js';
import { ROLE_PRESETS, LEVELS, ROUNDS, FALLBACK_ROLE_QUESTIONS } from '../../data/roles.js';
import { askJSON, aiAvailable } from '../../services/ai.js';
import { roleQuestionsPrompt } from '../../services/prompts.js';
import { createSubjectPlan, createRolePlan, overallPct, answeredCount } from '../../services/session.js';
import { listPlans, deletePlan } from '../../services/storage.js';
import { introScenes } from '../scenes.js';
import { createCoach } from '../coach.js';
import { esc, scoreColor } from '../dom.js';

export function renderHome(root, app) {
  const n = CONFIG.questionsPerTest, coach = CONFIG.coach.name;
  const plans = listPlans();
  root.innerHTML = `
  <section class="hero band">
    <div class="hero-in">
      <div>
        <h1>${esc(CONFIG.appName)}</h1>
        <p class="lead">${esc(CONFIG.tagline)}</p>
        <div class="row" style="margin-top:20px"><button class="btn play" id="meet">▶ Meet ${esc(coach)}</button>
        <a class="btn ghost-light" href="#choose">Choose a test ↓</a></div>
      </div>
      <div class="hero-coach" id="heroCoach"></div>
    </div>
    <ol class="how">
      <li><b>1</b><span>Pick a role or subject</span></li>
      <li><b>2</b><span>Answer ${n} questions</span></li>
      <li><b>3</b><span>${esc(coach)} teaches every answer</span></li>
      <li><b>4</b><span>Follow your roadmap</span></li>
    </ol>
  </section>

  <div class="wrap lift">
    ${plans.length ? `<section class="card"><h2 class="h2">Your plans</h2><p class="hint">Pick up where you left off, or reopen a roadmap.</p>
      <div class="plans">${plans.map((p) => {
        const done = p.stage === 'done', pct = done ? overallPct(p) : null;
        return `<div class="plan-row"><div><b>${esc(p.title)}</b><small>${done ? 'Assessed' : `In progress · ${answeredCount(p)} of ${p.questions.length} answered`} · ${new Date(p.createdAt).toLocaleDateString()}</small></div>
          ${done ? `<span class="pill" style="background:${scoreColor(pct)}">${pct}%</span>` : ''}
          <button class="btn sm" data-open="${esc(p.id)}">${done ? 'Open roadmap' : 'Continue'}</button>
          <button class="btn ghost sm" data-del="${esc(p.id)}" aria-label="Delete ${esc(p.title)}">Delete</button></div>`;
      }).join('')}</div></section>` : ''}

    <section class="card" id="choose">
      <h2 class="h2">Subject-based tests</h2>
      <p class="hint">${n} multiple-choice questions each. Answers are checked against a verified answer key.</p>
      <div class="subjects">${SUBJECTS.map((s) => `
        <button class="subject" data-subject="${esc(s.id)}">
          <span class="s-badge" style="background:${esc(s.color)}">${esc(s.badge)}</span>
          <b>${esc(s.name)}</b><span>${esc(s.blurb)}</span>
          <small>${s.questions.length} questions · about ${Math.round(s.questions.length * 1.2)} min</small>
        </button>`).join('')}</div>
    </section>

    <section class="card">
      <h2 class="h2">Role-based interview</h2>
      <p class="hint">${n} interview questions written for your role. Type or speak your answers; the AI scores each one.</p>
      <div class="form-grid">
        <div><label for="role">Role</label><input id="role" value="Frontend Developer" placeholder="e.g. Data Analyst"></div>
        <div><label for="level">Level</label><select id="level">${LEVELS.map((l, i) => `<option ${i === 1 ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
        <div><label for="round">Round</label><select id="round">${ROUNDS.map((r) => `<option>${esc(r)}</option>`).join('')}</select></div>
      </div>
      <div class="chips" id="presets">${ROLE_PRESETS.map((p) => `<button class="chip" data-preset="${esc(p)}">${esc(p)}</button>`).join('')}</div>
      <div class="row"><button class="btn" id="startRole">Start role interview</button><span class="status" id="roleStatus"></span></div>
      ${aiAvailable() ? '' : '<p class="note">AI is not connected here, so role interviews use 15 general questions and simple scoring. See docs/DEPLOY.md to connect AI.</p>'}
    </section>
  </div>`;

  const hc = createCoach();
  root.querySelector('#heroCoach').appendChild(hc.el);
  root.querySelector('#meet').onclick = () => app.player.open(introScenes(), `Meet ${coach}`, 'How this works, in one minute');

  root.querySelector('#presets').addEventListener('click', (e) => {
    const b = e.target.closest('[data-preset]'); if (b) root.querySelector('#role').value = b.dataset.preset;
  });

  root.querySelector('.subjects').addEventListener('click', (e) => {
    const b = e.target.closest('[data-subject]'); if (!b) return;
    app.startPlan(createSubjectPlan(getSubject(b.dataset.subject)));
  });

  const plansEl = root.querySelector('.plans');
  plansEl?.addEventListener('click', (e) => {
    const open = e.target.closest('[data-open]'), del = e.target.closest('[data-del]');
    if (open) app.openPlan(open.dataset.open);
    if (del) { deletePlan(del.dataset.del); renderHome(root, app); }
  });

  root.querySelector('#startRole').onclick = async (e) => {
    const btn = e.currentTarget, status = root.querySelector('#roleStatus');
    const meta = { role: root.querySelector('#role').value.trim() || 'Software Developer', level: root.querySelector('#level').value, round: root.querySelector('#round').value };
    if (!aiAvailable()) return app.startPlan(createRolePlan(meta, FALLBACK_ROLE_QUESTIONS));
    btn.disabled = true;
    status.innerHTML = `<span class="spin"></span>Writing ${n} questions for a ${esc(meta.role)}…`;
    try {
      const qs = await askJSON(roleQuestionsPrompt(meta, n));
      if (!Array.isArray(qs) || qs.length < 5) throw new Error('Too few questions came back');
      app.startPlan(createRolePlan(meta, qs.filter((q) => q && q.q).map((q) => ({ q: String(q.q), hint: String(q.hint || ''), section: String(q.section || 'General'), topic: String(q.topic || q.section || '') }))));
    } catch (err) {
      btn.disabled = false;
      status.innerHTML = `<span class="err">${esc(err?.code === 'rate_limited' ? 'Too many requests. Wait a minute and try again.' : `Could not create questions: ${err?.message || err}`)}</span>`;
    }
  };
}

// Between steps 2 and 3: the AI marks every answer, writes the teaching videos
// and builds the roadmap, while the coach "works" on screen.
import { CONFIG } from '../../config.js';
import { assessPlan, batchCount } from '../../services/assess.js';
import { buildRoadmap } from '../../services/roadmap.js';
import { createCoach } from '../coach.js';
import { esc } from '../dom.js';

export async function renderAssessing(root, app) {
  const plan = app.plan, batches = batchCount(plan);
  const steps = [...Array(batches)].map((_, j) => `Checking questions ${j * 5 + 1}–${Math.min(plan.questions.length, j * 5 + 5)}`).concat(['Recording teaching videos', 'Building your roadmap']);
  root.innerHTML = `
  <div class="wrap">
    <section class="card assess">
      <div id="ac"></div>
      <div>
        <h2 class="h2">${esc(CONFIG.coach.name)} is marking your answers</h2>
        <p class="hint">This takes about a minute. Please keep this page open.</p>
        <ul class="steps">${steps.map((s) => `<li class="run">${esc(s)}</li>`).join('')}</ul>
      </div>
    </section>
  </div>`;
  root.querySelector('#ac').appendChild(createCoach({ talking: true }).el);
  const li = [...root.querySelectorAll('.steps li')];
  const mark = (k) => { if (li[k]) li[k].className = 'ok'; };
  li[batches + 1].className = '';

  plan.results = await assessPlan(plan, mark);
  mark(batches);
  li[batches + 1].className = 'run';
  plan.roadmap = await buildRoadmap(plan);
  mark(batches + 1);
  plan.stage = 'done';
  app.save();
  setTimeout(() => app.go('results'), 500);
}

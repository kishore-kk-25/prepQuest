// App entry point: starts the services, owns the current plan, and switches views.
//   home → test → assessing → results → roadmap
import { CONFIG } from './config.js';
import { initAI, aiMode } from './services/ai.js';
import { createVoice, createDictation } from './services/speech.js';
import { savePlan, getPlan } from './services/storage.js';
import { createPlayer } from './ui/player.js';
import { renderHome } from './ui/views/home.js';
import { renderTest } from './ui/views/test.js';
import { renderAssessing } from './ui/views/assessing.js';
import { renderResults } from './ui/views/results.js';
import { renderRoadmap } from './ui/views/roadmap.js';
import { esc } from './ui/dom.js';

const VIEWS = { home: renderHome, test: renderTest, assessing: renderAssessing, results: renderResults, roadmap: renderRoadmap };
const STEPS = [['home', 'Choose'], ['test', 'Answer'], ['results', 'Review'], ['roadmap', 'Roadmap']];

const app = {
  plan: null,
  view: 'home',
  player: null,
  voice: null,
  dictation: null,

  go(view) {
    this.view = view;
    renderStepper();
    VIEWS[view](document.getElementById('view'), this);
    window.scrollTo({ top: 0 });
  },
  save() { if (this.plan) savePlan(this.plan); },
  startPlan(plan) { this.plan = plan; this.save(); this.go('test'); },
  openPlan(id) {
    const p = getPlan(id); if (!p) return;
    this.plan = p;
    this.go(p.stage === 'done' ? 'roadmap' : 'test');
  },
};

function renderStepper() {
  const el = document.getElementById('stepper');
  const at = app.view === 'assessing' ? 2 : STEPS.findIndex(([v]) => v === app.view);
  const done = app.plan?.stage === 'done';
  const can = (v) => v === 'home' || (v === 'test' && app.plan && !done) || ((v === 'results' || v === 'roadmap') && done);
  el.innerHTML = STEPS.map(([v, label], k) =>
    `<button class="step ${k < at ? 'past' : ''} ${k === at ? 'now' : ''}" data-v="${v}" ${can(v) && app.view !== 'assessing' ? '' : 'disabled'}>
       <span>${k < at ? '✓' : k + 1}</span>${esc(label)}</button>`).join('');
}

async function start() {
  document.title = CONFIG.appName;
  document.getElementById('brand').textContent = CONFIG.appName;
  document.getElementById('stepper').addEventListener('click', (e) => {
    const b = e.target.closest('.step'); if (b && !b.disabled) app.go(b.dataset.v);
  });
  const [, voice, dictation] = await Promise.all([initAI(), createVoice(), createDictation()]);
  app.voice = voice;
  app.dictation = dictation;
  if (dictation) {
    // Register once; the test view sets app.onDictation to receive the text.
    dictation.onFinal((t) => app.onDictation?.final(t));
    dictation.onPartial((t) => app.onDictation?.partial(t));
    dictation.onState((on) => app.onDictation?.state(on));
  }
  app.player = createPlayer(voice);
  document.getElementById('aiMode').textContent =
    { claude: 'AI: Claude', proxy: 'AI: connected', demo: 'Demo mode (no AI)' }[aiMode()];
  app.go('home');
}

start();

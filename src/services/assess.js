// Grades a finished test and produces one teaching video per question.
// Subject tests are marked against the known answer key; the AI only writes
// the explanation. Role answers are scored by the AI. If the AI is missing
// or fails, built-in feedback is used so the app never breaks.
import { CONFIG } from '../config.js';
import { askJSON, aiAvailable } from './ai.js';
import { isMCQ } from './session.js';
import { subjectBatchPrompt, roleBatchPrompt } from './prompts.js';

const BATCH = 5;

/** Built-in feedback for one question (no AI needed). */
export function localResult(plan, i) {
  const q = plan.questions[i], a = plan.answers[i], name = CONFIG.coach.name;
  if (isMCQ(plan)) {
    const correct = a === q.answer, chosen = a == null ? 'no answer' : q.options[a], right = q.options[q.answer];
    const steps = q.explain.split(/(?<=\.)\s+/).filter(Boolean);
    return {
      n: i + 1, score: correct ? 10 : 0, correct, chosen,
      study: [{ topic: q.topic, why: correct ? 'Keep it sharp with timed practice' : 'This is where the mark was lost' }],
      video: [
        { title: correct ? 'Correct, well done!' : a == null ? 'You skipped this one' : 'Not quite, let\'s fix it', bullets: [`Your answer: ${chosen}`, `Correct answer: ${right}`], board: [], say: correct ? `Hi, I'm ${name}. You chose ${right}, and that's right! Let's make sure you really understand why, so you can do it fast in the real test.` : `Hi, I'm ${name}. You chose ${chosen}, but the correct answer is ${right}. Don't worry, this is a common slip. Let me teach you how to get it right every time.`, mood: correct ? 'happy' : 'concern' },
        { title: `The idea: ${q.topic}`, bullets: [`This question tests ${q.topic}.`, 'Learn the rule once, use it everywhere.'], board: steps.slice(0, 1), say: `This question is about ${q.topic}. Here's the key idea on the board. ${steps[0] || ''}`, mood: 'think' },
        { title: 'Step-by-step solution', bullets: steps.slice(0, 3), board: steps.slice(1, 4), say: q.explain, mood: 'think' },
        { title: 'Practise next', bullets: ['Watch a short video on this topic', 'Do 20 timed practice questions', 'Write down every mistake'], board: [], say: `To master ${q.topic}, watch one short video, then do twenty timed practice questions. The study links are right on this slide.`, mood: 'happy' },
      ],
    };
  }
  const words = (a || '').split(/\s+/).filter(Boolean).length;
  const score = a ? Math.min(9, Math.max(2, Math.round(words / 12) + 2)) : 0;
  return {
    n: i + 1, score, strengths: a ? ['You answered directly'] : [], improve: a ? ['Add a concrete example with a result', 'Structure it: situation, action, result'] : ['No answer given'],
    model_answer: 'Built-in mode can’t write a model answer. Connect an AI provider for full feedback (see docs/DEPLOY.md).',
    study: [{ topic: 'The STAR method', why: 'Gives every answer a clear story' }],
    video: [
      { title: a ? `You scored ${score}/10` : 'You skipped this one', bullets: a ? ['Clear and direct'] : ['No answer given'], board: [], say: a ? `Hi, I'm ${name}. You scored ${score} out of 10 here. Answering directly is a great start. Now let's make it memorable.` : `You skipped this one. In a real interview, always say something, even a short honest answer.`, mood: a ? 'think' : 'concern' },
      { title: 'What interviewers want', bullets: ['A real example', 'Your own actions', 'A clear result'], board: ['Situation → Task → Action → Result'], say: 'Interviewers want proof, not promises. Use the STAR method: the situation, your task, the action you took, and the result, ideally with a number.', mood: 'think' },
    ],
  };
}

function merge(plan, i, ai) {
  const local = localResult(plan, i);
  if (!ai || !Array.isArray(ai.video) || !ai.video.length) return local;
  if (isMCQ(plan)) return { ...local, study: ai.study?.length ? ai.study : local.study, video: ai.video };
  return { ...local, ...ai, n: i + 1, score: Math.max(0, Math.min(10, Math.round(Number(ai.score) || 0))) };
}

async function assessBatch(plan, idxs) {
  if (!aiAvailable()) return idxs.map((i) => localResult(plan, i));
  let out = [];
  try {
    out = await askJSON(isMCQ(plan) ? subjectBatchPrompt(plan, idxs) : roleBatchPrompt(plan, idxs));
  } catch { out = []; }
  return idxs.map((i) => merge(plan, i, (Array.isArray(out) ? out : []).find((x) => Number(x.n) === i + 1)));
}

/**
 * Assess every question in batches of 5, in parallel.
 * @param {object} plan
 * @param {(batchIndex:number) => void} onBatchDone
 */
export async function assessPlan(plan, onBatchDone = () => {}) {
  const batches = [];
  for (let s = 0; s < plan.questions.length; s += BATCH) {
    batches.push([...Array(Math.min(BATCH, plan.questions.length - s)).keys()].map((k) => s + k));
  }
  const parts = await Promise.all(batches.map((b, j) => assessBatch(plan, b).then((r) => { onBatchDone(j); return r; })));
  return parts.flat();
}

export const batchCount = (plan) => Math.ceil(plan.questions.length / BATCH);

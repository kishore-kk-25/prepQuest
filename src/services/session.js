// A "plan" is one test attempt: its questions, answers, AI results and roadmap.
import { CONFIG } from '../config.js';

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function base(type, title, questions, extra = {}) {
  const n = questions.length;
  return {
    id: uid(),
    type,                       // 'subject' (multiple choice, known answers) | 'role' (open answers)
    title,
    questions,
    answers: Array(n).fill(null),
    times: Array(n).fill(0),    // seconds spent per question
    flags: Array(n).fill(false),// "review later" flags
    current: 0,
    stage: 'test',              // 'test' → 'done'
    results: null,
    roadmap: null,
    progress: {},               // roadmap ticks
    createdAt: Date.now(),
    ...extra,
  };
}

export function createSubjectPlan(subject) {
  return base('subject', subject.name, subject.questions.slice(0, CONFIG.questionsPerTest), { subjectId: subject.id });
}

export function createRolePlan(meta, questions) {
  return base('role', `${meta.role} interview`, questions.slice(0, CONFIG.questionsPerTest), { meta });
}

export const isMCQ = (plan) => plan.type === 'subject';
export const answeredCount = (plan) => plan.answers.filter((a) => a != null && a !== '').length;

/** Overall score as a percentage (0–100). */
export function overallPct(plan) {
  if (!plan.results?.length) return 0;
  const sum = plan.results.reduce((a, r) => a + r.score, 0);
  return Math.round((sum / (plan.results.length * 10)) * 100);
}

/** Score per section, e.g. Quantitative 60%. */
export function sectionStats(plan) {
  const map = new Map();
  plan.questions.forEach((q, i) => {
    const key = q.section || 'General';
    const s = map.get(key) || { section: key, total: 0, n: 0, correct: 0 };
    const score = plan.results?.[i]?.score ?? 0;
    s.total += score; s.n += 1; if (score === 10) s.correct += 1;
    map.set(key, s);
  });
  return [...map.values()].map((s) => ({ ...s, pct: Math.round((s.total / (s.n * 10)) * 100) }));
}

// Turns results and roadmap stages into player scenes.
import { CONFIG } from '../config.js';
import { studyLink } from '../services/resources.js';
import { isMCQ, overallPct, sectionStats } from '../services/session.js';
import { getSubject } from '../data/subjects/index.js';

const practiceFor = (plan) => (plan.subjectId ? getSubject(plan.subjectId)?.practiceProvider : null) || 'geeksforgeeks';

/** Study links for a list of topics: one YouTube lesson + one practice link each. */
export function topicLinks(plan, topics) {
  const extra = isMCQ(plan) ? (plan.subjectId === 'aptitude' ? 'aptitude tricks' : `${plan.title} explained`) : `${plan.meta.role} interview`;
  return topics.slice(0, 2).flatMap((t) => [
    studyLink('youtube', `${t} ${extra}`, `▶ Learn ${t}`),
    studyLink(practiceFor(plan), t, `Practise ${t}`),
  ]);
}

/** Scenes for one question's teaching video. */
export function questionScenes(plan, i) {
  const r = plan.results[i];
  const scenes = r.video.map((s) => ({ ...s, tag: `Question ${i + 1}` }));
  scenes[0].badge = isMCQ(plan)
    ? { text: r.score ? '✓ Correct' : '✗ Wrong', pct: r.score * 10 }
    : { text: `${r.score}/10`, pct: r.score * 10 };
  scenes[scenes.length - 1].links = topicLinks(plan, (r.study || []).map((s) => s.topic));
  return scenes;
}

export function stageLinks(stage) {
  return (stage.resources || []).map((r) => studyLink(r.provider, r.query || r.title, r.title));
}

export const stageScene = (stage, k) => ({
  tag: `Stage ${k + 1} · ${stage.duration || ''}`,
  title: stage.title,
  bullets: (stage.tasks || []).slice(0, 3),
  board: [stage.goal, ...(stage.topics || []).slice(0, 2).map((t) => `• ${t}`)].filter(Boolean),
  say: stage.say || stage.goal,
  mood: 'think',
  links: stageLinks(stage),
});

/** The full narrated roadmap tour. */
export function tourScenes(plan) {
  const rm = plan.roadmap, pct = overallPct(plan);
  return [
    { tag: 'Welcome', title: rm.headline || 'Your roadmap', bullets: sectionStats(plan).slice(0, 3).map((s) => `${s.section}: ${s.pct}%`), board: [`Overall score: ${pct}%`], say: rm.intro_say || `You scored ${pct} percent. Here is your plan.`, mood: pct >= 70 ? 'happy' : 'think', badge: { text: `${pct}%`, pct } },
    ...rm.stages.map(stageScene),
    { tag: 'What next', title: 'Your next move', bullets: ['Start Stage 1 today', 'Tick tasks off as you go', 'Retake the test when you finish'], board: [], say: rm.outro_say || 'You have got this!', mood: 'happy' },
  ];
}

/** Short intro shown from the home page. */
export const introScenes = () => {
  const n = CONFIG.coach.name, q = CONFIG.questionsPerTest;
  return [
    { tag: 'Hello', title: `Hi, I'm ${n}!`, bullets: ['Your cartoon tutor', 'I explain every answer', 'I build your study roadmap'], board: [], say: `Hi, I'm ${n}, your interview prep tutor. I'll help you find out what you know, teach you what you don't, and give you a clear plan for what to study next.`, mood: 'happy' },
    { tag: 'Step 1', title: 'Take a test', bullets: [`${q} questions`, 'Role-based or subject-based', 'Type or speak role answers'], board: ['Role: interview questions for your job', 'Subject: DSA, DBMS, OS, aptitude …'], say: `First, pick a test. A role test gives you ${q} interview questions for your job. A subject test checks topics like data structures, databases or aptitude, with answers that are already checked.`, mood: 'think' },
    { tag: 'Step 2', title: 'Learn every answer', bullets: ['A short video per question', 'Step-by-step on the board', 'Links to study more'], board: ['Verdict → Concept → Solution → Practise'], say: `When you submit, I mark everything and make a short lesson for each question. I'll show the idea on the board, solve it step by step, and point you to videos and practice.`, mood: 'think' },
    { tag: 'Step 3', title: 'Follow your roadmap', bullets: ['Weakest areas first', 'Tasks you can tick off', 'YouTube, courses and practice sites'], board: [], say: `Finally, I build a roadmap just for you, weakest areas first, with tasks to tick off and the best places to study. Ready? Pick a test below and let's begin!`, mood: 'happy' },
  ];
};

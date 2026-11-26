// Every prompt sent to the AI lives here, so you can tune the tutor's
// teaching style in one place. The page fills in the data; the AI replies JSON.
import { CONFIG } from '../config.js';
import { ROLE_CATEGORIES } from '../data/roles.js';
import { PROVIDER_KEYS } from './resources.js';

const coach = () => `${CONFIG.coach.name}, ${CONFIG.coach.personality}`;

export const SCENE_SPEC = `Each scene is a JSON object:
{"title": short slide title,
 "bullets": [2-3 short slide points],
 "board": [0-3 short lines written on the teaching board, like a formula, rule, code line or step; [] if none],
 "say": what ${CONFIG.coach.name} says out loud, 40-70 words, warm, simple spoken English, talking to "you", teaching step by step like a good teacher,
 "mood": "happy" | "think" | "concern"}`;

export function roleQuestionsPrompt(meta, n) {
  return `You are a senior interviewer. Write exactly ${n} interview questions for a ${meta.level} ${meta.role} candidate, round type: ${meta.round}.
Make them realistic and specific to the role, ordered from warm-up to hard.
Return a JSON array of ${n} objects: {"q": question, "hint": short tip on what a great answer covers (max 14 words), "section": one of ${JSON.stringify(ROLE_CATEGORIES)}, "topic": the skill being tested (2-4 words)}.`;
}

export function subjectBatchPrompt(plan, idxs) {
  const items = idxs.map((i) => {
    const q = plan.questions[i], a = plan.answers[i];
    return { n: i + 1, question: q.q, options: q.options, correct_answer: q.options[q.answer],
      their_answer: a == null ? null : q.options[a], seconds: Math.round(plan.times[i]), topic: q.topic, verified_explanation: q.explain };
  });
  return `You are ${coach()}. A student just took a ${plan.title} test. For each question, write a short teaching video.
The correct_answer and verified_explanation are always right: base everything on them.
Items: ${JSON.stringify(items)}
Return a JSON array in the same order: {"n": number, "study": [1-2 {"topic": concept to study, "why": under 12 words}], "video": [exactly 4 scenes:
 1) verdict on their answer (if wrong, name the likely mistake kindly; if unanswered, encourage them),
 2) teach the core concept behind the question from scratch, with the key rule or formula on the board,
 3) solve it step by step on the board,
 4) a common trap or shortcut, and what to practise next]}.
${SCENE_SPEC}`;
}

export function roleBatchPrompt(plan, idxs) {
  const m = plan.meta;
  const items = idxs.map((i) => ({ n: i + 1, question: plan.questions[i].q, answer: plan.answers[i] || '(no answer)' }));
  return `You are a fair but demanding interviewer for a ${m.level} ${m.role} role (${m.round} round). Assess each answer, then write a short teaching video presented by ${coach()}.
Items: ${JSON.stringify(items)}
Return a JSON array in the same order: {"n": number, "score": integer 0-10 (0 if no answer), "strengths": [0-2 short points], "improve": [2 short specific points], "model_answer": "a strong answer in 60-90 words, first person", "study": [1-2 {"topic": concept or skill, "why": under 12 words}], "video": [exactly 4 scenes:
 1) reaction and score,
 2) teach what the interviewer is really looking for in this question,
 3) walk through the stronger answer, with its structure on the board,
 4) what to study or practise next]}.
${SCENE_SPEC}`;
}

export function roadmapPrompt(plan, summary, curated) {
  return `You are ${coach()}. A learner finished a ${CONFIG.questionsPerTest}-question ${summary.test}. Results: ${JSON.stringify(summary)}.
Hand-picked resources you may mention by name: ${JSON.stringify(curated)}.
Build a personal study roadmap that says what to do next and where to study. Return JSON:
{"headline": under 10 words,
 "summary": 1-2 sentences,
 "study": [4-6 {"topic", "why": under 14 words, "priority": "High" | "Medium"}],
 "stages": [4-5 stages in order, weakest areas first, ending with mock practice:
   {"title": short, "duration": e.g. "Week 1–2", "goal": one line, "topics": [2-4], "tasks": [3-4 concrete tasks],
    "resources": [3-4 {"title": what they will find, "provider": one of ${JSON.stringify(PROVIDER_KEYS)}, "query": a good search query for that site}],
    "say": 60-90 words where you teach this step: what to do, why it matters, and which resources to use}],
 "intro_say": 40-60 words welcome that mentions their score,
 "outro_say": 30-45 words encouraging close}.
Include at least one youtube resource per stage. Choose providers that suit the topic (indiabix for aptitude, leetcode for DSA, mdn for web, khan for maths).`;
}

// Builds the personal study roadmap from a finished, assessed plan.
import { CONFIG } from '../config.js';
import { askJSON, aiAvailable } from './ai.js';
import { overallPct, sectionStats, isMCQ } from './session.js';
import { roadmapPrompt } from './prompts.js';
import { PROVIDERS } from './resources.js';
import { getSubject } from '../data/subjects/index.js';

function summaryOf(plan) {
  return {
    test: isMCQ(plan) ? `${plan.title} test` : `${plan.meta.level} ${plan.meta.role} interview (${plan.meta.round})`,
    overall_pct: overallPct(plan),
    sections: sectionStats(plan).map(({ section, pct, n }) => ({ section, pct, questions: n })),
    questions: plan.results.map((r, i) => ({ n: i + 1, section: plan.questions[i].section, topic: plan.questions[i].topic, score: r.score, study: (r.study || []).map((s) => s.topic) })),
  };
}

/** Roadmap without AI: weakest sections first, then mock practice. */
export function localRoadmap(plan) {
  const subject = plan.subjectId ? getSubject(plan.subjectId) : null;
  const practice = subject?.practiceProvider || 'geeksforgeeks';
  const area = isMCQ(plan) ? plan.title : plan.meta.role;
  const weak = sectionStats(plan).sort((a, b) => a.pct - b.pct);
  const weakTopics = [...new Set(plan.results.filter((r) => r.score < 7).flatMap((r) => (r.study || []).map((s) => s.topic)))];
  const stages = weak.slice(0, 3).map((s, i) => {
    const topics = weakTopics.slice(i * 2, i * 2 + 3);
    return {
      title: `Strengthen ${s.section}`, duration: `Week ${i * 2 + 1}–${i * 2 + 2}`, goal: `Move ${s.section} from ${s.pct}% to 80%+`,
      topics: topics.length ? topics : [s.section],
      tasks: ['Watch one concept video per topic', 'Make a one-page note of rules and formulas', 'Do 20 practice questions a day', 'Review every mistake the same day'],
      resources: [
        { title: `${s.section} lessons`, provider: 'youtube', query: `${s.section} ${area} tutorial` },
        { title: `${s.section} practice`, provider: practice, query: `${s.section} ${area}` },
        { title: `${s.section} free course`, provider: 'classcentral', query: `${s.section} ${area}` },
      ],
      say: `Step ${i + 1} is ${s.section}, where you scored ${s.pct} percent. Spend two weeks here. Watch one short video per topic, write the key rules on a single page, then do twenty practice questions a day. Use the YouTube and practice links on this slide.`,
    };
  });
  stages.push({
    title: 'Mock tests and revision', duration: 'Week 7–8', goal: 'Build speed and confidence',
    topics: ['Timed mocks', 'Error log'], tasks: ['Take two full timed mocks a week', 'Keep an error log and revise it', `Retake this test in ${CONFIG.appName}`],
    resources: [{ title: 'Mock test strategy', provider: 'youtube', query: `${area} mock test tips` }, { title: 'Practice platform', provider: practice, query: area }],
    say: 'Finally, take full timed mock tests twice a week and keep an error log of every mistake. Then come back and retake this test to see how far you have come.',
  });
  return {
    headline: `Your 8-week plan for ${area}`,
    summary: `Built from your weakest areas: ${weak.slice(0, 3).map((s) => s.section).join(', ')}.`,
    study: (weakTopics.length ? weakTopics : weak.map((s) => s.section)).slice(0, 6).map((t, i) => ({ topic: t, why: 'You lost marks here in your test', priority: i < 3 ? 'High' : 'Medium' })),
    stages,
    intro_say: `Hi, I'm ${CONFIG.coach.name}! You scored ${overallPct(plan)} percent. Here is your roadmap, built from the areas where you lost the most marks. Let's walk through it together.`,
    outro_say: 'That is your plan. Tick off tasks as you go, and come back to retake the test. You have got this!',
  };
}

function clean(rm) {
  rm.stages = rm.stages.map((s) => ({ ...s, resources: (s.resources || []).filter((r) => r && r.query).map((r) => ({ ...r, provider: PROVIDERS[r.provider] ? r.provider : 'google' })) }));
  return rm;
}

export async function buildRoadmap(plan) {
  if (!aiAvailable()) return localRoadmap(plan);
  const subject = plan.subjectId ? getSubject(plan.subjectId) : null;
  try {
    const rm = await askJSON(roadmapPrompt(plan, summaryOf(plan), subject?.resources || []), { tier: 'complex' });
    if (!rm || !Array.isArray(rm.stages) || !rm.stages.length) throw new Error('empty roadmap');
    return clean(rm);
  } catch {
    return localRoadmap(plan);
  }
}

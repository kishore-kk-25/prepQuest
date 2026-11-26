// Unit tests for the parts that don't need a browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseJSON } from '../src/services/ai.js';
import { studyLink, safeUrl, PROVIDERS } from '../src/services/resources.js';
import { createSubjectPlan, overallPct, sectionStats } from '../src/services/session.js';
import { localResult } from '../src/services/assess.js';
import { localRoadmap } from '../src/services/roadmap.js';
import { getSubject } from '../src/data/subjects/index.js';

test('parseJSON pulls JSON out of a chatty reply', () => {
  assert.deepEqual(parseJSON('Sure! ```json\n[{"a":1}]\n```'), [{ a: 1 }]);
  assert.throws(() => parseJSON('no json here'));
});

test('every provider builds an https link', () => {
  for (const key of Object.keys(PROVIDERS)) assert.match(studyLink(key, 'binary search').url, /^https:\/\//);
  assert.equal(studyLink('unknown', 'x').provider, 'Web search');
  assert.equal(safeUrl('javascript:alert(1)'), '#');
});

test('subject marking uses the answer key', () => {
  const plan = createSubjectPlan(getSubject('aptitude'));
  plan.answers = plan.questions.map((q, i) => (i < 6 ? q.answer : (q.answer + 1) % 4));
  plan.results = plan.questions.map((_, i) => localResult(plan, i));
  assert.equal(plan.results.filter((r) => r.correct).length, 6);
  assert.equal(overallPct(plan), 40);
  const quant = sectionStats(plan).find((s) => s.section === 'Quantitative');
  assert.equal(quant.correct, 5);
});

test('built-in roadmap has stages with resources', () => {
  const plan = createSubjectPlan(getSubject('dsa'));
  plan.results = plan.questions.map((_, i) => localResult(plan, i));
  const rm = localRoadmap(plan);
  assert.ok(rm.stages.length >= 2);
  for (const s of rm.stages) assert.ok(s.resources.length && s.say);
});

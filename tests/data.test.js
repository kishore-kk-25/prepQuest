// Checks every question bank is well formed, so a typo can't break a test.
// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SUBJECTS } from '../src/data/subjects/index.js';
import { CONFIG } from '../src/config.js';

test('subject ids are unique', () => {
  const ids = SUBJECTS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

for (const s of SUBJECTS) {
  test(`${s.name}: has ${CONFIG.questionsPerTest} valid questions`, () => {
    assert.ok(s.questions.length >= CONFIG.questionsPerTest, 'not enough questions');
    s.questions.forEach((q, i) => {
      const where = `${s.id} question ${i + 1}`;
      for (const f of ['section', 'topic', 'q', 'explain']) assert.ok(typeof q[f] === 'string' && q[f].trim(), `${where}: missing ${f}`);
      assert.equal(q.options.length, 4, `${where}: needs 4 options`);
      assert.equal(new Set(q.options).size, 4, `${where}: options must be different`);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, `${where}: answer must be 0-3`);
    });
  });

  test(`${s.name}: resources use https`, () => {
    for (const r of s.resources || []) assert.match(r.url, /^https:\/\//);
  });
}

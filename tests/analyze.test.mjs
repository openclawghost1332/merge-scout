import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixtureRepo } from './helpers/git-fixture.mjs';
import { analyzeRepo } from '../src/analyze.js';

test('analyzeRepo ranks documented low-divergence branches above risky stale rewrites', async () => {
  const repo = await createFixtureRepo();

  try {
    const report = await analyzeRepo({ repoPath: repo.path, baseBranch: 'main' });

    assert.equal(report.candidates[0].name, 'feature/demo-docs');
    assert.match(report.candidates[0].reasons.join(' '), /README|tests|small divergence/i);
    assert.equal(report.candidates[1].name, 'feature/risky-rewrite');
    assert.match(report.candidates[1].risks.join(' '), /behind main|wide file spread/i);
  } finally {
    await repo.cleanup();
  }
});

test('analyzeRepo exposes a summary of candidate counts and top-branch score', async () => {
  const repo = await createFixtureRepo();

  try {
    const report = await analyzeRepo({ repoPath: repo.path, baseBranch: 'main' });

    assert.equal(report.summary.branchCount, 2);
    assert.equal(report.summary.topCandidate, 'feature/demo-docs');
    assert.equal(typeof report.summary.topScore, 'number');
    assert.ok(report.summary.topScore > report.candidates[1].score);
  } finally {
    await repo.cleanup();
  }
});

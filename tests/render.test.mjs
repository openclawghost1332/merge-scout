import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixtureRepo } from './helpers/git-fixture.mjs';
import { analyzeRepo } from '../src/analyze.js';
import { renderTable, renderMarkdown } from '../src/render.js';

test('renderTable prints score ahead behind counts and reasons', async () => {
  const repo = await createFixtureRepo();

  try {
    const report = await analyzeRepo({ repoPath: repo.path, baseBranch: 'main' });
    const output = renderTable(report);

    assert.match(output, /feature\/demo-docs/);
    assert.match(output, /Score/i);
    assert.match(output, /README/);
    assert.match(output, /ahead/i);
    assert.match(output, /behind/i);
  } finally {
    await repo.cleanup();
  }
});

test('renderMarkdown turns the report into a shareable ranked summary', async () => {
  const repo = await createFixtureRepo();

  try {
    const report = await analyzeRepo({ repoPath: repo.path, baseBranch: 'main' });
    const output = renderMarkdown(report);

    assert.match(output, /^# Merge Scout Report/m);
    assert.match(output, /## 1\. feature\/demo-docs/);
    assert.match(output, /Behind main by 3 commits/);
  } finally {
    await repo.cleanup();
  }
});

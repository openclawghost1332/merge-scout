import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createFixtureRepo } from './helpers/git-fixture.mjs';
import { analyzeRepo } from '../src/analyze.js';
import { renderSampleReport } from '../src/sample-report.js';

const browserSource = fs.readFileSync(new URL('../src/browser.js', import.meta.url), 'utf8');
const htmlSource = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('renderSampleReport turns report data into branch cards', async () => {
  const repo = await createFixtureRepo();

  try {
    const report = await analyzeRepo({ repoPath: repo.path, baseBranch: 'main' });
    const html = renderSampleReport(report);

    assert.match(html, /feature\/demo-docs/);
    assert.match(html, /Touches README/);
    assert.match(html, /Behind main by 3 commits/);
  } finally {
    await repo.cleanup();
  }
});

test('browser entry supports embedded sample data for direct-open previews', () => {
  assert.match(browserSource, /data-embedded-report/);
  assert.match(browserSource, /JSON\.parse/);
  assert.match(htmlSource, /data-embedded-report/);
  assert.match(htmlSource, /data-report-root/);
});

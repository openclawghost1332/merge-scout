import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('README documents scan usage output formats and library import', () => {
  assert.match(readme, /merge-scout scan --repo/);
  assert.match(readme, /--format json/);
  assert.match(readme, /--format markdown/);
  assert.match(readme, /sample report/i);
  assert.match(readme, /import \{ analyzeRepo, renderMarkdown \}/);
});

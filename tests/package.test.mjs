import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('package.json exposes Merge Scout as both CLI and reusable library entrypoint', () => {
  assert.equal(pkg.bin['merge-scout'], './bin/merge-scout.js');
  assert.equal(pkg.exports['.'], './src/index.js');
  assert.equal(pkg.main, './src/index.js');
});

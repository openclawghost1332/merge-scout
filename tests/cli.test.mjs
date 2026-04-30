import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFixtureRepo } from './helpers/git-fixture.mjs';

const projectRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const cliPath = path.join(projectRoot, 'bin', 'merge-scout.js');

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    encoding: 'utf8',
    cwd: projectRoot,
  });
}

test('CLI emits JSON when --format json is used', async () => {
  const repo = await createFixtureRepo();

  try {
    const result = runCli(['scan', '--repo', repo.path, '--base', 'main', '--format', 'json']);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).baseBranch, 'main');
  } finally {
    await repo.cleanup();
  }
});

test('CLI emits markdown when requested', async () => {
  const repo = await createFixtureRepo();

  try {
    const result = runCli(['scan', '--repo', repo.path, '--base', 'main', '--format', 'markdown']);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^# Merge Scout Report/m);
    assert.match(result.stdout, /feature\/demo-docs/);
  } finally {
    await repo.cleanup();
  }
});

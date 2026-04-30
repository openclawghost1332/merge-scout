import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixtureRepo } from './helpers/git-fixture.mjs';
import { scanRepo } from '../src/git.js';

test('scanRepo finds ahead branches and ahead behind counts against the base branch', async () => {
  const repo = await createFixtureRepo();

  try {
    const report = await scanRepo({ repoPath: repo.path, baseBranch: 'main' });

    assert.equal(report.baseBranch, 'main');
    assert.deepEqual(
      report.branches.map((branch) => ({
        name: branch.name,
        ahead: branch.ahead,
        behind: branch.behind,
        changedFiles: branch.changedFiles.length,
      })),
      [
        { name: 'feature/demo-docs', ahead: 2, behind: 0, changedFiles: 2 },
        { name: 'feature/risky-rewrite', ahead: 5, behind: 3, changedFiles: 6 },
      ],
    );
  } finally {
    await repo.cleanup();
  }
});

test('scanRepo reports branch metadata that can feed scoring heuristics', async () => {
  const repo = await createFixtureRepo();

  try {
    const report = await scanRepo({ repoPath: repo.path, baseBranch: 'main' });

    const demoBranch = report.branches.find((branch) => branch.name === 'feature/demo-docs');
    const riskyBranch = report.branches.find((branch) => branch.name === 'feature/risky-rewrite');

    assert.equal(demoBranch.touchesReadme, true);
    assert.equal(demoBranch.touchesTests, true);
    assert.equal(demoBranch.commitCount, 2);
    assert.equal(riskyBranch.touchesDocs, true);
    assert.equal(riskyBranch.touchesTests, true);
    assert.equal(riskyBranch.lastCommit.subject, 'feat: add rewrite tests');
  } finally {
    await repo.cleanup();
  }
});

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function git(repoPath, ...args) {
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd: repoPath,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'Merge Scout Tests',
        GIT_AUTHOR_EMAIL: 'merge-scout@example.com',
        GIT_COMMITTER_NAME: 'Merge Scout Tests',
        GIT_COMMITTER_EMAIL: 'merge-scout@example.com',
      },
    });
    return stdout.trim();
  } catch (error) {
    throw new Error(`git ${args.join(' ')} failed\n${error.stderr || error.stdout || error.message}`);
  }
}

async function commitFiles(repoPath, files, message, date) {
  for (const [relativePath, contents] of Object.entries(files)) {
    const absolutePath = path.join(repoPath, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, contents, 'utf8');
  }

  await git(repoPath, 'add', '.');
  await execFileAsync('git', ['commit', '-m', message], {
    cwd: repoPath,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Merge Scout Tests',
      GIT_AUTHOR_EMAIL: 'merge-scout@example.com',
      GIT_COMMITTER_NAME: 'Merge Scout Tests',
      GIT_COMMITTER_EMAIL: 'merge-scout@example.com',
      GIT_AUTHOR_DATE: date,
      GIT_COMMITTER_DATE: date,
    },
  });
}

export async function createFixtureRepo() {
  const repoPath = await fs.mkdtemp(path.join(os.tmpdir(), 'merge-scout-fixture-'));

  await git(repoPath, 'init', '--initial-branch=main');

  await commitFiles(repoPath, {
    'README.md': '# Fixture repo\n',
    'src/app.js': 'export const version = 1;\n',
  }, 'chore: initial commit', '2026-04-20T10:00:00Z');

  await commitFiles(repoPath, {
    'src/app.js': 'export const version = 2;\nexport function boot() { return "ok"; }\n',
    'tests/base.test.mjs': 'export const placeholder = true;\n',
  }, 'feat: add stable app surface', '2026-04-21T10:00:00Z');

  await git(repoPath, 'checkout', '-b', 'feature/risky-rewrite');
  await commitFiles(repoPath, {
    'src/rewrite/core.js': 'export const risky = true;\n',
    'src/rewrite/state.js': 'export const state = {};\n',
  }, 'feat: start rewrite', '2026-04-22T09:00:00Z');
  await commitFiles(repoPath, {
    'src/rewrite/api.js': 'export function callApi() { return "ok"; }\n',
  }, 'feat: expand rewrite surface', '2026-04-22T10:00:00Z');
  await commitFiles(repoPath, {
    'scripts/migrate.mjs': 'console.log("migrate");\n',
  }, 'feat: wire migration helper', '2026-04-22T11:00:00Z');
  await commitFiles(repoPath, {
    'docs/rewrite.md': '# Rewrite\n',
  }, 'feat: add rewrite docs', '2026-04-22T12:00:00Z');
  await commitFiles(repoPath, {
    'tests/rewrite.test.mjs': 'export const rewrite = true;\n',
  }, 'feat: add rewrite tests', '2026-04-22T13:00:00Z');

  await git(repoPath, 'checkout', 'main');
  await commitFiles(repoPath, {
    'src/app.js': 'export const version = 3;\nexport function boot() { return "patched"; }\n',
  }, 'fix: patch production bug', '2026-04-23T09:00:00Z');
  await commitFiles(repoPath, {
    'README.md': '# Fixture repo\n\nMainline usage docs.\n',
  }, 'docs: clarify usage', '2026-04-24T09:00:00Z');
  await commitFiles(repoPath, {
    'tests/mainline.test.mjs': 'export const mainline = true;\n',
  }, 'test: add regression guard', '2026-04-25T09:00:00Z');

  await git(repoPath, 'checkout', '-b', 'feature/demo-docs');
  await commitFiles(repoPath, {
    'README.md': '# Fixture repo\n\nMainline usage docs.\n\n## Demo\nA visible demo branch.\n',
  }, 'docs: draft demo pitch', '2026-04-26T09:00:00Z');
  await commitFiles(repoPath, {
    'tests/demo-smoke.test.mjs': 'export const smoke = true;\n',
  }, 'test: add demo smoke test', '2026-04-26T10:00:00Z');

  await git(repoPath, 'checkout', 'main');

  return {
    path: repoPath,
    async cleanup() {
      await fs.rm(repoPath, { recursive: true, force: true });
    },
  };
}

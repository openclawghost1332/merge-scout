import { execFileSync } from 'node:child_process';

function runGit(repoPath, args) {
  try {
    return execFileSync('git', args, {
      cwd: repoPath,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const stderr = error.stderr?.toString?.().trim?.() || error.message;
    throw new Error(`git ${args.join(' ')} failed: ${stderr}`);
  }
}

function listBranches(repoPath) {
  return runGit(repoPath, ['for-each-ref', 'refs/heads', '--format=%(refname:short)'])
    .split('\n')
    .map((branch) => branch.trim())
    .filter(Boolean);
}

function getAheadBehind(repoPath, baseBranch, branchName) {
  const output = runGit(repoPath, ['rev-list', '--left-right', '--count', `${baseBranch}...${branchName}`]);
  const [behind, ahead] = output.split(/\s+/).map((value) => Number.parseInt(value, 10));
  return { ahead, behind };
}

function getChangedFiles(repoPath, baseBranch, branchName) {
  const output = runGit(repoPath, ['diff', '--name-only', '--no-renames', `${baseBranch}...${branchName}`]);
  return output ? output.split('\n').map((file) => file.trim()).filter(Boolean) : [];
}

function getLastCommit(repoPath, branchName) {
  const output = runGit(repoPath, ['log', '-1', '--format=%H%x00%s%x00%cI', branchName]);
  const [hash, subject, committedAt] = output.split('\u0000');
  return { hash, subject, committedAt };
}

function inferFlags(changedFiles) {
  return {
    touchesReadme: changedFiles.some((file) => /(^|\/)README\.md$/i.test(file)),
    touchesTests: changedFiles.some((file) => /(^|\/)(test|tests)\//i.test(file) || /\.test\.[cm]?[jt]sx?$/i.test(file)),
    touchesDocs: changedFiles.some((file) => /(^|\/)(docs|doc)\//i.test(file)),
    touchesDemo: changedFiles.some((file) => /(^|\/)(index\.html|demo|preview|previews)\b/i.test(file)),
  };
}

export async function scanRepo({ repoPath, baseBranch = 'main' }) {
  if (!repoPath) {
    throw new Error('repoPath is required');
  }

  runGit(repoPath, ['rev-parse', '--show-toplevel']);
  runGit(repoPath, ['rev-parse', '--verify', baseBranch]);

  const branches = listBranches(repoPath)
    .filter((branch) => branch !== baseBranch)
    .map((branch) => {
      const { ahead, behind } = getAheadBehind(repoPath, baseBranch, branch);
      const changedFiles = getChangedFiles(repoPath, baseBranch, branch);
      const lastCommit = getLastCommit(repoPath, branch);
      return {
        name: branch,
        baseBranch,
        ahead,
        behind,
        commitCount: ahead,
        changedFiles,
        lastCommit,
        ...inferFlags(changedFiles),
      };
    })
    .filter((branch) => branch.ahead > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    repoPath,
    baseBranch,
    branches,
    scannedAt: new Date().toISOString(),
  };
}

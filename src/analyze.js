import { scanRepo } from './git.js';

function clampScore(score) {
  return Math.max(0, Math.min(100, score));
}

export function scoreBranch(branch) {
  let score = 50;
  const reasons = [];
  const risks = [];

  if (branch.touchesReadme) {
    score += 12;
    reasons.push('Touches README, which usually signals a visible product slice.');
  }

  if (branch.touchesDocs) {
    score += 6;
    reasons.push('Includes docs work that can make the branch easier to revive.');
  }

  if (branch.touchesTests) {
    score += 10;
    reasons.push('Ships tests, which suggests the branch moved past pure experimentation.');
  }

  if (branch.behind === 0) {
    score += 10;
    reasons.push(`Small divergence from ${branch.baseBranch}, with no missing base commits.`);
  } else {
    const penalty = Math.min(branch.behind * 5, 25);
    score -= penalty;
    risks.push(`Behind ${branch.baseBranch} by ${branch.behind} commit${branch.behind === 1 ? '' : 's'}.`);
  }

  if (branch.changedFiles.length <= 3) {
    score += 8;
    reasons.push('Compact file spread makes the branch cheaper to audit and promote.');
  }

  if (branch.changedFiles.length >= 5) {
    score -= 8;
    risks.push('Wide file spread raises merge and regression risk.');
  }

  if (branch.commitCount >= 5) {
    score -= 6;
    risks.push('Longer branch history increases the chance of hidden drift.');
  }

  if (branch.touchesDemo) {
    score += 4;
    reasons.push('Touches a demo or preview surface, which helps outsider-facing validation.');
  }

  return {
    ...branch,
    score: clampScore(score),
    reasons,
    risks,
  };
}

export async function analyzeRepo({ repoPath, baseBranch = 'main' }) {
  const scan = await scanRepo({ repoPath, baseBranch });
  const candidates = scan.branches
    .map(scoreBranch)
    .sort((left, right) => right.score - left.score || left.behind - right.behind || left.name.localeCompare(right.name));

  return {
    ...scan,
    candidates,
    summary: {
      branchCount: candidates.length,
      topCandidate: candidates[0]?.name ?? null,
      topScore: candidates[0]?.score ?? null,
    },
  };
}

function formatReasons(items) {
  return items.length > 0 ? items.join(' | ') : 'None';
}

export function renderTable(report) {
  const lines = [
    'Merge Scout Report',
    `Repo: ${report.repoPath}`,
    `Base: ${report.baseBranch}`,
    '',
    'Rank | Branch | Score | Ahead | Behind | Changed files',
    '---- | ------ | ----- | ----- | ------ | -------------',
  ];

  report.candidates.forEach((candidate, index) => {
    lines.push(`${index + 1} | ${candidate.name} | ${candidate.score} | ${candidate.ahead} | ${candidate.behind} | ${candidate.changedFiles.length}`);
    lines.push(`  Reasons: ${formatReasons(candidate.reasons)}`);
    lines.push(`  Risks: ${formatReasons(candidate.risks)}`);
  });

  if (report.candidates.length === 0) {
    lines.push('No candidate branches found.');
  }

  return lines.join('\n');
}

export function renderMarkdown(report) {
  const lines = [
    '# Merge Scout Report',
    '',
    `- **Repo:** ${report.repoPath}`,
    `- **Base branch:** ${report.baseBranch}`,
    `- **Candidate branches:** ${report.summary.branchCount}`,
    '',
  ];

  if (report.candidates.length === 0) {
    lines.push('No candidate branches found.');
    return lines.join('\n');
  }

  report.candidates.forEach((candidate, index) => {
    lines.push(`## ${index + 1}. ${candidate.name}`);
    lines.push(`- **Score:** ${candidate.score}`);
    lines.push(`- **Ahead / behind:** ${candidate.ahead} ahead, ${candidate.behind} behind`);
    lines.push(`- **Changed files:** ${candidate.changedFiles.length}`);
    lines.push(`- **Reasons:** ${formatReasons(candidate.reasons)}`);
    lines.push(`- **Risks:** ${formatReasons(candidate.risks)}`);
    lines.push('');
  });

  return lines.join('\n');
}

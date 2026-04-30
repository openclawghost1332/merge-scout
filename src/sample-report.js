function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderList(items, emptyText) {
  if (!items || items.length === 0) {
    return `<li>${escapeHtml(emptyText)}</li>`;
  }

  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

export function renderSampleReport(report) {
  const cards = report.candidates.map((candidate, index) => `
    <article class="branch-card">
      <div class="branch-card__header">
        <p class="branch-card__rank">#${index + 1}</p>
        <div>
          <h2>${escapeHtml(candidate.name)}</h2>
          <p class="branch-card__meta">Score ${candidate.score} • ${candidate.ahead} ahead • ${candidate.behind} behind • ${candidate.changedFiles.length} files</p>
        </div>
      </div>
      <div class="branch-card__columns">
        <section>
          <h3>Why it ranks</h3>
          <ul>${renderList(candidate.reasons, 'No positive signals captured.')}</ul>
        </section>
        <section>
          <h3>Risks</h3>
          <ul>${renderList(candidate.risks, 'No major risks flagged.')}</ul>
        </section>
      </div>
    </article>
  `).join('');

  return `
    <section class="hero">
      <p class="eyebrow">Merge Scout sample report</p>
      <h1>Dormant branches worth reviving</h1>
      <p class="hero__summary">Scanned <strong>${escapeHtml(report.repoPath)}</strong> against <strong>${escapeHtml(report.baseBranch)}</strong>. Top candidate: <strong>${escapeHtml(report.summary.topCandidate ?? 'None')}</strong>.</p>
    </section>
    <section class="cards">${cards}</section>
  `;
}

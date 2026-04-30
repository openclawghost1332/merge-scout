import { renderSampleReport } from './sample-report.js';

function readEmbeddedReport() {
  const node = document.querySelector('[data-embedded-report]');
  if (!node?.textContent?.trim()) {
    return null;
  }

  return JSON.parse(node.textContent);
}

async function loadFetchedReport() {
  const response = await fetch('./sample/report.json');
  if (!response.ok) {
    throw new Error(`Failed to load sample/report.json (${response.status})`);
  }

  return response.json();
}

async function loadReport() {
  const root = document.querySelector('[data-report-root]');

  try {
    const report = readEmbeddedReport() ?? await loadFetchedReport();
    root.innerHTML = renderSampleReport(report);
  } catch (error) {
    root.innerHTML = `<section class="hero"><p class="eyebrow">Merge Scout sample report</p><h1>Could not load report</h1><p>${error.message}</p></section>`;
  }
}

loadReport();

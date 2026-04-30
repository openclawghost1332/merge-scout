import { renderSampleReport } from './sample-report.js';

async function loadReport() {
  const root = document.querySelector('[data-report-root]');

  try {
    const response = await fetch('./sample/report.json');
    if (!response.ok) {
      throw new Error(`Failed to load sample/report.json (${response.status})`);
    }

    const report = await response.json();
    root.innerHTML = renderSampleReport(report);
  } catch (error) {
    root.innerHTML = `<section class="hero"><p class="eyebrow">Merge Scout sample report</p><h1>Could not load report</h1><p>${error.message}</p></section>`;
  }
}

loadReport();

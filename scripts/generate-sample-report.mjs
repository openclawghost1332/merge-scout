import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeRepo } from '../src/analyze.js';
import { createFixtureRepo } from '../tests/helpers/git-fixture.mjs';

const projectRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const outputPath = path.join(projectRoot, 'sample', 'report.json');
const indexPath = path.join(projectRoot, 'index.html');

function embedJson(json) {
  return json.replaceAll('<', '\\u003c');
}

const repo = await createFixtureRepo();
try {
  const report = await analyzeRepo({ repoPath: repo.path, baseBranch: 'main' });
  const normalizedReport = {
    ...report,
    repoPath: 'fixture:merge-scout-demo',
  };
  const reportJson = JSON.stringify(normalizedReport, null, 2) + '\n';
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, reportJson, 'utf8');

  const indexSource = await fs.readFile(indexPath, 'utf8');
  const embeddedIndex = indexSource.replace(
    /<script type="application\/json" data-embedded-report>[\s\S]*?<\/script>/,
    `<script type="application/json" data-embedded-report>${embedJson(reportJson)}</script>`,
  );
  await fs.writeFile(indexPath, embeddedIndex, 'utf8');

  console.log(outputPath);
} finally {
  await repo.cleanup();
}

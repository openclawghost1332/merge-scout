import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeRepo } from '../src/analyze.js';
import { createFixtureRepo } from '../tests/helpers/git-fixture.mjs';

const projectRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const outputPath = path.join(projectRoot, 'sample', 'report.json');

const repo = await createFixtureRepo();
try {
  const report = await analyzeRepo({ repoPath: repo.path, baseBranch: 'main' });
  const normalizedReport = {
    ...report,
    repoPath: 'fixture:merge-scout-demo',
  };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(normalizedReport, null, 2) + '\n', 'utf8');
  console.log(outputPath);
} finally {
  await repo.cleanup();
}

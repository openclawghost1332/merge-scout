#!/usr/bin/env node
import { analyzeRepo } from '../src/analyze.js';
import { renderTable, renderMarkdown } from '../src/render.js';

function parseArgs(argv) {
  const args = [...argv];
  const command = args.shift();
  const options = { format: 'table', baseBranch: 'main', repoPath: process.cwd() };

  while (args.length > 0) {
    const token = args.shift();
    if (token === '--repo') {
      options.repoPath = args.shift();
    } else if (token === '--base') {
      options.baseBranch = args.shift();
    } else if (token === '--format') {
      options.format = args.shift();
    } else {
      throw new Error(`Unknown argument: ${token}`);
    }
  }

  return { command, options };
}

async function main() {
  try {
    const { command, options } = parseArgs(process.argv.slice(2));
    if (command !== 'scan') {
      throw new Error('Usage: merge-scout scan --repo <path> [--base main] [--format table|json|markdown]');
    }

    const report = await analyzeRepo(options);
    if (options.format === 'json') {
      process.stdout.write(JSON.stringify(report, null, 2) + '\n');
      return;
    }

    if (options.format === 'markdown') {
      process.stdout.write(renderMarkdown(report) + '\n');
      return;
    }

    process.stdout.write(renderTable(report) + '\n');
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

await main();

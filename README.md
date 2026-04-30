# Merge Scout

Merge Scout ranks dormant git branches by revival potential. Point it at a local repo and it will surface the branches that look most worth rescuing, along with the signals and risks behind each score.

## Why it exists

Feature branches rot quietly. Merge Scout turns branch archaeology into a repeatable workflow by answering a few practical questions fast:

- which branches are still ahead of main
- how far they drifted behind base
- whether they touched docs, tests, or demo surfaces
- which ones look cheap to revive versus risky to resurrect

## CLI

```bash
merge-scout scan --repo /path/to/repo --base main
```

### JSON output

```bash
merge-scout scan --repo /path/to/repo --base main --format json
```

### Markdown output

```bash
merge-scout scan --repo /path/to/repo --base main --format markdown
```

## Sample report

Open `index.html` directly or serve the repo with any static file server to view the phone-friendly sample report. The page renders `sample/report.json`, which is generated from the same shared analysis core as the CLI.

To refresh the bundled sample data:

```bash
npm run sample
```

## Development

```bash
npm test
```

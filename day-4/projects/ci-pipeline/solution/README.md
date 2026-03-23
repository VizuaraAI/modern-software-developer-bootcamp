# CI Pipeline -- GitHub Actions Workflows

This project contains two GitHub Actions workflow configurations for
automated code review and deployment. These are templates you can add to
any Node.js repository.

## Workflows

### 1. Code Review Pipeline (`.github/workflows/code-review.yml`)

**Triggers on**: Pull requests targeting `main`

| Job        | What it does |
|------------|--------------|
| `test`     | Installs dependencies, runs Vitest with coverage, uploads artifacts |
| `security` | Runs Semgrep security scan, uploads SARIF results to GitHub Security tab |
| `report`   | Aggregates results and posts a summary comment on the PR |

Features:
- Node modules caching for faster runs
- Coverage reports uploaded as artifacts (retained 14 days)
- Semgrep SARIF integration with GitHub Code Scanning
- Automatic PR comment with test results, coverage table, and security findings
- Updates existing bot comment instead of creating duplicates
- Concurrency control to cancel outdated runs

### 2. Deploy Pipeline (`.github/workflows/deploy.yml`)

**Triggers on**: Push to `main`

| Job              | What it does |
|------------------|--------------|
| `build-and-test` | Full test suite with coverage, lint, and build |
| `deploy`         | Deploys to Vercel production using the Vercel CLI |

Features:
- Runs full test suite before deploying (deploy is blocked if tests fail)
- Uses GitHub Environments for deployment tracking
- Deployment URL captured and displayed in step summary
- Concurrency control ensures only one deploy runs at a time

## Setup instructions

### Step 1 -- Copy workflows into your repository

```bash
# From your project root
mkdir -p .github/workflows
cp path/to/ci-pipeline/.github/workflows/*.yml .github/workflows/
```

### Step 2 -- Configure repository secrets

Go to your repository on GitHub:
**Settings > Secrets and variables > Actions > New repository secret**

| Secret             | Required by     | Description |
|--------------------|-----------------|-------------|
| `SEMGREP_APP_TOKEN`| code-review.yml | Semgrep App token (optional -- scan works without it) |
| `VERCEL_TOKEN`     | deploy.yml      | Vercel personal access token |

To get a Vercel token:
1. Go to https://vercel.com/account/tokens
2. Create a new token with an appropriate scope
3. Add it as the `VERCEL_TOKEN` secret

### Step 3 -- Ensure your project has the right scripts

The workflows expect these in your `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint .",
    "build": "your-build-command"
  }
}
```

The `lint` and `build` scripts are optional (`--if-present` flag is used).

### Step 4 -- Link your Vercel project

Before the deploy workflow can run, link your repo to a Vercel project:

```bash
# Install Vercel CLI
npm install -g vercel

# Link the project (follow the prompts)
vercel link
```

This creates a `.vercel/` directory. Add it to `.gitignore`.

### Step 5 -- Push and test

```bash
# Create a branch and open a PR to test the code-review workflow
git checkout -b test/ci-pipeline
git push -u origin test/ci-pipeline
# Open a PR on GitHub -- the code-review workflow should trigger

# Merge to main to test the deploy workflow
```

## Customization

- **Node version**: Change `node-version: "20"` to match your project.
- **Test runner**: Replace `vitest` commands if you use Jest or another runner.
- **Security rules**: Adjust the Semgrep `config` list to add or remove rulesets.
- **Deploy target**: Replace the Vercel steps with your preferred platform (Netlify, AWS, etc.).
- **Coverage thresholds**: Set these in your `vitest.config.js` or equivalent.

## Status badges

Add these to your project's README to show pipeline status:

```markdown
![Code Review](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/code-review.yml/badge.svg)
![Deploy](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/deploy.yml/badge.svg)
```

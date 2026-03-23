# CI Pipeline — Build Prompts

Build GitHub Actions workflows for automated code review and deployment. These are templates you can drop into any Node.js project.

## Setup

Use an existing Node.js project (or create a minimal one), open Claude Code: `claude`

---

## Prompt 1 — Code review workflow (runs on pull requests)

```
Create a GitHub Actions workflow at .github/workflows/code-review.yml.

Trigger: pull_request targeting main branch.

Jobs:

1. test
   - runs-on: ubuntu-latest
   - Steps: checkout, setup Node 20, cache node_modules (key: node-modules-${{ hashFiles('package-lock.json') }}),
     npm ci, run tests with coverage (npm run test:coverage),
     upload coverage report as artifact named "coverage-report" retained for 14 days

2. security
   - runs-on: ubuntu-latest
   - Steps: checkout, run Semgrep using semgrep/semgrep-action@v1 with SEMGREP_APP_TOKEN secret,
     upload SARIF results to GitHub Code Scanning tab using github/codeql-action/upload-sarif

3. report
   - runs-on: ubuntu-latest
   - needs: [test, security]
   - if: always()
   - Steps: checkout, find existing bot comment on the PR (look for a comment containing "CI Report"),
     post or update a comment with a Markdown summary including:
       - Overall status (pass/fail)
       - Test result (pass/fail, number of tests)
       - Coverage table (lines, branches, functions, statements)
       - Security findings count

Add at the top of the file:
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

---

## Prompt 2 — Deploy workflow (runs on push to main)

```
Create a GitHub Actions workflow at .github/workflows/deploy.yml.

Trigger: push to main branch.

Jobs:

1. build-and-test
   - runs-on: ubuntu-latest
   - Steps: checkout, setup Node 20, cache node_modules, npm ci,
     run tests with coverage, run lint (npm run lint --if-present),
     run build (npm run build --if-present)

2. deploy
   - runs-on: ubuntu-latest
   - needs: build-and-test
   - environment: production
   - Steps: checkout, setup Node 20, install Vercel CLI (npm install -g vercel),
     pull Vercel environment (vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}),
     build for Vercel (vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}),
     deploy prebuilt (vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}),
     capture deployment URL and write it to $GITHUB_STEP_SUMMARY

Add concurrency control so only one deploy runs at a time:
concurrency:
  group: deploy-production
  cancel-in-progress: false
```

---

## Prompt 3 — Setup instructions

```
Write the complete setup instructions for a developer who wants to add these workflows to their project:

1. What secrets do they need to add in GitHub (Settings > Secrets > Actions)?
2. What npm scripts must be in package.json for the workflows to work?
3. How do they get a Vercel token?
4. How do they link their project to Vercel before the deploy workflow can run?
5. How do they test the code-review workflow? (hint: open a PR)
6. How do they test the deploy workflow? (hint: merge to main)

Include the exact commands where relevant.
```

---

## Verification checklist

- [ ] `code-review.yml` triggers correctly on pull requests
- [ ] `deploy.yml` triggers correctly on push to main
- [ ] Node modules are cached — subsequent runs are faster
- [ ] Deploy job only runs if build-and-test passes
- [ ] PR comment posts a summary with test and security results
- [ ] Concurrency control prevents overlapping runs
- [ ] Both workflows have the correct secrets documented

## Status badge (add to your README)

```markdown
![Code Review](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/code-review.yml/badge.svg)
![Deploy](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/deploy.yml/badge.svg)
```

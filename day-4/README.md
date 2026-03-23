# Day 4 — Testing, Security, and CI/CD

## Projects

### test-suite-demo
A starter project with utility and validation functions and zero tests. Your job: use Claude Code to generate a comprehensive test suite that hits 80%+ coverage thresholds. Covers Vitest, test design, edge cases, and branch coverage.

### vulnshop
An intentionally insecure e-commerce API with 8 planted vulnerabilities. Use Claude Code to audit the code, find every vulnerability, and fix them. Covers SQL injection, XSS, hardcoded secrets, file upload vulnerabilities, and more.

> **Warning:** Do not deploy vulnshop publicly. It is intentionally insecure.

### ci-pipeline
GitHub Actions workflow templates for automated code review (runs on PRs) and deployment (runs on push to main). Covers CI/CD, Semgrep security scanning, test coverage reporting, and Vercel deployment.

## How to work on these
1. Open the project folder you want to build
2. Read `PROMPTS.md`
3. Follow the prompts using Claude Code
4. Compare your result with `solution/`

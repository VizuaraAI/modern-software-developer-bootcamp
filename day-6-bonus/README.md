# Day 6 (Bonus) — Capstone: AI Interview Agent

## The Challenge

Build a full AI-powered mock interview agent from scratch in a single session, using every skill from Days 1–5.

## What You Build

```
THE AI INTERVIEW AGENT

  1. Reads your resume (PDF upload)
  2. Extracts your skills, projects, and experience using AI
  3. Conducts a multi-phase technical interview:
     - Phase I:   Greeting & warmup (personalized to your resume)
     - Phase II:  Deep-dive into your projects (FDR framework)
     - Phase III: Factual ML knowledge (RAG-selected questions)
  4. Supports voice input (speech-to-text) and voice output (TTS)
  5. Detects cheating (paste detection, timing, suspicious behavior)
  6. Scores your performance (0-10 on multiple dimensions)
  7. Generates personalized recommendations
  8. Has a full CI/CD pipeline and Docker deployment
```

## Reference Implementation

A complete reference implementation is available at:
https://github.com/VizuaraAI/Interview-Prep-Agent

Study it to understand the architecture before you start building.

## The Workflow

This capstone uses the full workflow from Days 3-5:

1. `/prd` — Plan the architecture and sprint breakdown
2. `/dev` — Implement each task with TDD
3. Security scan — Semgrep + pip-audit after each sprint
4. `/walkthrough` — Document what was built
5. Docker + CI/CD — Deploy the finished product

## Skills Required

| Day | What You Use |
|-----|-------------|
| Day 1 | Claude Code, agentic building, FastAPI |
| Day 2 | MCP servers (for voice, browser automation) |
| Day 3 | `/prd`, `/dev`, `/walkthrough`, PRD-driven development |
| Day 4 | Security scanning, OWASP hardening |
| Day 5 | Playwright E2E tests, GitHub Actions CI/CD, Docker |

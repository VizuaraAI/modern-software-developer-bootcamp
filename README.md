# Modern Software Developer Bootcamp — Projects

This repository contains the projects from the **Modern Software Developer** bootcamp.

## How to use this repo

Each project folder has two things:

- **`PROMPTS.md`** — step-by-step prompts to build the project using Claude Code
- **`solution/`** — the reference implementation to compare your work against

**The workflow:**
1. Pick a project from the day you are working on
2. Create a new empty folder on your machine
3. Open Claude Code in that folder (`claude` in the terminal)
4. Follow the prompts in `PROMPTS.md` one by one
5. When done, compare your result with `solution/`

The goal is not to copy the solution — it is to use the prompts to build something that works, then see how your approach compares.

---

## Projects

### Day 1 — Git, APIs, and the Developer Mindset

| Project | What you build |
|---------|---------------|
| `cli-task-manager` | A colorful command-line task manager with priorities, search, and stats |
| `bookstore-api` | A REST API with SQLite — full CRUD for a bookstore |

### Day 2 — AI-Assisted Development

| Project | What you build |
|---------|---------------|
| `custom-coding-agent` | A mini coding agent using the Anthropic SDK that reads files, writes code, and runs commands |
| `mcp-weather-server` | An MCP server that gives Claude live (simulated) weather tools |

### Day 3 — Agentic Engineering

| Project | What you build |
|---------|---------------|
| `quicknote-extension` | A Chrome extension for saving highlighted text as notes |
| `habitflow-saas` | A full habit tracking web app, built entirely from a PRD |

### Day 4 — Testing, Security, and CI/CD

| Project | What you build |
|---------|---------------|
| `test-suite-demo` | Use Claude Code to generate a comprehensive test suite for existing utility functions |
| `vulnshop` | Audit and fix 8 planted security vulnerabilities in an e-commerce API |
| `ci-pipeline` | GitHub Actions workflows for automated code review and deployment |

### Day 5 — Capstone

| Project | What you build |
|---------|---------------|
| `shipit-capstone` | Full-stack URL shortener with auth, click analytics, CI/CD, tests, and Docker |

---

## Prerequisites

- Node.js 20+
- Claude Code installed: `npm install -g @anthropic-ai/claude-code`
- An Anthropic API key (required for Day 2 projects)
- Chrome browser (required for the Day 3 extension project)

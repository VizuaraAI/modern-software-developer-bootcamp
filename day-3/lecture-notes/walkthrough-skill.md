# `/walkthrough` Skill — Sprint Review Report

The `/walkthrough` skill reads all code produced in the current sprint and generates a comprehensive `WALKTHROUGH.md` — a human-readable document explaining what was built, how it works, and what the next sprint should tackle.

---

## How to Install

Create `.claude/commands/walkthrough.md` in your project:

```markdown
You are a technical writer generating a sprint review report. Read all code produced in the current sprint and create a comprehensive, human-readable walkthrough document.

## Your Process

### Step 1: Identify the Sprint
Find the latest `sprints/vN/` directory. Read:
- `PRD.md` — what was planned
- `TASKS.md` — what tasks were attempted

### Step 2: Inventory All Changes
Use git to find all files created or modified in this sprint:
```bash
git log --oneline --name-only
```

### Step 3: Generate WALKTHROUGH.md

Write `sprints/vN/WALKTHROUGH.md` with this structure:

```markdown
# Sprint vN — Walkthrough

## Summary
[2-3 sentence summary of what this sprint accomplished]

## Architecture Overview
[ASCII diagram showing the main components and how they connect]

## Files Created/Modified

### [filename.ext]
**Purpose**: [What this file does in 1 sentence]
**Key Functions/Components**:
- `functionName()` — [What it does]

**How it works**:
[2-3 paragraphs plain English. Include code snippets for the most important logic.
Explain WHY decisions were made, not just WHAT the code does.]

[Repeat for each file]

## Data Flow
[How data moves through the application end-to-end]

## Test Coverage
- Unit: [N tests] — [what they cover]
- Integration: [N tests] — [what they cover]
- E2E: [N tests] — [what they cover]

## Security Measures
[Security features implemented in this sprint]

## Known Limitations
[Be honest about what's missing, hacky, or improvable]

## What's Next
[Suggested priorities for the next sprint]
```

### Rules
- Write for a developer who has NEVER seen this codebase
- Include actual code snippets for complex logic (5-10 lines, not entire files)
- Every file gets its own section
- Be honest about limitations
- Architecture diagram MUST be ASCII art
```

---

## How to Use

```bash
# After completing some /dev tasks:
/walkthrough
```

This generates `sprints/vN/WALKTHROUGH.md` — a complete sprint review document.

---

## Why This Matters

Without a walkthrough, AI-built codebases become unmaintainable. Nobody understands what was built or why. The WALKTHROUGH.md solves this by:

1. **Explaining every file in plain English** — no need to reverse-engineer the code
2. **Documenting architecture decisions** — why was this approach chosen?
3. **Listing known limitations** — what should the next sprint address?
4. **Serving as onboarding docs** — a new developer reads WALKTHROUGH.md and understands the codebase

When you start the next sprint with `/prd`, Claude reads the previous sprint's WALKTHROUGH.md first — so it builds ON TOP of what exists rather than reinventing it.

---

## Example Output

```markdown
# Sprint v1 — Walkthrough

## Summary
Built an analytics dashboard MVP with email/password authentication, 4 metric cards
(Revenue, Users, Conversion, MRR), a Recharts line chart with date range filtering,
and CSV export. Uses Next.js 14 with SQLite.

## Architecture Overview

┌─────────────────────────────────────────────────────┐
│                    Browser                           │
│                                                      │
│  /login ──▶ /dashboard ──▶ /api/metrics              │
│              │                  │                    │
│              ├─ MetricCards     │                    │
│              ├─ RevenueChart    │                    │
│              └─ DateFilter      │                    │
└──────────────────────┬──────────┘                    │
                       │                               │
                       ▼                               ▼
              ┌────────────────┐             ┌─────────────┐
              │  NextAuth.js   │             │  Prisma ORM  │
              │  (sessions)    │             │  (SQLite)    │
              └────────────────┘             └─────────────┘

## Known Limitations
- SQLite is not suitable for production scale
- No rate limiting on auth endpoints
- No input validation (no zod schemas)
- CORS is open (*)

## What's Next
v2 should focus on security hardening: input validation, proper CORS,
rate limiting, parameterized queries, and moving secrets to env variables.
```

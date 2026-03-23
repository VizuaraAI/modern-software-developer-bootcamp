# `/dev` Skill — Test-Driven Development Agent

The `/dev` skill picks the highest priority uncompleted task from your sprint backlog and implements it using Test-Driven Development — writing tests first, then code, then running security scans.

---

## How to Install

Create `.claude/commands/dev.md` in your project:

```markdown
You are a senior software engineer implementing tasks from a sprint backlog. Follow test-driven development with integrated security scanning.

## Your Process

### Step 1: Find the Current Sprint
Look for the latest `sprints/vN/TASKS.md` file. Read it and identify the highest-priority uncompleted task (first `- [ ]` item, preferring P0 over P1 over P2).

### Step 2: Understand Context
- Read the sprint's `PRD.md` for architecture and requirements
- If a previous sprint exists, read its `WALKTHROUGH.md`
- Read any existing source files that the task will modify
- Announce: "Working on Task N: [description]"

### Step 3: Write Tests FIRST (TDD)
Before writing any implementation code:

**For logic/utility tasks** → Write unit tests
**For API route tasks** → Write integration tests
**For UI/page tasks** → Write Playwright E2E tests

Screenshot convention: save to `tests/screenshots/taskN-stepN-description.png`

### Step 4: Implement
Write the minimum code needed to make the tests pass:
- Follow existing code conventions
- Use the tech stack from the PRD
- Add `data-testid` attributes to interactive elements (for Playwright)
- Include error handling for user-facing features

### Step 5: Run Tests
Run tests until green. If tests fail: read the error, fix the implementation (not the test, unless the test is wrong), re-run.

### Step 6: Security Scan
```bash
npx semgrep --config auto src/ --quiet
npm audit
```
Fix any findings, re-run tests, re-run scanner to confirm.

### Step 7: Update TASKS.md
```
- [x] Task N: [description] (P0)
  - Completed: [date] — [brief note]
```

### Step 8: Commit
```bash
git commit -m "feat(vN): Task N — [description]

- Implemented [what]
- Tests: [N unit, N integration, N e2e]
- Security: semgrep clean, npm audit clean"
```

## Rules
- NEVER skip the test-writing step
- NEVER skip the security scan step
- One task per /dev invocation. Don't combine tasks.
- Playwright tests MUST take screenshots (for visual debugging)
- Always use `data-testid` attributes for Playwright selectors
```

---

## How to Use

```bash
# Pick and implement the next task:
/dev

# Run again to pick the next task:
/dev
```

Each `/dev` invocation handles exactly one task — tests, implementation, security scan, commit.

---

## The /dev Flow

```
 ┌──────────────┐
 │ Read TASKS.md │
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │ Pick highest  │
 │ priority task │
 └──────┬───────┘
        ▼
 ┌──────────────┐     ┌──────────────┐
 │ Write tests  │────▶│ Run tests    │──── FAIL ──┐
 │ FIRST (TDD)  │     │ (should fail)│            │
 └──────────────┘     └──────┬───────┘            │
                             │ PASS               │
                             │ (test is wrong)    │
                             ▼                    ▼
                      ┌──────────────┐     Fix test
                      │ Implement    │
                      │ the code     │
                      └──────┬───────┘
                             ▼
                      ┌──────────────┐
                      │ Run tests    │──── FAIL ──▶ Fix code
                      │              │            then re-run
                      └──────┬───────┘
                             │ PASS
                             ▼
                      ┌──────────────┐
                      │ semgrep scan │──── FINDINGS ──▶ Fix
                      │ npm audit    │                 then re-run
                      └──────┬───────┘
                             │ CLEAN
                             ▼
                      ┌──────────────┐
                      │ Update task  │
                      │ Git commit   │
                      └──────────────┘
```

---

## Screenshot Convention

Playwright tests save screenshots to a predictable location so Claude can read them for visual debugging:

```
tests/
├── screenshots/
│   ├── task3-01-login-page.png
│   ├── task3-02-after-login.png
│   ├── task3-03-dashboard-loaded.png
│   └── ...
├── unit/
├── integration/
└── e2e/
```

---

## Why Write Tests First?

Writing tests before implementation forces you to define "done" precisely. Before writing a single line of implementation code, you answer:

- What inputs does this function accept?
- What should it return for valid inputs?
- What should it return for invalid inputs?
- What are the edge cases?

This makes the implementation clearer and prevents scope creep. The AI implements exactly what the tests require — no more, no less.

# HabitFlow SaaS — Build Prompts

This project demonstrates PRD-driven development. Instead of writing code from scratch, you write (or read) a detailed Product Requirements Document and let Claude Code build the entire application from it.

The PRD is your prompt. Everything Claude needs to build the app is in `solution/PRD.md`.

## Setup

1. Create a new folder called `habitflow-saas`
2. Copy `solution/package.json` and `solution/PRD.md` into it
3. Run `npm install`
4. Open Claude Code: `claude`

---

## The main prompt

```
Read PRD.md carefully from top to bottom before writing any code.

Then build the complete HabitFlow application exactly as specified:
- All pages (dashboard, add habit, habit detail, stats)
- All API routes
- Database setup with SQLite (lib/db.js)
- Streak calculation logic (lib/streaks.js)
- Tailwind CSS styling

Follow the file structure defined in Section 10 of the PRD.
When done, the app must start with `npm run dev` and satisfy all success criteria in Section 8.
```

---

## Follow-up prompts (use these if Claude gets stuck)

**If the database is not initializing:**
```
Set up the SQLite database using better-sqlite3.
Create lib/db.js that:
1. Opens (or creates) the database at ./data/habitflow.db
2. Creates the habits table and completions table using CREATE TABLE IF NOT EXISTS
3. Creates the index on completions(habit_id, date)
4. Exports the database instance
Use the exact schema from Section 6 of the PRD.
```

**If streaks are calculating incorrectly:**
```
Fix the streak calculation in lib/streaks.js.
For daily habits: walk backwards from today. If today is not yet completed,
start from yesterday. Count consecutive days with a completion record.
For weekly habits: count consecutive weeks with at least one completion.
Return { currentStreak, longestStreak }.
```

**If the toggle does not persist:**
```
The POST /api/habits/[id]/track route should:
- Check if there is a completion record for today (YYYY-MM-DD format)
- If yes: delete it (un-complete)
- If no: insert it (complete)
Return { completed: boolean, currentStreak, longestStreak }
```

**If styling looks wrong:**
```
Apply Tailwind CSS to the dashboard page. Each habit should be a card with:
- A colored left border matching the habit's color property
- The habit name in bold
- Current streak with a fire icon
- A checkbox/toggle button for today's completion
- Completed habits should appear slightly muted
The page should be mobile-responsive (single column on small screens, grid on desktop).
```

---

## Verification checklist

Work through Section 8 (Success Criteria) of the PRD:

- [ ] `npm run dev` starts without errors on http://localhost:3000
- [ ] Can create a new habit with name, frequency, and color
- [ ] Can toggle habit completion on the dashboard
- [ ] Toggle state persists after page refresh
- [ ] Streak counts update correctly when you toggle
- [ ] Habit detail page shows calendar heatmap and stats
- [ ] Overall stats page shows aggregate data
- [ ] Layout is responsive — works on both mobile and desktop
- [ ] No console errors during normal usage

## Why PRD-driven development works

A detailed PRD gives Claude:
- The exact data model (no guessing on table schemas)
- The exact API contract (endpoint paths, request/response shapes)
- The exact file structure (no inventing its own layout)
- Measurable success criteria (Claude can self-check its work)

The more specific your PRD, the closer the output matches your vision on the first try.

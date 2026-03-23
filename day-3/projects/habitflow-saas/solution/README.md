# HabitFlow -- PRD-Driven Development Demo

## What This Is

This project demonstrates **PRD-driven development** using Claude Code. Instead of writing code manually, you write a detailed Product Requirements Document (PRD) and let Claude Code build the entire application from it.

The `PRD.md` file in this directory describes **HabitFlow**, a habit tracking web app with:
- Habit creation and management (CRUD)
- Daily completion tracking with toggles
- Streak tracking (current + longest)
- Dashboard with today's habits
- Calendar heatmap and statistics
- Responsive mobile-friendly design

## Tech Stack

- **Next.js 14** (App Router)
- **SQLite** (via better-sqlite3) -- no database setup needed
- **Tailwind CSS** for styling

## Workshop Instructions

### Step 1: Review the PRD

Open `PRD.md` and read through it. Notice how it covers:
- Feature specifications
- API endpoint definitions
- Data model (database tables)
- Page layouts and routes
- UI/UX guidelines
- Success criteria

A good PRD gives the AI everything it needs to build the app correctly on the first try.

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Feed the PRD to Claude Code

Open Claude Code in this directory and use the following prompt:

```
Read the PRD.md file in this directory. Build the complete HabitFlow application
exactly as specified. Implement all pages, API routes, database setup, and styling.
Make sure the app runs with `npm run dev` and all features work.
```

### Step 4: Watch Claude Code Build the App

Claude Code will:
1. Read and understand the PRD
2. Set up the project configuration (Tailwind, Next.js config)
3. Create the database helper (`lib/db.js`)
4. Build all API routes
5. Create all pages with UI components
6. Style everything with Tailwind CSS

### Step 5: Test the App

```bash
npm run dev
```

Open http://localhost:3000 and test:
- [ ] Create a new habit
- [ ] Toggle completion on the dashboard
- [ ] Check that streaks update correctly
- [ ] View habit detail page with calendar heatmap
- [ ] Check overall statistics page
- [ ] Test on mobile viewport (resize browser)

## Key Takeaways

1. **A detailed PRD produces better results.** The more specific you are about data models, API contracts, and UI behavior, the closer the output matches your vision.

2. **Structure matters.** Organizing the PRD with clear sections (features, API, data model, pages) helps the AI understand the full picture before writing code.

3. **Include success criteria.** Telling the AI what "done" looks like helps it self-validate its work.

4. **Include file structure.** Showing the expected directory layout prevents the AI from inventing its own organization.

## Troubleshooting

- **"Module not found" errors**: Make sure you ran `npm install` first
- **Database errors**: Delete the `data/` directory and restart -- it will be recreated automatically
- **Port 3000 in use**: Run `npm run dev -- -p 3001` to use a different port

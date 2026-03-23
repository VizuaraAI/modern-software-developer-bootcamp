# HabitFlow - Product Requirements Document

## 1. Overview

**HabitFlow** is a habit tracking web application that helps users build and maintain positive habits. Users can create custom habits, track daily completions, monitor streaks, and view detailed statistics about their progress over time.

The app is designed to be simple, fast, and visually appealing -- focused on the core habit tracking experience without unnecessary complexity.

### Goals
- Allow users to create and manage habits with customizable properties
- Provide a daily dashboard for quick habit check-offs
- Track streaks (current and longest) to motivate consistency
- Display weekly and monthly statistics to show progress over time
- Deliver a responsive, mobile-friendly experience

### Non-Goals (Out of Scope)
- User authentication / multi-user support (this is a single-user local app)
- Push notifications or reminders
- Social features or habit sharing
- Data export/import

---

## 2. Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| Database    | SQLite via `better-sqlite3`       |
| Styling     | Tailwind CSS                      |
| Language    | JavaScript (not TypeScript)       |
| Runtime     | Node.js 18+                       |

### Why These Choices
- **Next.js 14 App Router**: Modern React framework with built-in API routes, server components, and file-based routing
- **SQLite**: Zero-configuration database, perfect for a local single-user app. No external database setup required.
- **Tailwind CSS**: Utility-first CSS for rapid, consistent UI development
- **better-sqlite3**: Synchronous SQLite bindings for Node.js -- fast and simple

---

## 3. Features

### 3.1 Habit Management (CRUD)
- **Create** a new habit with:
  - Name (required, max 50 characters)
  - Description (optional, max 200 characters)
  - Frequency: "daily" or "weekly"
  - Color: user-selectable from a predefined palette (e.g., red, blue, green, purple, orange, teal)
- **Edit** an existing habit (all fields)
- **Delete** a habit (with confirmation dialog). Deleting a habit also removes all its completion records.

### 3.2 Daily Tracking
- Dashboard shows all habits for today
- Each habit has a checkbox/toggle to mark it as complete
- Toggling a completion is instant (optimistic UI update)
- Habits marked as "weekly" only appear on the dashboard once per week (or show weekly progress)
- Visual feedback: completed habits show a checkmark and slightly muted/crossed style

### 3.3 Streak Tracking
- **Current Streak**: Number of consecutive days/weeks the habit has been completed (up to and including today)
- **Longest Streak**: The longest consecutive completion streak ever recorded for this habit
- Streaks are displayed on the dashboard next to each habit
- Streak calculation logic:
  - For daily habits: count consecutive days with a completion, going backwards from today
  - For weekly habits: count consecutive weeks with at least one completion
  - If today is not yet completed, the streak counts back from yesterday

### 3.4 Dashboard
- Shows today's date prominently
- Lists all habits with:
  - Habit name and color indicator
  - Completion toggle for today
  - Current streak count (with fire icon or similar)
- Progress bar or fraction showing "X of Y habits completed today"
- Quick action button to add a new habit

### 3.5 Statistics
- **Per-habit stats** (on habit detail page):
  - Calendar heatmap showing completions over the past 3 months
  - Current streak and longest streak
  - Total completions count
  - Completion rate (percentage of days completed since habit creation)
- **Overall stats** (on stats page):
  - Total habits being tracked
  - Overall completion rate across all habits
  - Best current streak (across all habits)
  - Weekly completion chart (bar chart showing completions per day for the past 7 days)
  - Monthly trend (completions per week for the past 4 weeks)

### 3.6 Responsive Design
- Mobile-first approach
- Dashboard works well on phone screens (single column layout)
- Touch-friendly toggle buttons (minimum 44px tap target)
- Desktop layout uses available space (multi-column grid for habits)

---

## 4. Pages and Routes

### 4.1 `/` -- Dashboard (Home)
The main page users see when they open the app.

**Layout:**
- Header: "HabitFlow" branding, today's date, link to stats page
- Progress summary: "3 of 5 habits completed today"
- Habit list: each habit shown as a card with:
  - Color indicator (left border or dot)
  - Habit name
  - Current streak (e.g., "5 days")
  - Toggle/checkbox for today's completion
- Floating action button or link: "+ Add Habit"
- Empty state (no habits): "No habits yet. Create your first one!"

### 4.2 `/add` -- Add New Habit
A form page to create a new habit.

**Form Fields:**
- Name (text input, required)
- Description (textarea, optional)
- Frequency (radio buttons: Daily / Weekly)
- Color (selectable color swatches)
- Submit button: "Create Habit"
- Cancel link back to dashboard

**Behavior:**
- Validate that name is not empty
- On success: redirect to dashboard
- On error: show inline validation message

### 4.3 `/habit/[id]` -- Habit Detail
Detailed view of a single habit with stats and history.

**Layout:**
- Habit name and description at the top, with edit and delete buttons
- Stats cards: Current Streak, Longest Streak, Total Completions, Completion Rate
- Calendar heatmap: 3-month grid showing which days the habit was completed
  - Days with completions are filled with the habit's color
  - Today is highlighted with a border
- Back link to dashboard

### 4.4 `/stats` -- Overall Statistics
Aggregate statistics across all habits.

**Layout:**
- Summary cards: Total Habits, Overall Completion Rate, Best Streak
- Weekly chart: bar chart (can be built with simple divs) showing daily completions for the past 7 days
- Monthly trend: weekly completion totals for the past 4 weeks
- List of all habits with their individual completion rates, sorted by rate (descending)
- Back link to dashboard

---

## 5. API Endpoints

All API routes are under `/api/`. They accept and return JSON.

### 5.1 `GET /api/habits`
Returns all habits.

**Response:**
```json
{
  "habits": [
    {
      "id": 1,
      "name": "Morning Run",
      "description": "Run for 30 minutes",
      "frequency": "daily",
      "color": "blue",
      "created_at": "2024-01-15T08:00:00.000Z",
      "completed_today": true,
      "current_streak": 5,
      "longest_streak": 12
    }
  ]
}
```

### 5.2 `POST /api/habits`
Create a new habit.

**Request Body:**
```json
{
  "name": "Morning Run",
  "description": "Run for 30 minutes",
  "frequency": "daily",
  "color": "blue"
}
```

**Response:** `201 Created` with the created habit object.

**Validation:**
- `name` is required and must be 1-50 characters
- `frequency` must be "daily" or "weekly"
- `color` must be one of the predefined colors

### 5.3 `PUT /api/habits/:id`
Update an existing habit.

**Request Body:** Same as POST (all fields optional, only provided fields are updated).

**Response:** `200 OK` with the updated habit object.

**Errors:** `404` if habit not found.

### 5.4 `DELETE /api/habits/:id`
Delete a habit and all its completion records.

**Response:** `200 OK` with `{ "success": true }`.

**Errors:** `404` if habit not found.

### 5.5 `POST /api/habits/:id/track`
Toggle today's completion for a habit.

**Behavior:**
- If the habit is NOT completed today: create a completion record for today
- If the habit IS completed today: delete the completion record for today

**Response:**
```json
{
  "completed": true,
  "current_streak": 6,
  "longest_streak": 12
}
```

### 5.6 `GET /api/habits/:id/stats`
Get detailed statistics for a habit.

**Response:**
```json
{
  "habit_id": 1,
  "current_streak": 5,
  "longest_streak": 12,
  "total_completions": 45,
  "completion_rate": 0.78,
  "completions": [
    { "date": "2024-01-15" },
    { "date": "2024-01-14" }
  ]
}
```

The `completions` array contains all completion dates for the past 90 days (for the calendar heatmap).

---

## 6. Data Model

### 6.1 `habits` Table

| Column      | Type    | Constraints                    |
|-------------|---------|--------------------------------|
| id          | INTEGER | PRIMARY KEY AUTOINCREMENT      |
| name        | TEXT    | NOT NULL                       |
| description | TEXT    | DEFAULT ''                     |
| frequency   | TEXT    | NOT NULL, CHECK(frequency IN ('daily', 'weekly')) |
| color       | TEXT    | NOT NULL, DEFAULT 'blue'       |
| created_at  | TEXT    | NOT NULL, DEFAULT (datetime('now')) |

### 6.2 `completions` Table

| Column       | Type    | Constraints                    |
|--------------|---------|--------------------------------|
| id           | INTEGER | PRIMARY KEY AUTOINCREMENT      |
| habit_id     | INTEGER | NOT NULL, FOREIGN KEY -> habits(id) ON DELETE CASCADE |
| date         | TEXT    | NOT NULL (format: 'YYYY-MM-DD') |
| completed_at | TEXT    | NOT NULL, DEFAULT (datetime('now')) |

**Unique Constraint:** `(habit_id, date)` -- a habit can only be completed once per day.

**Index:** Create an index on `completions(habit_id, date)` for fast lookups.

### 6.3 Database Initialization

The database file should be stored at `./data/habitflow.db`. The `data/` directory should be created automatically if it doesn't exist. Tables should be created automatically on first run (no migration step needed).

---

## 7. UI/UX Guidelines

### Color Palette
- Background: white (`#ffffff`) and light gray (`#f9fafb`)
- Text: dark gray (`#111827`) and medium gray (`#6b7280`)
- Accent colors for habits:
  - Red: `#ef4444`
  - Blue: `#3b82f6`
  - Green: `#22c55e`
  - Purple: `#8b5cf6`
  - Orange: `#f97316`
  - Teal: `#14b8a6`

### Typography
- Use the system font stack (Tailwind's default `font-sans`)
- Headings: bold, larger sizes
- Body text: regular weight, readable size (16px base)

### Component Patterns
- Cards with subtle shadows and rounded corners for habit items
- Color-coded left borders on habit cards matching the habit color
- Animated checkboxes/toggles for completion
- Toast notifications for actions (habit created, deleted, etc.)
- Confirmation dialogs for destructive actions (delete)

### Responsive Breakpoints
- Mobile: single column, stacked layout (< 640px)
- Tablet: two-column grid for habits (640px - 1024px)
- Desktop: three-column grid, wider content area (> 1024px)

---

## 8. Success Criteria

The app is considered complete when:

1. **Runs locally**: `npm run dev` starts the app without errors
2. **Habit CRUD**: Can create, read, update, and delete habits through the UI
3. **Daily tracking**: Can toggle habit completion on the dashboard; state persists after refresh
4. **Streak calculation**: Current streak and longest streak are calculated correctly
5. **Statistics**: Habit detail page shows calendar heatmap and stats; overall stats page shows aggregate data
6. **Responsive**: UI works well on both mobile (375px wide) and desktop (1440px wide)
7. **No errors**: No console errors during normal usage
8. **Data persistence**: All data survives server restarts (stored in SQLite)

---

## 9. Implementation Notes

### Database Helper
Create a `lib/db.js` utility that:
- Opens/creates the SQLite database
- Runs the schema creation (CREATE TABLE IF NOT EXISTS)
- Exports the database instance for use in API routes

### Streak Calculation
The streak calculation should be a reusable function in `lib/streaks.js`:
```
function calculateStreak(completionDates, frequency) {
  // Sort dates descending
  // Walk backwards from today, counting consecutive completions
  // Return { currentStreak, longestStreak }
}
```

### Calendar Heatmap
Build the calendar heatmap as a simple CSS grid:
- 7 rows (days of week) x N columns (weeks)
- Each cell is a small square
- Filled cells use the habit's color at varying opacity levels
- Tooltip on hover showing the date

### Error Handling
- API routes should return appropriate HTTP status codes
- Client-side should handle network errors gracefully
- Show user-friendly error messages (not raw error objects)

---

## 10. File Structure

```
habitflow-saas/
├── app/
│   ├── layout.js          # Root layout with Tailwind
│   ├── page.js            # Dashboard (home page)
│   ├── add/
│   │   └── page.js        # Add new habit form
│   ├── habit/
│   │   └── [id]/
│   │       └── page.js    # Habit detail page
│   ├── stats/
│   │   └── page.js        # Overall statistics
│   └── api/
│       └── habits/
│           ├── route.js           # GET all, POST new
│           └── [id]/
│               ├── route.js       # PUT, DELETE
│               ├── track/
│               │   └── route.js   # POST toggle
│               └── stats/
│                   └── route.js   # GET stats
├── lib/
│   ├── db.js              # Database connection and setup
│   └── streaks.js         # Streak calculation logic
├── data/                  # SQLite database directory (auto-created)
├── public/                # Static assets
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── package.json
├── PRD.md                 # This document
└── README.md
```

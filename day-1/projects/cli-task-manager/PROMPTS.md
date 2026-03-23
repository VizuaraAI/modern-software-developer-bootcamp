# CLI Task Manager — Build Prompts

Use these prompts with Claude Code to build this project from scratch. Compare your result with `solution/` when done.

## Setup

Create a new empty folder called `cli-task-manager`, navigate into it, and open Claude Code:
```
mkdir cli-task-manager && cd cli-task-manager && claude
```

---

## Prompt 1 — Initialize the project

```
Initialize a new Node.js project for a CLI task manager.
- Create package.json with "type": "module" and name "cli-task-manager"
- Install these dependencies: commander, chalk, cli-table3
- Create a src/ folder with an empty index.js
```

---

## Prompt 2 — Build the task manager

```
Build a CLI task manager in src/index.js with these commands:

Commands:
- add <title> [--priority high|medium|low]  Add a task. Default priority: medium.
- list                                        Show all tasks in a formatted table
- complete <id>                              Mark a task complete, record completedAt timestamp
- delete <id>                                Remove a task permanently
- search <keyword>                           Filter tasks by keyword, highlight matches in cyan
- stats                                      Show counts and a visual progress bar

Data storage:
- Store tasks in .task-manager/tasks.json inside the project folder
- Task shape: { id, title, priority, completed, createdAt, completedAt? }
- IDs are auto-incremented integers starting at 1

UI details:
- Use chalk for color: high = red.bold("HIGH"), medium = yellow.bold("MEDIUM"), low = green.bold("LOW")
- Use cli-table3 for the list and search output tables
- In list view: sort incomplete tasks first, then by priority (high > medium > low), then by id
- Show status emoji: completed = checkmark, pending = white square
- Show priority emoji: high = red circle, medium = yellow circle, low = green circle
- stats command: show total / completed / pending counts, then a 30-character progress bar
  using filled blocks for done and empty blocks for remaining, with the percentage at the end
- Completed tasks appear with strikethrough grey text in the table
```

---

## Prompt 3 — Test it end to end

```
Test the task manager by running these commands in sequence and showing me the output of each:

1. node src/index.js add "Build the landing page" --priority high
2. node src/index.js add "Write unit tests"
3. node src/index.js add "Update README" --priority low
4. node src/index.js list
5. node src/index.js complete 1
6. node src/index.js stats
7. node src/index.js search "test"
8. node src/index.js delete 2
9. node src/index.js list

Fix any errors that appear.
```

---

## Verification checklist

- [ ] `list` shows a colored, formatted table with the correct sort order
- [ ] Priorities are color-coded (red / yellow / green)
- [ ] `complete` marks task with strikethrough grey text
- [ ] `stats` shows a progress bar with percentage
- [ ] Tasks persist after closing and reopening (check `.task-manager/tasks.json`)
- [ ] `search` highlights the matched keyword in cyan
- [ ] Providing an invalid priority shows a clear error message

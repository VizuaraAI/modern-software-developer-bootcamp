# CLI Task Manager

A beautiful command-line task manager built with Claude Code.

## Installation

```bash
npm install
```

## Usage

### Add a task

```bash
node src/index.js add "Build the landing page"
node src/index.js add "Fix critical bug" --priority high
node src/index.js add "Update docs" --priority low
```

### List all tasks

```bash
node src/index.js list
```

### Complete a task

```bash
node src/index.js complete 1
```

### Delete a task

```bash
node src/index.js delete 2
```

### Search tasks

```bash
node src/index.js search "bug"
```

### View statistics

```bash
node src/index.js stats
```

## Features

- Color-coded priorities (red/yellow/green)
- Formatted table output
- Persistent storage in `~/.task-manager/tasks.json`
- Auto-incrementing task IDs
- Completion tracking with timestamps
- Search with keyword highlighting
- Progress bar in statistics view

## Built With

- [Commander](https://www.npmjs.com/package/commander) - CLI framework
- [Chalk](https://www.npmjs.com/package/chalk) - Terminal styling
- [cli-table3](https://www.npmjs.com/package/cli-table3) - Table formatting

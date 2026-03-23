#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import Table from "cli-table3";
import fs from "fs/promises";
import path from "path";
import os from "os";

// ─── Configuration ───────────────────────────────────────────────────────────

const __filename = decodeURIComponent(new URL(import.meta.url).pathname);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, ".task-manager");
const DATA_FILE = path.join(DATA_DIR, "tasks.json");

// ─── Data Layer ──────────────────────────────────────────────────────────────

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function loadTasks() {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { nextId: 1, tasks: [] };
  }
}

async function saveTasks(data) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Formatting Helpers ─────────────────────────────────────────────────────

function priorityLabel(priority) {
  switch (priority) {
    case "high":
      return chalk.red.bold("HIGH");
    case "medium":
      return chalk.yellow.bold("MEDIUM");
    case "low":
      return chalk.green.bold("LOW");
    default:
      return priority;
  }
}

function priorityEmoji(priority) {
  switch (priority) {
    case "high":
      return "\u{1F534}";
    case "medium":
      return "\u{1F7E1}";
    case "low":
      return "\u{1F7E2}";
    default:
      return "";
  }
}

function statusEmoji(completed) {
  return completed ? "\u2705" : "\u2B1C";
}

function formatTitle(title, completed) {
  if (completed) {
    return chalk.gray.strikethrough(title);
  }
  return chalk.white(title);
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function printHeader() {
  console.log();
  console.log(chalk.cyan.bold("  \u2500\u2500\u2500 Task Manager \u2500\u2500\u2500"));
  console.log();
}

// ─── Commands ────────────────────────────────────────────────────────────────

async function addTask(title, options) {
  const data = await loadTasks();
  const priority = options.priority || "medium";

  if (!["low", "medium", "high"].includes(priority)) {
    console.log(
      chalk.red(`\n  \u2718 Invalid priority "${priority}". Use: low, medium, or high.\n`)
    );
    process.exit(1);
  }

  const task = {
    id: data.nextId++,
    title,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  data.tasks.push(task);
  await saveTasks(data);

  printHeader();
  console.log(
    chalk.green(`  \u2714 Task added successfully!`)
  );
  console.log();
  console.log(`    ${statusEmoji(false)}  #${task.id}  ${chalk.white.bold(task.title)}`);
  console.log(`       Priority: ${priorityEmoji(task.priority)} ${priorityLabel(task.priority)}`);
  console.log(`       Created:  ${chalk.gray(formatDate(task.createdAt))}`);
  console.log();
}

async function listTasks() {
  const data = await loadTasks();

  printHeader();

  if (data.tasks.length === 0) {
    console.log(chalk.gray("  No tasks yet. Add one with: task add \"My first task\""));
    console.log();
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan.bold(""),
      chalk.cyan.bold("ID"),
      chalk.cyan.bold("Title"),
      chalk.cyan.bold("Priority"),
      chalk.cyan.bold("Created"),
    ],
    style: {
      head: [],
      border: ["gray"],
      "padding-left": 1,
      "padding-right": 1,
    },
    colWidths: [4, 6, 40, 14, 22],
    wordWrap: true,
  });

  // Sort: incomplete first, then by priority (high > medium > low), then by id
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...data.tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.id - b.id;
  });

  for (const task of sorted) {
    table.push([
      statusEmoji(task.completed),
      chalk.gray(`#${task.id}`),
      formatTitle(task.title, task.completed),
      `${priorityEmoji(task.priority)} ${priorityLabel(task.priority)}`,
      chalk.gray(formatDate(task.createdAt)),
    ]);
  }

  console.log(table.toString());

  const done = data.tasks.filter((t) => t.completed).length;
  const total = data.tasks.length;
  console.log(
    chalk.gray(`\n  Showing ${total} task${total !== 1 ? "s" : ""} (${done} completed)\n`)
  );
}

async function completeTask(id) {
  const data = await loadTasks();
  const taskId = parseInt(id, 10);

  if (isNaN(taskId)) {
    console.log(chalk.red(`\n  \u2718 Invalid ID. Please provide a numeric task ID.\n`));
    process.exit(1);
  }

  const task = data.tasks.find((t) => t.id === taskId);

  if (!task) {
    console.log(chalk.red(`\n  \u2718 Task #${taskId} not found.\n`));
    process.exit(1);
  }

  if (task.completed) {
    console.log(chalk.yellow(`\n  \u26A0 Task #${taskId} is already completed.\n`));
    return;
  }

  task.completed = true;
  task.completedAt = new Date().toISOString();
  await saveTasks(data);

  printHeader();
  console.log(chalk.green(`  \u2714 Task #${taskId} marked as complete!`));
  console.log();
  console.log(`    \u2705  ${chalk.gray.strikethrough(task.title)}`);
  console.log();
}

async function deleteTask(id) {
  const data = await loadTasks();
  const taskId = parseInt(id, 10);

  if (isNaN(taskId)) {
    console.log(chalk.red(`\n  \u2718 Invalid ID. Please provide a numeric task ID.\n`));
    process.exit(1);
  }

  const taskIndex = data.tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    console.log(chalk.red(`\n  \u2718 Task #${taskId} not found.\n`));
    process.exit(1);
  }

  const [removed] = data.tasks.splice(taskIndex, 1);
  await saveTasks(data);

  printHeader();
  console.log(chalk.green(`  \u2714 Task #${taskId} deleted.`));
  console.log();
  console.log(`    \u{1F5D1}\uFE0F  ${chalk.gray(removed.title)}`);
  console.log();
}

async function searchTasks(keyword) {
  const data = await loadTasks();
  const query = keyword.toLowerCase();

  printHeader();

  const matches = data.tasks.filter((t) =>
    t.title.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    console.log(chalk.gray(`  No tasks matching "${keyword}".`));
    console.log();
    return;
  }

  console.log(
    chalk.white(`  \u{1F50D} Found ${matches.length} task${matches.length !== 1 ? "s" : ""} matching "${keyword}":\n`)
  );

  const table = new Table({
    head: [
      chalk.cyan.bold(""),
      chalk.cyan.bold("ID"),
      chalk.cyan.bold("Title"),
      chalk.cyan.bold("Priority"),
      chalk.cyan.bold("Created"),
    ],
    style: {
      head: [],
      border: ["gray"],
      "padding-left": 1,
      "padding-right": 1,
    },
    colWidths: [4, 6, 40, 14, 22],
    wordWrap: true,
  });

  for (const task of matches) {
    // Highlight the matching keyword in the title
    const highlighted = task.title.replace(
      new RegExp(`(${keyword})`, "gi"),
      (match) => chalk.cyan.underline(match)
    );

    table.push([
      statusEmoji(task.completed),
      chalk.gray(`#${task.id}`),
      task.completed ? chalk.gray.strikethrough(task.title) : highlighted,
      `${priorityEmoji(task.priority)} ${priorityLabel(task.priority)}`,
      chalk.gray(formatDate(task.createdAt)),
    ]);
  }

  console.log(table.toString());
  console.log();
}

async function showStats() {
  const data = await loadTasks();

  printHeader();

  if (data.tasks.length === 0) {
    console.log(chalk.gray("  No tasks yet. Add one to see statistics!"));
    console.log();
    return;
  }

  const total = data.tasks.length;
  const completed = data.tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = data.tasks.filter((t) => t.priority === "high" && !t.completed).length;
  const mediumPriority = data.tasks.filter((t) => t.priority === "medium" && !t.completed).length;
  const lowPriority = data.tasks.filter((t) => t.priority === "low" && !t.completed).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Progress bar
  const barLength = 30;
  const filledLength = Math.round((completionRate / 100) * barLength);
  const bar =
    chalk.green("\u2588".repeat(filledLength)) +
    chalk.gray("\u2591".repeat(barLength - filledLength));

  console.log(chalk.white.bold("  \u{1F4CA} Task Statistics\n"));

  console.log(`    Total tasks:      ${chalk.white.bold(total)}`);
  console.log(`    Completed:        ${chalk.green.bold(completed)}`);
  console.log(`    Pending:          ${chalk.yellow.bold(pending)}`);
  console.log();

  console.log(`    Completion:  ${bar}  ${chalk.white.bold(completionRate + "%")}`);
  console.log();

  console.log(chalk.white.bold("  \u{1F3AF} Pending by Priority\n"));
  console.log(`    \u{1F534} High:     ${chalk.red.bold(highPriority)}`);
  console.log(`    \u{1F7E1} Medium:   ${chalk.yellow.bold(mediumPriority)}`);
  console.log(`    \u{1F7E2} Low:      ${chalk.green.bold(lowPriority)}`);
  console.log();
}

// ─── CLI Setup ───────────────────────────────────────────────────────────────

const program = new Command();

program
  .name("task")
  .description(chalk.cyan("A beautiful CLI task manager built with Claude Code"))
  .version("1.0.0");

program
  .command("add")
  .description("Add a new task")
  .argument("<title>", "Task title")
  .option("-p, --priority <level>", "Priority level (low, medium, high)", "medium")
  .action(addTask);

program
  .command("list")
  .description("List all tasks")
  .action(listTasks);

program
  .command("complete")
  .description("Mark a task as complete")
  .argument("<id>", "Task ID")
  .action(completeTask);

program
  .command("delete")
  .description("Delete a task")
  .argument("<id>", "Task ID")
  .action(deleteTask);

program
  .command("search")
  .description("Search tasks by keyword")
  .argument("<keyword>", "Search keyword")
  .action(searchTasks);

program
  .command("stats")
  .description("Show task statistics")
  .action(showStats);

program.parse();

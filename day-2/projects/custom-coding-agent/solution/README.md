# Custom Coding Agent - A Mini Claude Code

A coding agent built from scratch using the Anthropic SDK. This agent can read files, write files, and run shell commands — all driven by Claude's intelligence.

Built as a demo project for learning how AI coding agents work under the hood.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

## Usage

```bash
# Basic usage
node agent.js "Your task description here"

# Examples
node agent.js "Create a hello world program in Python and run it"
node agent.js "Create a simple calculator in JavaScript with add, subtract, multiply, divide functions and test it"
node agent.js "List all files in the current directory and tell me what they do"
node agent.js "Create an HTML file with a styled landing page for a coffee shop"
```

## How It Works

The agent follows a simple loop:

1. **You** provide a task (e.g., "Create a Python script that prints hello world")
2. **Claude** receives the task along with 3 available tools (read_file, write_file, run_command)
3. **Claude decides** which tool to use and with what parameters
4. **The agent executes** the tool and sends the result back to Claude
5. **Repeat** until Claude decides the task is complete

This is called the **agentic loop** — the same pattern used by tools like Claude Code, Cursor, and other AI coding assistants.

### The Three Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `read_file` | Read contents of a file | Inspect existing code |
| `write_file` | Create or overwrite a file | Generate new code |
| `run_command` | Execute a shell command | Run scripts, install packages |

### Key Concepts

- **Tool definitions** tell Claude what tools exist and what parameters they accept (JSON Schema)
- **The system prompt** shapes the agent's behavior and methodology
- **Conversation history** lets Claude remember what it has already done
- **Stop reason** tells us whether Claude wants to use more tools or is finished
- **Safety limits** (max iterations, command timeout) prevent runaway execution

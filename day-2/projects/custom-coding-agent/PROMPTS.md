# Custom Coding Agent — Build Prompts

Build a mini AI coding agent from scratch using the Anthropic SDK. This is the same core pattern used by Claude Code, Cursor, and other AI coding tools.

## Setup

Create a new empty folder called `custom-coding-agent`, navigate into it, and open Claude Code:
```
mkdir custom-coding-agent && cd custom-coding-agent && claude
```

Make sure your Anthropic API key is set:
```
export ANTHROPIC_API_KEY="sk-ant-..."
```

---

## Prompt 1 — Initialize the project

```
Set up a Node.js project for a coding agent:
- Create package.json with "type": "module"
- Install @anthropic-ai/sdk
- Create an empty agent.js file
```

---

## Prompt 2 — Build the agent

```
Build a coding agent in agent.js. Here is exactly how it should work:

Usage: node agent.js "your task description here"

The agent implements an agentic loop:
1. Accept a task string from process.argv[2]. If none is provided, print usage and exit.
2. Define 3 tools for Claude to call:
   - read_file(path: string): reads and returns the file contents, or an error message
   - write_file(path: string, content: string): writes the file (creates parent directories
     if needed), returns a success or error message
   - run_command(command: string): runs a shell command with a 30-second timeout,
     returns stdout or an error message

3. Initialize the Anthropic client (it reads ANTHROPIC_API_KEY automatically)

4. Build and run the agentic loop:
   - Start with messages = [{ role: "user", content: task }]
   - System prompt: "You are a coding agent. You can read files, write files, and run
     shell commands. Break down tasks into steps. Always verify your work by reading
     files after writing and running code after creating it."
   - Send messages to claude-sonnet-4-20250514 with max_tokens 4096 and the 3 tools
   - Add Claude's response to messages history
   - If stop_reason is "end_turn", print the final text and break
   - Otherwise, find all tool_use blocks, execute each tool, collect results, and
     send them back as a user message with tool_result blocks
   - Safety limit: max 25 iterations, stop and warn if exceeded

5. For each tool call, log:
   - The tool name
   - A 100-character preview of the input
   - A 200-character preview of the result
```

---

## Prompt 3 — Test the agent

```
Test the agent with these two tasks and show me the full output including all tool calls:

Task 1:
node agent.js "Create a Python script called hello.py that prints 'Hello from the agent!' and then run it"

Task 2:
node agent.js "Create a JavaScript function in fib.js that returns the nth Fibonacci number using recursion, then write a small test at the bottom that prints fib(10) and run it"

Fix any errors before continuing.
```

---

## Verification checklist

- [ ] Running without arguments prints usage instructions and exits
- [ ] Agent logs each tool call (name, input preview, result preview)
- [ ] Agent loops correctly — calls tools, feeds results back, loops again
- [ ] Agent stops cleanly when stop_reason is "end_turn"
- [ ] Safety limit of 25 iterations prevents infinite loops
- [ ] Files created by the agent actually exist and run correctly

## Key concept to understand

The agentic loop is the foundation of all AI coding tools. Each iteration:
1. Claude sees the full conversation history
2. Claude decides what tool to use (or says it is done)
3. You execute the tool and send the result back
4. Repeat

This is identical to how Claude Code, Cursor, Devin, and other AI agents work.

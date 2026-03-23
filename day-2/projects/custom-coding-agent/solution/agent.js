// ============================================================================
// CUSTOM CODING AGENT - A Mini Claude Code
// ============================================================================
// This file implements a complete AI coding agent from scratch.
// The agent can read files, write files, and run shell commands — then it
// uses Claude's intelligence to decide WHICH tool to call and WHEN.
//
// This is the core "agentic loop" pattern:
//   1. Send a task to Claude along with available tools
//   2. Claude decides which tool to use (or responds with text)
//   3. We execute the tool and send the result back
//   4. Repeat until Claude says "I'm done"
// ============================================================================

// --- IMPORTS ----------------------------------------------------------------
// We need three things:
//   - Anthropic SDK: to talk to Claude's API
//   - fs: to read/write files on disk
//   - execSync: to run shell commands (like "node script.js" or "ls")
// ----------------------------------------------------------------------------
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import { execSync } from "child_process";

// --- INITIALIZE THE ANTHROPIC CLIENT ----------------------------------------
// The SDK automatically picks up ANTHROPIC_API_KEY from environment variables.
// Make sure you've set it: export ANTHROPIC_API_KEY="sk-ant-..."
// ----------------------------------------------------------------------------
const client = new Anthropic();

// --- TOOL DEFINITIONS -------------------------------------------------------
// These are the tools we give to Claude. Each tool has:
//   - name: unique identifier Claude uses to call it
//   - description: helps Claude understand WHEN to use this tool
//   - input_schema: JSON Schema defining what parameters the tool accepts
//
// Think of these as the "hands" of the agent — without tools, Claude can
// only think and talk. With tools, it can ACT on the world.
// ----------------------------------------------------------------------------
const tools = [
  {
    // TOOL 1: READ FILE
    // Lets the agent inspect existing code, configs, or any text file.
    // This is essential for understanding what already exists before making changes.
    name: "read_file",
    description:
      "Read the contents of a file at the given path. Use this to inspect existing code, check configurations, or verify files you've written.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The path to the file to read",
        },
      },
      required: ["path"],
    },
  },
  {
    // TOOL 2: WRITE FILE
    // Lets the agent create new files or overwrite existing ones.
    // This is how the agent produces code, configs, or any output.
    name: "write_file",
    description:
      "Write content to a file at the given path. This will create the file if it doesn't exist, or overwrite it if it does. Always verify by reading the file after writing.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The path where the file should be written",
        },
        content: {
          type: "string",
          description: "The content to write to the file",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    // TOOL 3: RUN COMMAND
    // Lets the agent execute shell commands like "node app.js", "npm install",
    // "python script.py", "ls -la", etc.
    // The timeout prevents runaway processes from hanging forever.
    name: "run_command",
    description:
      "Run a shell command and return its output. Use this for running code, installing packages, listing files, or any terminal operation.",
    input_schema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The shell command to execute",
        },
      },
      required: ["command"],
    },
  },
];

// --- TOOL EXECUTOR ----------------------------------------------------------
// This function is the bridge between Claude's DECISIONS and REAL ACTIONS.
// When Claude says "I want to use read_file with path='./app.js'",
// this function actually reads that file and returns the contents.
//
// It's a simple dispatch: match the tool name, run the right code.
// ----------------------------------------------------------------------------
function executeTool(name, input) {
  switch (name) {
    case "read_file":
      // Read and return the file contents, or return an error message
      try {
        return fs.readFileSync(input.path, "utf-8");
      } catch (error) {
        return `Error reading file: ${error.message}`;
      }

    case "write_file":
      // Write the content to disk, creating directories if needed
      try {
        // Ensure the parent directory exists (handles nested paths)
        const dir = input.path.substring(0, input.path.lastIndexOf("/"));
        if (dir) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(input.path, input.content);
        return `Successfully wrote to ${input.path}`;
      } catch (error) {
        return `Error writing file: ${error.message}`;
      }

    case "run_command":
      // Execute a shell command with a 30-second timeout for safety
      try {
        const output = execSync(input.command, {
          encoding: "utf-8",
          timeout: 30000, // 30 second timeout prevents infinite loops
        });
        return output || "(command completed with no output)";
      } catch (error) {
        return `Error: ${error.message}`;
      }

    default:
      return `Unknown tool: ${name}`;
  }
}

// --- THE AGENT LOOP ---------------------------------------------------------
// This is the HEART of the agent. It implements the core loop:
//
//   User Task --> Claude thinks --> Claude picks a tool --> We run it -->
//   Send result back --> Claude thinks again --> ... --> Done!
//
// The loop continues until Claude decides it's finished (stop_reason: "end_turn")
// or we hit the safety limit of 25 iterations.
// ----------------------------------------------------------------------------
async function runAgent(task) {
  console.log("\n🤖 Agent starting...");
  console.log(`📋 Task: ${task}\n`);

  // --- BUILD THE INITIAL MESSAGE --------------------------------------------
  // Every conversation starts with the user's task. We'll keep adding to
  // this array as the conversation goes back and forth.
  // -------------------------------------------------------------------------
  const messages = [{ role: "user", content: task }];

  // --- THE SYSTEM PROMPT ----------------------------------------------------
  // This tells Claude WHO it is and HOW to behave. A good system prompt
  // is critical for agent performance. Notice we tell it to:
  //   1. Break tasks into steps (methodical approach)
  //   2. Verify its work (read after write, run after create)
  // -------------------------------------------------------------------------
  const systemPrompt =
    "You are a coding agent. You can read files, write files, and run shell commands. Break down tasks into steps. Always verify your work by reading files after writing and running code after creating it.";

  // --- ITERATION COUNTER & SAFETY LIMIT -------------------------------------
  // AI agents can theoretically loop forever. The max iteration limit is
  // a safety net to prevent infinite loops and runaway API costs.
  // -------------------------------------------------------------------------
  let iterations = 0;
  const MAX_ITERATIONS = 25;

  // --- MAIN AGENT LOOP ------------------------------------------------------
  // This while(true) loop is the agentic loop. Each iteration:
  //   1. Sends the full conversation to Claude
  //   2. Claude responds (with text, tool calls, or both)
  //   3. We process tool calls and feed results back
  //   4. Loop continues until Claude says it's done
  // -------------------------------------------------------------------------
  while (true) {
    // Safety check: prevent infinite loops
    iterations++;
    if (iterations > MAX_ITERATIONS) {
      console.log("\n⚠️  Max iterations reached. Stopping agent.");
      break;
    }

    // --- CALL THE CLAUDE API ------------------------------------------------
    // We send:
    //   - model: which Claude model to use
    //   - max_tokens: maximum response length
    //   - system: the system prompt (agent personality/instructions)
    //   - tools: the list of tools Claude can call
    //   - messages: the full conversation history so far
    //
    // Claude will respond with content blocks that are either:
    //   - "text" blocks: Claude's thinking/response
    //   - "tool_use" blocks: Claude wants to use a tool
    // -----------------------------------------------------------------------
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools: tools,
      messages: messages,
    });

    // --- ADD CLAUDE'S RESPONSE TO CONVERSATION HISTORY ----------------------
    // We must keep the full history so Claude has context of everything
    // that's happened so far (what it tried, what worked, what failed).
    // -----------------------------------------------------------------------
    messages.push({ role: "assistant", content: response.content });

    // --- CHECK IF CLAUDE IS DONE --------------------------------------------
    // stop_reason "end_turn" means Claude has finished and is responding
    // with final text (no more tool calls needed).
    // -----------------------------------------------------------------------
    if (response.stop_reason === "end_turn") {
      // Extract and display any final text from Claude
      const finalText = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      if (finalText) {
        console.log(`\n✅ Agent finished:\n${finalText}`);
      }
      break; // Exit the loop — we're done!
    }

    // --- PROCESS TOOL CALLS -------------------------------------------------
    // If Claude wants to use tools, we need to:
    //   1. Find all tool_use blocks in the response
    //   2. Execute each tool
    //   3. Collect the results
    //   4. Send them back as a "user" message with tool_result blocks
    //
    // Note: Claude can call MULTIPLE tools in a single response!
    // -----------------------------------------------------------------------
    const toolResults = [];

    for (const block of response.content) {
      if (block.type === "tool_use") {
        // Log what tool the agent is using (helps with debugging)
        console.log(`🔧 Tool: ${block.name}`);

        // Show a preview of the input (truncated for readability)
        const inputPreview = JSON.stringify(block.input).substring(0, 100);
        console.log(`   Input: ${inputPreview}${inputPreview.length >= 100 ? "..." : ""}`);

        // Actually execute the tool and get the result
        const result = executeTool(block.name, block.input);

        // Show a preview of the result
        const resultPreview = String(result).substring(0, 200);
        console.log(`   Result: ${resultPreview}${resultPreview.length >= 200 ? "..." : ""}\n`);

        // Collect the result in the format the API expects
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id, // Must match the tool_use block's ID
          content: String(result),
        });
      }
    }

    // --- SEND TOOL RESULTS BACK TO CLAUDE -----------------------------------
    // Tool results go in a "user" message. This is because in the API's
    // conversation model, tool results are provided by the "user" side
    // (we're the executor, Claude is the thinker).
    // -----------------------------------------------------------------------
    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }
}

// --- CLI ENTRY POINT --------------------------------------------------------
// This is where the program starts. We grab the task from command line args
// and kick off the agent. If no task is provided, show usage instructions.
//
// Usage: node agent.js "Create a hello world program"
// ----------------------------------------------------------------------------
const task = process.argv[2];

if (!task) {
  console.log("Usage: node agent.js \"<your task>\"");
  console.log("Example: node agent.js \"Create a hello world program in Python\"");
  process.exit(1);
}

// Run the agent and handle any unexpected errors
runAgent(task).catch(console.error);

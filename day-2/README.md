# Day 2 — AI-Assisted Development

## Projects

### custom-coding-agent
Build a mini coding agent from scratch using the Anthropic SDK. The agent implements the core agentic loop: send a task to Claude, execute tool calls, feed results back, repeat until done. This is how Claude Code itself works under the hood.

### mcp-weather-server
Build a Model Context Protocol (MCP) server that exposes weather tools to Claude. Once registered, Claude can call your tools in any conversation. This covers the MCP protocol, tool schemas, and stdio communication.

## How to work on these
1. Open the project folder you want to build
2. Read `PROMPTS.md`
3. Create a new empty folder on your machine, open Claude Code inside it
4. Follow the prompts to build the project
5. Compare your result with `solution/`

## Prerequisites
- `ANTHROPIC_API_KEY` set in your environment (for custom-coding-agent)

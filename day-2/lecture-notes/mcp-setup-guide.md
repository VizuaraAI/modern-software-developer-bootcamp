# MCP Setup Guide

**Model Context Protocol (MCP)** is a universal standard for connecting AI agents to external tools and data sources. Think of it as **USB for AI**: build a tool once, plug it into any AI agent.

---

## How to Add MCP Servers to Claude Code

### Method 1: CLI Command (simplest)

```bash
# stdio transport (local process):
claude mcp add --transport stdio <name> -- <command> [args...]

# HTTP transport (remote service):
claude mcp add --transport http <name> <url>

# With environment variables:
claude mcp add --transport stdio --env API_KEY=xxx <name> -- <command>
```

### Method 2: Project Config File (`.mcp.json`)

Create a `.mcp.json` in your project root — committed to git so the whole team has the same tools:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "env": {}
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {}
    }
  }
}
```

### Method 3: Claude Desktop Config

File: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/Desktop"],
      "env": {}
    }
  }
}
```

---

## MCP Servers Used in This Course

### 1. GitHub MCP (Official, by GitHub)

**What it does**: Create repos, manage PRs, issues, branches, read code.

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

> **Important**: `claude mcp list` will show "Failed to connect" for GitHub — this is normal. GitHub MCP authenticates via OAuth inside a Claude Code session. Launch `claude`, type `/mcp`, and authenticate in your browser.

---

### 2. Sequential Thinking MCP

**What it does**: Structured step-by-step reasoning before acting.

```bash
claude mcp add --transport stdio sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
```

---

### 3. Memory MCP

**What it does**: Persistent key-value memory that survives across sessions.

```bash
claude mcp add --transport stdio memory -- npx -y @modelcontextprotocol/server-memory
```

---

### 4. Notion MCP (Official, by Notion)

**What it does**: Read/write Notion pages, databases, blocks.

```bash
# Option A: HTTP remote (recommended)
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Option B: Local stdio (needs NOTION_TOKEN)
claude mcp add --transport stdio --env NOTION_TOKEN=ntn_YOUR_TOKEN notion -- npx -y @notionhq/notion-mcp-server
```

---

### 5. Brave Search MCP

**What it does**: Web search via Brave's search API.

```bash
claude mcp add --transport stdio --env BRAVE_API_KEY=YOUR_KEY brave-search -- npx -y @brave/brave-search-mcp-server
```

> Get a free API key at https://brave.com/search/api/

---

## Useful Commands

```bash
# List all connected MCP servers and their status
claude mcp list

# Get details about a specific server
claude mcp get <name>

# Remove a server
claude mcp remove <name>

# Inside Claude Code — check MCP status
/mcp

# Inside Claude Code — see all available tools (including MCP tools)
/tools
```

---

## The N×M Problem MCP Solves

```
WITHOUT MCP (N×M integrations):

  Claude Code ──► GitHub Plugin (for Claude)
  Cursor ──────► GitHub Plugin (for Cursor)
  Copilot ─────► GitHub Plugin (for Copilot)
  = 9 integrations for 3 hosts × 3 tools

WITH MCP (N+M integrations):

  Claude Code ─┐
  Cursor ──────┼──► MCP ──┬──► GitHub MCP Server
  Copilot ─────┘          ├──► Notion MCP Server
                          └──► ArXiv MCP Server
  = 6 integrations (3 hosts + 3 servers)
```

MCP separates the "host" (the AI agent) from the "tool" (the external service). Build the tool once, use it with any agent.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npx` not found | Install Node.js: `brew install node` |
| GitHub MCP shows "Failed to connect" | Normal — authenticate via OAuth inside `claude` by typing `/mcp` |
| `npm EPERM` / permission errors | Run: `sudo rm -rf ~/.npm` then retry |
| `npm cache root-owned files` | Run: `sudo chown -R $(id -u):$(id -g) ~/.npm` |
| Server timeout on first run | Some servers take 10-15s to start (downloading npm packages) — wait and retry |

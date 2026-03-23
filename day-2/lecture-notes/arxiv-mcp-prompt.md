# ArXiv MCP Integration — Claude Code Prompt

Use this prompt to add ArXiv MCP server support to the Paper-to-Notebook app from Day 1. This extends the app so users can paste an arXiv URL instead of uploading a PDF.

---

## Prerequisites

- The Paper-to-Notebook app from Day 1 is built and running
- Python 3.10+ (check with `python --version`)

---

## The Prompt

Run this inside the Paper-to-Notebook project directory:

```
I want to add ArXiv MCP server support to this Paper-to-Notebook app, so users
can paste an arXiv URL/ID instead of uploading a PDF.

## What to install
- `pip install "mcp[cli]" arxiv-mcp-server` (needs Python 3.10+, recreate the venv if needed)
- The ArXiv MCP server binary will be at `venv/bin/arxiv-mcp-server`

## How MCP works (important context)
MCP servers communicate via stdio. You connect to them using the `mcp` Python SDK:

```python
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters

params = StdioServerParameters(command="venv/bin/arxiv-mcp-server", args=[])
async with stdio_client(params) as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        tools = await session.list_tools()
        result = await session.call_tool("download_paper", {"paper_id": "2401.12345"})
```

The ArXiv MCP server exposes: `search_papers`, `download_paper`, `read_paper`, `list_papers`.

## Critical gotchas
1. Use the FULL PATH to the MCP server binary (`venv/bin/arxiv-mcp-server`), not just `arxiv-mcp-server`
2. MCP client calls are async — use `anyio` internally. For sync code in async context, use `loop.run_in_executor()`
3. When polling frontend for log updates, always fetch the full log (`since_id=0`) — incremental tracking breaks when the log resets
4. Add `expose_headers=["Content-Disposition"]` to CORS middleware so the frontend can read filenames

## What to build

### Backend (`mcp_clients.py`)
- Create an MCP client manager that:
  - Connects to the ArXiv MCP server via stdio
  - Calls `download_paper(paper_id)` then `read_paper(paper_id)`
  - Logs EVERY MCP interaction to an in-memory activity log:
    connecting, connected, calling_tool (with tool name + params), result (with timing), errors
  - Each log entry: id, timestamp, server name, action, tool name, details
  - Provides `get_activity_log(since_id)` and `clear_activity_log()`

### Backend (`main.py`)
- Add `POST /api/arxiv/fetch` — accepts `{paper_id: "2401.12345"}` or full arXiv URL,
  strips the URL prefix, calls the MCP client, generates a notebook with Gemini
- Add `GET /api/mcp/activity?since_id=0` — returns the activity log
- Add `POST /api/mcp/activity/clear` — clears the log
- Log a "generating" event BEFORE the Gemini API call so users see progress during the wait
- Accept the API key from the `X-Api-Key` request header

### Frontend
- Add a tab switcher: "Upload PDF" | "arXiv URL" (with an MCP badge on the arXiv tab)
- Add an arXiv URL/ID input field
- Add an MCP Activity Log panel on the right side that:
  - Polls `GET /api/mcp/activity?since_id=0` every 1 second during conversion
  - Shows each event: emoji icon, server name, tool name, timestamp, details
  - Clears when a new conversion starts
  - Auto-scrolls to the bottom
- Drive the progress steps from actual MCP log events (not arbitrary timers)
- Keep the existing PDF upload flow working unchanged
```

---

## What to test

After the build, paste `2403.03507` in the arXiv URL field. You should see the MCP Activity Log update in real-time:

```
connecting    — Starting ArXiv MCP server...
connected     — ArXiv MCP server ready
download_paper — paper_id=2403.03507
download_paper — Downloaded in 0.6s
read_paper    — paper_id=2403.03507
read_paper    — Read in 0.0s
generating    — Sending to Gemini API...
arxiv_done    — Generated notebook!
```

---

## Challenges to try

### Challenge 1: Puppeteer MCP (Medium)
```
Add the Puppeteer MCP server to take a screenshot of the generated notebook in Google Colab.

Install: npm install -g @modelcontextprotocol/server-puppeteer
Command: npx -y @modelcontextprotocol/server-puppeteer
Tools: puppeteer_navigate, puppeteer_screenshot, puppeteer_click, puppeteer_fill

Note: Puppeteer opens its own headless browser. For "Open in Colab", open Colab in the
user's browser with window.open() AND use Puppeteer in the background to take a screenshot
for the activity log.
```

### Challenge 2: Excalidraw MCP (Hard)
```
Add the Excalidraw MCP server to generate architecture diagrams of the paper's algorithm.

Note: This MCP server has two processes:
1. Canvas server (REST API + WebSocket UI): node dist/server.js
2. MCP stdio server

The MCP stdio transport has compatibility issues with the Python SDK. Use the canvas
REST API directly:
  POST /api/elements/from-mermaid with {"mermaidDiagram": "graph TD\n A --> B"}
  (field is "mermaidDiagram", not "mermaidSyntax")

Install: git clone https://github.com/yctimlin/mcp_excalidraw && npm install && npm run build
```

---

## Key concept: MCP is a protocol, not a library

You are not importing an arXiv Python library. You are starting a **separate process** (the MCP server) and communicating with it through a protocol over stdin/stdout. This is why it works with any MCP host — Claude Code, Cursor, or your own app.

The Activity Log makes this transparent: you can see exactly which server was called, which tool, what parameters, and how long it took. MCP is not a black box.

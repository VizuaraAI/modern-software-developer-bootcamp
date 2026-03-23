# MCP Weather Server — Build Prompts

Build a Model Context Protocol (MCP) server that gives Claude weather tools. Once registered, Claude can call your server's tools in any conversation.

## Setup

Create a new empty folder called `mcp-weather-server`, navigate into it, and open Claude Code:
```
mkdir mcp-weather-server && cd mcp-weather-server && claude
```

---

## Prompt 1 — Initialize the project

```
Set up a Node.js project for an MCP server:
- Create package.json with "type": "module"
- Install @modelcontextprotocol/sdk
- Create an empty server.js file
```

---

## Prompt 2 — Build the MCP server

```
Build an MCP weather server in server.js that exposes two tools to Claude.

Server setup:
- Use McpServer from @modelcontextprotocol/sdk/server/mcp.js
- Use StdioServerTransport from @modelcontextprotocol/sdk/server/stdio.js
- Server name: "weather-server", version: "1.0.0"
- Connect via stdio transport

Tool 1 — get_current_weather:
- Input: city (string, required)
- Returns: { city, temperature (number in Celsius), condition (string),
  humidity (number 0-100), windSpeed (number in km/h), feelsLike (number in Celsius) }

Tool 2 — get_forecast:
- Input: city (string, required), days (number 1-7, required)
- Returns: { city, forecast: Array of { date (YYYY-MM-DD), high, low, condition, rainChance } }

Weather data:
- Include realistic hardcoded data for these 8 cities:
  New York, London, Tokyo, Paris, Sydney, Mumbai, San Francisco, Berlin
- For any unknown city, generate plausible random weather (temperature between 10-30C, etc.)

The server communicates over stdin/stdout — do not add any HTTP server.
```

---

## Prompt 3 — Register with Claude Code

```
Show me the exact command to register this MCP server with Claude Code.
Use the absolute path to server.js on this machine.
Then verify it was registered with `claude mcp list`.
```

---

## Prompt 4 — Test the tools

Once registered, open a new Claude conversation and test:
```
Try asking Claude these questions to verify the tools work:
1. "What is the weather like in Tokyo right now?"
2. "Give me a 5-day forecast for London."
3. "Compare the weather in New York and Sydney."
4. "What is the weather in a city Claude has no data for, like Reykjavik?"
Show me the responses and confirm the tools were called.
```

---

## Verification checklist

- [ ] `npm start` (or `node server.js`) starts without errors
- [ ] `claude mcp list` shows weather-server
- [ ] Claude calls `get_current_weather` when asked about current conditions
- [ ] Claude calls `get_forecast` when asked about a multi-day forecast
- [ ] Unknown cities return plausible (not crashing) weather data

## How MCP works

1. Claude Code launches `server.js` as a child process
2. They communicate over stdin/stdout using the MCP protocol (JSON-RPC)
3. When Claude needs weather data, it calls one of your registered tools
4. Your server returns JSON, Claude interprets it and responds to the user

This is the same protocol used by all official Claude integrations (GitHub, Slack, databases, etc.)

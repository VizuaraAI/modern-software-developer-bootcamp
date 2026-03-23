# MCP Weather Server

A demo **Model Context Protocol (MCP)** server that provides weather tools to AI assistants like Claude. Built as a workshop example to show how MCP works.

The server exposes two tools:

| Tool | Description |
|------|-------------|
| `get_current_weather` | Returns current temperature, condition, humidity, and wind speed for a city |
| `get_forecast` | Returns a 5-day forecast with highs, lows, conditions, and rain chance |

Weather data is simulated for 8 built-in cities (New York, London, Tokyo, Paris, Sydney, Mumbai, San Francisco, Berlin). Unknown cities get randomly generated but plausible weather.

## Install

```bash
cd mcp-weather-server
npm install
```

## Connect to Claude Code

Register the server so Claude can use its tools:

```bash
claude mcp add weather-server node /absolute/path/to/mcp-weather-server/server.js
```

Replace `/absolute/path/to/` with the actual path on your machine.

To verify it was added:

```bash
claude mcp list
```

## Example Prompts

Once connected, try asking Claude:

- "What's the weather like in Tokyo?"
- "Compare the weather in London and Sydney."
- "Give me a 5-day forecast for San Francisco."
- "Should I pack an umbrella for Paris this week?"
- "Which city has the best weather right now: New York, Berlin, or Mumbai?"

## How It Works

1. Claude Code launches `server.js` as a child process.
2. They communicate over **stdin/stdout** using the MCP protocol.
3. When Claude decides it needs weather data, it calls one of the registered tools.
4. The server returns JSON results, which Claude then interprets for the user.

> **Note:** This server uses simulated data for demo purposes. In production you would replace the static data with calls to a real weather API like OpenWeatherMap.

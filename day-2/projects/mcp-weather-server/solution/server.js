// =============================================================================
// MCP Weather Server
// =============================================================================
// This is a Model Context Protocol (MCP) server that exposes weather tools
// to AI assistants like Claude. MCP lets AI models call external tools —
// think of it as giving the AI "hands" to reach out and fetch real data.
//
// In this demo we use simulated data, but the same pattern works for any API.
// =============================================================================

// --- Imports -----------------------------------------------------------------
// McpServer   – the core class that handles tool registration & request routing
// StdioServerTransport – connects the server to stdin/stdout so Claude can talk to it
// z (Zod)     – schema validation library used to define tool parameters
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// --- Create the MCP Server ---------------------------------------------------
// The name and version are sent to the client during the handshake so it knows
// which server it's talking to.
const server = new McpServer({
  name: "weather-server",
  version: "1.0.0",
});

// --- Simulated Weather Database ----------------------------------------------
// In a real server you'd call an API like OpenWeatherMap here.
// We store static data for well-known cities to keep the demo predictable.
const weatherData = {
  "new york":      { temp: 22, condition: "Partly Cloudy", humidity: 60, windSpeed: 15 },
  "london":        { temp: 15, condition: "Overcast",      humidity: 75, windSpeed: 20 },
  "tokyo":         { temp: 28, condition: "Sunny",         humidity: 55, windSpeed: 10 },
  "paris":         { temp: 18, condition: "Light Rain",    humidity: 80, windSpeed: 12 },
  "sydney":        { temp: 24, condition: "Sunny",         humidity: 45, windSpeed: 18 },
  "mumbai":        { temp: 33, condition: "Humid",         humidity: 85, windSpeed: 8  },
  "san francisco": { temp: 16, condition: "Foggy",         humidity: 70, windSpeed: 22 },
  "berlin":        { temp: 13, condition: "Cloudy",        humidity: 65, windSpeed: 14 },
};

// --- Helper: Get Current Weather ---------------------------------------------
// Returns weather for known cities. For unknown cities it generates random but
// plausible data so the tool always returns something useful.
function getWeather(city) {
  const key = city.toLowerCase().trim();
  if (weatherData[key]) {
    return { city, ...weatherData[key] };
  }

  // Generate plausible random weather for unknown cities
  const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Overcast"];
  return {
    city,
    temp: Math.round(Math.random() * 35 + 5),               // 5 – 40 °C
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    humidity: Math.round(Math.random() * 60 + 30),           // 30 – 90 %
    windSpeed: Math.round(Math.random() * 30 + 5),           // 5 – 35 km/h
  };
}

// --- Helper: Get 5-Day Forecast ----------------------------------------------
// Builds a forecast by starting from the current weather and adding small daily
// variations so the numbers feel realistic.
function getForecast(city) {
  const current = getWeather(city);
  const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Overcast", "Clear"];
  const forecast = [];

  for (let day = 1; day <= 5; day++) {
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const todayIndex = new Date().getDay();                   // 0 = Sunday
    const dayName = dayNames[(todayIndex + day) % 7];

    // Vary temperature slightly each day (-3 to +3 degrees)
    const variation = Math.round(Math.random() * 6 - 3);
    const high = current.temp + variation + 2;                // high is a bit above base
    const low = current.temp + variation - 4;                 // low is below base

    forecast.push({
      day: dayName,
      high,
      low,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      rainChance: Math.round(Math.random() * 80),            // 0 – 80 %
    });
  }

  return { city, forecast };
}

// =============================================================================
// Tool Registration
// =============================================================================
// Each tool needs three things:
//   1. A name (string the AI uses to call it)
//   2. A schema describing the parameters (built with Zod)
//   3. An async handler that returns the result
// =============================================================================

// --- Tool 1: get_current_weather ---------------------------------------------
server.tool(
  "get_current_weather",
  "Get the current weather conditions for a city. Returns temperature (Celsius), condition, humidity percentage, and wind speed in km/h.",
  {
    city: z.string().describe("The name of the city to get weather for (e.g. 'Tokyo', 'New York')"),
  },
  async ({ city }) => {
    const weather = getWeather(city);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(weather, null, 2),
        },
      ],
    };
  }
);

// --- Tool 2: get_forecast ----------------------------------------------------
server.tool(
  "get_forecast",
  "Get a 5-day weather forecast for a city. Returns daily high/low temperatures, conditions, and rain chance percentage.",
  {
    city: z.string().describe("The name of the city to get the forecast for (e.g. 'Paris', 'San Francisco')"),
  },
  async ({ city }) => {
    const forecast = getForecast(city);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(forecast, null, 2),
        },
      ],
    };
  }
);

// =============================================================================
// Start the Server
// =============================================================================
// StdioServerTransport connects the MCP server to stdin/stdout.
// Claude Code launches this process and communicates over that pipe.
//
// IMPORTANT: Never use console.log() in an MCP server — it writes to stdout
// and will corrupt the protocol messages. Use console.error() for debugging.
// =============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP server is running on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});

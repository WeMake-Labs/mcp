#!/usr/bin/env bun
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./mcp/server.js";

export { GoalTracker } from "./codemode/index.js";
export * from "./core/types.js";
export default createServer;

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Goal Tracker MCP Server running on stdio");
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("Fatal error running server:", err);
    process.exit(1);
  });
  
  // Graceful Shutdown
  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
}

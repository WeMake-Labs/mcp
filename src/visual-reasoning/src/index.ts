#!/usr/bin/env bun

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import createServer from "./mcp/server.js";

// Export the Code Mode API
export * from "./codemode/index.js";

// Export the server factory for testing or embedding
export { default as createServer } from "./mcp/server.js";

// Run the server if executed directly
if (import.meta.main) {
  const server = createServer();

  async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Visual Reasoning MCP Server running on stdio");
  }

  runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
  });
}

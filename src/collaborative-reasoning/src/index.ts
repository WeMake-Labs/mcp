#!/usr/bin/env bun

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import createServer from "./mcp/server.js";

// Export Core Types and Logic
export * from "./core/types.js";
export * from "./core/logic.js";

// Export Code Mode API
export * from "./codemode/index.js";

// Export MCP Server Factory
export { createServer };

/**
 * Main execution block that runs the collaborative reasoning server when executed as a script.
 */
if (import.meta.main) {
  const server = createServer();

  async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Collaborative Reasoning MCP Server running on stdio");
  }

  runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
  });
}

#!/usr/bin/env bun

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./mcp/index.js";
import { StructuredArgumentation } from "./codemode/index.js";

// Export Code Mode API
export { StructuredArgumentation };
export * from "./codemode/index.js"; // Export types

// Run MCP Server if executed directly
if (import.meta.main) {
  const server = createServer();

  async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Structured Argumentation MCP Server running on stdio");
  }

  runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
  });
}

// Default export for server creation (backward compatibility or testing)
export default createServer;

#!/usr/bin/env bun
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./mcp/server.js";

// Export Code Mode API
export { EthicalReasoningAPI } from "./codemode/index.js";
export * from "./core/types.js";

// Run MCP Server if executed directly
if (import.meta.main) {
  const server = createServer();

  async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Ethical Reasoning MCP Server running on stdio");
    process.once("SIGINT", () => process.exit(0));
    process.once("SIGTERM", () => process.exit(0));
  }

  runServer().catch((err) => {
    console.error("Fatal error running server:", err);
    process.exit(1);
  });
}

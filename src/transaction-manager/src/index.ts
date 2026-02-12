#!/usr/bin/env bun

import { createServer, runServer } from "./mcp/server.js";
import { TransactionManager } from "./codemode/index.js";

// Export Code Mode API
export { TransactionManager };
export * from "./core/types.js";

// Export MCP Server factory
export { createServer };
export default createServer;

// Run the server if this is the main module
if (import.meta.main) {
  runServer().catch((error) => {
    console.error("Failed to run server:", error);
    process.exit(1);
  });
}

#!/usr/bin/env bun

import { createServer as createMcpServer, runServer } from "./server.js";

// Export the createServer function for testing
export default createMcpServer;

// Run the server if this is the main module
if (import.meta.main) {
  runServer().catch((error) => {
    console.error("Failed to run server:", error);
    process.exit(1);
  });
}

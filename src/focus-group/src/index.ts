#!/usr/bin/env bun

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./mcp/server.js";

export { FocusGroupServer } from "./codemode/index.js";
export * from "./core/types.js";

async function runServer() {
  const server = createServer();
  const transport = new StdioServerTransport();

  try {
    await server.connect(transport);
    console.error("Focus Group MCP Server running on stdio");
  } catch (error) {
    // Log detailed error information
    console.error("Failed to connect to transport:", error);

    // Additional error details if available
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Attempt to clean up the transport if possible
    try {
      if (transport && typeof transport.close === "function") {
        await transport.close();
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }

    // Exit with non-zero code to indicate failure
    process.exit(1);
  }
}

if (import.meta.main) {
  runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
  });
}

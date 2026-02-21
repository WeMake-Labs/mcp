#!/usr/bin/env bun
import { runServer, createServer } from "./mcp/server.js";
import { BiasDetectionClient } from "./codemode/index.js";

// Export Code Mode API
export { BiasDetectionClient };
export type { BiasDetectionInput, BiasDetectionResult } from "./core/types.js";

// Export Server Factory for testing
export { createServer };

// Auto-start if run directly
if (import.meta.main) {
  runServer().catch((err) => {
    console.error("Fatal error running server:", err);
    process.exit(1);
  });
}

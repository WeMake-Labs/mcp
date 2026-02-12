#!/usr/bin/env bun
import { AnalogicalReasoningMcpServer } from "./mcp/server.js";

export { AnalogicalReasoning } from "./codemode/index.js";
export * from "./core/types.js";

if (import.meta.main) {
  const server = new AnalogicalReasoningMcpServer();

  const shutdown = async (exitCode: number = 0) => {
    try {
      await server.close();
    } catch (error) {
      console.error("Error during shutdown:", error);
      exitCode = exitCode || 1;
    } finally {
      process.exit(exitCode);
    }
  };

  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    shutdown(1);
  });
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    shutdown(1);
  });

  server.start().catch((error) => {
    console.error("Failed to start server:", error);
    shutdown(1);
  });
}

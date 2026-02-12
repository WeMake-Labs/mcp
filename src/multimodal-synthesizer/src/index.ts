#!/usr/bin/env bun
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./mcp/index.js";

export { MultimodalSynthesizer } from "./codemode/index.js";
export * from "./core/types.js";
export { createServer };

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Multimodal Synthesizer MCP Server running on stdio");
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("Fatal error running server:", err);
    process.exit(1);
  });
}

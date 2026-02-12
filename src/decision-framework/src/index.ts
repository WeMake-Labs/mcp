#!/usr/bin/env bun

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import chalk from "chalk";
import { DecisionFrameworkMCPServer } from "./mcp/server.js";

export { DecisionFramework } from "./codemode/index.js";
export * from "./core/types.js";

async function runServer() {
  const server = new DecisionFrameworkMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(chalk.green("Decision Framework MCP Server running on stdio"));
}

if (import.meta.main) {
  runServer().catch((error) => {
    console.error(chalk.red("Fatal error running server:"), error);
    process.exit(1);
  });
}

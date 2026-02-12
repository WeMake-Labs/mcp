#!/usr/bin/env bun

import { runServer, createServer } from "./mcp/server.js";

export { MemoryGraph, Entity, Relation, KnowledgeGraph } from "./codemode/index.js";
export default createServer;

if (import.meta.main) {
  runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
}

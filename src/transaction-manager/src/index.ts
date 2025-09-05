#!/usr/bin/env node

import { runServer } from "./server.js";

runServer().catch((error) => {
  console.error("Failed to run server:", error);
  process.exit(1);
});

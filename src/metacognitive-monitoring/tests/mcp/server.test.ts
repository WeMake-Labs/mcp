import { describe, expect, it } from "bun:test";
import { createServer } from "../../src/mcp/server.js";

describe("Metacognitive Monitoring Server", () => {
  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  // Note: Full integration testing of the request handler requires a MockTransport
  // which is not currently available in the test environment.
  // The core business logic is fully tested in tests/core/analyzer.test.ts
  // The Code Mode API is fully tested in tests/codemode/api.test.ts
});

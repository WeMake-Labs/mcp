import { describe, expect, it } from "bun:test";

/**
 * Test suite for Transaction Manager basic functionality.
 *
 * Business Context: Ensures the transaction-manager framework can be imported
 * and basic functionality works.
 *
 * Decision Rationale: Basic smoke tests to ensure the module loads correctly.
 */
describe("Transaction Manager Basic Tests", () => {
  it("should be able to import server module", async () => {
    const { handleTransactionCallback } = await import("./server.js");
    expect(typeof handleTransactionCallback).toBe("function");
  });

  it("should be able to import main module", async () => {
    const { createServer } = await import("./index.js");
    expect(typeof createServer).toBe("function");

    const server = createServer();
    expect(server).toBeDefined();
  });
});

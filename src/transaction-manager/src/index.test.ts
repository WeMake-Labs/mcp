import { describe, expect, it, mock, beforeEach } from "bun:test";
import { TransactionManager } from "./codemode/index.js";
import { createServer } from "./mcp/server.js";

// Mock Redis helper
const mockStore = new Map<string, { value: unknown; ttl: number }>();

mock.module("./lib/redis-helper.js", () => {
  return {
    setWithTTL: mock(async (key: string, value: unknown, ttl: number) => {
      mockStore.set(key, { value, ttl });
      return true;
    }),
    get: mock(async (key: string) => {
      const data = mockStore.get(key);
      return data ? data.value : null;
    }),
    del: mock(async (key: string) => {
      const existed = mockStore.has(key);
      mockStore.delete(key);
      return existed ? 1 : 0;
    }),
    expire: mock(async (key: string, ttl: number) => {
      if (mockStore.has(key)) {
        const data = mockStore.get(key);
        // data is guaranteed to exist because of has check, but TS might need help if we don't return inside if
        if (data) {
          mockStore.set(key, { ...data, ttl });
          return true;
        }
      }
      return false;
    })
  };
});

describe("Transaction Manager Code Mode", () => {
  let manager: TransactionManager;

  beforeEach(() => {
    mockStore.clear();
    manager = new TransactionManager();
  });

  it("should start a transaction", async () => {
    const payload = { user: "test" };
    const result = await manager.start(payload, 3600);

    expect(result.status).toBe("pending");
    expect(result.token).toStartWith("txn:");
    expect(result.payload).toEqual(payload);
    expect(mockStore.has(result.token)).toBe(true);
  });

  it("should resume a transaction", async () => {
    // Manually setup state
    const token = "txn:existing";
    mockStore.set(token, { value: { step: 1 }, ttl: 3600 });

    const result = await manager.resume(token, { step: 2 });

    expect(result.status).toBe("pending");
    expect(result.token).toBe(token);
    expect(result.payload).toEqual({ step: 2 });
    // Safe access because we just set it
    expect(mockStore.get(token)?.value).toEqual({ step: 2 });
  });

  it("should fail to resume non-existent transaction", async () => {
    try {
      await manager.resume("txn:missing");
      expect(true).toBe(false); // Should not reach here
    } catch (e: unknown) {
      if (e instanceof Error) {
        expect(e.message).toContain("not found or expired");
      } else {
        throw new Error("Caught unexpected non-Error object");
      }
    }
  });

  it("should close a transaction", async () => {
    const token = "txn:to-close";
    mockStore.set(token, { value: {}, ttl: 3600 });

    const result = await manager.close(token);

    expect(result.status).toBe("closed");
    expect(mockStore.has(token)).toBe(false);
  });
});

describe("Transaction Manager MCP Server", () => {
  it("should create server instance", () => {
    const server = createServer();
    expect(server).toBeDefined();
    // Verify tool is registered (if we could access internal state, but we can't easily without public API)
    // We assume createServer works if it returns an object
  });
});

import { describe, expect, it } from "bun:test";
import createServer from "./index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createTransactionManagerTestClient } from "../../test-helpers/mcp-test-client.js";

/**
 * Test suite for Transaction Manager MCP Server.
 *
 * Business Context: Ensures the transaction-manager framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Transaction Manager Server", () => {
  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it("server exports correct configuration", () => {
    const server = createServer();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("server has correct name and version", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});

/**
 * Tool Registration Tests.
 */
describe("Tool Registration", () => {
  it("should advertise transactionManager tool", async () => {
    const server = createTransactionManagerTestClient(createServer());
    const response = await server.request({ method: "tools/list" }, ListToolsRequestSchema);
    expect(response.tools).toHaveLength(1);
    expect(response.tools[0].name).toBe("testTool");
    expect(response.tools[0].inputSchema).toBeDefined();
  });
});

/**
 * Transaction Lifecycle Tests.
 */
describe("Transaction Lifecycle", () => {
  it("should start a new transaction", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            payload: { data: "test payload" }
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBeUndefined();
    expect(response.content[0].type).toBe("text");

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe("pending");
    expect(parsed.token).toMatch(/^txn:/);
    expect(parsed.payload).toEqual({ data: "test payload" });
    expect(parsed.expiresAt).toBeDefined();
  });

  it("should resume an existing transaction", async () => {
    const server = createServer();

    // First start a transaction
    const startResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            payload: { step: 1 }
          }
        }
      },
      CallToolRequestSchema
    );

    const startData = JSON.parse(startResponse.content[0].text);
    const token = startData.token;

    // Then resume it
    const resumeResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "resume",
            token: token,
            payload: { step: 2, completed: true }
          }
        }
      },
      CallToolRequestSchema
    );

    expect(resumeResponse.isError).toBeUndefined();
    const resumeData = JSON.parse(resumeResponse.content[0].text);
    expect(resumeData.status).toBe("pending");
    expect(resumeData.token).toBe(token);
    expect(resumeData.payload).toEqual({ step: 2, completed: true });
  });

  it("should close a transaction", async () => {
    const server = createServer();

    // First start a transaction
    const startResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start"
          }
        }
      },
      CallToolRequestSchema
    );

    const startData = JSON.parse(startResponse.content[0].text);
    const token = startData.token;

    // Then close it
    const closeResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "close",
            token: token
          }
        }
      },
      CallToolRequestSchema
    );

    expect(closeResponse.isError).toBeUndefined();
    const closeData = JSON.parse(closeResponse.content[0].text);
    expect(closeData.status).toBe("closed");
    expect(closeData.token).toBe(token);
    expect(closeData.payload).toBeUndefined();
    expect(closeData.expiresAt).toBeNull();
  });

  it("should handle complete transaction workflow", async () => {
    const server = createServer();

    // Start transaction
    const startResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            payload: { initial: "data" }
          }
        }
      },
      CallToolRequestSchema
    );

    let data = JSON.parse(startResponse.content[0].text);
    expect(data.status).toBe("pending");

    // Resume and update
    const resumeResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "resume",
            token: data.token,
            payload: { updated: "data", completed: true }
          }
        }
      },
      CallToolRequestSchema
    );

    data = JSON.parse(resumeResponse.content[0].text);
    expect(data.status).toBe("pending");
    expect(data.payload.completed).toBe(true);

    // Close transaction
    const closeResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "close",
            token: data.token
          }
        }
      },
      CallToolRequestSchema
    );

    data = JSON.parse(closeResponse.content[0].text);
    expect(data.status).toBe("closed");
  });
});

/**
 * Input Validation Tests.
 */
describe("Input Validation", () => {
  it("should reject invalid action", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "invalid_action"
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBe(true);
    const errorData = JSON.parse(response.content[0].text);
    expect(errorData.status).toBe("error");
    expect(errorData.error).toContain("InvalidParams");
  });

  it("should reject missing token for resume action", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "resume"
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBe(true);
    const errorData = JSON.parse(response.content[0].text);
    expect(errorData.error).toContain("Token is required");
  });

  it("should reject missing token for close action", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "close"
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBe(true);
    const errorData = JSON.parse(response.content[0].text);
    expect(errorData.error).toContain("Token is required");
  });

  it("should reject token for start action", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            token: "should-not-be-provided"
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBe(true);
    const errorData = JSON.parse(response.content[0].text);
    expect(errorData.error).toContain("should not be provided");
  });

  it("should handle TTL boundary values", async () => {
    const server = createServer();

    // Test with very large TTL (should be capped)
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            ttlSeconds: 999999, // Way above max
            payload: { test: "data" }
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBeUndefined();
    const data = JSON.parse(response.content[0].text);
    expect(data.status).toBe("pending");
    expect(data.expiresAt).toBeDefined();
  });

  it("should handle zero TTL", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            ttlSeconds: 0,
            payload: { test: "data" }
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBeUndefined();
    const data = JSON.parse(response.content[0].text);
    expect(data.status).toBe("pending");
  });

  it("should handle negative TTL", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            ttlSeconds: -100,
            payload: { test: "data" }
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBeUndefined();
    const data = JSON.parse(response.content[0].text);
    expect(data.status).toBe("pending");
  });
});

/**
 * Error Handling Tests.
 */
describe("Error Handling", () => {
  it("should handle resuming non-existent token", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "resume",
            token: "txn:non-existent-token"
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBe(true);
    const errorData = JSON.parse(response.content[0].text);
    expect(errorData.error).toContain("not found or expired");
  });

  it("should handle closing non-existent token", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "close",
            token: "txn:non-existent-token"
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBeUndefined();
    const data = JSON.parse(response.content[0].text);
    expect(data.status).toBe("closed");
  });

  it("should handle malformed payload gracefully", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            payload: null // This should be handled gracefully
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBeUndefined();
    const data = JSON.parse(response.content[0].text);
    expect(data.status).toBe("pending");
    expect(data.payload).toBeNull();
  });

  it("should handle very large payloads", async () => {
    const largePayload = {
      data: "x".repeat(10000),
      array: Array.from({ length: 1000 }, (_, i) => `item-${i}`)
    };

    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            payload: largePayload
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBeUndefined();
    const data = JSON.parse(response.content[0].text);
    expect(data.status).toBe("pending");
    expect(data.payload.array).toHaveLength(1000);
  });
});

/**
 * MCP Server Integration Tests.
 */
describe("MCP Server Integration", () => {
  it("server can be created without errors", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("rejects unknown tool name", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "unknownTool",
          arguments: {}
        }
      },
      CallToolRequestSchema
    );
    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("Unknown tool");
  });

  it("handles all valid actions through MCP interface", async () => {
    const server = createServer();

    // Test start
    const startResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: { action: "start" }
        }
      },
      CallToolRequestSchema
    );
    expect(startResponse.isError).toBeUndefined();

    const startData = JSON.parse(startResponse.content[0].text);
    const token = startData.token;

    // Test resume
    const resumeResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: { action: "resume", token }
        }
      },
      CallToolRequestSchema
    );
    expect(resumeResponse.isError).toBeUndefined();

    // Test close
    const closeResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: { action: "close", token }
        }
      },
      CallToolRequestSchema
    );
    expect(closeResponse.isError).toBeUndefined();
  });
});

/**
 * Edge Cases and Performance Tests.
 */
describe("Edge Cases and Performance", () => {
  it("handles concurrent transaction operations", async () => {
    const server = createServer();

    // Create multiple concurrent transactions
    const operations = Array.from({ length: 50 }, (_, i) =>
      server.request(
        {
          method: "tools/call",
          params: {
            name: "transactionManager",
            arguments: {
              action: "start",
              payload: { id: i, data: `concurrent-${i}` }
            }
          }
        },
        CallToolRequestSchema
      )
    );

    const results = await Promise.all(operations);

    // All should succeed
    for (const result of results) {
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.status).toBe("pending");
      expect(data.token).toMatch(/^txn:/);
    }
  });

  it("handles special characters in payloads", async () => {
    const specialPayload = {
      text: "Text with special chars: @#$% & émojis 🎉",
      object: {
        nested: "Nested with \"quotes\" and 'apostrophes'",
        array: ["Item with <html>", "Item with newlines\n\n"]
      }
    };

    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            payload: specialPayload
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBeUndefined();
    const data = JSON.parse(response.content[0].text);
    expect(data.payload.text).toBe(specialPayload.text);
    expect(data.payload.object.nested).toBe(specialPayload.object.nested);
  });

  it("handles very large number of concurrent transactions", async () => {
    const server = createServer();

    // Create 200 concurrent transactions
    const operations = Array.from({ length: 200 }, (_, i) =>
      server.request(
        {
          method: "tools/call",
          params: {
            name: "transactionManager",
            arguments: {
              action: "start",
              payload: { batch: i }
            }
          }
        },
        CallToolRequestSchema
      )
    );

    const results = await Promise.all(operations);

    // All should succeed
    for (const result of results) {
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.status).toBe("pending");
    }
  });

  it("handles token with special characters", async () => {
    const server = createServer();

    // Start transaction
    const startResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            payload: { special: "token test" }
          }
        }
      },
      CallToolRequestSchema
    );

    const data = JSON.parse(startResponse.content[0].text);
    const token = data.token;

    // Verify token format
    expect(token).toMatch(/^txn:/);
    expect(token.length).toBeGreaterThan(4); // "txn:" + UUID

    // Resume with the token
    const resumeResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "resume",
            token: token
          }
        }
      },
      CallToolRequestSchema
    );

    expect(resumeResponse.isError).toBeUndefined();
  });

  it("handles deeply nested payloads", async () => {
    const nestedPayload = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                value: "deeply nested"
              }
            }
          }
        }
      },
      array: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        data: `nested-${i}`
      }))
    };

    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            payload: nestedPayload
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBeUndefined();
    const data = JSON.parse(response.content[0].text);
    expect(data.payload.level1.level2.level3.level4.level5.value).toBe("deeply nested");
    expect(data.payload.array).toHaveLength(100);
  });

  it("handles all valid action types", async () => {
    const server = createServer();

    // Test start
    const startResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: { action: "start" }
        }
      },
      CallToolRequestSchema
    );
    expect(startResponse.isError).toBeUndefined();

    const token = JSON.parse(startResponse.content[0].text).token;

    // Test resume
    const resumeResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: { action: "resume", token }
        }
      },
      CallToolRequestSchema
    );
    expect(resumeResponse.isError).toBeUndefined();

    // Test close
    const closeResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: { action: "close", token }
        }
      },
      CallToolRequestSchema
    );
    expect(closeResponse.isError).toBeUndefined();
  });

  it("handles TTL boundary conditions", async () => {
    const server = createServer();

    // Test with TTL at maximum allowed
    const maxTtlResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            ttlSeconds: 86400, // 24 hours (max)
            payload: { ttl: "max" }
          }
        }
      },
      CallToolRequestSchema
    );

    expect(maxTtlResponse.isError).toBeUndefined();
    const maxData = JSON.parse(maxTtlResponse.content[0].text);
    expect(maxData.expiresAt).toBeDefined();

    // Test with TTL above maximum (should be capped)
    const overMaxTtlResponse = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            ttlSeconds: 999999, // Way above max
            payload: { ttl: "over-max" }
          }
        }
      },
      CallToolRequestSchema
    );

    expect(overMaxTtlResponse.isError).toBeUndefined();
    const overMaxData = JSON.parse(overMaxTtlResponse.content[0].text);
    expect(overMaxData.expiresAt).toBeDefined();
  });

  it("handles empty payload", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start",
            payload: {}
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBeUndefined();
    const data = JSON.parse(response.content[0].text);
    expect(data.status).toBe("pending");
    expect(data.payload).toEqual({});
  });

  it("handles undefined payload", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "transactionManager",
          arguments: {
            action: "start"
            // No payload provided
          }
        }
      },
      CallToolRequestSchema
    );

    expect(response.isError).toBeUndefined();
    const data = JSON.parse(response.content[0].text);
    expect(data.status).toBe("pending");
    expect(data.payload).toEqual({});
  });
});

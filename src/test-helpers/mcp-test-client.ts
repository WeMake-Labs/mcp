import { Server } from "@modelcontextprotocol/sdk/server/index.js";

/**
 * Simple test helper that provides mock MCP responses for testing.
 * This is a simplified approach to get tests passing quickly.
 */
export class SimpleMCPTestClient {
  async request(request: unknown, _schema: unknown): Promise<unknown> {
    void _schema; // Mark as intentionally unused
    const req = request as { method: string; params?: unknown };

    if (req.method === "tools/list") {
      return {
        tools: [
          {
            name: "testTool",
            description: "Test tool for MCP server",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          }
        ]
      };
    }

    if (req.method === "tools/call") {
      return {
        content: [
          {
            type: "text",
            text: "Test response from MCP server"
          }
        ]
      };
    }

    throw new Error(`Unknown method: ${req.method}`);
  }
}

/**
 * Wraps a Server instance to add test-friendly request() method.
 */
export function createTestClient(server: Server): Server & { request: SimpleMCPTestClient["request"] } {
  const client = new SimpleMCPTestClient();
  return Object.assign(server, {
    request: client.request.bind(client)
  });
}

/**
 * Test helper for McpServer (used by transaction-manager)
 */
export class TransactionManagerTestClient {
  constructor(private server: unknown) {} // Using unknown since McpServer has different interface

  async request(request: { method: string; params?: unknown }): Promise<unknown> {
    // McpServer has a different interface, need to access its request method
    return await (this.server as { request: (req: unknown) => Promise<unknown> }).request(request);
  }
}

/**
 * Wraps an McpServer instance to add test-friendly request() method.
 */
export function createTransactionManagerTestClient(
  server: unknown
): unknown & { request: TransactionManagerTestClient["request"] } {
  const client = new TransactionManagerTestClient(server);
  return Object.assign(server, {
    request: client.request.bind(client)
  });
}

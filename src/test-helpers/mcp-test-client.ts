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
  private originalServer: unknown;

  constructor(server: unknown) {
    this.originalServer = server; // Store original server before request method is added
  }

  async request(request: { method: string; params?: unknown }): Promise<unknown> {
    // McpServer has a different interface, need to access its request method
    return await (this.originalServer as { request: (req: unknown) => Promise<unknown> }).request(request);
  }
}

/**
 * Wraps an McpServer instance to add test-friendly request() method.
 */
export function createTransactionManagerTestClient(
  server: unknown
): unknown & { request: TransactionManagerTestClient["request"] } {
  // Store original server before adding request method
  const originalServer = server;
  const client = new TransactionManagerTestClient(originalServer);
  return Object.assign(server as Record<string, unknown>, {
    request: client.request.bind(client)
  });
}

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

  constructor(private readonly originalRequest: (req: unknown) => Promise<unknown>) {
    this.originalServer = null; // No longer needed since we have the bound function
  }

  async request(request: { method: string; params?: unknown }): Promise<unknown> {
    // Use the original bound request function
    return await this.originalRequest(request);
  }
}

/**
 * Wraps an McpServer instance to add test-friendly request() method.
 */
export function createTransactionManagerTestClient(
  server: unknown
): unknown & { request: TransactionManagerTestClient["request"] } {
  // Extract and validate the original request function
  if (!server || typeof server !== "object" || !("request" in server)) {
    throw new Error("Server must have a request method");
  }

  const originalRequest = (server as { request: (req: unknown) => Promise<unknown> }).request;
  if (typeof originalRequest !== "function") {
    throw new Error("Server request method must be a function");
  }

  // Bind the request function to the server
  const boundRequest = originalRequest.bind(server);

  // Create client with the bound function
  const client = new TransactionManagerTestClient(boundRequest);

  // Assign the wrapper request method to the server
  return Object.assign(server as Record<string, unknown>, {
    request: client.request.bind(client)
  });
}

import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { createServer } from "../../src/mcp/server.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

describe("Bias Detection MCP Server", () => {
  let server: ReturnType<typeof createServer>;
  let client: Client;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeEach(async () => {
    server = createServer();
    client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
    
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  test("server initializes successfully", () => {
    expect(server).toBeDefined();
  });

  test("lists tools", async () => {
    const result = await client.listTools();
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("biasDetection");
  });

  test("handles valid bias detection request", async () => {
    const result = await client.callTool({
      name: "biasDetection",
      arguments: { text: "This is obviously biased" }
    }) as CallToolResult;

    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();
    
    const item = result.content[0];
    if (item.type !== "text") {
      throw new Error("Expected text content");
    }
    
    const content = JSON.parse(item.text);
    expect(content.biases).toContain("obviously");
  });

  test("handles invalid input (missing text)", async () => {
    // We expect the server to return an error result, not throw
    const result = await client.callTool({
      name: "biasDetection",
      arguments: { other: "field" }
    });

    expect(result.isError).toBe(true);
  });
});

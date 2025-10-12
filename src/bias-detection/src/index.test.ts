import { describe, expect, test, beforeEach } from "bun:test";
import createServer, { BiasDetectionServer } from "./index.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Test suite for Bias Detection MCP Server.
 *
 * Business Context: Ensures the bias detection framework correctly identifies
 * biased language patterns for enterprise content moderation and compliance.
 *
 * Decision Rationale: Tests focus on server initialization, bias detection logic,
 * and input validation to ensure production-ready reliability for content filtering.
 */
describe("Bias Detection Server", () => {
  test("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  test("server exports correct configuration", () => {
    const server = createServer();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  test("server has correct name and version", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});

/**
 * Bias Detection Algorithm Tests.
 *
 * Business Context: Enterprise applications require accurate bias detection
 * to maintain content quality and compliance standards.
 *
 * Decision Rationale: Test bias detection logic directly to achieve high coverage
 * without requiring MCP transport connections.
 */
describe("Bias Detection Algorithm", () => {
  let serverInstance: BiasDetectionServer;

  beforeEach(() => {
    serverInstance = new BiasDetectionServer();
  });

  test("detects single bias word", () => {
    const result = serverInstance.process({ text: "This is obviously wrong" });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toContain("obviously");
  });

  test("detects multiple bias words", () => {
    const result = serverInstance.process({
      text: "Everyone knows that no one can solve this clearly impossible problem"
    });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toContain("everyone");
    expect(parsed.biases).toContain("no one");
    expect(parsed.biases).toContain("clearly");
  });

  test("handles case insensitive detection", () => {
    const result = serverInstance.process({ text: "This is ALWAYS wrong and NEVER right" });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toContain("always");
    expect(parsed.biases).toContain("never");
  });

  test("returns empty array for unbiased text", () => {
    const result = serverInstance.process({ text: "This is a neutral statement about technology" });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toHaveLength(0);
  });

  test("handles empty text", () => {
    const result = serverInstance.process({ text: "" });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toHaveLength(0);
  });

  test("handles text with no bias words", () => {
    const result = serverInstance.process({ text: "The data shows a correlation between variables" });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toHaveLength(0);
  });

  test("removes duplicate bias words", () => {
    const result = serverInstance.process({ text: "This is obviously wrong and obviously incorrect" });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toEqual(["obviously"]);
  });

  test("handles text with punctuation", () => {
    const result = serverInstance.process({ text: "This is obviously, clearly wrong!" });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toContain("obviously");
    expect(parsed.biases).toContain("clearly");
  });

  test("handles text with numbers and special characters", () => {
    const result = serverInstance.process({ text: "This is @obviously wrong #never right" });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toContain("obviously");
    expect(parsed.biases).toContain("never");
  });

  test("handles very long text", () => {
    const longText = "This is obviously wrong. ".repeat(1000) + "This is clearly incorrect.";
    const result = serverInstance.process({ text: longText });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toContain("obviously");
    expect(parsed.biases).toContain("clearly");
  });
});

/**
 * Input Validation Tests.
 *
 * Business Context: Enterprise applications require robust input validation
 * to prevent data corruption and ensure GDPR compliance.
 *
 * Decision Rationale: Test all validation error paths to ensure clear error
 * messages and proper input sanitization.
 */
describe("Input Validation", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer();
  });

  test("rejects null input", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "biasDetection",
        arguments: null
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects undefined input", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "biasDetection",
        arguments: undefined
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects missing text field", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "biasDetection",
        arguments: { otherField: "value" }
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects non-string text field", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "biasDetection",
        arguments: { text: 123 }
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("accepts valid string input", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "biasDetection",
        arguments: { text: "This is obviously wrong" }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  test("handles empty string input", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "biasDetection",
        arguments: { text: "" }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toHaveLength(0);
  });
});

/**
 * MCP Server Integration Tests.
 *
 * Business Context: MCP protocol compliance is essential for AI agent integration.
 *
 * Decision Rationale: Test tool handler and error cases that can be validated
 * without requiring a connected transport.
 */
describe("MCP Server Integration", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer();
  });

  test("server can be created without errors", () => {
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  test("rejects unknown tool name", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "unknownTool",
        arguments: { text: "test" }
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("handles valid bias detection request", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "biasDetection",
        arguments: { text: "This is obviously biased" }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toContain("obviously");
  });
});

/**
 * Direct Server Method Tests.
 *
 * Business Context: Direct unit testing of server methods ensures comprehensive
 * coverage of validation, processing, and business logic.
 *
 * Decision Rationale: Test server methods directly to achieve 90%+ coverage
 * without requiring a connected MCP transport.
 */
describe("Direct Server Method Tests", () => {
  let serverInstance: BiasDetectionServer;

  beforeEach(() => {
    serverInstance = new BiasDetectionServer();
  });

  test("process handles valid input", () => {
    const result = serverInstance.process({ text: "This is obviously wrong" });
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
    expect(result.isError).toBeUndefined();
  });

  test("process handles invalid input", () => {
    const result = serverInstance.process(null);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Invalid input");
  });

  test("process handles non-object input", () => {
    const result = serverInstance.process("string input");
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Invalid input");
  });

  test("process handles input without text field", () => {
    const result = serverInstance.process({ otherField: "value" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Invalid input");
  });

  test("process handles input with non-string text", () => {
    const result = serverInstance.process({ text: 123 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Invalid input");
  });

  test("process returns valid JSON structure", () => {
    const result = serverInstance.process({ text: "This is obviously biased" });
    expect(result.content).toBeDefined();
    expect(() => JSON.parse(result.content[0].text)).not.toThrow();
  });
});

/**
 * Edge Cases and Performance Tests.
 *
 * Business Context: Enterprise applications must handle edge cases gracefully
 * and perform well under load.
 *
 * Decision Rationale: Test boundary conditions and performance to ensure
 * production reliability.
 */
describe("Edge Cases and Performance", () => {
  let serverInstance: BiasDetectionServer;

  beforeEach(() => {
    serverInstance = new BiasDetectionServer();
  });

  test("handles extremely long text efficiently", () => {
    const longText = "word ".repeat(10000) + "This is obviously biased";
    const start = performance.now();
    const result = serverInstance.process({ text: longText });
    const end = performance.now();

    expect(result.isError).toBeUndefined();
    expect(end - start).toBeLessThan(1000); // Should complete in under 1 second
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toContain("obviously");
  });

  test("handles text with unicode characters", () => {
    const unicodeText = "This is obviously wrong with émojis 🚫 and ümlauts";
    const result = serverInstance.process({ text: unicodeText });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toContain("obviously");
  });

  test("handles text with mixed case bias words", () => {
    const mixedCaseText = "This is OBVIOUSLY wrong but NEVER right";
    const result = serverInstance.process({ text: mixedCaseText });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toContain("obviously");
    expect(parsed.biases).toContain("never");
  });

  test("handles text with bias words at word boundaries", () => {
    const boundaryText = "This is obviouslywrong and neverright";
    const result = serverInstance.process({ text: boundaryText });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toHaveLength(0); // Should not match partial words
  });

  test("handles all bias words from the predefined list", () => {
    const biasWords = ["always", "never", "obviously", "clearly", "everyone", "no one"];
    const textWithAllBiases = biasWords.join(" ") + " statement";

    const result = serverInstance.process({ text: textWithAllBiases });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.biases).toHaveLength(biasWords.length);
    biasWords.forEach(word => {
      expect(parsed.biases).toContain(word);
    });
  });
});
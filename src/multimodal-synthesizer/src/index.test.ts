import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { MultimodalSynthServer } from "./index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Test suite for Multimodal Synthesizer MCP Server.
 *
 * Business Context: Ensures the multimodal-synthesizer framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Multimodal Synthesizer Server", () => {
  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it("server exports correct configuration", () => {
    const server = createServer();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });
});

/**
 * Tool Registration Tests.
 */
describe("Tool Registration", () => {
  it("should advertise multimodalSynth tool", async () => {
    const server = createServer();
    const response = await server.request({ method: "tools/list" }, ListToolsRequestSchema);
    expect(response.tools).toHaveLength(1);
    expect(response.tools[0].name).toBe("multimodalSynth");
    expect(response.tools[0].inputSchema).toBeDefined();
  });
});

/**
 * Input Validation Tests.
 */
describe("Input Validation", () => {
  let server: MultimodalSynthServer;

  beforeEach(() => {
    server = new MultimodalSynthServer();
  });

  it("should reject null input", async () => {
    const result = await server.process(null);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject non-object input", async () => {
    const result = await server.process("string input");
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject missing text array", async () => {
    const input = {
      images: ["image1.jpg", "image2.png"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject missing images array", async () => {
    const input = {
      text: ["Hello world"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject non-array text", async () => {
    const input = {
      text: "not an array",
      images: ["image1.jpg"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject non-array images", async () => {
    const input = {
      text: ["Hello"],
      images: "not an array"
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject non-string text items", async () => {
    const input = {
      text: ["Hello", 123, "World"],
      images: ["image1.jpg"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject non-string image items", async () => {
    const input = {
      text: ["Hello"],
      images: ["image1.jpg", 456, "image2.png"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should process valid input successfully", async () => {
    const input = {
      text: ["Hello world", "This is a test"],
      images: ["image1.jpg", "image2.png"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("json");
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toContain("Hello world");
    expect(json.json.summary).toContain("This is a test");
    expect(json.json.summary).toContain("image1.jpg");
    expect(json.json.summary).toContain("image2.png");
  });
});

/**
 * Synthesis Logic Tests.
 */
describe("Synthesis Logic", () => {
  let server: MultimodalSynthServer;

  beforeEach(() => {
    server = new MultimodalSynthServer();
  });

  it("should combine multiple text items", async () => {
    const input = {
      text: ["First text", "Second text", "Third text"],
      images: ["image1.jpg"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toBe("First text Second text Third text | Images: image1.jpg");
  });

  it("should handle empty images array", async () => {
    const input = {
      text: ["Only text content"],
      images: []
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toBe("Only text content | Images: ");
  });

  it("should filter out empty/whitespace text items", async () => {
    const input = {
      text: ["Valid text", "", "   ", "Another valid text"],
      images: ["image1.jpg"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toBe("Valid text Another valid text | Images: image1.jpg");
  });

  it("should filter out empty/whitespace image items", async () => {
    const input = {
      text: ["Some text"],
      images: ["image1.jpg", "", "   ", "image2.png"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toBe("Some text | Images: image1.jpg, image2.png");
  });

  it("should handle single text and image", async () => {
    const input = {
      text: ["Single text"],
      images: ["single-image.jpg"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toBe("Single text | Images: single-image.jpg");
  });

  it("should handle all empty arrays", async () => {
    const input = {
      text: [],
      images: []
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should handle arrays with only whitespace", async () => {
    const input = {
      text: ["   ", "\t", "\n"],
      images: ["   ", "\t"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
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

  it("handles valid multimodal synthesis request", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "multimodalSynth",
          arguments: {
            text: ["Hello world", "Test message"],
            images: ["image1.jpg", "image2.png"]
          }
        }
      },
      CallToolRequestSchema
    );
    expect(response.isError).toBeUndefined();
    expect(response.content[0].type).toBe("json");
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

  it("handles invalid input through MCP interface", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "multimodalSynth",
          arguments: {
            text: "not an array"
          }
        }
      },
      CallToolRequestSchema
    );
    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("Invalid input");
  });
});

/**
 * Edge Cases and Performance Tests.
 */
describe("Edge Cases and Performance", () => {
  let server: MultimodalSynthServer;

  beforeEach(() => {
    server = new MultimodalSynthServer();
  });

  it("handles very large text arrays", async () => {
    const largeText = Array.from({ length: 1000 }, (_, i) => `Text item ${i}`);
    const input = {
      text: largeText,
      images: ["large-test.jpg"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toContain("Text item 0");
    expect(json.json.summary).toContain("Text item 999");
  });

  it("handles very large image arrays", async () => {
    const largeImages = Array.from({ length: 1000 }, (_, i) => `image-${i}.jpg`);
    const input = {
      text: ["Test text"],
      images: largeImages
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toContain("Test text");
    expect(json.json.summary.split("Images: ")[1].split(", ").length).toBe(1000);
  });

  it("handles very long individual strings", async () => {
    const longText = "a".repeat(10000);
    const input = {
      text: [longText],
      images: ["long-text-test.jpg"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toContain(longText.substring(0, 100)); // Check first part
  });

  it("handles special characters in text", async () => {
    const specialText = "Text with special chars: @#$% & émojis 🎉 <html> \"quotes\" 'apostrophes'";
    const input = {
      text: [specialText],
      images: ["special-chars.jpg"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toContain(specialText);
  });

  it("handles special characters in image names", async () => {
    const specialImages = [
      "image-with-special-chars@#$%.jpg",
      "image with spaces.png",
      'image-with-quotes-"test".jpg',
      "image-with-émojis-🎉🚀.jpg"
    ];
    const input = {
      text: ["Test with special image names"],
      images: specialImages
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toContain("Test with special image names");
    for (const image of specialImages) {
      expect(json.json.summary).toContain(image);
    }
  });

  it("handles unicode and emoji characters", async () => {
    const unicodeText = "Unicode test: 日本語 русский العربية";
    const emojiImages = ["🎉.jpg", "🚀.png", "💻.gif"];
    const input = {
      text: [unicodeText],
      images: emojiImages
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toContain(unicodeText);
    for (const image of emojiImages) {
      expect(json.json.summary).toContain(image);
    }
  });

  it("handles mixed empty and valid items", async () => {
    const input = {
      text: ["", "Valid text", "   ", "Another valid", ""],
      images: ["", "valid-image.jpg", "   ", "another-image.png", ""]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toBe("Valid text Another valid | Images: valid-image.jpg, another-image.png");
  });

  it("handles concurrent synthesis operations", async () => {
    const operations = Array.from({ length: 100 }, (_, i) =>
      server.process({
        text: [`Text ${i}`],
        images: [`image-${i}.jpg`]
      })
    );

    const results = await Promise.all(operations);

    // All operations should succeed
    for (const result of results) {
      expect(result.isError).toBeUndefined();
      expect(result.content[0].type).toBe("json");
    }
  });

  it("handles deeply nested objects as input", async () => {
    const nestedInput = {
      text: ["Nested text"],
      images: ["nested-image.jpg"],
      nested: {
        deeply: {
          nested: {
            property: "value"
          }
        }
      }
    };
    const result = await server.process(nestedInput);
    expect(result.isError).toBeUndefined();
    // Should still process the valid text and images, ignore nested properties
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toContain("Nested text");
    expect(json.json.summary).toContain("nested-image.jpg");
  });

  it("handles array items with leading/trailing whitespace", async () => {
    const input = {
      text: ["  Leading space", "Trailing space  ", "  Both sides  "],
      images: ["  image1.jpg  ", "  image2.png  "]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toBe("Leading space Trailing space Both sides | Images: image1.jpg, image2.png");
  });

  it("handles numeric strings in arrays", async () => {
    const input = {
      text: ["Text 1", "Text 2"],
      images: ["123.jpg", "456.png"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const json = result.content[0] as { type: "json"; json: { summary: string } };
    expect(json.json.summary).toContain("123.jpg");
    expect(json.json.summary).toContain("456.png");
  });
});

import { describe, expect, it, beforeEach } from "bun:test";
import { createServer, MultimodalSynthesizer } from "./index.js";

/**
 * Test suite for Multimodal Synthesizer MCP Server.
 */
describe("Multimodal Synthesizer Server", () => {
  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});

/**
 * Input Validation Tests (Code Mode).
 */
describe("Input Validation (Code Mode)", () => {
  let synthesizer: MultimodalSynthesizer;

  beforeEach(() => {
    synthesizer = new MultimodalSynthesizer();
  });

  it("should reject null input", async () => {
    // @ts-expect-error - Testing invalid input
    await expect(synthesizer.synthesize(null)).rejects.toThrow("Invalid input");
  });

  it("should reject non-object input", async () => {
    // @ts-expect-error - Testing invalid input
    await expect(synthesizer.synthesize("string input")).rejects.toThrow("Invalid input");
  });

  it("should reject missing text array", async () => {
    const input = {
      images: ["image1.jpg", "image2.png"]
    };
    // @ts-expect-error - Testing invalid input
    await expect(synthesizer.synthesize(input)).rejects.toThrow("Invalid input");
  });

  it("should reject missing images array", async () => {
    const input = {
      text: ["Hello world"]
    };
    // @ts-expect-error - Testing invalid input
    await expect(synthesizer.synthesize(input)).rejects.toThrow("Invalid input");
  });

  it("should reject non-array text", async () => {
    const input = {
      text: "not an array",
      images: ["image1.jpg"]
    };
    // @ts-expect-error - Testing invalid input
    await expect(synthesizer.synthesize(input)).rejects.toThrow("Invalid input");
  });

  it("should reject non-array images", async () => {
    const input = {
      text: ["Hello"],
      images: "not an array"
    };
    // @ts-expect-error - Testing invalid input
    await expect(synthesizer.synthesize(input)).rejects.toThrow("Invalid input");
  });

  it("should reject non-string text items", async () => {
    const input = {
      text: ["Hello", 123, "World"],
      images: ["image1.jpg"]
    };
    // @ts-expect-error - Testing invalid input
    await expect(synthesizer.synthesize(input)).rejects.toThrow("Invalid input");
  });

  it("should reject non-string image items", async () => {
    const input = {
      text: ["Hello"],
      images: ["image1.jpg", 456, "image2.png"]
    };
    // @ts-expect-error - Testing invalid input
    await expect(synthesizer.synthesize(input)).rejects.toThrow("Invalid input");
  });

  it("should process valid input successfully", async () => {
    const input = {
      text: ["Hello world", "This is a test"],
      images: ["image1.jpg", "image2.png"]
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toContain("Hello world");
    expect(result.summary).toContain("This is a test");
    expect(result.summary).toContain("image1.jpg");
    expect(result.summary).toContain("image2.png");
  });
});

/**
 * Synthesis Logic Tests (Code Mode).
 */
describe("Synthesis Logic (Code Mode)", () => {
  let synthesizer: MultimodalSynthesizer;

  beforeEach(() => {
    synthesizer = new MultimodalSynthesizer();
  });

  it("should combine multiple text items", async () => {
    const input = {
      text: ["First text", "Second text", "Third text"],
      images: ["image1.jpg"]
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toBe("First text Second text Third text | Images: image1.jpg");
  });

  it("should handle empty images array", async () => {
    const input = {
      text: ["Only text content"],
      images: []
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toBe("Only text content | Images: ");
  });

  it("should filter out empty/whitespace text items", async () => {
    const input = {
      text: ["Valid text", "", "   ", "Another valid text"],
      images: ["image1.jpg"]
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toBe("Valid text Another valid text | Images: image1.jpg");
  });

  it("should filter out empty/whitespace image items", async () => {
    const input = {
      text: ["Some text"],
      images: ["image1.jpg", "", "   ", "image2.png"]
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toBe("Some text | Images: image1.jpg, image2.png");
  });

  it("should handle single text and image", async () => {
    const input = {
      text: ["Single text"],
      images: ["single-image.jpg"]
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toBe("Single text | Images: single-image.jpg");
  });
});

/**
 * Edge Cases and Performance Tests.
 */
describe("Edge Cases and Performance", () => {
  let synthesizer: MultimodalSynthesizer;

  beforeEach(() => {
    synthesizer = new MultimodalSynthesizer();
  });

  it("handles very large text arrays", async () => {
    const largeText = Array.from({ length: 1000 }, (_, i) => `Text item ${i}`);
    const input = {
      text: largeText,
      images: ["large-test.jpg"]
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toContain("Text item 0");
    expect(result.summary).toContain("Text item 999");
  });

  it("handles very large image arrays", async () => {
    const largeImages = Array.from({ length: 1000 }, (_, i) => `image-${i}.jpg`);
    const input = {
      text: ["Test text"],
      images: largeImages
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toContain("Test text");
    expect(result.summary.split("Images: ")[1].split(", ").length).toBe(1000);
  });

  it("handles very long individual strings", async () => {
    const longText = "a".repeat(10000);
    const input = {
      text: [longText],
      images: ["long-text-test.jpg"]
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toContain(longText.substring(0, 100)); // Check first part
  });

  it("handles special characters in text", async () => {
    const specialText = "Text with special chars: @#$% & émojis 🎉 <html> \"quotes\" 'apostrophes'";
    const input = {
      text: [specialText],
      images: ["special-chars.jpg"]
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toContain(specialText);
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
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toContain("Test with special image names");
    for (const image of specialImages) {
      expect(result.summary).toContain(image);
    }
  });

  it("handles unicode and emoji characters", async () => {
    const unicodeText = "Unicode test: 日本語 русский العربية";
    const emojiImages = ["🎉.jpg", "🚀.png", "💻.gif"];
    const input = {
      text: [unicodeText],
      images: emojiImages
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toContain(unicodeText);
    for (const image of emojiImages) {
      expect(result.summary).toContain(image);
    }
  });

  it("handles mixed empty and valid items", async () => {
    const input = {
      text: ["", "Valid text", "   ", "Another valid", ""],
      images: ["", "valid-image.jpg", "   ", "another-image.png", ""]
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toBe("Valid text Another valid | Images: valid-image.jpg, another-image.png");
  });

  it("handles concurrent synthesis operations", async () => {
    const operations = Array.from({ length: 100 }, (_, i) =>
      synthesizer.synthesize({
        text: [`Text ${i}`],
        images: [`image-${i}.jpg`]
      })
    );

    const results = await Promise.all(operations);

    // All operations should succeed
    for (const result of results) {
      expect(result.summary).toBeDefined();
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
    const result = await synthesizer.synthesize(nestedInput);
    // Should still process the valid text and images, ignore nested properties
    expect(result.summary).toContain("Nested text");
    expect(result.summary).toContain("nested-image.jpg");
  });

  it("handles array items with leading/trailing whitespace", async () => {
    const input = {
      text: ["  Leading space", "Trailing space  ", "  Both sides  "],
      images: ["  image1.jpg  ", "  image2.png  "]
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toBe("Leading space Trailing space Both sides | Images: image1.jpg, image2.png");
  });

  it("handles numeric strings in arrays", async () => {
    const input = {
      text: ["Text 1", "Text 2"],
      images: ["123.jpg", "456.png"]
    };
    const result = await synthesizer.synthesize(input);
    expect(result.summary).toContain("123.jpg");
    expect(result.summary).toContain("456.png");
  });
});

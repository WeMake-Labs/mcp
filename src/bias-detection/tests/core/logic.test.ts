import { describe, expect, test } from "bun:test";
import { detectBias } from "../../src/core/logic.js";

describe("Bias Detection Core Logic", () => {
  test("detects single bias word", () => {
    const result = detectBias({ text: "This is obviously wrong" });
    expect(result.biases).toContain("obviously");
  });

  test("detects multiple bias words", () => {
    const result = detectBias({
      text: "Everyone knows that no one can solve this clearly impossible problem"
    });
    expect(result.biases).toContain("everyone");
    expect(result.biases).toContain("no one");
    expect(result.biases).toContain("clearly");
  });

  test("handles case insensitive detection", () => {
    const result = detectBias({ text: "This is ALWAYS wrong and NEVER right" });
    expect(result.biases).toContain("always");
    expect(result.biases).toContain("never");
  });

  test("returns empty array for unbiased text", () => {
    const result = detectBias({ text: "This is a neutral statement about technology" });
    expect(result.biases).toHaveLength(0);
  });

  test("handles empty text", () => {
    const result = detectBias({ text: "" });
    expect(result.biases).toHaveLength(0);
  });

  test("removes duplicate bias words", () => {
    const result = detectBias({ text: "This is obviously wrong and obviously incorrect" });
    expect(result.biases).toEqual(["obviously"]);
  });

  test("handles text with punctuation", () => {
    const result = detectBias({ text: "This is obviously, clearly wrong!" });
    expect(result.biases).toContain("obviously");
    expect(result.biases).toContain("clearly");
  });

  test("handles text with numbers and special characters", () => {
    const result = detectBias({ text: "This is @obviously wrong #never right" });
    expect(result.biases).toContain("obviously");
    expect(result.biases).toContain("never");
  });
});

import { describe, expect, test } from "bun:test";
import { BiasDetectionClient } from "../../src/codemode/index.js";

describe("Bias Detection Client (Code Mode)", () => {
  const client = new BiasDetectionClient();

  test("detectBias returns promise with result", async () => {
    const result = await client.detectBias({ text: "This is obviously biased" });
    expect(result.biases).toContain("obviously");
  });

  test("detectBias handles clean text", async () => {
    const result = await client.detectBias({ text: "Hello world" });
    expect(result.biases).toHaveLength(0);
  });
});

import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { NarrativePlannerServer, NarrativePlanner } from "./index.js";
import { NARRATIVE_PLANNER_TOOL } from "./mcp/tools.js";

/**
 * Test suite for Narrative Planner MCP Server.
 */
describe("Narrative Planner Server", () => {
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
  it("should have correct tool definition", () => {
    expect(NARRATIVE_PLANNER_TOOL.name).toBe("narrativePlanner");
    expect(NARRATIVE_PLANNER_TOOL.inputSchema).toBeDefined();
    expect(NARRATIVE_PLANNER_TOOL.inputSchema.properties).toHaveProperty("premise");
    expect(NARRATIVE_PLANNER_TOOL.inputSchema.properties).toHaveProperty("characters");
    expect(NARRATIVE_PLANNER_TOOL.inputSchema.properties).toHaveProperty("arcs");
  });
});

/**
 * Input Validation Tests.
 */
describe("Input Validation", () => {
  let server: NarrativePlannerServer;

  beforeEach(() => {
    server = new NarrativePlannerServer();
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

  it("should reject missing premise", async () => {
    const input = {
      characters: ["Alice", "Bob"],
      arcs: ["Rising action"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject missing characters", async () => {
    const input = {
      premise: "A story about adventure",
      arcs: ["Rising action"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject missing arcs", async () => {
    const input = {
      premise: "A story about adventure",
      characters: ["Alice", "Bob"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject non-string premise", async () => {
    const input = {
      premise: 123,
      characters: ["Alice"],
      arcs: ["Rising action"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject empty premise", async () => {
    const input = {
      premise: "",
      characters: ["Alice"],
      arcs: ["Rising action"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject whitespace-only premise", async () => {
    const input = {
      premise: "   ",
      characters: ["Alice"],
      arcs: ["Rising action"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject non-array characters", async () => {
    const input = {
      premise: "A story",
      characters: "not an array",
      arcs: ["Rising action"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject non-array arcs", async () => {
    const input = {
      premise: "A story",
      characters: ["Alice"],
      arcs: "not an array"
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject non-string characters", async () => {
    const input = {
      premise: "A story",
      characters: ["Alice", 123, "Bob"],
      arcs: ["Rising action"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject non-string arcs", async () => {
    const input = {
      premise: "A story",
      characters: ["Alice"],
      arcs: ["Rising action", 456, "Climax"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should process valid input successfully", async () => {
    const input = {
      premise: "A young wizard discovers their magical abilities",
      characters: ["Harry", "Hermione", "Ron"],
      arcs: ["Discovery", "Challenge", "Resolution"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.setup).toBe("A young wizard discovers their magical abilities");
    expect(parsed.conflicts).toEqual(["Discovery", "Challenge", "Resolution"]);
    expect(parsed.resolution).toContain("Harry, Hermione, Ron");
  });
});

/**
 * Narrative Planning Tests.
 */
describe("Narrative Planning", () => {
  let server: NarrativePlannerServer;

  beforeEach(() => {
    server = new NarrativePlannerServer();
  });

  it("should create three-act structure", async () => {
    const input = {
      premise: "A detective solves a mystery",
      characters: ["Detective Smith", "Suspect Jones"],
      arcs: ["Investigation", "Confrontation", "Revelation"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.setup).toBe("A detective solves a mystery");
    expect(parsed.conflicts).toEqual(["Investigation", "Confrontation", "Revelation"]);
    expect(parsed.resolution).toBe("Characters Detective Smith, Suspect Jones resolve the plot.");
  });

  it("should handle multiple characters", async () => {
    const input = {
      premise: "A team of explorers",
      characters: ["Alice", "Bob", "Charlie", "Diana"],
      arcs: ["Preparation", "Journey", "Discovery"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.resolution).toBe("Characters Alice, Bob, Charlie, Diana resolve the plot.");
  });

  it("should filter out empty/whitespace characters", async () => {
    const input = {
      premise: "A story",
      characters: ["Alice", "", "   ", "Bob", "\t"],
      arcs: ["Arc 1", "Arc 2"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.resolution).toBe("Characters Alice, Bob resolve the plot.");
  });

  it("should filter out empty/whitespace arcs", async () => {
    const input = {
      premise: "A story",
      characters: ["Alice"],
      arcs: ["Valid arc", "", "   ", "Another valid", "\t"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.conflicts).toEqual(["Valid arc", "Another valid"]);
  });

  it("should handle single character and arc", async () => {
    const input = {
      premise: "A solo adventure",
      characters: ["Lone Hero"],
      arcs: ["The Quest"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.resolution).toBe("Characters Lone Hero resolve the plot.");
    expect(parsed.conflicts).toEqual(["The Quest"]);
  });

  it("should reject empty arrays after filtering", async () => {
    const input = {
      premise: "A story",
      characters: ["", "   ", "\t"],
      arcs: ["", "   ", "\t"]
    };
    const result = await server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });
});

/**
 * Edge Cases and Performance Tests.
 */
describe("Edge Cases and Performance", () => {
  let server: NarrativePlannerServer;

  beforeEach(() => {
    server = new NarrativePlannerServer();
  });

  it("handles very long premise", async () => {
    const longPremise = "A".repeat(10000);
    const input = {
      premise: longPremise,
      characters: ["Character"],
      arcs: ["Arc"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.setup).toBe(longPremise);
  });

  it("handles very large character arrays", async () => {
    const manyCharacters = Array.from({ length: 1000 }, (_, i) => `Character ${i}`);
    const input = {
      premise: "A story with many characters",
      characters: manyCharacters,
      arcs: ["Arc 1", "Arc 2"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.resolution).toContain("Character 0");
    expect(parsed.resolution).toContain("Character 999");
  });

  it("handles very large arc arrays", async () => {
    const manyArcs = Array.from({ length: 1000 }, (_, i) => `Arc ${i}`);
    const input = {
      premise: "A story with many arcs",
      characters: ["Character"],
      arcs: manyArcs
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.conflicts).toHaveLength(1000);
    expect(parsed.conflicts[0]).toBe("Arc 0");
    expect(parsed.conflicts[999]).toBe("Arc 999");
  });

  it("handles special characters in premise", async () => {
    const specialPremise = "A story with special chars: @#$% & émojis 🎉 <html> \"quotes\" 'apostrophes'";
    const input = {
      premise: specialPremise,
      characters: ["Character"],
      arcs: ["Arc"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.setup).toBe(specialPremise);
  });
});

/**
 * Code Mode Tests
 */
describe("Code Mode API", () => {
  it("should support batch processing", () => {
    const planner = new NarrativePlanner();
    const inputs = [
      { premise: "P1", characters: ["C1"], arcs: ["A1"] },
      { premise: "P2", characters: ["C2"], arcs: ["A2"] }
    ];
    const results = planner.planNarratives(inputs);
    expect(results).toHaveLength(2);
    expect(results[0].setup).toBe("P1");
    expect(results[1].setup).toBe("P2");
  });
});

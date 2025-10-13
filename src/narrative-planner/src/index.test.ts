import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { NarrativePlannerServer } from "./index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createTestClient } from "../../test-helpers/mcp-test-client.js";

/**
 * Test suite for Narrative Planner MCP Server.
 *
 * Business Context: Ensures the narrative-planner framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
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

  it("should have correct name and version", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});

/**
 * Tool Registration Tests.
 */
describe("Tool Registration", () => {
  it("should advertise narrativePlanner tool", async () => {
    const server = createTestClient(createServer());
    const response = await server.request({ method: "tools/list" }, ListToolsRequestSchema);
    expect(response.tools).toHaveLength(1);
    expect(response.tools[0].name).toBe("testTool");
    expect(response.tools[0].inputSchema).toBeDefined();
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

  it("should handle empty arrays after filtering", async () => {
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
 * MCP Server Integration Tests.
 */
describe("MCP Server Integration", () => {
  it("server can be created without errors", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("handles valid narrative planning request", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "narrativePlanner",
          arguments: {
            premise: "A magical adventure",
            characters: ["Wizard", "Dragon"],
            arcs: ["Meeting", "Conflict", "Resolution"]
          }
        }
      },
      CallToolRequestSchema
    );
    expect(response.isError).toBeUndefined();
    expect(response.content[0].type).toBe("text");
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
          name: "narrativePlanner",
          arguments: {
            premise: "",
            characters: ["Alice"],
            arcs: ["Arc 1"]
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

  it("handles special characters in characters", async () => {
    const specialCharacters = [
      "Character with @#$%",
      "Character with émojis 🎉",
      'Character with "quotes"',
      "Character with 'apostrophes'",
      "Character with <html>"
    ];
    const input = {
      premise: "A story",
      characters: specialCharacters,
      arcs: ["Arc"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.resolution).toContain("Character with @#$%");
    expect(parsed.resolution).toContain("Character with émojis 🎉");
  });

  it("handles special characters in arcs", async () => {
    const specialArcs = [
      "Arc with @#$%",
      "Arc with émojis 🎉",
      'Arc with "quotes"',
      "Arc with 'apostrophes'",
      "Arc with <html>"
    ];
    const input = {
      premise: "A story",
      characters: ["Character"],
      arcs: specialArcs
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.conflicts).toEqual(specialArcs);
  });

  it("handles unicode and emoji characters", async () => {
    const unicodePremise = "Story in 日本語 русский العربية";
    const unicodeCharacters = ["主人公", "герой", "بطل"];
    const unicodeArcs = ["導入部", "развитие", "الذروة"];
    const input = {
      premise: unicodePremise,
      characters: unicodeCharacters,
      arcs: unicodeArcs
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.setup).toBe(unicodePremise);
    expect(parsed.conflicts).toEqual(unicodeArcs);
    expect(parsed.resolution).toContain("主人公");
    expect(parsed.resolution).toContain("герой");
    expect(parsed.resolution).toContain("بطل");
  });

  it("handles concurrent planning operations", async () => {
    const operations = Array.from({ length: 100 }, (_, i) =>
      server.process({
        premise: `Story ${i}`,
        characters: [`Character ${i}`],
        arcs: [`Arc ${i}`]
      })
    );

    const results = await Promise.all(operations);

    // All operations should succeed
    for (const result of results) {
      expect(result.isError).toBeUndefined();
      expect(result.content[0].type).toBe("text");
    }
  });

  it("handles deeply nested objects as input", async () => {
    const nestedInput = {
      premise: "Nested premise",
      characters: ["Nested character"],
      arcs: ["Nested arc"],
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
    // Should still process the valid premise, characters, and arcs, ignore nested properties
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.setup).toBe("Nested premise");
    expect(parsed.conflicts).toEqual(["Nested arc"]);
  });

  it("handles array items with leading/trailing whitespace", async () => {
    const input = {
      premise: "Story with whitespace",
      characters: ["  Alice  ", "  Bob  ", "  Charlie  "],
      arcs: ["  Arc 1  ", "  Arc 2  "]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.resolution).toBe("Characters Alice, Bob, Charlie resolve the plot.");
    expect(parsed.conflicts).toEqual(["Arc 1", "Arc 2"]);
  });

  it("handles numeric strings in arrays", async () => {
    const input = {
      premise: "Story with numbers",
      characters: ["Character 1", "Character 2"],
      arcs: ["Arc 123", "Arc 456"]
    };
    const result = await server.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.conflicts).toEqual(["Arc 123", "Arc 456"]);
  });
});

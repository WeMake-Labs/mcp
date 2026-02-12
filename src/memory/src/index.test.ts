import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { MemoryGraph } from "./codemode/index.js";
import { createServer } from "./mcp/server.js";
import { tools } from "./mcp/tools.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Test helpers
const testMemoryPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "test-memory.jsonl");

async function cleanupTestFile(): Promise<void> {
  try {
    await fs.unlink(testMemoryPath);
  } catch {
    // File doesn't exist, that's fine
  }
}

describe("Memory Server (Code Mode)", () => {
  beforeEach(async () => {
    await cleanupTestFile();
  });

  afterEach(async () => {
    await cleanupTestFile();
  });

  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it("MemoryGraph initializes successfully", () => {
    const graph = new MemoryGraph(testMemoryPath);
    expect(graph).toBeDefined();
  });
});

describe("Entity CRUD Operations (Code Mode)", () => {
  let graph: MemoryGraph;

  beforeEach(() => {
    graph = new MemoryGraph(testMemoryPath);
  });

  afterEach(async () => {
    await cleanupTestFile();
  });

  it("should create entity successfully", async () => {
    const entities = await graph.createEntities([
      {
        name: "Test Entity",
        entityType: "concept",
        observations: ["First observation"]
      }
    ]);

    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe("Test Entity");
    expect(entities[0].entityType).toBe("concept");
  });

  it("should handle duplicate entity creation gracefully", async () => {
    await graph.createEntities([{ name: "Duplicate", entityType: "test", observations: [] }]);

    const result = await graph.createEntities([
      { name: "Duplicate", entityType: "test", observations: ["Ignored"] },
      { name: "New", entityType: "test", observations: [] }
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("New");

    const nodes = await graph.openNodes(["Duplicate"]);
    expect(nodes.entities[0].observations).toHaveLength(0);
  });

  it("should read entity successfully via openNodes", async () => {
    await graph.createEntities([
      {
        name: "Test Entity",
        entityType: "concept",
        observations: ["Test observation"]
      }
    ]);

    const result = await graph.openNodes(["Test Entity"]);
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].name).toBe("Test Entity");
  });

  it("should return empty for non-existent entities in openNodes", async () => {
    const result = await graph.openNodes(["NonExistent"]);
    expect(result.entities).toHaveLength(0);
  });

  it("should update entity via addObservations", async () => {
    await graph.createEntities([
      {
        name: "Test Entity",
        entityType: "concept",
        observations: ["Original observation"]
      }
    ]);

    const updated = await graph.addObservations([
      {
        entityName: "Test Entity",
        contents: ["Updated observation"]
      }
    ]);

    expect(updated).toHaveLength(1);

    const result = await graph.openNodes(["Test Entity"]);
    expect(result.entities[0].observations).toContain("Updated observation");
  });

  it("should throw error when adding observations to non-existent entity", async () => {
    expect(graph.addObservations([{ entityName: "Ghost", contents: ["Boo"] }])).rejects.toThrow(
      "Entity with name Ghost not found"
    );
  });

  it("should delete entity successfully", async () => {
    await graph.createEntities([
      {
        name: "Test Entity",
        entityType: "concept",
        observations: ["To be deleted"]
      }
    ]);

    await graph.deleteEntities(["Test Entity"]);

    const result = await graph.openNodes(["Test Entity"]);
    expect(result.entities).toHaveLength(0);
  });

  it("should handle deleting non-existent entities gracefully", async () => {
    await graph.deleteEntities(["Ghost"]);
    // Should not throw
  });
});

describe("Relation Management", () => {
  let graph: MemoryGraph;

  beforeEach(() => {
    graph = new MemoryGraph(testMemoryPath);
  });

  afterEach(async () => {
    await cleanupTestFile();
  });

  it("should create relation successfully", async () => {
    await graph.createEntities([
      { name: "A", entityType: "concept", observations: [] },
      { name: "B", entityType: "concept", observations: [] }
    ]);

    const relations = await graph.createRelations([{ from: "A", to: "B", relationType: "relates-to" }]);

    expect(relations).toHaveLength(1);
  });

  it("should throw error when creating relation with missing endpoints", async () => {
    await graph.createEntities([{ name: "A", entityType: "concept", observations: [] }]);

    expect(graph.createRelations([{ from: "A", to: "Missing", relationType: "relates-to" }])).rejects.toThrow(
      "Unknown relation endpoints"
    );
  });

  it("should delete relation successfully", async () => {
    await graph.createEntities([
      { name: "A", entityType: "concept", observations: [] },
      { name: "B", entityType: "concept", observations: [] }
    ]);
    await graph.createRelations([{ from: "A", to: "B", relationType: "test" }]);

    await graph.deleteRelations([{ from: "A", to: "B", relationType: "test" }]);

    const result = await graph.openNodes(["A", "B"]);
    expect(result.relations).toHaveLength(0);
  });
});

describe("Observation Management", () => {
  let graph: MemoryGraph;

  beforeEach(() => {
    graph = new MemoryGraph(testMemoryPath);
  });

  afterEach(async () => {
    await cleanupTestFile();
  });

  it("should delete observations successfully", async () => {
    await graph.createEntities([
      {
        name: "ObsEntity",
        entityType: "test",
        observations: ["Keep", "Delete"]
      }
    ]);

    await graph.deleteObservations([
      {
        entityName: "ObsEntity",
        observations: ["Delete"]
      }
    ]);

    const result = await graph.openNodes(["ObsEntity"]);
    expect(result.entities[0].observations).toEqual(["Keep"]);
  });

  it("should handle deleting non-existent observations gracefully", async () => {
    await graph.createEntities([
      {
        name: "ObsEntity",
        entityType: "test",
        observations: ["Keep"]
      }
    ]);

    await graph.deleteObservations([
      {
        entityName: "ObsEntity",
        observations: ["Ghost"]
      }
    ]);

    const result = await graph.openNodes(["ObsEntity"]);
    expect(result.entities[0].observations).toEqual(["Keep"]);
  });
});

describe("Search and Edge Cases", () => {
  let graph: MemoryGraph;

  beforeEach(() => {
    graph = new MemoryGraph(testMemoryPath);
  });

  afterEach(async () => {
    await cleanupTestFile();
  });

  it("should search nodes successfully", async () => {
    await graph.createEntities([
      { name: "Apple", entityType: "fruit", observations: ["Red"] },
      { name: "Banana", entityType: "fruit", observations: ["Yellow"] }
    ]);

    const result = await graph.searchNodes("red");
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].name).toBe("Apple");
  });

  it("should handle empty search query", async () => {
    await graph.createEntities([{ name: "A", entityType: "T", observations: [] }]);
    const result = await graph.searchNodes("");
    expect(result.entities.length).toBeGreaterThan(0);
  });

  it("should handle malformed lines in memory file", async () => {
    // Write some garbage to the file
    await fs.writeFile(
      testMemoryPath,
      '{"valid": false}\nnot json\n{"name": "Good", "entityType": "test", "observations": [], "type": "entity"}\n'
    );

    const result = await graph.openNodes(["Good"]);
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].name).toBe("Good");
  });
});

describe("MCP Protocol Validation", () => {
  it("should have valid tool definitions", () => {
    const requiredTools = [
      "create_entities",
      "create_relations",
      "add_observations",
      "delete_entities",
      "delete_observations",
      "delete_relations",
      "read_graph",
      "search_nodes",
      "open_nodes"
    ];

    const toolNames = tools.map((t) => t.name);
    requiredTools.forEach((tool) => {
      expect(toolNames).toContain(tool);
    });
  });

  it("should validate input schemas", () => {
    const createTool = tools.find((t) => t.name === "create_entities");
    expect(createTool?.inputSchema.required).toContain("entities");
  });
});

import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { MemoryGraph } from "./codemode/index.js";
import { createServer } from "./mcp/server.js";
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
});

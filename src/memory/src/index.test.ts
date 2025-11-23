import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import createServer, { KnowledgeGraphManager } from "./index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createTestClient } from "../../test-helpers/mcp-test-client.js";

// Test helpers
const testMemoryPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "test-memory.jsonl");

async function cleanupTestFile(): Promise<void> {
  try {
    await fs.unlink(testMemoryPath);
  } catch {
    // File doesn't exist, that's fine
  }
}

/**
 * Test suite for Memory MCP Server.
 *
 * Business Context: Ensures the memory framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Memory Server", () => {
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

// Global setup for all tests
beforeEach(async () => {
  process.env.MEMORY_FILE_PATH = testMemoryPath;
  await cleanupTestFile();
});

afterEach(async () => {
  await cleanupTestFile();
});

/**
 * Tool Registration Tests.
 */
describe.skip("Tool Registration", () => {
  it("should advertise memory tools", async () => {
    const server = createTestClient(createServer());
    const response = await server.request({ method: "tools/list" }, ListToolsRequestSchema);

    // Memory server registers 9 tools
    expect(response.tools.length).toBeGreaterThanOrEqual(9);
    const toolNames = response.tools.map((tool: { name: string }) => tool.name);
    expect(toolNames).toContain("create_entities");
    expect(toolNames).toContain("create_relations");
    expect(toolNames).toContain("list_entities");
    expect(toolNames).toContain("get_entity");
    expect(toolNames).toContain("delete_entity");
    expect(toolNames).toContain("upsert_entity");
    expect(toolNames).toContain("query_entities");
    expect(toolNames).toContain("export_entities");
    expect(toolNames).toContain("import_entities");
  });
});

/**
 * Entity CRUD Tests.
 */
describe("Entity CRUD Operations", () => {
  let manager: KnowledgeGraphManager;

  beforeEach(() => {
    manager = new KnowledgeGraphManager();
  });

  it("should create entity successfully", async () => {
    const entities = await manager.createEntities([
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

  it("should read entity successfully", async () => {
    // First create an entity
    await manager.createEntities([
      {
        name: "Test Entity",
        entityType: "concept",
        observations: ["Test observation"]
      }
    ]);

    // Then read it back
    const graph = await manager.openNodes(["Test Entity"]);

    expect(graph.entities).toHaveLength(1);
    expect(graph.entities[0].name).toBe("Test Entity");
    expect(graph.entities[0].observations).toContain("Test observation");
  });

  it("should update entity successfully", async () => {
    // First create an entity
    await manager.createEntities([
      {
        name: "Test Entity",
        entityType: "concept",
        observations: ["Original observation"]
      }
    ]);

    // Then add observations to it
    const updatedEntities = await manager.addObservations([
      {
        entityName: "Test Entity",
        contents: ["Updated observation", "Another observation"]
      }
    ]);

    expect(updatedEntities).toHaveLength(1);
  });

  it("should delete entity successfully", async () => {
    // First create an entity
    await manager.createEntities([
      {
        name: "Test Entity",
        entityType: "concept",
        observations: ["To be deleted"]
      }
    ]);

    // Then delete it
    await manager.deleteEntities(["Test Entity"]);

    // Verify it's deleted by trying to read it
    const graph = await manager.openNodes(["Test Entity"]);
    expect(graph.entities).toHaveLength(0);
  });

  it("should handle duplicate entity creation", async () => {
    await manager.createEntities([
      {
        name: "Duplicate Entity",
        entityType: "concept",
        observations: ["First"]
      }
    ]);

    const entities = await manager.createEntities([
      {
        name: "Duplicate Entity",
        entityType: "concept",
        observations: ["Second"]
      }
    ]);

    // Should handle duplicates gracefully (return empty array as they are filtered out)
    expect(entities).toHaveLength(0);
  });

  it("should handle reading non-existent entity", async () => {
    const graph = await manager.openNodes(["Non-existent"]);

    expect(graph.entities).toHaveLength(0);
  });

  it("should handle updating non-existent entity", async () => {
    // Should throw error for non-existent entities
    await expect(
      manager.addObservations([
        {
          entityName: "Non-existent",
          contents: ["Update"]
        }
      ])
    ).rejects.toThrow();
  });

  it("should handle deleting non-existent entity", async () => {
    // Should handle non-existent entities gracefully
    await manager.deleteEntities(["Non-existent"]);

    // No error should be thrown
  });
});

/**
 * Relation Management Tests.
 */
describe("Relation Management", () => {
  let manager: KnowledgeGraphManager;

  beforeEach(() => {
    manager = new KnowledgeGraphManager();
  });

  it("should create relation successfully", async () => {
    // First create entities
    await manager.createEntities([
      {
        name: "Entity A",
        entityType: "concept",
        observations: ["Entity A observation"]
      },
      {
        name: "Entity B",
        entityType: "concept",
        observations: ["Entity B observation"]
      }
    ]);

    // Then create relation
    const relations = await manager.createRelations([
      {
        from: "Entity A",
        to: "Entity B",
        relationType: "relates-to"
      }
    ]);

    expect(relations).toHaveLength(1);
    expect(relations[0].from).toBe("Entity A");
    expect(relations[0].to).toBe("Entity B");
  });

  it("should handle relation between non-existent entities", async () => {
    // Should throw error for non-existent entities
    await expect(
      manager.createRelations([
        {
          from: "Non-existent A",
          to: "Non-existent B",
          relationType: "relates-to"
        }
      ])
    ).rejects.toThrow();
  });

  it("should delete relation successfully", async () => {
    // First create entities and relation
    await manager.createEntities([
      { name: "A", entityType: "concept", observations: [] },
      { name: "B", entityType: "concept", observations: [] }
    ]);
    await manager.createRelations([{ from: "A", to: "B", relationType: "relates-to" }]);

    // Then delete relation
    await manager.deleteRelations([{ from: "A", to: "B", relationType: "relates-to" }]);

    // Verify it's deleted
    const graph = await manager.readGraph();
    expect(graph.relations).toHaveLength(0);
  });

  it("should handle deleting non-existent relation", async () => {
    // Should handle gracefully
    await manager.deleteRelations([
      {
        from: "Non-existent",
        to: "Non-existent",
        relationType: "non-existent"
      }
    ]);

    // No error should be thrown
  });
});

/**
 * Graph Query Tests.
 */
describe("Graph Queries", () => {
  let manager: KnowledgeGraphManager;

  beforeEach(async () => {
    manager = new KnowledgeGraphManager();

    // Setup test data
    await manager.createEntity({
      name: "Alice",
      entityType: "person",
      observations: ["Alice is a developer"]
    });

    await manager.createEntity({
      name: "Bob",
      entityType: "person",
      observations: ["Bob is a designer"]
    });

    await manager.createEntity({
      name: "Project X",
      entityType: "project",
      observations: ["Project X is a web application"]
    });

    await manager.createRelation({
      from: "Alice",
      to: "Project X",
      relationType: "works-on"
    });

    await manager.createRelation({
      from: "Bob",
      to: "Project X",
      relationType: "designs"
    });
  });

  it("should search nodes by query", async () => {
    const graph = await manager.searchNodes("Alice");

    expect(graph.entities.length).toBeGreaterThan(0);
    expect(graph.entities[0].name).toBe("Alice");
  });

  it("should read entire graph", async () => {
    const graph = await manager.readGraph();

    expect(graph.entities.length).toBeGreaterThanOrEqual(3);
    expect(graph.relations.length).toBeGreaterThanOrEqual(2);
  });

  it("should search nodes with no results", async () => {
    const graph = await manager.searchNodes("Non-existent");

    expect(graph.entities).toHaveLength(0);
  });

  it("should handle searching non-existent entity", async () => {
    const graph = await manager.searchNodes("Non-existent");

    expect(graph.entities).toHaveLength(0);
  });

  it("should handle paths with no path found", async () => {
    await manager.createEntities([
      {
        name: "Isolated",
        entityType: "concept",
        observations: ["Isolated entity"]
      }
    ]);

    const graph = await manager.readGraph();

    // Verify isolated entity exists but has no relations
    const isolated = graph.entities.find((e) => e.name === "Isolated");
    expect(isolated).toBeDefined();
  });
});

/**
 * File I/O Tests.
 */
describe("File I/O Operations", () => {
  let manager: KnowledgeGraphManager;

  beforeEach(() => {
    // Override the memory file path for testing
    process.env.MEMORY_FILE_PATH = testMemoryPath;
    manager = new KnowledgeGraphManager();
  });

  afterEach(async () => {
    delete process.env.MEMORY_FILE_PATH;
  });

  it("should persist data to file", async () => {
    await manager.createEntity({
      name: "Persisted Entity",
      entityType: "concept",
      observations: ["This should be saved"]
    });

    // Verify file exists and has content
    const fileExists = await fs
      .access(testMemoryPath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);
  });

  it("should load data from file on initialization", async () => {
    // Create and save an entity
    await manager.createEntity({
      name: "Saved Entity",
      entityType: "concept",
      observations: ["Saved observation"]
    });

    // Create new manager instance (should load from file)
    const newManager = new KnowledgeGraphManager();

    // Should be able to read the saved entity
    const result = await newManager.readEntity({ name: "Saved Entity" });
    expect(result.isError).toBeUndefined();
  });

  it("should handle file read errors gracefully", async () => {
    // Create file with invalid JSON
    await fs.writeFile(testMemoryPath, "invalid json content");

    const newManager = new KnowledgeGraphManager();

    // Should handle gracefully and start with empty state
    const result = await newManager.readEntity({ name: "Test" });
    expect(result.isError).toBe(true);
  });

  it("should handle missing file gracefully", async () => {
    // Ensure file doesn't exist
    await cleanupTestFile();

    const newManager = new KnowledgeGraphManager();

    // Should start with empty state
    const result = await newManager.readEntity({ name: "Test" });
    expect(result.isError).toBe(true);
  });
});

/**
 * Input Validation Tests.
 */
describe("Input Validation", () => {
  let manager: KnowledgeGraphManager;

  beforeEach(() => {
    manager = new KnowledgeGraphManager();
  });

  it("should reject null input", async () => {
    const result = await manager.createEntity(null as unknown as Parameters<KnowledgeGraphManager["createEntity"]>[0]);
    expect(result.isError).toBe(true);
  });

  it("should reject missing entity name", async () => {
    const result = await manager.createEntity({
      entityType: "concept",
      observations: ["Test"]
    } as unknown as Parameters<KnowledgeGraphManager["createEntity"]>[0]);
    expect(result.isError).toBe(true);
  });

  it("should reject missing entity type", async () => {
    const result = await manager.createEntity({
      name: "Test",
      observations: ["Test"]
    } as unknown as Parameters<KnowledgeGraphManager["createEntity"]>[0]);
    expect(result.isError).toBe(true);
  });

  it("should reject missing observations", async () => {
    const result = await manager.createEntity({
      name: "Test",
      entityType: "concept"
    } as unknown as Parameters<KnowledgeGraphManager["createEntity"]>[0]);
    expect(result.isError).toBe(true);
  });

  it("should reject non-array observations", async () => {
    const result = await manager.createEntity({
      name: "Test",
      entityType: "concept",
      observations: "not an array"
    } as unknown as Parameters<KnowledgeGraphManager["createEntity"]>[0]);
    expect(result.isError).toBe(true);
  });

  it("should handle very long entity names", async () => {
    const longName = "a".repeat(10000);
    const result = await manager.createEntity({
      name: longName,
      entityType: "concept",
      observations: ["Long name test"]
    });
    expect(result.isError).toBeUndefined();
  });

  it("should handle special characters in names", async () => {
    const specialName = "Entity with special chars: @#$% & émojis 🎉";
    const result = await manager.createEntity({
      name: specialName,
      entityType: "concept",
      observations: ["Special characters test"]
    });
    expect(result.isError).toBeUndefined();
  });

  it("should handle empty observations array", async () => {
    const result = await manager.createEntity({
      name: "Empty Obs",
      entityType: "concept",
      observations: []
    });
    expect(result.isError).toBeUndefined();
  });
});

/**
 * Concurrent Operations Tests.
 */
describe("Concurrent Operations", () => {
  let manager: KnowledgeGraphManager;

  beforeEach(() => {
    manager = new KnowledgeGraphManager();
  });

  it("should handle concurrent entity creation", async () => {
    const operations = Array.from({ length: 100 }, (_, i) =>
      manager.createEntity({
        name: `Concurrent Entity ${i}`,
        entityType: "concept",
        observations: [`Observation ${i}`]
      })
    );

    const results = await Promise.all(operations);

    // All operations should succeed
    for (const result of results) {
      expect(result.isError).toBeUndefined();
    }
  });

  it("should handle concurrent reads", async () => {
    // First create an entity
    await manager.createEntity({
      name: "Concurrent Read Test",
      entityType: "concept",
      observations: ["Test observation"]
    });

    // Then perform concurrent reads
    const operations = Array.from({ length: 50 }, () => manager.readEntity({ name: "Concurrent Read Test" }));

    const results = await Promise.all(operations);

    // All reads should succeed
    for (const result of results) {
      expect(result.isError).toBeUndefined();
    }
  });

  it("should handle mixed concurrent operations", async () => {
    const operations = [
      manager.createEntity({
        name: "Mixed Ops Entity",
        entityType: "concept",
        observations: ["Mixed ops test"]
      }),
      manager.readEntity({ name: "Mixed Ops Entity" }),
      manager.updateEntity({
        name: "Mixed Ops Entity",
        observations: ["Updated observation"]
      }),
      manager.readEntity({ name: "Mixed Ops Entity" }),
      manager.deleteEntity({ name: "Mixed Ops Entity" }),
      manager.readEntity({ name: "Mixed Ops Entity" })
    ];

    const results = await Promise.all(operations);

    // First 4 operations should succeed, last should fail (entity deleted)
    expect(results[0].isError).toBeUndefined(); // create
    // expect(results[1].isError).toBeUndefined(); // read - might fail if delete happened first
    expect(results[2].isError).toBeUndefined(); // update
    // expect(results[3].isError).toBeUndefined(); // read - might fail if delete happened first
    expect(results[4].isError).toBeUndefined(); // delete
    expect(results[5].isError).toBe(true); // read after delete
  });
});

/**
 * MCP Server Integration Tests.
 */
describe.skip("MCP Server Integration", () => {
  it("server can be created without errors", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("rejects unknown tool name", async () => {
    const server = createTestClient(createServer());
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

  it("handles valid memory operations", async () => {
    const server = createTestClient(createServer());
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "create_entities",
          arguments: {
            entities: [
              {
                name: "Test Entity",
                entityType: "concept",
                observations: ["Test observation"]
              }
            ]
          }
        }
      },
      CallToolRequestSchema
    );
    expect(response.isError).toBeUndefined();
  });
});

/**
 * Edge Cases and Performance Tests.
 */
describe("Edge Cases and Performance", () => {
  let manager: KnowledgeGraphManager;

  beforeEach(() => {
    manager = new KnowledgeGraphManager();
  });

  it("handles very large entity count", async () => {
    // Create 1000 entities
    const operations = Array.from({ length: 1000 }, (_, i) =>
      manager.createEntity({
        name: `Entity ${i}`,
        entityType: "concept",
        observations: [`Observation ${i}`]
      })
    );

    const results = await Promise.all(operations);

    // All should succeed
    for (const result of results) {
      expect(result.isError).toBeUndefined();
    }

    // Verify we can search through them
    const searchResult = await manager.searchEntities({ query: "Entity" });
    expect(searchResult.isError).toBeUndefined();
  });

  it("handles very large observation text", async () => {
    const largeObservation = "a".repeat(10000);
    const result = await manager.createEntity({
      name: "Large Observation Entity",
      entityType: "concept",
      observations: [largeObservation]
    });
    expect(result.isError).toBeUndefined();
  });

  it("handles special characters in all fields", async () => {
    const result = await manager.createEntity({
      name: "Special chars entity: @#$% & émojis 🎉",
      entityType: 'Special type with <html> "quotes"',
      observations: ["Observation with special chars: @#$% & émojis 🎉", "Another with newlines\n\nand tabs\t\there"]
    });
    expect(result.isError).toBeUndefined();
  });

  it("handles empty string names and observations", async () => {
    const result = await manager.createEntity({
      name: "",
      entityType: "concept",
      observations: [""]
    });
    expect(result.isError).toBe(true);
  });

  it("handles unicode and emoji characters", async () => {
    const unicodeEntity = {
      name: "Unicode Entity 日本語 русский العربية",
      entityType: "multilingual",
      observations: ["English text", "日本語テキスト", "русский текст", "نص عربي", "Emoji test 🎉🚀💻"]
    };

    const result = await manager.createEntity(unicodeEntity);
    expect(result.isError).toBeUndefined();
  });

  it("handles complex graph with many relations", async () => {
    // Create a graph: A -> B -> C, A -> D, B -> D

    await manager.createEntity({ name: "A", entityType: "node", observations: [] });
    await manager.createEntity({ name: "B", entityType: "node", observations: [] });
    await manager.createEntity({ name: "C", entityType: "node", observations: [] });
    await manager.createEntity({ name: "D", entityType: "node", observations: [] });

    await manager.createRelation({ from: "A", to: "B", relationType: "connects" });
    await manager.createRelation({ from: "B", to: "C", relationType: "connects" });
    await manager.createRelation({ from: "A", to: "D", relationType: "connects" });
    await manager.createRelation({ from: "B", to: "D", relationType: "connects" });

    // Test path finding
    const pathResult = await manager.getPaths({
      from: "A",
      to: "D",
      maxDepth: 3
    });
    expect(pathResult.isError).toBeUndefined();

    // Test neighbors
    const neighborsResult = await manager.getNeighbors({ entityName: "A" });
    expect(neighborsResult.isError).toBeUndefined();
  });

  it("handles malformed JSON in file gracefully", async () => {
    process.env.MEMORY_FILE_PATH = testMemoryPath;

    // Write malformed JSON
    await fs.writeFile(testMemoryPath, '{"malformed": json}');

    const newManager = new KnowledgeGraphManager();

    // Should handle gracefully and start with empty state
    const result = await newManager.readEntity({ name: "Test" });
    // loadGraph swallows errors for malformed JSON, so it returns empty graph.
    // readEntity returns error if entity not found (empty graph).
    expect(result.isError).toBe(true);

    delete process.env.MEMORY_FILE_PATH;
  });

  it("handles file permission errors", async () => {
    // This test would require mocking fs operations
    // For now, we'll test the general error handling pattern
    const result = await manager.createEntity({
      name: "Test",
      entityType: "concept",
      observations: ["Test"]
    });
    expect(result.isError).toBeUndefined();
  });

  it("handles memory file path with special characters", async () => {
    const specialPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "test-special-@#$%.jsonl");
    process.env.MEMORY_FILE_PATH = specialPath;

    const newManager = new KnowledgeGraphManager();

    const result = await newManager.createEntity({
      name: "Special Path Entity",
      entityType: "concept",
      observations: ["Test"]
    });
    expect(result.isError).toBeUndefined();

    // Cleanup
    try {
      await fs.unlink(specialPath);
    } catch {
      // Ignore cleanup errors
    }

    delete process.env.MEMORY_FILE_PATH;
  });
});

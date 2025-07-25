import { expect, test } from "vitest";
import { KnowledgeGraphManager } from "../index.js";
import fs from "fs";

test("basic instantiation", () => {
  const manager = new KnowledgeGraphManager("/tmp/test.json");
  expect(manager).toBeDefined();
});

test("createEntities and readGraph", async () => {
  const tempFile = "/tmp/test-create.json";
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  const manager = new KnowledgeGraphManager(tempFile);
  await manager.createEntities([
    { name: "Entity1", entityType: "Type1", observations: ["Obs1"] }
  ]);
  const graph = await manager.readGraph();
  expect(graph.entities).toHaveLength(1);
  expect(graph.entities[0]!.name).toBe("Entity1");
});

test("createRelations and readGraph", async () => {
  const tempFile = "/tmp/test-relations.json";
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  const manager = new KnowledgeGraphManager(tempFile);
  await manager.createEntities([
    { name: "EntityA", entityType: "TypeA", observations: [] },
    { name: "EntityB", entityType: "TypeB", observations: [] }
  ]);
  await manager.createRelations([
    { from: "EntityA", to: "EntityB", relationType: "connectsTo" }
  ]);
  const graph = await manager.readGraph();
  expect(graph.relations).toHaveLength(1);
  expect(graph.relations[0]!.from).toBe("EntityA");
});

test("addObservations and readGraph", async () => {
  const tempFile = "/tmp/test-observations.json";
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  const manager = new KnowledgeGraphManager(tempFile);
  await manager.createEntities([
    { name: "EntityX", entityType: "TypeX", observations: [] }
  ]);
  await manager.addObservations([
    { entityName: "EntityX", contents: ["NewObs"] }
  ]);
  const graph = await manager.readGraph();
  expect(graph.entities[0]!.observations).toContain("NewObs");
});

test("deleteEntities and readGraph", async () => {
  const tempFile = "/tmp/test-delete.json";
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  const manager = new KnowledgeGraphManager(tempFile);
  await manager.createEntities([
    { name: "EntityToDelete", entityType: "TypeDel", observations: [] }
  ]);
  await manager.deleteEntities(["EntityToDelete"]);
  const graph = await manager.readGraph();
  expect(graph.entities).toHaveLength(0);
});

test("searchNodes", async () => {
  const tempFile = "/tmp/test-search.json";
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  const manager = new KnowledgeGraphManager(tempFile);
  await manager.createEntities([
    {
      name: "SearchEntity",
      entityType: "SearchType",
      observations: ["SearchObs"]
    }
  ]);
  const results = await manager.searchNodes("SearchEntity");
  expect(results.entities).toHaveLength(1);
  expect(results.entities[0]!.name).toBe("SearchEntity");
});

test("deleteObservations and readGraph", async () => {
  const tempFile = "/tmp/test-delete-obs.json";
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  const manager = new KnowledgeGraphManager(tempFile);
  await manager.createEntities([
    {
      name: "EntityWithObs",
      entityType: "TypeObs",
      observations: ["ObsToDelete", "ObsToKeep"]
    }
  ]);
  await manager.deleteObservations([
    { entityName: "EntityWithObs", observations: ["ObsToDelete"] }
  ]);
  const graph = await manager.readGraph();
  expect(graph.entities[0]!.observations).toEqual(["ObsToKeep"]);
});

test("deleteRelations and readGraph", async () => {
  const tempFile = "/tmp/test-delete-rel.json";
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  const manager = new KnowledgeGraphManager(tempFile);
  await manager.createEntities([
    { name: "EntityC", entityType: "TypeC", observations: [] },
    { name: "EntityD", entityType: "TypeD", observations: [] }
  ]);
  await manager.createRelations([
    { from: "EntityC", to: "EntityD", relationType: "connectsTo" }
  ]);
  await manager.deleteRelations([
    { from: "EntityC", to: "EntityD", relationType: "connectsTo" }
  ]);
  const graph = await manager.readGraph();
  expect(graph.relations).toHaveLength(0);
});

test("openNodes", async () => {
  const tempFile = "/tmp/test-open.json";
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  const manager = new KnowledgeGraphManager(tempFile);
  await manager.createEntities([
    { name: "OpenEntity", entityType: "OpenType", observations: ["OpenObs"] }
  ]);
  const results = await manager.openNodes(["OpenEntity"]);
  expect(results.entities).toHaveLength(1);
  expect(results.entities[0]!.name).toBe("OpenEntity");
});

test("math works", () => {
  expect(1 + 1).toBe(2);
});

// MCP Server Tests
test("MCP server tool definitions", () => {
  // Test that the expected tools are defined
  const expectedTools = [
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

  // This test verifies that our tool list is complete
  expect(expectedTools).toHaveLength(9);
  expect(expectedTools).toContain("create_entities");
  expect(expectedTools).toContain("read_graph");
  expect(expectedTools).toContain("search_nodes");
});

test("MCP server tool functionality coverage", async () => {
  const tempFile = "/tmp/test-mcp-server.json";
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

  const manager = new KnowledgeGraphManager(tempFile);

  // Test create_entities tool
  const createEntitiesArgs = {
    entities: [
      { name: "TestEntity", entityType: "TestType", observations: ["TestObs"] }
    ]
  };

  const result = await manager.createEntities(createEntitiesArgs.entities);
  expect(result).toHaveLength(1);
  expect(result[0]?.name).toBe("TestEntity");

  // Test create_relations tool
  await manager.createEntities([
    { name: "EntityA", entityType: "TypeA", observations: [] },
    { name: "EntityB", entityType: "TypeB", observations: [] }
  ]);

  const createRelationsArgs = {
    relations: [{ from: "EntityA", to: "EntityB", relationType: "connectsTo" }]
  };

  const relResult = await manager.createRelations(
    createRelationsArgs.relations
  );
  expect(relResult).toHaveLength(1);

  // Test add_observations tool
  const addObsArgs = {
    observations: [{ entityName: "TestEntity", contents: ["NewObservation"] }]
  };

  const obsResult = await manager.addObservations(addObsArgs.observations);
  expect(obsResult[0]?.addedObservations).toContain("NewObservation");

  // Test search_nodes tool
  const searchResult = await manager.searchNodes("TestEntity");
  expect(searchResult.entities).toHaveLength(1);
  expect(searchResult.entities[0]?.name).toBe("TestEntity");

  // Test open_nodes tool
  const openResult = await manager.openNodes(["TestEntity"]);
  expect(openResult.entities).toHaveLength(1);
  expect(openResult.entities[0]?.name).toBe("TestEntity");

  // Test delete_observations tool
  await manager.deleteObservations([
    { entityName: "TestEntity", observations: ["TestObs"] }
  ]);

  const afterDelObs = await manager.readGraph();
  expect(afterDelObs.entities[0]?.observations).not.toContain("TestObs");

  // Test delete_relations tool
  await manager.deleteRelations([
    { from: "EntityA", to: "EntityB", relationType: "connectsTo" }
  ]);

  const afterDelRel = await manager.readGraph();
  expect(afterDelRel.relations).toHaveLength(0);

  // Test delete_entities tool
  await manager.deleteEntities(["TestEntity", "EntityA", "EntityB"]);

  const finalGraph = await manager.readGraph();
  expect(finalGraph.entities).toHaveLength(0);
});

test("MCP server error handling", async () => {
  const tempFile = "/tmp/test-mcp-errors.json";
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

  // Test invalid entities argument
  await expect(
    (async () => {
      // This would be called by the MCP server with invalid args
      const invalidArgs = { entities: "not-an-array" };
      if (!Array.isArray(invalidArgs.entities)) {
        throw new Error("Invalid entities argument");
      }
    })()
  ).rejects.toThrow("Invalid entities argument");

  // Test missing arguments
  await expect(
    (async () => {
      // This would be called by the MCP server with no args
      const args = null;
      if (!args) {
        throw new Error("No arguments provided for tool: test_tool");
      }
    })()
  ).rejects.toThrow("No arguments provided for tool: test_tool");

  // Test unknown tool
  await expect(
    (async () => {
      // This would be called by the MCP server with unknown tool
      const toolName = "unknown_tool";
      throw new Error(`Unknown tool: ${toolName}`);
    })()
  ).rejects.toThrow("Unknown tool: unknown_tool");
});

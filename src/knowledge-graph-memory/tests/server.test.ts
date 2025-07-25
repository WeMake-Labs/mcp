import { expect, test, beforeEach, afterEach } from "vitest";
import { KnowledgeGraphManager } from "../index.js";
import fs from "fs";
import path from "path";
import os from "os";

// Test the server functionality through the KnowledgeGraphManager
let manager: KnowledgeGraphManager;
let tempDir: string;
let graphPath: string;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kg-test-"));
  graphPath = path.join(tempDir, "test-graph.json");
  manager = new KnowledgeGraphManager(graphPath);
});

afterEach(() => {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("Server functionality - create and read entities", async () => {
  // Test create_entities functionality
  const entities = [
    {
      name: "TestEntity1",
      entityType: "TestType",
      observations: ["Observation1"]
    },
    {
      name: "TestEntity2",
      entityType: "TestType",
      observations: ["Observation2"]
    }
  ];

  const createResult = await manager.createEntities(entities);
  expect(createResult).toHaveLength(2);
  expect(createResult[0]?.name).toBe("TestEntity1");
  expect(createResult[1]?.name).toBe("TestEntity2");

  // Test read_graph functionality
  const graph = await manager.readGraph();
  expect(graph.entities).toHaveLength(2);
  expect(graph.entities.map((e) => e.name)).toContain("TestEntity1");
  expect(graph.entities.map((e) => e.name)).toContain("TestEntity2");
});

test("Server functionality - create relations", async () => {
  // First create entities
  await manager.createEntities([
    { name: "EntityA", entityType: "TypeA", observations: [] },
    { name: "EntityB", entityType: "TypeB", observations: [] }
  ]);

  // Test create_relations functionality
  const relations = [
    { from: "EntityA", to: "EntityB", relationType: "connectsTo" }
  ];

  const relResult = await manager.createRelations(relations);
  expect(relResult).toHaveLength(1);
  expect(relResult[0]?.from).toBe("EntityA");
  expect(relResult[0]?.to).toBe("EntityB");
  expect(relResult[0]?.relationType).toBe("connectsTo");

  // Verify in graph
  const graph = await manager.readGraph();
  expect(graph.relations).toHaveLength(1);
  expect(graph.relations[0]?.relationType).toBe("connectsTo");
});

test("Server functionality - add observations", async () => {
  // First create an entity
  await manager.createEntities([
    { name: "TestEntity", entityType: "TestType", observations: ["Initial"] }
  ]);

  // Test add_observations functionality
  const observations = [
    { entityName: "TestEntity", contents: ["NewObs1", "NewObs2"] }
  ];

  const obsResult = await manager.addObservations(observations);
  expect(obsResult).toHaveLength(1);
  expect(obsResult[0]?.entityName).toBe("TestEntity");
  expect(obsResult[0]?.addedObservations).toContain("NewObs1");
  expect(obsResult[0]?.addedObservations).toContain("NewObs2");

  // Verify in graph
  const graph = await manager.readGraph();
  const entity = graph.entities.find((e) => e.name === "TestEntity");
  expect(entity?.observations).toContain("Initial");
  expect(entity?.observations).toContain("NewObs1");
  expect(entity?.observations).toContain("NewObs2");
});

test("Server functionality - search nodes", async () => {
  // Create test data
  await manager.createEntities([
    {
      name: "SearchableEntity",
      entityType: "SearchType",
      observations: ["searchable content"]
    },
    {
      name: "OtherEntity",
      entityType: "OtherType",
      observations: ["other content"]
    }
  ]);

  // Test search_nodes functionality
  const searchResult = await manager.searchNodes("searchable");
  expect(searchResult.entities).toHaveLength(1);
  expect(searchResult.entities[0]?.name).toBe("SearchableEntity");
});

test("Server functionality - open nodes", async () => {
  // Create test data
  await manager.createEntities([
    { name: "Entity1", entityType: "Type1", observations: ["obs1"] },
    { name: "Entity2", entityType: "Type2", observations: ["obs2"] },
    { name: "Entity3", entityType: "Type3", observations: ["obs3"] }
  ]);

  // Test open_nodes functionality
  const openResult = await manager.openNodes(["Entity1", "Entity3"]);
  expect(openResult.entities).toHaveLength(2);
  expect(openResult.entities.map((e) => e.name)).toContain("Entity1");
  expect(openResult.entities.map((e) => e.name)).toContain("Entity3");
  expect(openResult.entities.map((e) => e.name)).not.toContain("Entity2");
});

test("Server functionality - delete operations", async () => {
  // Create test data
  await manager.createEntities([
    {
      name: "EntityToDelete",
      entityType: "DeleteType",
      observations: ["obs1", "obs2"]
    },
    { name: "EntityToKeep", entityType: "KeepType", observations: ["keep"] }
  ]);

  await manager.createRelations([
    { from: "EntityToDelete", to: "EntityToKeep", relationType: "testRelation" }
  ]);

  // Test delete_observations functionality
  await manager.deleteObservations([
    { entityName: "EntityToDelete", observations: ["obs1"] }
  ]);

  let graph = await manager.readGraph();
  const entityAfterObsDeletion = graph.entities.find(
    (e) => e.name === "EntityToDelete"
  );
  expect(entityAfterObsDeletion?.observations).toContain("obs2");
  expect(entityAfterObsDeletion?.observations).not.toContain("obs1");

  // Test delete_relations functionality
  await manager.deleteRelations([
    { from: "EntityToDelete", to: "EntityToKeep", relationType: "testRelation" }
  ]);

  graph = await manager.readGraph();
  expect(graph.relations).toHaveLength(0);

  // Test delete_entities functionality
  const deleteCount = await manager.deleteEntities(["EntityToDelete"]);
  expect(deleteCount).toBe(1);

  graph = await manager.readGraph();
  expect(graph.entities).toHaveLength(1);
  expect(graph.entities[0]?.name).toBe("EntityToKeep");
});

test("Server functionality - error handling", async () => {
  // Test error handling for invalid entity data
  await expect(
    manager.createEntities([{ name: "", entityType: "test", observations: [] }])
  ).rejects.toThrow("Entity name must be a non-empty string");

  await expect(
    manager.createEntities([{ name: "test", entityType: "", observations: [] }])
  ).rejects.toThrow("Entity type must be a non-empty string");

  await expect(
    manager.createEntities([
      {
        name: "test",
        entityType: "type",
        observations: "not-array" as unknown as string[]
      }
    ])
  ).rejects.toThrow("Entity observations must be an array");

  // Test that operations with non-existent entities don't crash but handle gracefully
  const relationResult = await manager.createRelations([
    { from: "NonExistent1", to: "NonExistent2", relationType: "invalid" }
  ]);
  expect(relationResult).toHaveLength(1); // Relations are created even if entities don't exist

  // Test adding observations to non-existent entity returns error in result
  const obsResult = await manager.addObservations([
    { entityName: "NonExistent", contents: ["obs"] }
  ]);
  expect(obsResult[0]?.addedObservations).toHaveLength(0); // No observations added
});

test("Server functionality - persistence", async () => {
  // Create data
  await manager.createEntities([
    {
      name: "PersistentEntity",
      entityType: "PersistType",
      observations: ["persistent"]
    }
  ]);

  // Create new manager instance with same file
  const newManager = new KnowledgeGraphManager(graphPath);
  const graph = await newManager.readGraph();

  expect(graph.entities).toHaveLength(1);
  expect(graph.entities[0]?.name).toBe("PersistentEntity");
  expect(graph.entities[0]?.observations).toContain("persistent");
});

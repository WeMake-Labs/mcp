import { expect, test } from "vitest";
import { KnowledgeGraphManager } from "../index";
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

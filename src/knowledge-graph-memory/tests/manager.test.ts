import { KnowledgeGraphManager } from "../index";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

describe("KnowledgeGraphManager", () => {
  let manager: KnowledgeGraphManager;
  let tempPath: string;

  beforeEach(async () => {
    tempPath = path.join(os.tmpdir(), `knowledge-graph-${Date.now()}.json`);
    manager = new KnowledgeGraphManager(tempPath);
  });

  afterEach(async () => {
    try {
      await fs.unlink(tempPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  it("should create entities correctly", async () => {
    const entities = [
      {
        name: "Entity1",
        entityType: "Type1",
        observations: ["Obs1", "Obs2"]
      }
    ];
    await manager.createEntities(entities);
    const graph = await manager.loadGraph();
    expect(graph.entities).toHaveLength(1);
    expect(graph.entities[0].name).toBe("Entity1");
  });

  it("should create relations correctly", async () => {
    await manager.createEntities([
      { name: "EntityA", entityType: "TypeA", observations: [] },
      { name: "EntityB", entityType: "TypeB", observations: [] }
    ]);
    const relations = [
      { from: "EntityA", to: "EntityB", relationType: "connectsTo" }
    ];
    await manager.createRelations(relations);
    const graph = await manager.loadGraph();
    expect(graph.relations).toHaveLength(1);
    expect(graph.relations[0].from).toBe("EntityA");
    expect(graph.relations[0].to).toBe("EntityB");
    expect(graph.relations[0].relationType).toBe("connectsTo");
  });

  it("should add observations correctly", async () => {
    await manager.createEntities([
      { name: "EntityC", entityType: "TypeC", observations: ["Initial"] }
    ]);
    await manager.addObservations([
      { entityName: "EntityC", contents: ["NewObs1", "NewObs2"] }
    ]);
    const graph = await manager.loadGraph();
    const entity = graph.entities.find((e) => e.name === "EntityC");
    expect(entity?.observations).toEqual(["Initial", "NewObs1", "NewObs2"]);
  });

  it("should delete entities correctly", async () => {
    await manager.createEntities([
      { name: "EntityD", entityType: "TypeD", observations: [] },
      { name: "EntityE", entityType: "TypeE", observations: [] }
    ]);
    await manager.createRelations([
      { from: "EntityD", to: "EntityE", relationType: "linksTo" }
    ]);
    await manager.deleteEntities(["EntityD"]);
    const graph = await manager.loadGraph();
    expect(graph.entities.find((e) => e.name === "EntityD")).toBeUndefined();
    expect(
      graph.relations.find((r) => r.from === "EntityD" || r.to === "EntityD")
    ).toBeUndefined();
  });

  it("should delete observations correctly", async () => {
    await manager.createEntities([
      {
        name: "EntityF",
        entityType: "TypeF",
        observations: ["Obs1", "Obs2", "Obs3"]
      }
    ]);
    await manager.deleteObservations([
      { entityName: "EntityF", observations: ["Obs2"] }
    ]);
    const graph = await manager.loadGraph();
    const entity = graph.entities.find((e) => e.name === "EntityF");
    expect(entity?.observations).toEqual(["Obs1", "Obs3"]);
  });

  it("should delete relations correctly", async () => {
    await manager.createEntities([
      { name: "EntityG", entityType: "TypeG", observations: [] },
      { name: "EntityH", entityType: "TypeH", observations: [] }
    ]);
    await manager.createRelations([
      { from: "EntityG", to: "EntityH", relationType: "relatesTo" }
    ]);
    await manager.deleteRelations([
      { from: "EntityG", to: "EntityH", relationType: "relatesTo" }
    ]);
    const graph = await manager.loadGraph();
    expect(graph.relations).toHaveLength(0);
  });

  it("should read the entire graph correctly", async () => {
    await manager.createEntities([
      { name: "EntityI", entityType: "TypeI", observations: [] }
    ]);
    const graph = await manager.readGraph();
    expect(graph.entities).toHaveLength(1);
  });

  it("should search nodes correctly", async () => {
    await manager.createEntities([
      { name: "EntityJ", entityType: "TypeJ", observations: ["searchable"] }
    ]);
    const result = await manager.searchNodes("searchable");
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].name).toBe("EntityJ");
  });

  it("should open specific nodes correctly", async () => {
    await manager.createEntities([
      { name: "EntityK", entityType: "TypeK", observations: [] },
      { name: "EntityL", entityType: "TypeL", observations: [] }
    ]);
    await manager.createRelations([
      { from: "EntityK", to: "EntityL", relationType: "connects" }
    ]);
    const result = await manager.openNodes(["EntityK"]);
    expect(result.entities).toHaveLength(1);
    expect(result.relations).toHaveLength(0); // Since EntityL not included
  });

  it("should not create duplicate entities", async () => {
    const entities = [
      { name: "Duplicate", entityType: "Type", observations: [] },
      { name: "Duplicate", entityType: "Type", observations: [] }
    ];
    const created = await manager.createEntities(entities);
    expect(created).toHaveLength(1);
    const graph = await manager.loadGraph();
    expect(graph.entities.filter((e) => e.name === "Duplicate")).toHaveLength(
      1
    );
  });

  it("should handle adding observations to non-existent entity", async () => {
    const result = await manager.addObservations([
      { entityName: "NonExistent", contents: ["Obs"] }
    ]);
    expect(result[0].addedObservations).toHaveLength(0);
    // Assuming it logs error but continues
  });

  it("should not create duplicate relations", async () => {
    await manager.createEntities([
      { name: "A", entityType: "Type", observations: [] },
      { name: "B", entityType: "Type", observations: [] }
    ]);
    const relations = [
      { from: "A", to: "B", relationType: "connects" },
      { from: "A", to: "B", relationType: "connects" }
    ];
    const created = await manager.createRelations(relations);
    expect(created).toHaveLength(1);
    const graph = await manager.loadGraph();
    expect(graph.relations).toHaveLength(1);
  });

  it("should handle deleting non-existent entities", async () => {
    const deleted = await manager.deleteEntities(["NonExistent"]);
    expect(deleted).toBe(0);
  });

  it("should handle searching with no matches", async () => {
    const result = await manager.searchNodes("nothing");
    expect(result.entities).toHaveLength(0);
    expect(result.relations).toHaveLength(0);
  });

  it("should handle opening non-existent nodes", async () => {
    const result = await manager.openNodes(["NonExistent"]);
    expect(result.entities).toHaveLength(0);
    expect(result.relations).toHaveLength(0);
  });

  it("should throw error for invalid entity creation", async () => {
    const invalidEntities = [
      { name: "", entityType: "Type", observations: [] },
      { name: "Valid", entityType: "", observations: [] },
      { name: "Valid", entityType: "Type", observations: "not array" }
    ];
    await expect(manager.createEntities(invalidEntities)).rejects.toThrow();
  });

  it("should handle adding duplicate observations", async () => {
    await manager.createEntities([
      { name: "DupObs", entityType: "Type", observations: ["Obs1"] }
    ]);
    const result = await manager.addObservations([
      { entityName: "DupObs", contents: ["Obs1", "Obs2"] }
    ]);
    expect(result[0].addedObservations).toEqual(["Obs2"]);
    const graph = await manager.loadGraph();
    const entity = graph.entities.find((e) => e.name === "DupObs");
    expect(entity.observations).toEqual(["Obs1", "Obs2"]);
  });
});

import { KnowledgeGraphManager } from "../core/manager.js";
import type { Entity, Relation, KnowledgeGraph } from "../core/types.js";

export type { Entity, Relation, KnowledgeGraph };

export class MemoryGraph {
  private manager: KnowledgeGraphManager;

  constructor(memoryPath: string) {
    this.manager = new KnowledgeGraphManager(memoryPath);
  }

  async createEntities(entities: Entity[]): Promise<Entity[]> {
    return this.manager.createEntities(entities);
  }

  async createRelations(relations: Relation[]): Promise<Relation[]> {
    return this.manager.createRelations(relations);
  }

  async addObservations(
    observations: { entityName: string; contents: string[] }[]
  ): Promise<{ entityName: string; addedObservations: string[] }[]> {
    return this.manager.addObservations(observations);
  }

  async deleteEntities(entityNames: string[]): Promise<void> {
    return this.manager.deleteEntities(entityNames);
  }

  async deleteObservations(deletions: { entityName: string; observations: string[] }[]): Promise<void> {
    return this.manager.deleteObservations(deletions);
  }

  async deleteRelations(relations: Relation[]): Promise<void> {
    return this.manager.deleteRelations(relations);
  }

  async readGraph(): Promise<KnowledgeGraph> {
    return this.manager.readGraph();
  }

  async searchNodes(query: string): Promise<KnowledgeGraph> {
    return this.manager.searchNodes(query);
  }

  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    return this.manager.openNodes(names);
  }
}

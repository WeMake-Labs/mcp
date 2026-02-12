import { KnowledgeGraphManager } from "../core/manager.js";
import type { Entity, Relation, KnowledgeGraph } from "../core/types.js";

export type { Entity, Relation, KnowledgeGraph };

/**
 * The main entry point for the Knowledge Graph Memory system.
 * This class provides a high-level, strictly-typed API for managing a persistent
 * knowledge graph of entities, relations, and observations.
 *
 * It is designed to be used by AI agents or other TypeScript applications to maintain
 * context and memory across sessions.
 *
 * @example
 * ```typescript
 * const memory = new MemoryGraph("./memory.jsonl");
 * await memory.createEntities([{ name: "User", entityType: "Person", observations: [] }]);
 * ```
 */
export class MemoryGraph {
  private manager: KnowledgeGraphManager;

  /**
   * Creates a new instance of the MemoryGraph.
   *
   * @param memoryPath - The absolute or relative path to the JSONL file where the graph will be persisted.
   */
  constructor(memoryPath: string) {
    this.manager = new KnowledgeGraphManager(memoryPath);
  }

  /**
   * Creates multiple new entities in the knowledge graph.
   * Existing entities with the same name will be skipped.
   *
   * @param entities - An array of Entity objects to create.
   * @returns A promise that resolves to the array of successfully created entities.
   */
  async createEntities(entities: Entity[]): Promise<Entity[]> {
    return this.manager.createEntities(entities);
  }

  /**
   * Creates multiple new relations between entities.
   * Relations are directed (from -> to) and should use active voice for the relation type.
   *
   * @param relations - An array of Relation objects to create.
   * @returns A promise that resolves to the array of successfully created relations.
   * @throws Error if either the source or target entity does not exist.
   */
  async createRelations(relations: Relation[]): Promise<Relation[]> {
    return this.manager.createRelations(relations);
  }

  /**
   * Adds new observations (facts) to existing entities.
   *
   * @param observations - An array of objects specifying the target entity name and the new observation contents.
   * @returns A promise that resolves to the results, indicating which observations were added for each entity.
   * @throws Error if the target entity does not exist.
   */
  async addObservations(
    observations: { entityName: string; contents: string[] }[]
  ): Promise<{ entityName: string; addedObservations: string[] }[]> {
    return this.manager.addObservations(observations);
  }

  /**
   * Deletes multiple entities and their associated relations from the graph.
   * This is a cascading delete: any relations involving these entities will also be removed.
   *
   * @param entityNames - An array of names of the entities to delete.
   * @returns A promise that resolves when the operation is complete.
   */
  async deleteEntities(entityNames: string[]): Promise<void> {
    return this.manager.deleteEntities(entityNames);
  }

  /**
   * Deletes specific observations from entities.
   *
   * @param deletions - An array of objects specifying the target entity and the observations to remove.
   * @returns A promise that resolves when the operation is complete.
   */
  async deleteObservations(deletions: { entityName: string; observations: string[] }[]): Promise<void> {
    return this.manager.deleteObservations(deletions);
  }

  /**
   * Deletes specific relations from the graph.
   *
   * @param relations - An array of Relation objects to delete. matches are exact.
   * @returns A promise that resolves when the operation is complete.
   */
  async deleteRelations(relations: Relation[]): Promise<void> {
    return this.manager.deleteRelations(relations);
  }

  /**
   * Reads and returns the entire knowledge graph.
   *
   * @returns A promise that resolves to the complete KnowledgeGraph object.
   */
  async readGraph(): Promise<KnowledgeGraph> {
    return this.manager.readGraph();
  }

  /**
   * Searches for nodes in the graph based on a query string.
   * Matches against entity names, types, and observation content.
   *
   * @param query - The search query string.
   * @returns A promise that resolves to a subgraph containing matching entities and their connecting relations.
   */
  async searchNodes(query: string): Promise<KnowledgeGraph> {
    return this.manager.searchNodes(query);
  }

  /**
   * Retrieves specific nodes by their names.
   *
   * @param names - An array of entity names to retrieve.
   * @returns A promise that resolves to a subgraph containing the requested entities and their connecting relations.
   */
  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    return this.manager.openNodes(names);
  }
}

import { promises as fs } from "fs";
import path from "path";
import { Entity, KnowledgeGraph, Relation } from "./types.js";

/**
 * A simple Mutex to ensure sequential execution of asynchronous operations.
 * This prevents race conditions where concurrent read-modify-write cycles
 * could overwrite each other's changes.
 */
class Mutex {
  private _queue: Promise<void> = Promise.resolve();

  runExclusive<T>(callback: () => Promise<T>): Promise<T> {
    const result = this._queue.then(() => callback());
    // Catch errors so the queue doesn't get stuck
    this._queue = result.then(
      () => {},
      () => {}
    );
    return result;
  }
}

export class KnowledgeGraphManager {
  private memoryPath: string;
  private mutex = new Mutex();

  constructor(memoryPath: string) {
    this.memoryPath = memoryPath;
  }

  private async loadGraph(): Promise<KnowledgeGraph> {
    try {
      const data = await fs.readFile(this.memoryPath, "utf-8");
      const lines = data.split(/\r?\n/).filter((line) => line.trim() !== "");
      const graph: KnowledgeGraph = { entities: [], relations: [] };

      for (const line of lines) {
        try {
          const item = JSON.parse(line);

          if (
            item?.type === "entity" &&
            typeof item.name === "string" &&
            typeof item.entityType === "string" &&
            Array.isArray(item.observations)
          ) {
            graph.entities.push({
              name: item.name,
              entityType: item.entityType,
              observations: item.observations.map(String)
            });
          } else if (
            item?.type === "relation" &&
            typeof item.from === "string" &&
            typeof item.to === "string" &&
            typeof item.relationType === "string"
          ) {
            graph.relations.push({
              from: item.from,
              to: item.to,
              relationType: item.relationType
            });
          }
        } catch {
          // Ignore malformed lines
        }
      }

      return graph;
    } catch (error) {
      if (error instanceof Error && "code" in error && (error as { code: string }).code === "ENOENT") {
        return { entities: [], relations: [] };
      }
      throw error;
    }
  }

  private async saveGraph(graph: KnowledgeGraph): Promise<void> {
    const lines = [
      ...graph.entities.map((e) =>
        JSON.stringify({
          name: e.name,
          entityType: e.entityType,
          observations: e.observations,
          type: "entity"
        })
      ),
      ...graph.relations.map((r) =>
        JSON.stringify({
          from: r.from,
          to: r.to,
          relationType: r.relationType,
          type: "relation"
        })
      )
    ];
    const dir = path.dirname(this.memoryPath);
    await fs.mkdir(dir, { recursive: true });
    const tmp = `${this.memoryPath}.tmp`;
    await fs.writeFile(tmp, lines.join("\n") + "\n", "utf-8");
    await fs.rename(tmp, this.memoryPath);
  }

  async createEntities(entities: Entity[]): Promise<Entity[]> {
    return this.mutex.runExclusive(async () => {
      const graph = await this.loadGraph();

      const sanitized = entities
        .map((e) => ({
          name: e.name?.trim(),
          entityType: e.entityType?.trim(),
          observations: Array.isArray(e.observations) ? e.observations.map(String) : []
        }))
        .filter((e) => e.name && e.entityType);

      const newEntities = sanitized.filter((e) => !graph.entities.some((existing) => existing.name === e.name));

      graph.entities.push(...newEntities);
      await this.saveGraph(graph);
      return newEntities;
    });
  }

  async createRelations(relations: Relation[]): Promise<Relation[]> {
    return this.mutex.runExclusive(async () => {
      const graph = await this.loadGraph();
      const exists = (n: string) => graph.entities.some((e) => e.name === n);
      const sanitized = relations.filter((r) => r.from && r.to && r.relationType);
      const missingEndpoints = sanitized.filter((r) => !exists(r.from) || !exists(r.to));

      if (missingEndpoints.length) {
        throw new Error(`Unknown relation endpoints: ${missingEndpoints.map((r) => `${r.from}->${r.to}`).join(", ")}`);
      }

      const newRelations = sanitized.filter(
        (r) =>
          !graph.relations.some(
            (existingRelation) =>
              existingRelation.from === r.from &&
              existingRelation.to === r.to &&
              existingRelation.relationType === r.relationType
          )
      );

      graph.relations.push(...newRelations);
      await this.saveGraph(graph);
      return newRelations;
    });
  }

  async addObservations(
    observations: { entityName: string; contents: string[] }[]
  ): Promise<{ entityName: string; addedObservations: string[] }[]> {
    return this.mutex.runExclusive(async () => {
      const graph = await this.loadGraph();
      const results = observations.map((o) => {
        const entity = graph.entities.find((e) => e.name === o.entityName);
        if (!entity) {
          throw new Error(`Entity with name ${o.entityName} not found`);
        }
        const MAX_PER_CALL = 200;
        const normalized = o.contents
          .map((c) => String(c).trim())
          .filter(Boolean)
          .slice(0, MAX_PER_CALL);
        const existing = new Set(entity.observations);
        const newObservations = normalized.filter((c) => !existing.has(c));
        entity.observations.push(...newObservations);
        return { entityName: o.entityName, addedObservations: newObservations };
      });
      await this.saveGraph(graph);
      return results;
    });
  }

  async deleteEntities(entityNames: string[]): Promise<void> {
    return this.mutex.runExclusive(async () => {
      const graph = await this.loadGraph();
      graph.entities = graph.entities.filter((e) => !entityNames.includes(e.name));
      graph.relations = graph.relations.filter((r) => !entityNames.includes(r.from) && !entityNames.includes(r.to));
      await this.saveGraph(graph);
    });
  }

  async deleteObservations(deletions: { entityName: string; observations: string[] }[]): Promise<void> {
    return this.mutex.runExclusive(async () => {
      const graph = await this.loadGraph();
      deletions.forEach((d) => {
        const entity = graph.entities.find((e) => e.name === d.entityName);
        if (entity) {
          entity.observations = entity.observations.filter((o) => !d.observations.includes(o));
        }
      });
      await this.saveGraph(graph);
    });
  }

  async deleteRelations(relations: Relation[]): Promise<void> {
    return this.mutex.runExclusive(async () => {
      const graph = await this.loadGraph();
      graph.relations = graph.relations.filter(
        (r) =>
          !relations.some(
            (delRelation) =>
              r.from === delRelation.from && r.to === delRelation.to && r.relationType === delRelation.relationType
          )
      );
      await this.saveGraph(graph);
    });
  }

  async readGraph(): Promise<KnowledgeGraph> {
    return this.loadGraph();
  }

  async searchNodes(query: string): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();
    const q = query.toLowerCase();
    const filteredEntities = graph.entities.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.entityType.toLowerCase().includes(q) ||
        e.observations.some((o) => o.toLowerCase().includes(q))
    );

    const filteredEntityNames = new Set(filteredEntities.map((e) => e.name));

    const filteredRelations = graph.relations.filter(
      (r) => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    return {
      entities: filteredEntities,
      relations: filteredRelations
    };
  }

  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    const filteredEntities = graph.entities.filter((e) => names.includes(e.name));

    const filteredEntityNames = new Set(filteredEntities.map((e) => e.name));

    const filteredRelations = graph.relations.filter(
      (r) => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    return {
      entities: filteredEntities,
      relations: filteredRelations
    };
  }
}

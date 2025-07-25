#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import minimist from "minimist";
import { isAbsolute } from "path";

// Parse args and handle paths safely
const argv = minimist(process.argv.slice(2));
let memoryPath = argv["memory-path"];

// If a custom path is provided, ensure it's absolute
// Before:
// if (memoryPath && !isAbsolute(memoryPath)) {
//   memoryPath = path.resolve(process.cwd(), memoryPath);
// }

// After:
if (memoryPath) {
  // Handle tilde expansion
  if (memoryPath.startsWith("~/")) {
    memoryPath = path.join(
      process.env.HOME || process.env.USERPROFILE || "",
      memoryPath.slice(2)
    );
  }
  if (!isAbsolute(memoryPath)) {
    memoryPath = path.resolve(process.cwd(), memoryPath);
  }
}

// Define the path to the JSON file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Use the custom path or default to the installation directory
const MEMORY_FILE_PATH = memoryPath || path.join(__dirname, "knowledge.json");

// We are storing our memory using entities, relations, and observations in a graph structure
interface Entity {
  name: string;
  entityType: string;
  observations: string[];
}

interface Relation {
  from: string;
  to: string;
  relationType: string;
}

interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

// The KnowledgeGraphManager class contains all operations to interact with the knowledge graph
export class KnowledgeGraphManager {
  private memoryFilePath: string;

  constructor(memoryFilePath: string) {
    this.memoryFilePath = memoryFilePath;
  }
  private async loadGraph(): Promise<KnowledgeGraph> {
    try {
      const data = await fs.readFile(this.memoryFilePath, "utf-8");
      if (!data.trim()) {
        return { entities: [], relations: [] };
      }
      const graph = JSON.parse(data) as KnowledgeGraph;
      return {
        entities: Array.isArray(graph.entities)
          ? graph.entities.map((e) => ({
              ...e,
              observations: Array.isArray(e.observations) ? e.observations : []
            }))
          : [],
        relations: Array.isArray(graph.relations) ? graph.relations : []
      };
    } catch (error) {
      if (
        error instanceof Error &&
        (("code" in error &&
          (error as Error & { code: string }).code === "ENOENT") ||
          error.name === "SyntaxError")
      ) {
        return { entities: [], relations: [] };
      }
      throw error;
    }
  }

  private async saveGraph(graph: KnowledgeGraph): Promise<void> {
    // Create a clean graph object
    const jsonGraph = {
      entities: graph.entities.map(({ name, entityType, observations }) => ({
        name,
        entityType,
        observations
      })),
      relations: graph.relations.map(({ from, to, relationType }) => ({
        from,
        to,
        relationType
      }))
    };

    await fs.writeFile(this.memoryFilePath, JSON.stringify(jsonGraph, null, 2));
  }

  async createEntities(entities: Entity[]): Promise<Entity[]> {
    // Validate entities
    for (const entity of entities) {
      if (!entity.name || typeof entity.name !== "string") {
        throw new Error("Entity name must be a non-empty string");
      }
      if (!entity.entityType || typeof entity.entityType !== "string") {
        throw new Error("Entity type must be a non-empty string");
      }
      if (!Array.isArray(entity.observations)) {
        throw new Error("Entity observations must be an array");
      }
    }
    const graph = await this.loadGraph();
    const existingNames = new Set(graph.entities.map((e) => e.name));
    const newEntities: Entity[] = [];
    for (const e of entities) {
      if (!existingNames.has(e.name)) {
        newEntities.push(e);
        existingNames.add(e.name);
      }
    }
    graph.entities.push(...newEntities);
    await this.saveGraph(graph);
    return newEntities;
  }

  async createRelations(relations: Relation[]): Promise<Relation[]> {
    const graph = await this.loadGraph();
    const existingRelations = new Set(
      graph.relations.map((r) => `${r.from}|${r.to}|${r.relationType}`)
    );
    const newRelations: Relation[] = [];
    for (const r of relations) {
      const key = `${r.from}|${r.to}|${r.relationType}`;
      if (!existingRelations.has(key)) {
        newRelations.push(r);
        existingRelations.add(key);
      }
    }
    graph.relations.push(...newRelations);
    await this.saveGraph(graph);
    return newRelations;
  }

  async addObservations(
    observations: { entityName: string; contents: string[] }[]
  ): Promise<{ entityName: string; addedObservations: string[] }[]> {
    const graph = await this.loadGraph();
    const results = observations.map((o) => {
      const entity = graph.entities.find((e) => e.name === o.entityName);
      if (!entity) {
        console.error(`Entity with name ${o.entityName} not found`);
        return {
          entityName: o.entityName,
          addedObservations: [],
          error: "Entity not found"
        };
      }
      const newObservations = o.contents.filter(
        (content) => !entity.observations.includes(content)
      );
      entity.observations.push(...newObservations);
      return { entityName: o.entityName, addedObservations: newObservations };
    });
    await this.saveGraph(graph);
    return results;
  }

  async deleteEntities(entityNames: string[]): Promise<number> {
    const graph = await this.loadGraph();
    const setToDelete = new Set(entityNames);
    const initialLength = graph.entities.length;
    graph.entities = graph.entities.filter((e) => !setToDelete.has(e.name));
    graph.relations = graph.relations.filter(
      (r) => !setToDelete.has(r.from) && !setToDelete.has(r.to)
    );
    await this.saveGraph(graph);
    return initialLength - graph.entities.length;
  }

  async deleteObservations(
    deletions: { entityName: string; observations: string[] }[]
  ): Promise<void> {
    const graph = await this.loadGraph();
    deletions.forEach((d) => {
      const entity = graph.entities.find((e) => e.name === d.entityName);
      if (entity) {
        entity.observations = entity.observations.filter(
          (o) => !d.observations.includes(o)
        );
      }
    });
    await this.saveGraph(graph);
  }

  async deleteRelations(relations: Relation[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.relations = graph.relations.filter(
      (r) =>
        !relations.some(
          (delRelation) =>
            r.from === delRelation.from &&
            r.to === delRelation.to &&
            r.relationType === delRelation.relationType
        )
    );
    await this.saveGraph(graph);
  }

  async readGraph(): Promise<KnowledgeGraph> {
    return this.loadGraph();
  }

  // Very basic search function
  async searchNodes(query: string): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    // Filter entities
    const filteredEntities = graph.entities.filter(
      (e) =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.entityType.toLowerCase().includes(query.toLowerCase()) ||
        e.observations.some((o) =>
          o.toLowerCase().includes(query.toLowerCase())
        )
    );

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map((e) => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(
      (r) => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations
    };

    return filteredGraph;
  }

  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    // Filter entities
    const filteredEntities = graph.entities.filter((e) =>
      names.includes(e.name)
    );

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map((e) => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(
      (r) => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations
    };

    return filteredGraph;
  }
}

const knowledgeGraphManager = new KnowledgeGraphManager(MEMORY_FILE_PATH);

// The server instance and tools exposed to AI models
const server = new Server(
  {
    name: "knowledge-graph-memory-server",
    version: "1.1.2"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

const listToolsHandler = async () => {
  return { tools: toolSchemas };
};
const callToolHandler = async (request) => {
  const memoryFilePath =
    process.env.KNOWLEDGE_GRAPH_MEMORY_FILE ||
    path.join(__dirname, "knowledge.json");
  const manager = new KnowledgeGraphManager(memoryFilePath);
  const { name, arguments: args } = request.params;
  if (!args) throw new Error("No arguments provided");
  let result;
  switch (name) {
    case "create_entities":
      result = await manager.createEntities(args.entities);
      break;
    case "create_relations":
      result = await manager.createRelations(args.relations);
      break;
    case "add_observations":
      result = await manager.addObservations(args.observations);
      break;
    case "delete_entities":
      await manager.deleteEntities(args.entityNames);
      result = "Entities deleted successfully";
      break;
    case "delete_observations":
      await manager.deleteObservations(args.deletions);
      result = "Observations deleted successfully";
      break;
    case "delete_relations":
      await manager.deleteRelations(args.relations);
      result = "Relations deleted successfully";
      break;
    case "read_graph":
      result = await manager.readGraph();
      break;
    case "search_nodes":
      result = await manager.searchNodes(args.query);
      break;
    case "open_nodes":
      result = await manager.openNodes(args.names);
      break;
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
  return {
    content: [
      { text: typeof result === "string" ? result : JSON.stringify(result) }
    ]
  };
};

export const testExports =
  process.env.NODE_ENV === "test" || process.env.VITEST
    ? { listToolsHandler, callToolHandler }
    : undefined;
if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
}

const toolSchemas = [
  {
    name: "create_entities",
    description: "Create multiple new entities",
    inputSchema: {
      type: "object",
      properties: {
        entities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              entityType: { type: "string" },
              observations: { type: "array", items: { type: "string" } }
            },
            required: ["name", "entityType", "observations"]
          }
        }
      },
      required: ["entities"]
    }
  },
  {
    name: "create_relations",
    description: "Create multiple new relations",
    inputSchema: {
      type: "object",
      properties: {
        relations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              relationType: { type: "string" }
            },
            required: ["from", "to", "relationType"]
          }
        }
      },
      required: ["relations"]
    }
  },
  {
    name: "add_observations",
    description: "Add observations to entities",
    inputSchema: {
      type: "object",
      properties: {
        observations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              entityName: { type: "string" },
              contents: { type: "array", items: { type: "string" } }
            },
            required: ["entityName", "contents"]
          }
        }
      },
      required: ["observations"]
    }
  },
  {
    name: "delete_entities",
    description: "Delete entities",
    inputSchema: {
      type: "object",
      properties: { entityNames: { type: "array", items: { type: "string" } } },
      required: ["entityNames"]
    }
  },
  {
    name: "delete_observations",
    description: "Delete observations",
    inputSchema: {
      type: "object",
      properties: {
        deletions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              entityName: { type: "string" },
              observations: { type: "array", items: { type: "string" } }
            },
            required: ["entityName", "observations"]
          }
        }
      },
      required: ["deletions"]
    }
  },
  {
    name: "delete_relations",
    description: "Delete relations",
    inputSchema: {
      type: "object",
      properties: {
        relations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              relationType: { type: "string" }
            },
            required: ["from", "to", "relationType"]
          }
        }
      },
      required: ["relations"]
    }
  },
  {
    name: "read_graph",
    description: "Read the entire graph",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "search_nodes",
    description: "Search for nodes",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"]
    }
  },
  {
    name: "open_nodes",
    description: "Open specific nodes",
    inputSchema: {
      type: "object",
      properties: { names: { type: "array", items: { type: "string" } } },
      required: ["names"]
    }
  }
];
const createEntities = async (args) =>
  await knowledgeGraphManager.createEntities(args.entities);
const createRelations = async (args) =>
  await knowledgeGraphManager.createRelations(args.relations);
const addObservations = async (args) =>
  await knowledgeGraphManager.addObservations(args.observations);
const deleteEntities = async (args) =>
  await knowledgeGraphManager.deleteEntities(args.entityNames);
const deleteObservations = async (args) =>
  await knowledgeGraphManager.deleteObservations(args.deletions);
const deleteRelations = async (args) =>
  await knowledgeGraphManager.deleteRelations(args.relations);
const readGraph = async () => await knowledgeGraphManager.readGraph();
const searchNodes = async (args) =>
  await knowledgeGraphManager.searchNodes(args.query);
const openNodes = async (args) =>
  await knowledgeGraphManager.openNodes(args.names);

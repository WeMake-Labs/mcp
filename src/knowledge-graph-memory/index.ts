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
      const graph = JSON.parse(data) as KnowledgeGraph;

      // Ensure the graph has the expected structure
      return {
        entities: Array.isArray(graph.entities) ? graph.entities : [],
        relations: Array.isArray(graph.relations) ? graph.relations : []
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as Error & { code: string }).code === "ENOENT"
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

    const tempPath = `${this.memoryFilePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(jsonGraph, null, 2));
    await fs.rename(tempPath, this.memoryFilePath);
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
    const newEntities = entities.filter(
      (e) =>
        !graph.entities.some((existingEntity) => existingEntity.name === e.name)
    );
    graph.entities.push(...newEntities);
    await this.saveGraph(graph);
    return newEntities;
  }

  async createRelations(relations: Relation[]): Promise<Relation[]> {
    const graph = await this.loadGraph();
    const newRelations = relations.filter(
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

  async deleteEntities(entityNames: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(
      (e) => !entityNames.includes(e.name)
    );
    graph.relations = graph.relations.filter(
      (r) => !entityNames.includes(r.from) && !entityNames.includes(r.to)
    );
    await this.saveGraph(graph);
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
    version: "1.1.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_entities",
        description: "Create multiple new entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the entity"
                  },
                  entityType: {
                    type: "string",
                    description: "The type of the entity"
                  },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description:
                      "An array of observation contents associated with the entity"
                  }
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
        description:
          "Create multiple new relations between entities in the knowledge graph. Relations should be in active voice",
        inputSchema: {
          type: "object",
          properties: {
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: {
                    type: "string",
                    description:
                      "The name of the entity where the relation starts"
                  },
                  to: {
                    type: "string",
                    description:
                      "The name of the entity where the relation ends"
                  },
                  relationType: {
                    type: "string",
                    description: "The type of the relation"
                  }
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
        description:
          "Add new observations to existing entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            observations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: {
                    type: "string",
                    description:
                      "The name of the entity to add the observations to"
                  },
                  contents: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observation contents to add"
                  }
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
        description:
          "Delete multiple entities and their associated relations from the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            entityNames: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to delete"
            }
          },
          required: ["entityNames"]
        }
      },
      {
        name: "delete_observations",
        description:
          "Delete specific observations from entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            deletions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: {
                    type: "string",
                    description:
                      "The name of the entity containing the observations"
                  },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observations to delete"
                  }
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
        description: "Delete multiple relations from the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: {
                    type: "string",
                    description:
                      "The name of the entity where the relation starts"
                  },
                  to: {
                    type: "string",
                    description:
                      "The name of the entity where the relation ends"
                  },
                  relationType: {
                    type: "string",
                    description: "The type of the relation"
                  }
                },
                required: ["from", "to", "relationType"]
              },
              description: "An array of relations to delete"
            }
          },
          required: ["relations"]
        }
      },
      {
        name: "read_graph",
        description: "Read the entire knowledge graph",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "search_nodes",
        description: "Search for nodes in the knowledge graph based on a query",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "The search query to match against entity names, types, and observation content"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "open_nodes",
        description:
          "Open specific nodes in the knowledge graph by their names",
        inputSchema: {
          type: "object",
          properties: {
            names: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to retrieve"
            }
          },
          required: ["names"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error(`No arguments provided for tool: ${name}`);
  }

  switch (name) {
    case "create_entities":
      if (!args.entities || !Array.isArray(args.entities)) {
        throw new Error("Invalid entities argument");
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.createEntities(args.entities),
              null,
              2
            )
          }
        ]
      };
    case "create_relations":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.createRelations(
                args.relations as Relation[]
              ),
              null,
              2
            )
          }
        ]
      };
    case "add_observations":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.addObservations(
                args.observations as {
                  entityName: string;
                  contents: string[];
                }[]
              ),
              null,
              2
            )
          }
        ]
      };
    case "delete_entities":
      await knowledgeGraphManager.deleteEntities(args.entityNames as string[]);
      return {
        content: [{ type: "text", text: "Entities deleted successfully" }]
      };
    case "delete_observations":
      await knowledgeGraphManager.deleteObservations(
        args.deletions as { entityName: string; observations: string[] }[]
      );
      return {
        content: [{ type: "text", text: "Observations deleted successfully" }]
      };
    case "delete_relations":
      await knowledgeGraphManager.deleteRelations(args.relations as Relation[]);
      return {
        content: [{ type: "text", text: "Relations deleted successfully" }]
      };
    case "read_graph":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.readGraph(),
              null,
              2
            )
          }
        ]
      };
    case "search_nodes":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.searchNodes(args.query as string),
              null,
              2
            )
          }
        ]
      };
    case "open_nodes":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.openNodes(args.names as string[]),
              null,
              2
            )
          }
        ]
      };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Knowledge Graph MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

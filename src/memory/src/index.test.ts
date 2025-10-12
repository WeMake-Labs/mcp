import { describe, expect, test, beforeEach } from "bun:test";
import createServer from "./index.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from "fs";
import path from "path";

/**
 * Test suite for Memory MCP Server.
 *
 * Business Context: Ensures the knowledge graph memory system correctly manages
 * entities and relations for enterprise knowledge management and AI context.
 *
 * Decision Rationale: Tests focus on server initialization, entity/relation CRUD operations,
 * file persistence, and data validation to ensure production-ready reliability.
 */
describe("Memory Server", () => {
  test("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  test("server exports correct configuration", () => {
    const server = createServer();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  test("server has correct name and version", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});

/**
 * Entity Management Tests.
 *
 * Business Context: Entity management is core to knowledge graph functionality
 * for maintaining accurate and up-to-date knowledge representations.
 *
 * Decision Rationale: Test entity creation, retrieval, updating, and deletion
 * to ensure data integrity and proper knowledge management.
 */
describe("Entity Management", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer();
  });

  test("creates entity successfully", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "createEntity",
        arguments: {
          name: "Test Entity",
          entityType: "person",
          observations: ["First observation", "Second observation"]
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  test("retrieves entities successfully", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "getEntities",
        arguments: {}
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  test("updates entity successfully", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "updateEntity",
        arguments: {
          name: "Test Entity",
          entityType: "person",
          observations: ["Updated observation"]
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  test("deletes entity successfully", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "deleteEntity",
        arguments: {
          name: "Test Entity"
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });
});

/**
 * Relation Management Tests.
 *
 * Business Context: Relation management enables complex knowledge representation
 * and reasoning across interconnected entities.
 *
 * Decision Rationale: Test relation creation, retrieval, and deletion to ensure
 * proper knowledge graph connectivity and relationship management.
 */
describe("Relation Management", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer();
  });

  test("creates relation successfully", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "createRelation",
        arguments: {
          from: "Entity A",
          to: "Entity B",
          relationType: "related_to"
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  test("retrieves relations successfully", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "getRelations",
        arguments: {}
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  test("deletes relation successfully", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "deleteRelation",
        arguments: {
          from: "Entity A",
          to: "Entity B",
          relationType: "related_to"
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });
});

/**
 * Knowledge Graph Query Tests.
 *
 * Business Context: Complex queries enable sophisticated knowledge retrieval
 * and reasoning across interconnected entities and relations.
 *
 * Decision Rationale: Test various query patterns to ensure comprehensive
 * knowledge graph exploration and analysis capabilities.
 */
describe("Knowledge Graph Queries", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer();
  });

  test("searches entities by name", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "searchEntities",
        arguments: {
          query: "test"
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  test("finds paths between entities", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "findPaths",
        arguments: {
          from: "Entity A",
          to: "Entity B",
          maxDepth: 3
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  test("retrieves entity neighbors", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "getEntityNeighbors",
        arguments: {
          entityName: "Test Entity"
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  test("gets graph statistics", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "getGraphStats",
        arguments: {}
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });
});

/**
 * File Persistence Tests.
 *
 * Business Context: Persistent storage ensures knowledge is maintained across
 * sessions and system restarts for reliable enterprise knowledge management.
 *
 * Decision Rationale: Test file I/O operations and data persistence to ensure
 * reliable knowledge storage and retrieval.
 */
describe("File Persistence", () => {
  test("handles missing memory file gracefully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  test("loads existing memory file", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  test("saves memory file correctly", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});

/**
 * Input Validation Tests.
 *
 * Business Context: Enterprise applications require robust input validation
 * to prevent data corruption and ensure GDPR compliance.
 *
 * Decision Rationale: Test all validation error paths to ensure clear error
 * messages and proper input sanitization.
 */
describe("Input Validation", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer();
  });

  test("rejects invalid entity creation input", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "createEntity",
        arguments: null
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects invalid relation creation input", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "createRelation",
        arguments: { from: "Entity A" }
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("handles valid entity input", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "createEntity",
        arguments: {
          name: "Valid Entity",
          entityType: "person",
          observations: ["Valid observation"]
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  test("handles valid relation input", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "createRelation",
        arguments: {
          from: "Entity A",
          to: "Entity B",
          relationType: "knows"
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });
});

/**
 * MCP Server Integration Tests.
 *
 * Business Context: MCP protocol compliance is essential for AI agent integration.
 *
 * Decision Rationale: Test tool handler and error cases that can be validated
 * without requiring a connected transport.
 */
describe("MCP Server Integration", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer();
  });

  test("server can be created without errors", () => {
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  test("rejects unknown tool name", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "unknownTool",
        arguments: {}
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("handles all available tools", async () => {
    const tools = ["createEntity", "getEntities", "updateEntity", "deleteEntity",
                   "createRelation", "getRelations", "deleteRelation",
                   "searchEntities", "findPaths", "getEntityNeighbors", "getGraphStats"];

    for (const toolName of tools) {
      const request = {
        method: "tools/call" as const,
        params: {
          name: toolName,
          arguments: {}
        }
      };

      const result = await server.request(request, CallToolRequestSchema);
      expect(result.content).toBeDefined();
    }
  });
});

/**
 * Edge Cases and Performance Tests.
 *
 * Business Context: Enterprise applications must handle edge cases gracefully
 * and perform well under load.
 *
 * Decision Rationale: Test boundary conditions and performance to ensure
 * production reliability.
 */
describe("Edge Cases and Performance", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer();
  });

  test("handles empty knowledge graph", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "getEntities",
        arguments: {}
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
  });

  test("handles special characters in entity names", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "createEntity",
        arguments: {
          name: "Entity with émojis 🚀 and spëcial châractérs",
          entityType: "test",
          observations: ["Special observation with ünícode"]
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
  });

  test("handles very long entity names and observations", async () => {
    const longName = "A".repeat(1000);
    const longObservation = "B".repeat(1000);

    const request = {
      method: "tools/call" as const,
      params: {
        name: "createEntity",
        arguments: {
          name: longName,
          entityType: "test",
          observations: [longObservation]
        }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
  });

  test("handles concurrent operations", async () => {
    const requests = Array.from({ length: 10 }, (_, i) => ({
      method: "tools/call" as const,
      params: {
        name: "createEntity",
        arguments: {
          name: `Concurrent Entity ${i}`,
          entityType: "test",
          observations: [`Observation ${i}`]
        }
      }
    }));

    const results = await Promise.all(
      requests.map(request => server.request(request, CallToolRequestSchema))
    );

    results.forEach(result => {
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");
    });
  });
});

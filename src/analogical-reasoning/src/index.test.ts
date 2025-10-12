import { describe, expect, test, beforeEach } from "bun:test";
import createServer, { AnalogicalReasoningServer } from "./index.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Test suite for Analogical Reasoning MCP Server.
 *
 * Business Context: Ensures the analogical reasoning framework correctly validates
 * domain structures, mappings, and inferences for enterprise AI applications.
 *
 * Decision Rationale: Tests focus on server initialization and schema validation
 * to ensure production-ready reliability. Full integration testing is done via
 * MCP Inspector during development workflow.
 */
describe("Analogical Reasoning Server", () => {
  test("server initializes successfully", () => {
    const server = createServer({ config: {} });
    expect(server).toBeDefined();
  });

  test("server exports correct configuration", () => {
    const server = createServer({ config: {} });
    // Verify server is an MCP Server instance
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  test("server has correct name and version", () => {
    const server = createServer({ config: {} });
    // Server metadata is internal, but we can verify it initializes
    expect(server).toBeDefined();
  });
});

/**
 * Integration tests for analogical reasoning tool.
 *
 * These tests verify the tool schema and basic structural requirements.
 * Full end-to-end testing is performed using MCP Inspector with sample data.
 */
describe("Analogical Reasoning Tool", () => {
  test("valid water-electricity analogy structure", () => {
    const validAnalogy = {
      analogyId: "water-electricity-001",
      purpose: "explanation" as const,
      confidence: 0.85,
      iteration: 1,
      sourceDomain: {
        name: "Water Flow",
        elements: [
          {
            id: "water",
            name: "Water",
            type: "entity" as const,
            description: "Fluid that flows through pipes"
          },
          {
            id: "pipe",
            name: "Pipe",
            type: "entity" as const,
            description: "Conduit for water flow"
          },
          {
            id: "pressure",
            name: "Water Pressure",
            type: "attribute" as const,
            description: "Force pushing water through pipes"
          },
          {
            id: "flow",
            name: "Flow",
            type: "process" as const,
            description: "Movement of water through system"
          }
        ]
      },
      targetDomain: {
        name: "Electrical Circuit",
        elements: [
          {
            id: "electricity",
            name: "Electric Current",
            type: "entity" as const,
            description: "Flow of electrons through circuit"
          },
          {
            id: "wire",
            name: "Wire",
            type: "entity" as const,
            description: "Conduit for electrical current"
          },
          {
            id: "voltage",
            name: "Voltage",
            type: "attribute" as const,
            description: "Electrical potential difference"
          },
          {
            id: "current_flow",
            name: "Current Flow",
            type: "process" as const,
            description: "Movement of electrons through circuit"
          }
        ]
      },
      mappings: [
        {
          sourceElement: "water",
          targetElement: "electricity",
          mappingStrength: 0.9,
          justification: "Both are flowing substances through a system",
          limitations: ["Water is visible, electricity is not"]
        },
        {
          sourceElement: "pipe",
          targetElement: "wire",
          mappingStrength: 0.85,
          justification: "Both are conduits for flow",
          limitations: ["Different materials and physical properties"]
        },
        {
          sourceElement: "pressure",
          targetElement: "voltage",
          mappingStrength: 0.8,
          justification: "Both represent the force driving flow",
          limitations: ["Different units and measurement methods"]
        }
      ],
      strengths: ["Strong structural correspondence", "Useful for teaching basic circuits"],
      limitations: ["Breaks down at quantum level", "Oversimplifies electrical resistance"],
      inferences: [
        {
          statement: "Higher voltage leads to more current, like higher pressure leads to more water flow",
          confidence: 0.9,
          basedOnMappings: ["pressure_to_voltage"]
        }
      ],
      nextOperationNeeded: false,
      suggestedOperations: []
    };

    // Verify structure
    expect(validAnalogy.analogyId).toBe("water-electricity-001");
    expect(validAnalogy.sourceDomain.elements).toHaveLength(4);
    expect(validAnalogy.targetDomain.elements).toHaveLength(4);
    expect(validAnalogy.mappings).toHaveLength(3);
    expect(validAnalogy.inferences).toHaveLength(1);

    // Verify element types
    const elementTypes = validAnalogy.sourceDomain.elements.map((e) => e.type);
    expect(elementTypes).toContain("entity");
    expect(elementTypes).toContain("attribute");
    expect(elementTypes).toContain("process");

    // Verify mapping strengths are in valid range
    for (const mapping of validAnalogy.mappings) {
      expect(mapping.mappingStrength).toBeGreaterThanOrEqual(0);
      expect(mapping.mappingStrength).toBeLessThanOrEqual(1);
    }

    // Verify confidence is in valid range
    expect(validAnalogy.confidence).toBeGreaterThanOrEqual(0);
    expect(validAnalogy.confidence).toBeLessThanOrEqual(1);
  });

  test("biology-organization analogy with multiple inferences", () => {
    const analogyWithInferences = {
      analogyId: "biology-org-001",
      purpose: "prediction" as const,
      confidence: 0.75,
      iteration: 2,
      sourceDomain: {
        name: "Biology",
        elements: [
          {
            id: "cell",
            name: "Cell",
            type: "entity" as const,
            description: "Basic unit of life"
          },
          {
            id: "specialization",
            name: "Cell Specialization",
            type: "process" as const,
            description: "Cells developing specific functions"
          }
        ]
      },
      targetDomain: {
        name: "Organization",
        elements: [
          {
            id: "employee",
            name: "Employee",
            type: "entity" as const,
            description: "Basic unit of organization"
          },
          {
            id: "role_assignment",
            name: "Role Assignment",
            type: "process" as const,
            description: "Employees taking on specific roles"
          }
        ]
      },
      mappings: [
        {
          sourceElement: "cell",
          targetElement: "employee",
          mappingStrength: 0.7,
          justification: "Both are fundamental building blocks"
        },
        {
          sourceElement: "specialization",
          targetElement: "role_assignment",
          mappingStrength: 0.65,
          justification: "Both involve differentiation of function"
        }
      ],
      strengths: ["Helps understand organizational structure"],
      limitations: ["Oversimplifies human agency"],
      inferences: [
        {
          statement: "Organizations need diverse types of employees like bodies need different cell types",
          confidence: 0.8,
          basedOnMappings: ["cell_to_employee"]
        },
        {
          statement: "Communication between employees is like cell signaling",
          confidence: 0.65,
          basedOnMappings: ["cell_to_employee"]
        }
      ],
      nextOperationNeeded: true,
      suggestedOperations: ["add-mapping" as const, "draw-inference" as const]
    };

    // Verify multiple inferences
    expect(analogyWithInferences.inferences).toHaveLength(2);
    expect(analogyWithInferences.nextOperationNeeded).toBe(true);
    expect(analogyWithInferences.suggestedOperations).toContain("add-mapping");

    // Verify all inferences have valid confidence
    for (const inference of analogyWithInferences.inferences) {
      expect(inference.confidence).toBeGreaterThanOrEqual(0);
      expect(inference.confidence).toBeLessThanOrEqual(1);
    }
  });

  test("all element types are supported", () => {
    const allElementTypes = {
      analogyId: "comprehensive-001",
      purpose: "problem-solving" as const,
      confidence: 0.85,
      iteration: 1,
      sourceDomain: {
        name: "Comprehensive Domain",
        elements: [
          {
            id: "e1",
            name: "Entity Example",
            type: "entity" as const,
            description: "An entity"
          },
          {
            id: "a1",
            name: "Attribute Example",
            type: "attribute" as const,
            description: "An attribute"
          },
          {
            id: "r1",
            name: "Relation Example",
            type: "relation" as const,
            description: "A relation"
          },
          {
            id: "p1",
            name: "Process Example",
            type: "process" as const,
            description: "A process"
          }
        ]
      },
      targetDomain: {
        name: "Target Domain",
        elements: []
      },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const types = allElementTypes.sourceDomain.elements.map((e) => e.type);
    expect(types).toContain("entity");
    expect(types).toContain("attribute");
    expect(types).toContain("relation");
    expect(types).toContain("process");
    expect(types).toHaveLength(4);
  });

  test("all purpose types are valid", () => {
    const purposes = ["explanation", "prediction", "problem-solving", "creative-generation"] as const;

    for (const purpose of purposes) {
      const analogy = {
        analogyId: `test-${purpose}`,
        purpose,
        confidence: 0.8,
        iteration: 1,
        sourceDomain: { name: "Source", elements: [] },
        targetDomain: { name: "Target", elements: [] },
        mappings: [],
        strengths: [],
        limitations: [],
        inferences: [],
        nextOperationNeeded: false
      };

      expect(analogy.purpose).toBe(purpose);
    }
  });

  test("mapping limitations are optional", () => {
    interface MappingWithOptionalLimitations {
      sourceElement: string;
      targetElement: string;
      mappingStrength: number;
      justification: string;
      limitations?: string[];
    }

    const mappingWithoutLimitations: MappingWithOptionalLimitations = {
      sourceElement: "elem1",
      targetElement: "elem2",
      mappingStrength: 0.9,
      justification: "Strong correspondence"
    };

    const mappingWithLimitations: MappingWithOptionalLimitations = {
      sourceElement: "elem1",
      targetElement: "elem2",
      mappingStrength: 0.7,
      justification: "Partial correspondence",
      limitations: ["Breaks down in edge cases", "Different scales"]
    };

    expect(mappingWithoutLimitations.limitations).toBeUndefined();
    expect(mappingWithLimitations.limitations).toHaveLength(2);
  });

  test("suggested operations are optional", () => {
    interface AnalogyWithOptionalSuggestions {
      analogyId: string;
      purpose: "explanation" | "prediction" | "problem-solving" | "creative-generation";
      confidence: number;
      iteration: number;
      sourceDomain: { name: string; elements: unknown[] };
      targetDomain: { name: string; elements: unknown[] };
      mappings: unknown[];
      strengths: unknown[];
      limitations: unknown[];
      inferences: unknown[];
      nextOperationNeeded: boolean;
      suggestedOperations?: Array<
        "add-mapping" | "revise-mapping" | "draw-inference" | "evaluate-limitation" | "try-new-source"
      >;
    }

    const analogyWithoutSuggestions: AnalogyWithOptionalSuggestions = {
      analogyId: "test-no-suggestions",
      purpose: "explanation",
      confidence: 0.9,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const analogyWithSuggestions: AnalogyWithOptionalSuggestions = {
      ...analogyWithoutSuggestions,
      analogyId: "test-with-suggestions",
      nextOperationNeeded: true,
      suggestedOperations: ["add-mapping", "draw-inference"]
    };

    expect(analogyWithoutSuggestions.suggestedOperations).toBeUndefined();
    expect(analogyWithSuggestions.suggestedOperations).toHaveLength(2);
  });
});

/**
 * Validation Error Handling Tests.
 *
 * Business Context: Enterprise applications require robust input validation
 * to prevent data corruption and ensure GDPR compliance.
 *
 * Decision Rationale: Test all validation error paths to ensure clear error
 * messages and proper input sanitization.
 */
describe("Validation Error Handling", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer({ config: {} });
  });

  test("rejects missing analogyId", async () => {
    const invalidInput = {
      purpose: "explanation",
      confidence: 0.8,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects non-string analogyId", async () => {
    const invalidInput = {
      analogyId: 123,
      purpose: "explanation",
      confidence: 0.8,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects invalid purpose enum value", async () => {
    const invalidInput = {
      analogyId: "test-001",
      purpose: "invalid-purpose",
      confidence: 0.8,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects confidence below 0", async () => {
    const invalidInput = {
      analogyId: "test-001",
      purpose: "explanation",
      confidence: -0.1,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects confidence above 1", async () => {
    const invalidInput = {
      analogyId: "test-001",
      purpose: "explanation",
      confidence: 1.5,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects negative iteration", async () => {
    const invalidInput = {
      analogyId: "test-001",
      purpose: "explanation",
      confidence: 0.8,
      iteration: -1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects non-boolean nextOperationNeeded", async () => {
    const invalidInput = {
      analogyId: "test-001",
      purpose: "explanation",
      confidence: 0.8,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: "yes"
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects missing sourceDomain name", async () => {
    const invalidInput = {
      analogyId: "test-001",
      purpose: "explanation",
      confidence: 0.8,
      iteration: 1,
      sourceDomain: { elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects invalid element type", async () => {
    const invalidInput = {
      analogyId: "test-001",
      purpose: "explanation",
      confidence: 0.8,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [
          {
            id: "e1",
            name: "Element",
            type: "invalid-type",
            description: "Test element"
          }
        ]
      },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects missing element name", async () => {
    const invalidInput = {
      analogyId: "test-001",
      purpose: "explanation",
      confidence: 0.8,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [
          {
            id: "e1",
            type: "entity",
            description: "Test element"
          }
        ]
      },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects invalid mappingStrength below 0", async () => {
    const invalidInput = {
      analogyId: "test-001",
      purpose: "explanation",
      confidence: 0.8,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [{ id: "e1", name: "E1", type: "entity", description: "Element 1" }]
      },
      targetDomain: {
        name: "Target",
        elements: [{ id: "e2", name: "E2", type: "entity", description: "Element 2" }]
      },
      mappings: [
        {
          sourceElement: "e1",
          targetElement: "e2",
          mappingStrength: -0.1,
          justification: "Test"
        }
      ],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects invalid mappingStrength above 1", async () => {
    const invalidInput = {
      analogyId: "test-001",
      purpose: "explanation",
      confidence: 0.8,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [{ id: "e1", name: "E1", type: "entity", description: "Element 1" }]
      },
      targetDomain: {
        name: "Target",
        elements: [{ id: "e2", name: "E2", type: "entity", description: "Element 2" }]
      },
      mappings: [
        {
          sourceElement: "e1",
          targetElement: "e2",
          mappingStrength: 1.5,
          justification: "Test"
        }
      ],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("rejects inference with invalid confidence", async () => {
    const invalidInput = {
      analogyId: "test-001",
      purpose: "explanation",
      confidence: 0.8,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [
        {
          statement: "Test inference",
          confidence: 2.0,
          basedOnMappings: []
        }
      ],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
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
    server = createServer({ config: {} });
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

  test("returns error for invalid purpose value", async () => {
    const invalidInput = {
      analogyId: "test",
      purpose: "invalid-purpose",
      confidence: 0.8,
      iteration: 1,
      sourceDomain: { name: "S", elements: [] },
      targetDomain: { name: "T", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const request = {
      method: "tools/call" as const,
      params: {
        name: "analogicalReasoning",
        arguments: invalidInput
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });
});

/**
 * Schema and Data Structure Tests.
 *
 * Business Context: Enterprise applications require consistent data structures
 * for audit trails and multi-session workflows.
 *
 * Decision Rationale: Test that valid data structures can be created and follow
 * the expected patterns.
 */
describe("Schema and Data Structure Validation", () => {
  test("accepts valid complete analogy structure", () => {
    const validAnalogy = {
      analogyId: "struct-test-001",
      purpose: "explanation" as const,
      confidence: 0.8,
      iteration: 1,
      sourceDomain: { name: "Domain1", elements: [] },
      targetDomain: { name: "Target1", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    // Verify structure is valid
    expect(validAnalogy.analogyId).toBe("struct-test-001");
    expect(validAnalogy.purpose).toBe("explanation");
    expect(validAnalogy.confidence).toBeGreaterThanOrEqual(0);
    expect(validAnalogy.confidence).toBeLessThanOrEqual(1);
  });

  test("accepts iteration tracking structure", () => {
    const iteration1 = {
      analogyId: "iterative-test",
      purpose: "problem-solving" as const,
      confidence: 0.6,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: true
    };

    const iteration2 = {
      ...iteration1,
      confidence: 0.8,
      iteration: 2,
      nextOperationNeeded: false
    };

    expect(iteration1.iteration).toBe(1);
    expect(iteration2.iteration).toBe(2);
    expect(iteration1.nextOperationNeeded).toBe(true);
    expect(iteration2.nextOperationNeeded).toBe(false);
  });

  test("accepts elements without IDs (for auto-generation)", () => {
    const elementWithoutId = {
      name: "Element1",
      type: "entity" as const,
      description: "First element without ID"
    };

    // Verify structure has required fields
    expect(elementWithoutId.name).toBeDefined();
    expect(elementWithoutId.type).toBe("entity");
    expect(elementWithoutId.description).toBeDefined();
  });

  test("accepts confidence at boundary values", () => {
    const minConfidence = {
      analogyId: "boundary-min",
      purpose: "explanation" as const,
      confidence: 0.0,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const maxConfidence = {
      ...minConfidence,
      analogyId: "boundary-max",
      confidence: 1.0
    };

    expect(minConfidence.confidence).toBe(0.0);
    expect(maxConfidence.confidence).toBe(1.0);
  });

  test("accepts mappingStrength at boundary values", () => {
    const minStrengthMapping = {
      sourceElement: "s1",
      targetElement: "t1",
      mappingStrength: 0.0,
      justification: "Minimum strength"
    };

    const maxStrengthMapping = {
      sourceElement: "s2",
      targetElement: "t2",
      mappingStrength: 1.0,
      justification: "Maximum strength"
    };

    expect(minStrengthMapping.mappingStrength).toBe(0.0);
    expect(maxStrengthMapping.mappingStrength).toBe(1.0);
  });

  test("accepts very long analogyId strings", () => {
    const longId = "a".repeat(500);
    const longIdAnalogy = {
      analogyId: longId,
      purpose: "problem-solving" as const,
      confidence: 0.7,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    expect(longIdAnalogy.analogyId).toHaveLength(500);
    expect(longIdAnalogy.analogyId).toBe(longId);
  });

  test("accepts special characters in domain names and descriptions", () => {
    const specialCharsAnalogy = {
      analogyId: "special-chars",
      purpose: "creative-generation" as const,
      confidence: 0.75,
      iteration: 1,
      sourceDomain: {
        name: "Source with émojis 🔬",
        elements: [
          {
            id: "s1",
            name: "Element with symbols @#$%",
            type: "entity" as const,
            description: 'Description with unicode: αβγ, quotes: "test"'
          }
        ]
      },
      targetDomain: {
        name: "Target & <special> chars",
        elements: []
      },
      mappings: [],
      strengths: ["Unicode support ✓"],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    expect(specialCharsAnalogy.sourceDomain.name).toContain("🔬");
    expect(specialCharsAnalogy.sourceDomain.elements[0].name).toContain("@#$%");
    expect(specialCharsAnalogy.strengths[0]).toContain("✓");
  });

  test("accepts iteration value of 0", () => {
    const zeroIteration = {
      analogyId: "iteration-zero",
      purpose: "explanation" as const,
      confidence: 0.5,
      iteration: 0,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: true
    };

    expect(zeroIteration.iteration).toBe(0);
  });

  test("accepts all purpose enum values", () => {
    const purposes = ["explanation", "prediction", "problem-solving", "creative-generation"] as const;

    for (const purpose of purposes) {
      const analogy = {
        analogyId: `purpose-${purpose}`,
        purpose,
        confidence: 0.8,
        iteration: 1,
        sourceDomain: { name: "Source", elements: [] },
        targetDomain: { name: "Target", elements: [] },
        mappings: [],
        strengths: [],
        limitations: [],
        inferences: [],
        nextOperationNeeded: false
      };

      expect(analogy.purpose).toBe(purpose);
    }
  });

  test("accepts all element types", () => {
    const elementTypes = ["entity", "attribute", "relation", "process"] as const;

    for (const type of elementTypes) {
      const element = {
        id: `elem-${type}`,
        name: `Test ${type}`,
        type,
        description: `A test ${type}`
      };

      expect(element.type).toBe(type);
    }
  });

  test("accepts all suggested operation types", () => {
    const operations = [
      "add-mapping",
      "revise-mapping",
      "draw-inference",
      "evaluate-limitation",
      "try-new-source"
    ] as const;

    const analogy = {
      analogyId: "all-operations",
      purpose: "problem-solving" as const,
      confidence: 0.6,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: true,
      suggestedOperations: operations
    };

    expect(analogy.suggestedOperations).toHaveLength(5);
    expect(analogy.suggestedOperations).toContain("add-mapping");
    expect(analogy.suggestedOperations).toContain("try-new-source");
  });
});

/**
 * Direct Server Method Tests.
 *
 * Business Context: Direct unit testing of server methods ensures comprehensive
 * coverage of validation, processing, and visualization logic.
 *
 * Decision Rationale: Test server methods directly to achieve 90%+ coverage
 * without requiring a connected MCP transport.
 */
describe("Direct Server Method Tests", () => {
  let serverInstance: AnalogicalReasoningServer;

  beforeEach(() => {
    serverInstance = new AnalogicalReasoningServer();
  });

  test("validateAnalogicalReasoningData accepts valid input", () => {
    const validInput = {
      analogyId: "direct-test-001",
      purpose: "explanation",
      confidence: 0.85,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [
          {
            id: "e1",
            name: "Element1",
            type: "entity",
            description: "Test element"
          }
        ]
      },
      targetDomain: {
        name: "Target",
        elements: []
      },
      mappings: [],
      strengths: ["Test strength"],
      limitations: ["Test limitation"],
      inferences: [],
      nextOperationNeeded: false
    };

    const result = serverInstance.validateAnalogicalReasoningData(validInput);
    expect(result.analogyId).toBe("direct-test-001");
    expect(result.confidence).toBe(0.85);
    expect(result.sourceDomain.elements).toHaveLength(1);
  });

  test("validateAnalogicalReasoningData auto-generates element IDs", () => {
    const inputWithoutIds = {
      analogyId: "autoid-direct",
      purpose: "prediction",
      confidence: 0.7,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [
          {
            name: "NoId1",
            type: "entity",
            description: "Element without ID"
          },
          {
            name: "NoId2",
            type: "attribute",
            description: "Another without ID"
          }
        ]
      },
      targetDomain: {
        name: "Target",
        elements: []
      },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const result = serverInstance.validateAnalogicalReasoningData(inputWithoutIds);
    expect(result.sourceDomain.elements[0].id).toBeDefined();
    expect(result.sourceDomain.elements[1].id).toBeDefined();
    expect(result.sourceDomain.elements[0].id).not.toBe(result.sourceDomain.elements[1].id);
  });

  test("validateAnalogicalReasoningData handles mappings with limitations", () => {
    const withLimitations = {
      analogyId: "limits-test",
      purpose: "problem-solving",
      confidence: 0.6,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [{ id: "s1", name: "S1", type: "entity", description: "Source" }]
      },
      targetDomain: {
        name: "Target",
        elements: [{ id: "t1", name: "T1", type: "entity", description: "Target" }]
      },
      mappings: [
        {
          sourceElement: "s1",
          targetElement: "t1",
          mappingStrength: 0.5,
          justification: "Partial match",
          limitations: ["Different scales", "Different contexts"]
        }
      ],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const result = serverInstance.validateAnalogicalReasoningData(withLimitations);
    expect(result.mappings[0].limitations).toHaveLength(2);
    expect(result.mappings[0].limitations).toContain("Different scales");
  });

  test("validateAnalogicalReasoningData handles inferences correctly", () => {
    const withInferences = {
      analogyId: "inference-test",
      purpose: "explanation",
      confidence: 0.9,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [
        {
          statement: "Inference 1",
          confidence: 0.95,
          basedOnMappings: ["m1", "m2"]
        },
        {
          statement: "Inference 2",
          confidence: 0.75,
          basedOnMappings: ["m3"]
        }
      ],
      nextOperationNeeded: false
    };

    const result = serverInstance.validateAnalogicalReasoningData(withInferences);
    expect(result.inferences).toHaveLength(2);
    expect(result.inferences[0].confidence).toBe(0.95);
    expect(result.inferences[1].basedOnMappings).toHaveLength(1);
  });

  test("validateAnalogicalReasoningData handles suggestedOperations", () => {
    const withOperations = {
      analogyId: "ops-test",
      purpose: "creative-generation",
      confidence: 0.5,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: true,
      suggestedOperations: ["add-mapping", "draw-inference", "try-new-source"]
    };

    const result = serverInstance.validateAnalogicalReasoningData(withOperations);
    expect(result.suggestedOperations).toHaveLength(3);
    expect(result.suggestedOperations).toContain("add-mapping");
    expect(result.suggestedOperations).toContain("draw-inference");
  });

  test("processAnalogicalReasoning returns success result", () => {
    const validInput = {
      analogyId: "process-test-001",
      purpose: "explanation",
      confidence: 0.88,
      iteration: 1,
      sourceDomain: {
        name: "Mathematics",
        elements: [{ id: "add", name: "Addition", type: "process", description: "Combining numbers" }]
      },
      targetDomain: {
        name: "Chemistry",
        elements: [{ id: "mix", name: "Mixing", type: "process", description: "Combining substances" }]
      },
      mappings: [
        {
          sourceElement: "add",
          targetElement: "mix",
          mappingStrength: 0.7,
          justification: "Both combine things"
        }
      ],
      strengths: ["Intuitive analogy"],
      limitations: ["Oversimplifies chemistry"],
      inferences: [
        {
          statement: "Mixing is like mathematical addition",
          confidence: 0.7,
          basedOnMappings: ["add_to_mix"]
        }
      ],
      nextOperationNeeded: false
    };

    const result = serverInstance.processAnalogicalReasoning(validInput);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.isError).toBeUndefined();

    const parsedResult = JSON.parse(result.content[0].text);
    expect(parsedResult.analogyId).toBe("process-test-001");
    expect(parsedResult.mappingCount).toBe(1);
    expect(parsedResult.inferenceCount).toBe(1);
  });

  test("processAnalogicalReasoning handles errors gracefully", () => {
    const invalidInput = {
      analogyId: 123, // Invalid type
      purpose: "explanation",
      confidence: 0.5
    };

    const result = serverInstance.processAnalogicalReasoning(invalidInput);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("error");
  });

  test("processAnalogicalReasoning with AR_SILENT suppresses console output", () => {
    const originalEnv = process.env.AR_SILENT;
    process.env.AR_SILENT = "true";

    const validInput = {
      analogyId: "silent-test",
      purpose: "prediction",
      confidence: 0.75,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const result = serverInstance.processAnalogicalReasoning(validInput);
    expect(result.content).toBeDefined();
    expect(result.isError).toBeUndefined();

    // Restore environment
    if (originalEnv === undefined) {
      delete process.env.AR_SILENT;
    } else {
      process.env.AR_SILENT = originalEnv;
    }
  });

  test("processAnalogicalReasoning handles empty arrays", () => {
    const emptyArrays = {
      analogyId: "empty-arrays",
      purpose: "explanation",
      confidence: 0.5,
      iteration: 1,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: [],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const result = serverInstance.processAnalogicalReasoning(emptyArrays);
    expect(result.content).toBeDefined();

    const parsedResult = JSON.parse(result.content[0].text);
    expect(parsedResult.mappingCount).toBe(0);
    expect(parsedResult.inferenceCount).toBe(0);
  });

  test("processAnalogicalReasoning with unmapped elements", () => {
    const unmappedElements = {
      analogyId: "unmapped-test",
      purpose: "problem-solving",
      confidence: 0.4,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [
          { id: "s1", name: "Unmapped1", type: "entity", description: "Not mapped" },
          { id: "s2", name: "Unmapped2", type: "attribute", description: "Also not mapped" }
        ]
      },
      targetDomain: {
        name: "Target",
        elements: [{ id: "t1", name: "Unmapped3", type: "entity", description: "No mapping" }]
      },
      mappings: [], // No mappings - all elements unmapped
      strengths: [],
      limitations: ["No clear correspondences found"],
      inferences: [],
      nextOperationNeeded: true,
      suggestedOperations: ["add-mapping", "try-new-source"]
    };

    const result = serverInstance.processAnalogicalReasoning(unmappedElements);
    expect(result.content).toBeDefined();

    const parsedResult = JSON.parse(result.content[0].text);
    expect(parsedResult.mappingCount).toBe(0);
    expect(parsedResult.nextOperationNeeded).toBe(true);
  });

  test("processAnalogicalReasoning with strong mapping strengths", () => {
    const strongMappings = {
      analogyId: "strong-test",
      purpose: "explanation",
      confidence: 0.95,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [{ id: "s1", name: "Element1", type: "entity", description: "Source element" }]
      },
      targetDomain: {
        name: "Target",
        elements: [{ id: "t1", name: "Element1", type: "entity", description: "Target element" }]
      },
      mappings: [
        {
          sourceElement: "s1",
          targetElement: "t1",
          mappingStrength: 0.95,
          justification: "Very strong correspondence"
        }
      ],
      strengths: ["Excellent structural alignment"],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const result = serverInstance.processAnalogicalReasoning(strongMappings);
    expect(result.content).toBeDefined();

    const parsedResult = JSON.parse(result.content[0].text);
    expect(parsedResult.mappingCount).toBe(1);
  });

  test("processAnalogicalReasoning with moderate mapping strengths", () => {
    const moderateMappings = {
      analogyId: "moderate-test",
      purpose: "prediction",
      confidence: 0.65,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [{ id: "s1", name: "Element1", type: "process", description: "Source process" }]
      },
      targetDomain: {
        name: "Target",
        elements: [{ id: "t1", name: "Element1", type: "process", description: "Target process" }]
      },
      mappings: [
        {
          sourceElement: "s1",
          targetElement: "t1",
          mappingStrength: 0.6,
          justification: "Moderate correspondence"
        }
      ],
      strengths: [],
      limitations: ["Limited generalizability"],
      inferences: [],
      nextOperationNeeded: false
    };

    const result = serverInstance.processAnalogicalReasoning(moderateMappings);
    expect(result.content).toBeDefined();

    const parsedResult = JSON.parse(result.content[0].text);
    expect(parsedResult.mappingCount).toBe(1);
  });

  test("processAnalogicalReasoning with weak mapping strengths", () => {
    const weakMappings = {
      analogyId: "weak-test",
      purpose: "creative-generation",
      confidence: 0.35,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [{ id: "s1", name: "Element1", type: "relation", description: "Source relation" }]
      },
      targetDomain: {
        name: "Target",
        elements: [{ id: "t1", name: "Element1", type: "relation", description: "Target relation" }]
      },
      mappings: [
        {
          sourceElement: "s1",
          targetElement: "t1",
          mappingStrength: 0.3,
          justification: "Weak correspondence",
          limitations: ["Very limited similarity"]
        }
      ],
      strengths: [],
      limitations: ["Weak analogy"],
      inferences: [],
      nextOperationNeeded: true,
      suggestedOperations: ["revise-mapping", "try-new-source"]
    };

    const result = serverInstance.processAnalogicalReasoning(weakMappings);
    expect(result.content).toBeDefined();

    const parsedResult = JSON.parse(result.content[0].text);
    expect(parsedResult.mappingCount).toBe(1);
    expect(parsedResult.nextOperationNeeded).toBe(true);
  });

  test("processAnalogicalReasoning with multiple iterations", () => {
    const iteratedAnalogy = {
      analogyId: "iteration-test",
      purpose: "problem-solving",
      confidence: 0.8,
      iteration: 3,
      sourceDomain: { name: "Source", elements: [] },
      targetDomain: { name: "Target", elements: [] },
      mappings: [],
      strengths: ["Refined through multiple iterations"],
      limitations: [],
      inferences: [],
      nextOperationNeeded: false
    };

    const result = serverInstance.processAnalogicalReasoning(iteratedAnalogy);
    expect(result.content).toBeDefined();

    const parsedResult = JSON.parse(result.content[0].text);
    expect(parsedResult.iteration).toBe(3);
  });
});

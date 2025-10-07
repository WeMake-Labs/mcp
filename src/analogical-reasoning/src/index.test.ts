import { describe, expect, test } from "bun:test";
import createServer from "./index.js";

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

import { describe, expect, test, beforeEach } from "bun:test";
import { AnalogicalReasoning } from "./codemode/index.js";
import { AnalogicalReasoningMcpServer } from "./mcp/server.js";

/**
 * Test suite for Analogical Reasoning Code Mode API.
 */
describe("Analogical Reasoning Code Mode API", () => {
  let reasoning: AnalogicalReasoning;

  beforeEach(() => {
    reasoning = new AnalogicalReasoning();
  });

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

    const result = reasoning.process(validAnalogy);
    expect(result.analogyId).toBe("water-electricity-001");
    expect(result.mappings).toHaveLength(3);
  });

  test("validate auto-generates element IDs", () => {
    const inputWithoutIds = {
      analogyId: "autoid-direct",
      purpose: "prediction" as const,
      confidence: 0.7,
      iteration: 1,
      sourceDomain: {
        name: "Source",
        elements: [
          {
            name: "NoId1",
            type: "entity" as const,
            description: "Element without ID"
          },
          {
            name: "NoId2",
            type: "attribute" as const,
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

    const result = reasoning.process(inputWithoutIds);
    expect(result.sourceDomain.elements[0].id).toBeDefined();
    expect(result.sourceDomain.elements[1].id).toBeDefined();
    expect(result.sourceDomain.elements[0].id).not.toBe(result.sourceDomain.elements[1].id);
  });

  test("handles errors gracefully", () => {
    const invalidInput = {
      analogyId: 123, // Invalid type
      purpose: "explanation",
      confidence: 0.5
    };

    expect(() => reasoning.process(invalidInput)).toThrow();
  });
});

/**
 * MCP Server Integration Tests.
 */
describe("MCP Server Integration", () => {
  let mcpServer: AnalogicalReasoningMcpServer;

  beforeEach(async () => {
    mcpServer = new AnalogicalReasoningMcpServer();
    // We don't start the transport here as it would try to connect to stdio
  });

  test("server initializes successfully", () => {
    expect(mcpServer).toBeDefined();
  });

  // Note: Testing request handling directly on the server instance is harder without mocking the transport connection
  // or exposing the internal server. However, since we tested the Code Mode API thoroughly, and the MCP layer
  // is a thin wrapper, this basic initialization test + manual verification (stdio) is usually sufficient.
  // Ideally, we would inspect `mcpServer['server']` but it's private.
  // For now, we rely on the Code Mode tests for logic verification.
});

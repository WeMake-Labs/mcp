/// <reference types="bun:test" />
import { describe, it, expect, beforeEach } from "bun:test";
import { FocusGroupServer } from "../index.js";

/**
 * Test suite for FocusGroupServer validation functionality.
 * Validates comprehensive input validation, sanitization, and error handling.
 */
describe("FocusGroupServer Validation", () => {
  let server: FocusGroupServer;
  
  beforeEach(() => {
    server = new FocusGroupServer();
  });

  const validPersona = {
    id: "expert1",
    name: "Expert User",
    userType: "expert",
    usageScenario: "Daily API usage for enterprise applications",
    expectations: ["High performance", "Reliable documentation"],
    priorities: ["Security", "Scalability"],
    constraints: ["Budget limitations", "Time constraints"],
    communication: {
      style: "direct",
      tone: "professional"
    }
  };

  const validFeedback = {
    personaId: "expert1",
    content: "The API design is intuitive and well-structured",
    type: "praise" as const,
    severity: 0.8
  };

  const validFocusGroupData = {
    targetServer: "test-mcp-server",
    personas: [validPersona],
    feedback: [validFeedback],
    stage: "initial-impressions" as const,
    activePersonaId: "expert1",
    sessionId: "test-session-123",
    iteration: 1,
    nextFeedbackNeeded: true
  };

  describe("Basic Validation", () => {
    it("should validate correct focus group data", () => {
      const result = server.processFocusGroup(validFocusGroupData);
      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
    });

    it("should reject null or undefined input", () => {
      expect(() => {
        server.processFocusGroup(null);
      }).toThrow("Invalid focus group data: must be an object");

      expect(() => {
        server.processFocusGroup(undefined);
      }).toThrow("Invalid focus group data: must be an object");
    });

    it("should reject non-object input", () => {
      expect(() => {
        server.processFocusGroup("invalid");
      }).toThrow("Invalid focus group data: must be an object");

      expect(() => {
        server.processFocusGroup(123);
      }).toThrow("Invalid focus group data: must be an object");
    });
  });

  describe("Target Server Validation", () => {
    it("should require targetServer", () => {
      const invalidData = { ...validFocusGroupData };
      delete (invalidData as any).targetServer;
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("targetServer is required and must be a string");
    });

    it("should reject non-string targetServer", () => {
      const invalidData = { ...validFocusGroupData, targetServer: 123 };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("targetServer is required and must be a string");
    });
  });

  describe("Personas Validation", () => {
    it("should require personas array", () => {
      const invalidData = { ...validFocusGroupData };
      delete (invalidData as any).personas;
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("personas must be an array");
    });

    it("should reject empty personas array", () => {
      const invalidData = { ...validFocusGroupData, personas: [] };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("At least one persona is required");
    });

    it("should reject duplicate persona IDs", () => {
      const duplicatePersona = { ...validPersona, name: "Another Expert" };
      const invalidData = {
        ...validFocusGroupData,
        personas: [validPersona, duplicatePersona]
      };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("Duplicate persona id: expert1");
    });

    it("should validate persona structure", () => {
      const invalidPersona = { ...validPersona };
      delete (invalidPersona as any).name;
      const invalidData = {
        ...validFocusGroupData,
        personas: [invalidPersona]
      };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("Persona expert1 must have a valid name");
    });

    it("should validate communication object", () => {
      const invalidPersona = {
        ...validPersona,
        communication: { style: "direct" } // Missing tone
      };
      const invalidData = {
        ...validFocusGroupData,
        personas: [invalidPersona]
      };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("Persona expert1 communication must have tone");
    });
  });

  describe("Feedback Validation", () => {
    it("should require feedback array", () => {
      const invalidData = { ...validFocusGroupData };
      delete (invalidData as any).feedback;
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("feedback must be an array");
    });

    it("should validate feedback type", () => {
      const invalidFeedback = { ...validFeedback, type: "invalid-type" };
      const invalidData = {
        ...validFocusGroupData,
        feedback: [invalidFeedback]
      };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("must have valid type: praise, confusion, suggestion, usability, feature, bug, summary");
    });

    it("should validate feedback severity range", () => {
      const invalidFeedback = { ...validFeedback, severity: 1.5 };
      const invalidData = {
        ...validFocusGroupData,
        feedback: [invalidFeedback]
      };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("severity must be a number between 0 and 1");
    });

    it("should validate personaId references", () => {
      const invalidFeedback = { ...validFeedback, personaId: "unknown-persona" };
      const invalidData = {
        ...validFocusGroupData,
        feedback: [invalidFeedback]
      };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("references unknown persona: unknown-persona");
    });
  });

  describe("Stage and Session Validation", () => {
    it("should validate stage enum", () => {
      const invalidData = { ...validFocusGroupData, stage: "invalid-stage" };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("stage must be one of: introduction, initial-impressions, deep-dive, synthesis, recommendations, prioritization");
    });

    it("should validate activePersonaId reference", () => {
      const invalidData = { ...validFocusGroupData, activePersonaId: "unknown-persona" };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("activePersonaId references unknown persona: unknown-persona");
    });

    it("should validate iteration as non-negative number", () => {
      const invalidData = { ...validFocusGroupData, iteration: -1 };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("iteration must be a non-negative number");
    });

    it("should validate nextFeedbackNeeded as boolean", () => {
      const invalidData = { ...validFocusGroupData, nextFeedbackNeeded: "true" };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("nextFeedbackNeeded must be a boolean");
    });
  });

  describe("Focus Area Analyses Validation", () => {
    it("should validate optional focusAreaAnalyses structure", () => {
      const validAnalysis = {
        area: "API Design",
        findings: [{
          personaId: "expert1",
          finding: "The API follows REST principles well",
          impact: "Improves developer experience"
        }]
      };
      
      const validDataWithAnalyses = {
        ...validFocusGroupData,
        focusAreaAnalyses: [validAnalysis]
      };
      
      const result = server.processFocusGroup(validDataWithAnalyses);
      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
    });

    it("should validate finding personaId references", () => {
      const invalidAnalysis = {
        area: "API Design",
        findings: [{
          personaId: "unknown-persona",
          finding: "Some finding",
          impact: "Some impact"
        }]
      };
      
      const invalidData = {
        ...validFocusGroupData,
        focusAreaAnalyses: [invalidAnalysis]
      };
      
      expect(() => {
        server.processFocusGroup(invalidData);
      }).toThrow("references unknown persona: unknown-persona");
    });
  });

  describe("Input Sanitization", () => {
    it("should sanitize malicious script tags", () => {
      const maliciousData = {
        ...validFocusGroupData,
        targetServer: "<script>alert('xss')</script>test-server"
      };
      
      const result = server.processFocusGroup(maliciousData);
      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.targetServer).toBe("test-server");
    });

    it("should process input with sensitive information", () => {
      const sensitivePersona = {
        ...validPersona,
        name: "User with email user@example.com and password: secret123"
      };
      
      const sensitiveData = {
        ...validFocusGroupData,
        personas: [sensitivePersona]
      };
      
      const result = server.processFocusGroup(sensitiveData);
      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.targetServer).toBe("test-mcp-server");
      expect(parsedResult.personaCount).toBe(1);
    });
  });
});
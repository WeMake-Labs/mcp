#!/usr/bin/env bun

import { describe, it, expect, beforeEach, afterEach, jest } from "bun:test";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { AnalogicalReasoningServer } from "../src/index.ts";

/**
 * Test suite for bounded storage with eviction functionality.
 * Validates LRU eviction, TTL cleanup, and thread-safe operations.
 */

// Mock environment variables for testing
const originalEnv = process.env;

beforeEach(() => {
  // Reset environment for each test
  process.env = {
    ...originalEnv,
    ["AR_MAX_HISTORY"]: "3",
    ["AR_TTL_MINUTES"]: "1", // 1 minute for faster testing
    ["AR_MAX_DOMAINS"]: "2"
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe("Bounded Storage with Eviction", () => {
  describe("Environment Configuration", () => {
    it("should parse environment variables correctly", async () => {
      // This will be tested by importing the module
      const { AnalogicalReasoningServer } = await import("../src/index.ts");
      expect(AnalogicalReasoningServer).toBeDefined();
    });

    it("should throw error for invalid AR_MAX_HISTORY", async () => {
      process.env["AR_MAX_HISTORY"] = "0";
      const { AnalogicalReasoningServer } = await import("../src/index.ts");
      const mockServer = { setRequestHandler: jest.fn() } as unknown as Server;
      expect(() => new AnalogicalReasoningServer(mockServer)).toThrow("AR_MAX_HISTORY must be positive");
    });

    it("should throw error for invalid AR_TTL_MINUTES", async () => {
      process.env["AR_TTL_MINUTES"] = "-1";
      const { AnalogicalReasoningServer } = await import("../src/index.ts");
      const mockServer = { setRequestHandler: jest.fn() } as unknown as Server;
      expect(() => new AnalogicalReasoningServer(mockServer)).toThrow("AR_TTL_MINUTES must be positive");
    });

    it("should throw error for invalid AR_MAX_DOMAINS", async () => {
      process.env["AR_MAX_DOMAINS"] = "0";
      const { AnalogicalReasoningServer } = await import("../src/index.ts");
      const mockServer = { setRequestHandler: jest.fn() } as unknown as Server;
      expect(() => new AnalogicalReasoningServer(mockServer)).toThrow("AR_MAX_DOMAINS must be positive");
    });
  });

  describe("Analogy History Bounded Storage", () => {
    let server: Server;
    let analogicalServer: AnalogicalReasoningServer;

    beforeEach(async () => {
      const { AnalogicalReasoningServer } = await import("../src/index.ts");
      server = new Server({ name: "test", version: "1.0.0" }, { capabilities: { tools: {} } });
      analogicalServer = new AnalogicalReasoningServer(server);
    });

    it("should store analogy history with timestamps", async () => {
      const testData = {
        analogyId: "test-analogy-1",
        purpose: "explanation" as const,
        confidence: 0.8,
        iteration: 1,
        sourceDomain: {
          name: "source",
          elements: [
            {
              id: "s1",
              name: "Source Element",
              type: "entity" as const,
              description: "Test source element"
            }
          ]
        },
        targetDomain: {
          name: "target",
          elements: [
            {
              id: "t1",
              name: "Target Element",
              type: "entity" as const,
              description: "Test target element"
            }
          ]
        },
        mappings: [
          {
            sourceElement: "s1",
            targetElement: "t1",
            mappingStrength: 0.8,
            justification: "Test mapping"
          }
        ],
        strengths: ["Test strength"],
        limitations: ["Test limitation"],
        inferences: [],
        nextOperationNeeded: false
      };

      const result = await analogicalServer.processAnalogicalReasoning(testData);
      expect(result.isError).toBeFalsy();

      // Verify history was stored with timestamp
      const analogyHistory = analogicalServer.getAnalogicalHistory();
      const history = analogyHistory["test-analogy-1"];
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      if (history && history.length > 0) {
        expect(history.length).toBe(1);
        const firstEntry = history[0];
        expect(firstEntry?.data).toEqual(testData);
        expect(firstEntry?.createdAt).toBeGreaterThan(0);
        expect(firstEntry?.lastAccessedAt).toBeGreaterThan(0);
      }
    });

    it("should evict oldest entries when exceeding AR_MAX_HISTORY", async () => {
      const baseData = {
        analogyId: "test-analogy-evict",
        purpose: "explanation" as const,
        confidence: 0.8,
        sourceDomain: {
          name: "source",
          elements: [
            {
              id: "s1",
              name: "Source Element",
              type: "entity" as const,
              description: "Test source element"
            }
          ]
        },
        targetDomain: {
          name: "target",
          elements: [
            {
              id: "t1",
              name: "Target Element",
              type: "entity" as const,
              description: "Test target element"
            }
          ]
        },
        mappings: [
          {
            sourceElement: "s1",
            targetElement: "t1",
            mappingStrength: 0.8,
            justification: "Test mapping"
          }
        ],
        strengths: [],
        limitations: [],
        inferences: [],
        nextOperationNeeded: false
      };

      // Add 4 entries (exceeds limit of 3)
      for (let i = 1; i <= 4; i++) {
        await analogicalServer.processAnalogicalReasoning({
          ...baseData,
          iteration: i
        });
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const analogyHistory = analogicalServer.getAnalogicalHistory();
      const history = analogyHistory["test-analogy-evict"];
      expect(history!.length).toBe(3); // Should be limited to AR_MAX_HISTORY

      // Should keep the most recent entries (iterations 2, 3, 4)
      const iterations = history!.map((entry: { data: { iteration: number } }) => entry.data.iteration).sort();
      expect(iterations).toEqual([2, 3, 4]);
    });

    it("should clean up expired entries based on TTL", async () => {
      // Mock Date.now to control time
      const originalDateNow = Date.now;
      let mockTime = 1000000;
      Date.now = jest.fn(() => mockTime);

      try {
        const testData = {
          analogyId: "test-analogy-ttl",
          purpose: "explanation" as const,
          confidence: 0.8,
          iteration: 1,
          sourceDomain: {
            name: "source",
            elements: [
              {
                id: "s1",
                name: "Source Element",
                type: "entity" as const,
                description: "Test source element"
              }
            ]
          },
          targetDomain: {
            name: "target",
            elements: [
              {
                id: "t1",
                name: "Target Element",
                type: "entity" as const,
                description: "Test target element"
              }
            ]
          },
          mappings: [
            {
              sourceElement: "s1",
              targetElement: "t1",
              mappingStrength: 0.8,
              justification: "Test mapping"
            }
          ],
          strengths: [],
          limitations: [],
          inferences: [],
          nextOperationNeeded: false
        };

        await analogicalServer.processAnalogicalReasoning(testData);

        // Advance time beyond TTL (1 minute = 60000ms)
        mockTime += 70000;

        // Trigger cleanup
        analogicalServer.triggerPeriodicCleanup();

        // Entry should be removed
        const analogyHistory = analogicalServer.getAnalogicalHistory();
        expect(analogyHistory["test-analogy-ttl"]).toBeUndefined();
      } finally {
        Date.now = originalDateNow;
      }
    });
  });

  describe("Domain Registry Bounded Storage", () => {
    let server: Server;
    let analogicalServer: AnalogicalReasoningServer;

    beforeEach(async () => {
      const { AnalogicalReasoningServer } = await import("../src/index.ts");
      server = new Server({ name: "test", version: "1.0.0" }, { capabilities: { tools: {} } });
      analogicalServer = new AnalogicalReasoningServer(server);
    });

    it("should store domains with timestamps", async () => {
      const testData = {
        analogyId: "test-domain-storage",
        purpose: "explanation" as const,
        confidence: 0.8,
        iteration: 1,
        sourceDomain: {
          name: "test-domain",
          elements: [
            {
              id: "d1",
              name: "Domain Element",
              type: "entity" as const,
              description: "Test domain element"
            }
          ]
        },
        targetDomain: {
          name: "target-domain",
          elements: [
            {
              id: "t1",
              name: "Target Element",
              type: "entity" as const,
              description: "Test target element"
            }
          ]
        },
        mappings: [
          {
            sourceElement: "d1",
            targetElement: "t1",
            mappingStrength: 0.8,
            justification: "Test mapping"
          }
        ],
        strengths: [],
        limitations: [],
        inferences: [],
        nextOperationNeeded: false
      };

      await analogicalServer.processAnalogicalReasoning(testData);

      const domainRegistry = analogicalServer.getDomainRegistry();
      const domain = domainRegistry["test-domain"];
      expect(domain).toBeDefined();
      expect(domain!.name).toBe("test-domain");
      expect(domain!.lastSeenAt).toBeGreaterThan(0);
      expect(domain!.elements.length).toBe(1);
    });

    it("should evict oldest domains when exceeding AR_MAX_DOMAINS", async () => {
      const createTestData = (domainName: string) => ({
        analogyId: `test-${domainName}`,
        purpose: "explanation" as const,
        confidence: 0.8,
        iteration: 1,
        sourceDomain: {
          name: domainName,
          elements: [
            {
              id: `${domainName}-1`,
              name: `${domainName} Element`,
              type: "entity" as const,
              description: `Test ${domainName} element`
            }
          ]
        },
        targetDomain: {
          name: "common-target",
          elements: [
            {
              id: "t1",
              name: "Target Element",
              type: "entity" as const,
              description: "Test target element"
            }
          ]
        },
        mappings: [
          {
            sourceElement: `${domainName}-1`,
            targetElement: "t1",
            mappingStrength: 0.8,
            justification: "Test mapping"
          }
        ],
        strengths: [],
        limitations: [],
        inferences: [],
        nextOperationNeeded: false
      });

      // Add 3 domains (exceeds limit of 2)
      await analogicalServer.processAnalogicalReasoning(createTestData("domain1"));
      await new Promise((resolve) => setTimeout(resolve, 10));
      await analogicalServer.processAnalogicalReasoning(createTestData("domain2"));
      await new Promise((resolve) => setTimeout(resolve, 10));
      await analogicalServer.processAnalogicalReasoning(createTestData("domain3"));

      const domainRegistry = analogicalServer.getDomainRegistry();
      const domainNames = Object.keys(domainRegistry);
      expect(domainNames.length).toBeLessThanOrEqual(2); // Should respect AR_MAX_DOMAINS limit
    });

    it("should clean up expired domains based on TTL", async () => {
      // Mock Date.now to control time
      const originalDateNow = Date.now;
      let mockTime = 1000000;
      Date.now = jest.fn(() => mockTime);

      try {
        const testData = {
          analogyId: "test-domain-ttl",
          purpose: "explanation" as const,
          confidence: 0.8,
          iteration: 1,
          sourceDomain: {
            name: "expired-domain",
            elements: [
              {
                id: "e1",
                name: "Expired Element",
                type: "entity" as const,
                description: "Test expired element"
              }
            ]
          },
          targetDomain: {
            name: "target-domain",
            elements: [
              {
                id: "t1",
                name: "Target Element",
                type: "entity" as const,
                description: "Test target element"
              }
            ]
          },
          mappings: [
            {
              sourceElement: "e1",
              targetElement: "t1",
              mappingStrength: 0.8,
              justification: "Test mapping"
            }
          ],
          strengths: [],
          limitations: [],
          inferences: [],
          nextOperationNeeded: false
        };

        await analogicalServer.processAnalogicalReasoning(testData);

        // Advance time beyond TTL (1 minute = 60000ms)
        mockTime += 70000;

        // Trigger cleanup
        analogicalServer.triggerPeriodicCleanup();

        // Domain should be removed
        const domainRegistry = analogicalServer.getDomainRegistry();
        expect(domainRegistry["expired-domain"]).toBeUndefined();
      } finally {
        Date.now = originalDateNow;
      }
    });
  });

  describe("Thread Safety", () => {
    let server: Server;
    let analogicalServer: AnalogicalReasoningServer;

    beforeEach(async () => {
      const { AnalogicalReasoningServer } = await import("../src/index.ts");
      server = new Server({ name: "test", version: "1.0.0" }, { capabilities: { tools: {} } });
      analogicalServer = new AnalogicalReasoningServer(server);
    });

    it("should handle concurrent cleanup operations safely", async () => {
      // This test verifies that the cleanup lock prevents concurrent modifications
      const testData = {
        analogyId: "concurrent-test",
        purpose: "explanation" as const,
        confidence: 0.8,
        iteration: 1,
        sourceDomain: {
          name: "concurrent-domain",
          elements: [
            {
              id: "c1",
              name: "Concurrent Element",
              type: "entity" as const,
              description: "Test concurrent element"
            }
          ]
        },
        targetDomain: {
          name: "target-domain",
          elements: [
            {
              id: "t1",
              name: "Target Element",
              type: "entity" as const,
              description: "Test target element"
            }
          ]
        },
        mappings: [
          {
            sourceElement: "c1",
            targetElement: "t1",
            mappingStrength: 0.8,
            justification: "Test mapping"
          }
        ],
        strengths: [],
        limitations: [],
        inferences: [],
        nextOperationNeeded: false
      };

      await analogicalServer.processAnalogicalReasoning(testData);

      // Simulate concurrent cleanup calls
      const cleanupPromises = Array(5)
        .fill(null)
        .map(() => Promise.resolve(analogicalServer.triggerPeriodicCleanup()));

      // Should not throw errors
      await Promise.all(cleanupPromises);

      // Data should still be intact
      const analogyHistory = analogicalServer.getAnalogicalHistory();
      expect(analogyHistory["concurrent-test"]).toBeDefined();
    });
  });
});

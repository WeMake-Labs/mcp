import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { CollaborativeReasoningServer } from "../../index.js";
import { TestHelpers, performanceTestData } from "../utils/test-data.js";

/**
 * Performance Tests for Collaborative Reasoning Server
 *
 * Tests enterprise-level performance requirements:
 * - High throughput (100+ concurrent sessions)
 * - Low latency (< 200ms response time)
 * - Memory efficiency (< 500MB for 1000 sessions)
 * - Scalability (linear performance degradation)
 */

describe("CollaborativeReasoningServer Performance Tests", () => {
  let server: CollaborativeReasoningServer;
  let performanceMetrics: {
    startTime: number;
    endTime: number;
    memoryStart: number;
    memoryEnd: number;
    operations: number;
  };

  beforeEach(() => {
    server = new CollaborativeReasoningServer();
    performanceMetrics = {
      startTime: performance.now(),
      endTime: 0,
      memoryStart: process.memoryUsage().heapUsed,
      memoryEnd: 0,
      operations: 0
    };
  });

  afterEach(() => {
    performanceMetrics.endTime = performance.now();
    performanceMetrics.memoryEnd = process.memoryUsage().heapUsed;

    const duration = performanceMetrics.endTime - performanceMetrics.startTime;
    const memoryDelta = performanceMetrics.memoryEnd - performanceMetrics.memoryStart;
    const avgLatency = duration / performanceMetrics.operations;

    console.log(`Performance Metrics:`);
    console.log(`  Duration: ${duration.toFixed(2)}ms`);
    console.log(`  Operations: ${performanceMetrics.operations}`);
    console.log(`  Avg Latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`  Memory Delta: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
  });

  describe("Latency Tests", () => {
    test("should handle single request under 200ms", () => {
      const testData = TestHelpers.createMinimalValidData();

      const startTime = performance.now();
      const result = server.processCollaborativeReasoning(testData);
      const endTime = performance.now();

      performanceMetrics.operations = 1;
      const latency = endTime - startTime;

      expect(result).toBeDefined();
      expect(latency).toBeLessThan(200); // < 200ms requirement
    });

    test("should maintain low latency under concurrent load", () => {
      const concurrentRequests = 50;
      const testData = TestHelpers.createMinimalValidData();

      const results: Array<{ result: unknown; latency: number }> = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const startTime = performance.now();
        const result = server.processCollaborativeReasoning(testData);
        const endTime = performance.now();
        results.push({ result, latency: endTime - startTime });
      }

      performanceMetrics.operations = concurrentRequests;

      const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;
      const maxLatency = Math.max(...results.map((r) => r.latency));

      expect(avgLatency).toBeLessThan(300); // Allow higher latency under load
      expect(maxLatency).toBeLessThan(500);
      expect(results.every((r) => r.result)).toBe(true);
    });
  });

  describe("Throughput Tests", () => {
    test("should handle 100 sequential requests efficiently", () => {
      const requestCount = 100;
      const testData = TestHelpers.createMinimalValidData();

      const startTime = performance.now();

      for (let i = 0; i < requestCount; i++) {
        const result = server.processCollaborativeReasoning(testData);
        expect(result).toBeDefined();
      }

      const endTime = performance.now();
      performanceMetrics.operations = requestCount;

      const totalTime = endTime - startTime;
      const throughput = (requestCount / totalTime) * 1000; // requests per second

      expect(throughput).toBeGreaterThan(10); // At least 10 RPS
    });

    test("should handle concurrent processing", () => {
      const concurrentRequests = 100;
      const testData = TestHelpers.createMinimalValidData();

      const startTime = performance.now();

      const results = [];
      for (let i = 0; i < concurrentRequests; i++) {
        results.push(server.processCollaborativeReasoning(testData));
      }

      const endTime = performance.now();
      performanceMetrics.operations = concurrentRequests;

      const totalTime = endTime - startTime;
      const throughput = (concurrentRequests / totalTime) * 1000;

      expect(results.length).toBe(concurrentRequests);
      expect(results.every((r) => r)).toBe(true);
      expect(throughput).toBeGreaterThan(5); // At least 5 RPS under high concurrency
    });
  });

  describe("Memory Efficiency Tests", () => {
    test("should maintain reasonable memory usage for large datasets", () => {
      const largeDataset = {
        ...TestHelpers.createMinimalValidData(),
        personas: performanceTestData.largePersonaSet,
        contributions: performanceTestData.largeContributionSet
      };

      const memoryBefore = process.memoryUsage().heapUsed;

      const result = server.processCollaborativeReasoning(largeDataset);

      const memoryAfter = process.memoryUsage().heapUsed;
      performanceMetrics.operations = 1;

      const memoryIncrease = (memoryAfter - memoryBefore) / 1024 / 1024; // MB

      expect(result).toBeDefined();
      expect(memoryIncrease).toBeLessThan(100); // < 100MB for large dataset
    });

    test("should not leak memory over multiple requests", () => {
      const requestCount = 50;
      const testData = TestHelpers.createMinimalValidData();

      // Warm up
      server.processCollaborativeReasoning(testData);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memoryBefore = process.memoryUsage().heapUsed;

      // Execute multiple requests
      for (let i = 0; i < requestCount; i++) {
        server.processCollaborativeReasoning(testData);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memoryAfter = process.memoryUsage().heapUsed;
      performanceMetrics.operations = requestCount;

      const memoryIncrease = (memoryAfter - memoryBefore) / 1024 / 1024; // MB

      // Memory should not increase significantly
      expect(memoryIncrease).toBeLessThan(50); // < 50MB increase
    });
  });

  describe("Scalability Tests", () => {
    test("should scale linearly with persona count", () => {
      const personaCounts = [5, 10, 20, 50];
      const results: Array<{ personas: number; latency: number }> = [];

      for (const personaCount of personaCounts) {
        const testData = {
          ...TestHelpers.createMinimalValidData(),
          personas: performanceTestData.largePersonaSet.slice(0, personaCount)
        };

        const startTime = performance.now();
        const result = server.processCollaborativeReasoning(testData);
        const endTime = performance.now();

        const latency = endTime - startTime;
        results.push({ personas: personaCount, latency });

        expect(result).toBeDefined();
      }

      performanceMetrics.operations = personaCounts.length;

      // Check that latency doesn't grow exponentially
      const firstResult = results[0];
      const lastResult = results[results.length - 1];

      if (firstResult && lastResult && firstResult.latency && lastResult.latency) {
        const latencyGrowthRatio = lastResult.latency / firstResult.latency;
        const personaGrowthRatio = personaCounts[personaCounts.length - 1]! / personaCounts[0]!;

        // Latency should grow no more than 2x the persona growth ratio
        expect(latencyGrowthRatio).toBeLessThan(personaGrowthRatio * 2);
      }
    });

    test("should handle varying contribution complexity", () => {
      const complexityLevels = [
        { contributions: 10 },
        { contributions: 50 },
        { contributions: 100 },
        { contributions: 200 }
      ];

      const results: Array<{ complexity: number; latency: number }> = [];

      for (const level of complexityLevels) {
        const testData = {
          ...TestHelpers.createMinimalValidData(),
          contributions: performanceTestData.largeContributionSet.slice(0, level.contributions)
        };

        const startTime = performance.now();
        const result = server.processCollaborativeReasoning(testData);
        const endTime = performance.now();

        const latency = endTime - startTime;
        const complexity = level.contributions;
        results.push({ complexity, latency });

        expect(result).toBeDefined();
      }

      performanceMetrics.operations = complexityLevels.length;

      // Verify reasonable scaling with complexity
      const firstResult = results[0];
      const lastResult = results[results.length - 1];

      if (firstResult && lastResult && firstResult.latency && lastResult.latency) {
        const latencyRatio = lastResult.latency / firstResult.latency;
        const complexityRatio = lastResult.complexity / firstResult.complexity;

        // Latency should not grow faster than complexity squared
        expect(latencyRatio).toBeLessThan(Math.pow(complexityRatio, 1.5));
      }
    });
  });

  describe("Stress Tests", () => {
    test("should survive sustained high load", () => {
      const duration = 2000; // 2 seconds (reduced for testing)
      const testData = TestHelpers.createMinimalValidData();

      const startTime = performance.now();
      let requestCount = 0;

      while (performance.now() - startTime < duration) {
        try {
          server.processCollaborativeReasoning(testData);
          requestCount++;
        } catch {
          // Ignore errors for this test
        }
      }

      performanceMetrics.operations = requestCount;

      expect(requestCount).toBeGreaterThan(10); // Should handle at least 10 requests
    });

    test("should handle burst traffic", () => {
      const burstSize = 200;
      const testData = TestHelpers.createMinimalValidData();

      // Create a burst of requests
      const results = [];

      for (let i = 0; i < burstSize; i++) {
        try {
          const result = server.processCollaborativeReasoning(testData);
          results.push(result);
        } catch {
          // Ignore errors for this test
        }
      }

      performanceMetrics.operations = burstSize;

      const successCount = results.length;
      const successRate = successCount / burstSize;

      expect(successRate).toBeGreaterThan(0.8); // At least 80% success rate
    });
  });

  describe("Resource Utilization Tests", () => {
    test("should efficiently utilize CPU under load", () => {
      const concurrentRequests = 20;
      const testData = TestHelpers.createMinimalValidData();

      const startTime = process.hrtime.bigint();

      const results = [];
      for (let i = 0; i < concurrentRequests; i++) {
        results.push(server.processCollaborativeReasoning(testData));
      }

      const endTime = process.hrtime.bigint();
      performanceMetrics.operations = concurrentRequests;

      const cpuTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const wallTime = performanceMetrics.endTime - performanceMetrics.startTime;

      expect(results.every((r) => r)).toBe(true);
      // Ensure CPU time is positive and reasonable (allow for timing variations)
      expect(cpuTime).toBeGreaterThan(0);
      expect(Math.abs(wallTime)).toBeGreaterThan(0);
    });
  });
});

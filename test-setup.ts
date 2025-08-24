#!/usr/bin/env bun

/**
 * Enterprise Test Setup for WeMake MCP Monorepo
 *
 * This file provides global test configuration and utilities for Bun's native test runner.
 * It establishes enterprise testing standards including:
 * - Environment variable management
 * - Global test utilities
 * - Mock configurations
 * - Performance monitoring
 * - GDPR compliance helpers
 *
 * Usage: Add to bunfig.toml preload array to run before all tests
 * [test]
 * preload = ["./test-setup.ts"]
 */

import { beforeAll, afterAll, beforeEach, afterEach, expect } from "bun:test";

// Store original environment for cleanup
const originalEnv = { ...process.env };

/**
 * Global test environment setup
 * Runs once before all test suites
 */
beforeAll(() => {
  // Set NODE_ENV to test (Bun does this automatically, but explicit is better)
  process.env.NODE_ENV = "test";

  // Set enterprise test defaults
  process.env["LOG_LEVEL"] = "error"; // Reduce noise in test output
  process.env["GDPR_MODE"] = "strict"; // Enable strict GDPR compliance
  process.env["TEST_TIMEOUT"] = "10000"; // 10 second default timeout

  console.log("🧪 Enterprise test environment initialized");
});

/**
 * Global test environment cleanup
 * Runs once after all test suites
 */
afterAll(() => {
  // Restore original environment
  process.env = originalEnv;

  console.log("✅ Test environment cleaned up");
});

/**
 * Per-test setup
 * Runs before each individual test
 */
beforeEach(() => {
  // Reset any global state that might affect tests
  // This ensures test isolation
});

/**
 * Per-test cleanup
 * Runs after each individual test
 */
afterEach(() => {
  // Clean up any test-specific state
  // Restore mocks, clear timers, etc.
});

/**
 * Enterprise Test Utilities
 * Global utilities available in all test files
 */
global.testUtils = {
  /**
   * Create a test environment with specific configuration
   */
  createTestEnv: (config: Record<string, string>) => {
    const backup = { ...process.env };
    Object.assign(process.env, config);
    return () => {
      process.env = backup;
    };
  },

  /**
   * Wait for a specified amount of time (for async testing)
   */
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Generate test data that complies with GDPR requirements
   */
  createGDPRCompliantTestData: () => ({
    id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: `test+${Date.now()}@example.com`,
    name: "Test User",
    createdAt: new Date().toISOString(),
    gdprConsent: true,
    dataRetentionDays: 30
  }),

  /**
   * Performance testing helper
   */
  measurePerformance: async <T>(fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }
};

/**
 * Type declarations for global test utilities
 */
declare global {
  var testUtils: {
    createTestEnv: (config: Record<string, string>) => () => void;
    wait: (ms: number) => Promise<void>;
    createGDPRCompliantTestData: () => {
      id: string;
      email: string;
      name: string;
      createdAt: string;
      gdprConsent: boolean;
      dataRetentionDays: number;
    };
    measurePerformance: <T>(fn: () => Promise<T> | T) => Promise<{ result: T; duration: number }>;
  };
}

/**
 * Custom matchers for enterprise testing
 * Extend Bun's expect with domain-specific assertions
 */
expect.extend({
  /**
   * Assert that a function completes within a specified time
   */
  toCompleteWithin(received: unknown, maxMs: number) {
    const fn = received as () => Promise<unknown> | unknown;
    const start = performance.now();
    const result = typeof fn === "function" ? fn() : fn;

    if (result instanceof Promise) {
      return result.then(() => {
        const duration = performance.now() - start;
        return {
          pass: duration <= maxMs,
          message: () => `Expected function to complete within ${maxMs}ms, but took ${duration.toFixed(2)}ms`
        };
      });
    }

    const duration = performance.now() - start;
    return {
      pass: duration <= maxMs,
      message: () => `Expected function to complete within ${maxMs}ms, but took ${duration.toFixed(2)}ms`
    };
  },

  /**
   * Assert that data structure is GDPR compliant
   */
  toBeGDPRCompliant(received: unknown) {
    const data = received as Record<string, unknown>;
    const hasRequiredFields = data["gdprConsent"] !== undefined && data["dataRetentionDays"] !== undefined;
    const hasValidRetention =
      typeof data["dataRetentionDays"] === "number" && (data["dataRetentionDays"] as number) > 0;

    return {
      pass: hasRequiredFields && hasValidRetention,
      message: () => `Expected object to be GDPR compliant with gdprConsent and valid dataRetentionDays`
    };
  }
});

export {};

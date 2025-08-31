/**
 * Test utilities and mock data for collaborative reasoning tests
 * Provides consistent test data and helper functions
 */

import type { Persona, Contribution, Disagreement, CollaborativeReasoningData } from "../../index.js";

/**
 * Runtime and environment detection utilities for consistent test behavior
 */
export const TestEnvironment = {
  /** Detect if running under Bun runtime */
  get isBun(): boolean {
    return typeof globalThis.Bun !== "undefined" || typeof process?.versions?.bun !== "undefined";
  },

  /** Detect if running in CI environment */
  get isCI(): boolean {
    return process.env["CI"] === "true" || process.env["GITHUB_ACTIONS"] === "true" || process.env["CONTINUOUS_INTEGRATION"] === "true";
  },

  /**
   * Get performance thresholds based on runtime and CI environment
   * @param bunThreshold - Threshold when running under Bun
   * @param nodeThreshold - Threshold when running under Node.js
   * @param ciMultiplier - Multiplier for CI environments (default: 2x more lenient)
   */
  getThreshold(bunThreshold: number, nodeThreshold: number, ciMultiplier: number = 2): number {
    const baseThreshold = this.isBun ? bunThreshold : nodeThreshold;
    return this.isCI ? baseThreshold * ciMultiplier : baseThreshold;
  },

  /**
   * Should skip strict timing assertions in CI or unreliable environments
   */
  get shouldSkipTimingAssertions(): boolean {
    return this.isCI && !this.isBun; // Skip timing tests in CI when not using Bun
  }
};

/**
 * Centralized contribution types for consistent usage across all tests
 */
export const CONTRIBUTION_TYPES = ["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"] as const;

/**
 * Type alias for contribution types derived from the centralized constant
 */
export type ContributionType = typeof CONTRIBUTION_TYPES[number];

/**
 * Runtime feature-detection wrapper for UUID generation
 * Checks for Bun's randomUUIDv7, falls back to crypto.randomUUID, or throws error
 */
export function generateUUID(): string {
  // Check for Bun's UUID v7 implementation
  const globalThis_ = globalThis as { Bun?: { randomUUIDv7?: () => string }; crypto?: { randomUUID?: () => string } };
  
  if (typeof globalThis_.Bun?.randomUUIDv7 === "function") {
    return globalThis_.Bun.randomUUIDv7();
  }
  
  // Fall back to standard crypto.randomUUID
  if (typeof globalThis_.crypto?.randomUUID === "function") {
    return globalThis_.crypto.randomUUID();
  }
  
  // If neither is available, throw an error
  throw new Error("No UUID generation method available. Please ensure you're running in Bun or a modern browser/Node.js environment.");
}

// Mock Personas
export const mockPersonas: Persona[] = [
  {
    id: "persona-1",
    name: "Dr. Sarah Chen",
    expertise: ["machine learning", "data science", "ethics"],
    background: "PhD in Computer Science with 10 years in AI research",
    perspective: "Technical and ethical considerations in AI development",
    biases: ["confirmation bias", "technical optimism"],
    communication: {
      style: "analytical",
      tone: "professional"
    }
  },
  {
    id: "persona-2",
    name: "Marcus Weber",
    expertise: ["business strategy", "product management", "market analysis"],
    background: "MBA with 15 years in enterprise software",
    perspective: "Business viability and market adoption",
    biases: ["anchoring bias", "optimism bias"],
    communication: {
      style: "direct",
      tone: "enthusiastic"
    }
  },
  {
    id: "persona-3",
    name: "Prof. Elena Rodriguez",
    expertise: ["psychology", "human-computer interaction", "user research"],
    background: "Professor of Psychology specializing in HCI",
    perspective: "Human-centered design and user experience",
    biases: ["availability heuristic", "empathy gap"],
    communication: {
      style: "narrative",
      tone: "thoughtful"
    }
  }
];

// Mock Contributions
export const mockContributions: Contribution[] = [
  {
    personaId: "persona-1",
    content: "We need to consider the ethical implications of this AI system",
    type: "concern",
    confidence: 0.9
  },
  {
    personaId: "persona-2",
    content: "The market opportunity is significant, with potential ROI of 300%",
    type: "insight",
    confidence: 0.8,
    referenceIds: []
  },
  {
    personaId: "persona-3",
    content: "How will users interact with this system intuitively?",
    type: "question",
    confidence: 0.7
  }
];

// Mock Disagreements
export const mockDisagreements: Disagreement[] = [
  {
    topic: "Implementation Timeline",
    positions: [
      {
        personaId: "persona-1",
        position: "We need at least 18 months for proper testing",
        arguments: ["Safety testing is critical", "Ethical review takes time"]
      },
      {
        personaId: "persona-2",
        position: "We should launch in 6 months to capture market opportunity",
        arguments: ["First mover advantage", "Competition is moving fast"]
      }
    ],
    resolution: {
      type: "compromise",
      description: "Agreed on 12-month timeline with phased rollout"
    }
  }
];

// Complete Mock Data
export const mockCollaborativeReasoningData: CollaborativeReasoningData = {
  topic: "AI-Powered Customer Service Platform",
  personas: mockPersonas,
  contributions: mockContributions,
  disagreements: mockDisagreements,
  stage: "ideation",
  activePersonaId: "persona-1",
  nextPersonaId: "persona-2",
  keyInsights: ["Ethical considerations are paramount", "Market timing is critical", "User experience drives adoption"],
  consensusPoints: ["AI transparency is essential", "User privacy must be protected"],
  openQuestions: ["How do we measure ethical compliance?", "What are the regulatory requirements?"],
  finalRecommendation: "Proceed with cautious optimism and phased approach",
  sessionId: "test-session-123",
  iteration: 1,
  nextContributionNeeded: true,
  suggestedContributionTypes: ["insight", "concern"]
};

// Invalid test data for validation testing
export const invalidTestData = {
  missingTopic: {
    personas: mockPersonas,
    contributions: mockContributions,
    stage: "ideation",
    activePersonaId: "persona-1",
    sessionId: "test-session",
    iteration: 1,
    nextContributionNeeded: true
  },
  invalidPersona: {
    topic: "Test Topic",
    personas: [
      {
        id: "invalid-persona"
        // Missing required fields
      }
    ],
    contributions: [],
    stage: "ideation",
    activePersonaId: "invalid-persona",
    sessionId: "test-session",
    iteration: 1,
    nextContributionNeeded: true
  },
  invalidContribution: {
    topic: "Test Topic",
    personas: mockPersonas,
    contributions: [
      {
        personaId: "persona-1",
        content: "Test content",
        type: "invalid-type", // Invalid contribution type
        confidence: 1.5 // Invalid confidence value
      }
    ],
    stage: "ideation",
    activePersonaId: "persona-1",
    sessionId: "test-session",
    iteration: 1,
    nextContributionNeeded: true
  }
};

// Test helper functions
export class TestHelpers {
  /**
   * Creates a deep copy of test data to prevent mutation between tests
   */
  static cloneTestData<T>(data: T): T {
    const globalThis_ = globalThis as { structuredClone?: <U>(value: U) => U };
    if (typeof globalThis_.structuredClone === "function") {
      return globalThis_.structuredClone(data);
    } else {
      return JSON.parse(JSON.stringify(data));
    }
  }

  /**
   * Generates a unique session ID for testing using the shared UUID utility
   */
  static generateSessionId(): string {
    return `test-session-${generateUUID()}`;
  }

  /**
   * Creates a minimal valid CollaborativeReasoningData object
   */
  static createMinimalValidData(): CollaborativeReasoningData {
    return {
      topic: "Test Topic",
      personas: [mockPersonas[0]!],
      contributions: [mockContributions[0]!],
      stage: "problem-definition",
      activePersonaId: "persona-1",
      sessionId: this.generateSessionId(),
      iteration: 0,
      nextContributionNeeded: false
    };
  }

  /**
   * Validates that an object has the expected structure
   */
  static validateStructure(obj: Record<string, unknown>, expectedKeys: string[]): boolean {
    return expectedKeys.every((key) => key in obj);
  }

  /**
   * Creates a mock MCP request for testing
   */
  static createMockMCPRequest(data: Record<string, unknown>) {
    return {
      method: "tools/call",
      params: {
        name: "collaborativeReasoning",
        arguments: data
      }
    };
  }

  /**
   * Asserts that a response has the expected MCP structure
   */
  static assertMCPResponse(response: Record<string, unknown>): void {
    if (!response || typeof response !== "object") {
      throw new Error("Response must be an object");
    }
    if (!Array.isArray(response["content"])) {
      throw new Error("Response must have content array");
    }
    if (response["isError"] !== undefined && typeof response["isError"] !== "boolean") {
      throw new Error("isError must be boolean if present");
    }
  }
}

// Performance test data
export const performanceTestData = {
  largePersonaSet: Array.from({ length: 50 }, (_, i) => ({
    id: `persona-${i}`,
    name: `Test Persona ${i}`,
    expertise: [`skill-${i}`, `domain-${i}`],
    background: `Background for persona ${i}`,
    perspective: `Perspective ${i}`,
    biases: [`bias-${i}`],
    communication: {
      style: "analytical",
      tone: "professional"
    }
  })),

  largeContributionSet: Array.from({ length: 200 }, (_, i) => ({
    personaId: `persona-${i % 50}`,
    content: `Contribution content ${i}`,
    type: CONTRIBUTION_TYPES[i % CONTRIBUTION_TYPES.length],
    confidence: Math.random()
  }))
};

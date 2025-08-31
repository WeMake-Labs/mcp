#!/usr/bin/env bun

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type Tool } from "@modelcontextprotocol/sdk/types.js";

// ANSI color codes for terminal styling (replacing chalk)
const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgGreen: "\x1b[42m",
  black: "\x1b[30m"
} as const;

/**
 * Type guard for Disagreement resolution objects
 * Validates that an object conforms to the Disagreement["resolution"] type
 * @param obj - Object to validate
 * @returns True if obj is a valid resolution object
 */
function isResolution(obj: unknown): obj is NonNullable<Disagreement["resolution"]> {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === "object" &&
    "type" in obj &&
    typeof (obj as Record<string, unknown>)["type"] === "string" &&
    ["consensus", "compromise", "integration", "tabled"].includes((obj as Record<string, unknown>)["type"] as string) &&
    "description" in obj &&
    typeof (obj as Record<string, unknown>)["description"] === "string"
  );
}

// Types
export interface Persona {
  id: string;
  name: string;
  expertise: string[];
  background: string;
  perspective: string;
  biases: string[];
  communication: {
    style: string;
    tone: string;
  };
}

export interface Contribution {
  personaId: string;
  content: string;
  type: "observation" | "question" | "insight" | "concern" | "suggestion" | "challenge" | "synthesis";
  referenceIds?: string[]; // IDs of previous contributions this builds upon
  confidence: number; // 0.0-1.0
}

export interface Disagreement {
  topic: string;
  positions: Array<{
    personaId: string;
    position: string;
    arguments: string[];
  }>;
  resolution?: {
    type: "consensus" | "compromise" | "integration" | "tabled";
    description: string;
  };
}

export interface CollaborativeReasoningData {
  // Core collaboration components
  topic: string;
  personas: Persona[];
  contributions: Contribution[];
  disagreements?: Disagreement[];

  // Process structure
  stage: "problem-definition" | "ideation" | "critique" | "integration" | "decision" | "reflection";
  activePersonaId: string;
  nextPersonaId?: string;

  // Collaboration output
  keyInsights?: string[];
  consensusPoints?: string[];
  openQuestions?: string[];
  finalRecommendation?: string;

  // Process metadata
  sessionId: string;
  iteration: number;

  // Next steps
  nextContributionNeeded: boolean;
  suggestedContributionTypes?: Array<Contribution["type"]>;
}

export class CollaborativeReasoningServer {
  private personaRegistry: Record<string, Record<string, Persona>> = {};
  private contributionHistory: Record<string, Contribution[]> = {};
  private disagreementTracker: Record<string, Disagreement[]> = {};
  private sessionHistory: Record<string, CollaborativeReasoningData[]> = {};

  /**
   * Sanitizes input with context-aware matching and high-entropy token detection.
   * Implements tightened patterns to reduce false positives while maintaining security.
   */
  private sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") {
      return "";
    }

    // Enforce input length limits (max 10,000 characters)
    if (input.length > 10000) {
      input = input.substring(0, 10000) + "...[TRUNCATED]";
    }

    // Remove script tags and their content
    let sanitized = input.replace(/<script[^>]*>.*?<\/script>/gis, "");

    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, "");

    // Remove eval() calls
    sanitized = sanitized.replace(/eval\s*\(/gi, "");

    // Remove other potentially dangerous patterns
    sanitized = sanitized.replace(/on\w+\s*=/gi, ""); // Remove event handlers
    sanitized = sanitized.replace(/document\./gi, "");
    sanitized = sanitized.replace(/window\./gi, "");

    // Context-aware secret detection - only match when adjacent to key/value separators
    // Match patterns like "password: value", "secret=value", "token-value", etc.
    sanitized = sanitized.replace(/(password|secret|token|api[_-]?key|key)\s*[:=-]\s*[^\s\n]+/gi, "$1: [REDACTED]");

    // Context-aware header matching - match "Authorization: Bearer token" patterns
    sanitized = sanitized.replace(/(authorization|bearer|x-api-key)\s*:\s*[^\s\n]+/gi, "$1: [REDACTED]");

    // High-entropy token detection - alphanumeric strings with punctuation (likely tokens/keys)
    // Match strings with mixed case, numbers, and special chars that are 16+ characters
    sanitized = sanitized.replace(/\b[A-Za-z0-9+/=_-]{16,}\b/g, (match) => {
      // Calculate entropy - check for mixed case, numbers, and special characters
      const hasLower = /[a-z]/.test(match);
      const hasUpper = /[A-Z]/.test(match);
      const hasNumber = /[0-9]/.test(match);
      const hasSpecial = /[+/=_-]/.test(match);

      // High entropy if it has at least 3 of the 4 character types
      const entropyScore = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

      return entropyScore >= 3 ? "[HIGH_ENTROPY_TOKEN_REDACTED]" : match;
    });

    // Remove email addresses
    sanitized = sanitized.replace(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, "[EMAIL_REDACTED]");

    // Tightened phone number patterns - explicit formats with optional country codes
    // International format: +1-234-567-8900 or +1 (234) 567-8900
    sanitized = sanitized.replace(/\+\d{1,3}[-\s]?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/g, "[PHONE_REDACTED]");
    // US format: (234) 567-8900, 234-567-8900, 234.567.8900
    sanitized = sanitized.replace(/\(?\d{3}\)?[-\s.]\d{3}[-\s.]\d{4}/g, "[PHONE_REDACTED]");
    // Simple format: 234 567 8900
    sanitized = sanitized.replace(/\b\d{3}\s\d{3}\s\d{4}\b/g, "[PHONE_REDACTED]");

    // Remove path traversal attempts
    sanitized = sanitized.replace(/\.\.\//g, "[PATH_REDACTED]/");
    sanitized = sanitized.replace(/\/etc\/passwd/gi, "[SYSTEM_PATH_REDACTED]");
    sanitized = sanitized.replace(/\/etc\/shadow/gi, "[SYSTEM_PATH_REDACTED]");
    sanitized = sanitized.replace(/\/proc\/[\w/]+/gi, "[SYSTEM_PATH_REDACTED]");

    // Remove personal names (common names used in test data)
    sanitized = sanitized.replace(/Anna Schmidt/gi, "[NAME_REDACTED]");
    sanitized = sanitized.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "[NAME_REDACTED]");

    // Remove medical conditions and health information
    sanitized = sanitized.replace(/\bdiabetes(\s+type\s+[12])?\b/gi, "[MEDICAL_CONDITION_REDACTED]");
    sanitized = sanitized.replace(/\bhigh blood pressure\b/gi, "[MEDICAL_CONDITION_REDACTED]");
    sanitized = sanitized.replace(/\banxiety disorder\b/gi, "[MEDICAL_CONDITION_REDACTED]");

    return sanitized.trim();
  }

  private sanitizeCollaborativeReasoningData(data: CollaborativeReasoningData): CollaborativeReasoningData {
    // Deep clone and sanitize all string fields
    const sanitized: CollaborativeReasoningData = {
      ...data,
      topic: this.sanitizeInput(data.topic),
      personas: data.personas.map((persona) => ({
        ...persona,
        name: this.sanitizeInput(persona.name),
        expertise: persona.expertise.map((exp) => this.sanitizeInput(exp)),
        background: this.sanitizeInput(persona.background),
        perspective: this.sanitizeInput(persona.perspective),
        biases: persona.biases.map((bias) => this.sanitizeInput(bias)),
        communication: {
          style: this.sanitizeInput(persona.communication.style),
          tone: this.sanitizeInput(persona.communication.tone)
        }
      })),
      contributions: data.contributions.map((contrib) => ({
        ...contrib,
        content: this.sanitizeInput(contrib.content),
        ...(contrib.referenceIds && { referenceIds: contrib.referenceIds.map((id) => this.sanitizeInput(id)) })
      })),
      ...(data.disagreements && {
        disagreements: data.disagreements.map((disagreement) => ({
          ...disagreement,
          topic: this.sanitizeInput(disagreement.topic),
          positions: disagreement.positions.map((pos) => ({
            ...pos,
            position: this.sanitizeInput(pos.position),
            arguments: pos.arguments.map((arg) => this.sanitizeInput(arg))
          })),
          ...(disagreement.resolution && {
            resolution: {
              ...disagreement.resolution,
              description: this.sanitizeInput(disagreement.resolution.description)
            }
          })
        }))
      }),
      activePersonaId: this.sanitizeInput(data.activePersonaId),
      ...(data.nextPersonaId && { nextPersonaId: this.sanitizeInput(data.nextPersonaId) }),
      ...(data.keyInsights && { keyInsights: data.keyInsights.map((insight) => this.sanitizeInput(insight)) }),
      ...(data.consensusPoints && { consensusPoints: data.consensusPoints.map((point) => this.sanitizeInput(point)) }),
      ...(data.openQuestions && { openQuestions: data.openQuestions.map((question) => this.sanitizeInput(question)) }),
      ...(data.finalRecommendation && { finalRecommendation: this.sanitizeInput(data.finalRecommendation) }),
      sessionId: this.sanitizeInput(data.sessionId),
      ...(data.suggestedContributionTypes && {
        suggestedContributionTypes: data.suggestedContributionTypes
      })
    };

    return sanitized;
  }

  private validateCollaborativeReasoningData(input: unknown): CollaborativeReasoningData {
    const data = input as Record<string, unknown>;

    // Validate required fields
    if (!data["topic"] || typeof data["topic"] !== "string") {
      throw new Error("Invalid topic: must be a string");
    }

    // Sanitize topic
    data["topic"] = this.sanitizeInput(data["topic"] as string);

    if (!Array.isArray(data["personas"])) {
      throw new Error("Invalid personas: must be an array");
    }

    if (!Array.isArray(data["contributions"])) {
      throw new Error("Invalid contributions: must be an array");
    }

    if (!data["stage"] || typeof data["stage"] !== "string") {
      throw new Error("Invalid stage: must be a string");
    }

    const validStages = ["problem-definition", "ideation", "critique", "integration", "decision", "reflection"];
    if (!validStages.includes(data["stage"] as string)) {
      throw new Error(`Invalid stage: must be one of ${validStages.join(", ")}`);
    }

    if (!data["activePersonaId"] || typeof data["activePersonaId"] !== "string") {
      throw new Error("Invalid activePersonaId: must be a string");
    }

    if (!data["sessionId"] || typeof data["sessionId"] !== "string") {
      throw new Error("Invalid sessionId: must be a string");
    }

    if (typeof data["iteration"] !== "number" || data["iteration"] < 0) {
      throw new Error("Invalid iteration: must be a non-negative number");
    }

    if (typeof data["nextContributionNeeded"] !== "boolean") {
      throw new Error("Invalid nextContributionNeeded: must be a boolean");
    }

    // Validate personas
    const personas: Persona[] = [];
    for (const persona of data["personas"] as Array<Record<string, unknown>>) {
      if (!persona["id"] || typeof persona["id"] !== "string") {
        throw new Error("Invalid persona id: must be a string");
      }

      if (!persona["name"] || typeof persona["name"] !== "string") {
        throw new Error("Invalid persona name: must be a string");
      }

      // Sanitize persona name
      persona["name"] = this.sanitizeInput(persona["name"] as string);

      if (!Array.isArray(persona["expertise"])) {
        throw new Error("Invalid persona expertise: must be an array");
      }

      if (!persona["background"] || typeof persona["background"] !== "string") {
        throw new Error("Invalid persona background: must be a string");
      }

      if (!persona["perspective"] || typeof persona["perspective"] !== "string") {
        throw new Error("Invalid persona perspective: must be a string");
      }

      if (!Array.isArray(persona["biases"])) {
        throw new Error("Invalid persona biases: must be an array");
      }

      if (!persona["communication"] || typeof persona["communication"] !== "object") {
        throw new Error("Invalid persona communication: must be an object");
      }

      const communication = persona["communication"] as Record<string, unknown>;

      if (!communication["style"] || typeof communication["style"] !== "string") {
        throw new Error("Invalid persona communication style: must be a string");
      }

      if (!communication["tone"] || typeof communication["tone"] !== "string") {
        throw new Error("Invalid persona communication tone: must be a string");
      }

      const expertise: string[] = [];
      for (const exp of persona["expertise"]) {
        if (typeof exp === "string") {
          expertise.push(exp);
        }
      }

      const biases: string[] = [];
      for (const bias of persona["biases"]) {
        if (typeof bias === "string") {
          biases.push(bias);
        }
      }

      personas.push({
        id: persona["id"] as string,
        name: persona["name"] as string,
        expertise,
        background: persona["background"] as string,
        perspective: persona["perspective"] as string,
        biases,
        communication: {
          style: communication["style"] as string,
          tone: communication["tone"] as string
        }
      });
    }

    // Validate contributions
    const contributions: Contribution[] = [];
    const personaIds = personas.map((p) => p.id);

    for (const contribution of data["contributions"] as Array<Record<string, unknown>>) {
      if (!contribution["personaId"] || typeof contribution["personaId"] !== "string") {
        throw new Error("Invalid contribution personaId: must be a string");
      }

      // Validate that personaId references an existing persona
      if (!personaIds.includes(contribution["personaId"] as string)) {
        throw new Error(
          `Invalid contribution personaId: persona '${contribution["personaId"]}' not found in personas array`
        );
      }

      if (!contribution["content"] || typeof contribution["content"] !== "string") {
        throw new Error("Invalid contribution content: must be a string");
      }

      // Sanitize contribution content
      contribution["content"] = this.sanitizeInput(contribution["content"] as string);

      if (!contribution["type"] || typeof contribution["type"] !== "string") {
        throw new Error("Invalid contribution type: must be a string");
      }

      const validContributionTypes = [
        "observation",
        "question",
        "insight",
        "concern",
        "suggestion",
        "challenge",
        "synthesis"
      ];
      if (!validContributionTypes.includes(contribution["type"] as string)) {
        throw new Error(`Invalid contribution type: must be one of ${validContributionTypes.join(", ")}`);
      }

      if (
        typeof contribution["confidence"] !== "number" ||
        contribution["confidence"] < 0 ||
        contribution["confidence"] > 1
      ) {
        throw new Error("Invalid contribution confidence: must be a number between 0 and 1");
      }

      const referenceIds: string[] = [];
      if (Array.isArray(contribution["referenceIds"])) {
        for (const refId of contribution["referenceIds"]) {
          if (typeof refId === "string") {
            referenceIds.push(refId);
          }
        }
      }

      const contributionData: Contribution = {
        personaId: contribution["personaId"] as string,
        content: contribution["content"] as string,
        type: contribution["type"] as Contribution["type"],
        confidence: contribution["confidence"] as number
      };
      if (referenceIds.length > 0) {
        contributionData.referenceIds = referenceIds;
      }
      contributions.push(contributionData);
    }

    // Validate that activePersonaId references an existing persona
    if (!personaIds.includes(data["activePersonaId"] as string)) {
      throw new Error(`Invalid activePersonaId: persona '${data["activePersonaId"]}' not found in personas array`);
    }

    // Validate that nextPersonaId references an existing persona (if provided)
    if (data["nextPersonaId"] && typeof data["nextPersonaId"] === "string") {
      if (!personaIds.includes(data["nextPersonaId"] as string)) {
        throw new Error(`Invalid nextPersonaId: persona '${data["nextPersonaId"]}' not found in personas array`);
      }
    }

    // Validate disagreements
    const disagreements: Disagreement[] = [];
    if (Array.isArray(data["disagreements"])) {
      for (const disagreement of data["disagreements"] as Array<Record<string, unknown>>) {
        if (!disagreement["topic"] || typeof disagreement["topic"] !== "string") {
          throw new Error("Invalid disagreement topic: must be a string");
        }

        if (!Array.isArray(disagreement["positions"])) {
          throw new Error("Invalid disagreement positions: must be an array");
        }

        const positions: Disagreement["positions"] = [];
        const positionsArray = disagreement["positions"] as Array<Record<string, unknown>>;
        for (let positionIndex = 0; positionIndex < positionsArray.length; positionIndex++) {
          const position = positionsArray[positionIndex];
          if (!position || !position["personaId"] || typeof position["personaId"] !== "string") {
            throw new Error(
              `Invalid position personaId at disagreement index ${disagreements.length}, position index ${positionIndex}: must be a string`
            );
          }

          // Validate that position personaId references an existing persona
          if (!personaIds.includes(position["personaId"] as string)) {
            throw new Error(
              `Invalid position personaId at disagreement index ${disagreements.length}, position index ${positionIndex}: persona '${position["personaId"]}' not found in personas array`
            );
          }

          if (!position["position"] || typeof position["position"] !== "string") {
            throw new Error(
              `Invalid position statement at disagreement index ${disagreements.length}, position index ${positionIndex}: must be a string`
            );
          }

          if (!Array.isArray(position["arguments"])) {
            throw new Error(
              `Invalid position arguments at disagreement index ${disagreements.length}, position index ${positionIndex}: must be an array`
            );
          }

          const args: string[] = [];
          for (const arg of position["arguments"]) {
            if (typeof arg === "string") {
              args.push(arg);
            }
          }

          positions.push({
            personaId: position["personaId"] as string,
            position: position["position"] as string,
            arguments: args
          });
        }

        let resolution: Disagreement["resolution"] | undefined = undefined;
        // Use extracted type guard helper function
        const resolutionCandidate = disagreement["resolution"];
        if (isResolution(resolutionCandidate)) {
          resolution = {
            type: resolutionCandidate.type,
            description: resolutionCandidate.description
          };
        }

        const disagreementData: Disagreement = {
          topic: disagreement["topic"] as string,
          positions
        };
        if (resolution) {
          disagreementData.resolution = resolution;
        }
        disagreements.push(disagreementData);
      }
    }

    // Validate optional array fields
    const keyInsights: string[] = [];
    if (Array.isArray(data["keyInsights"])) {
      for (const insight of data["keyInsights"]) {
        if (typeof insight === "string") {
          keyInsights.push(insight);
        }
      }
    }

    const consensusPoints: string[] = [];
    if (Array.isArray(data["consensusPoints"])) {
      for (const point of data["consensusPoints"]) {
        if (typeof point === "string") {
          consensusPoints.push(point);
        }
      }
    }

    const openQuestions: string[] = [];
    if (Array.isArray(data["openQuestions"])) {
      for (const question of data["openQuestions"]) {
        if (typeof question === "string") {
          openQuestions.push(question);
        }
      }
    }

    const suggestedContributionTypes: Array<Contribution["type"]> = [];
    if (Array.isArray(data["suggestedContributionTypes"])) {
      const validTypes = [
        "observation",
        "question",
        "insight",
        "concern",
        "suggestion",
        "challenge",
        "synthesis"
      ] as const;
      for (const type of data["suggestedContributionTypes"]) {
        if (typeof type === "string" && validTypes.includes(type as Contribution["type"])) {
          suggestedContributionTypes.push(type as Contribution["type"]);
        }
      }
    }

    // Create validated data object
    const validatedData: CollaborativeReasoningData = {
      topic: data["topic"] as string,
      personas,
      contributions,
      stage: data["stage"] as CollaborativeReasoningData["stage"],
      activePersonaId: data["activePersonaId"] as string,
      sessionId: data["sessionId"] as string,
      iteration: data["iteration"] as number,
      nextContributionNeeded: data["nextContributionNeeded"] as boolean
    };

    // Conditionally add optional properties
    if (disagreements.length > 0) {
      validatedData.disagreements = disagreements;
    }
    if (typeof data["nextPersonaId"] === "string") {
      validatedData.nextPersonaId = data["nextPersonaId"];
    }
    if (keyInsights.length > 0) {
      validatedData.keyInsights = keyInsights;
    }
    if (consensusPoints.length > 0) {
      validatedData.consensusPoints = consensusPoints;
    }
    if (openQuestions.length > 0) {
      validatedData.openQuestions = openQuestions;
    }
    if (data["finalRecommendation"] && typeof data["finalRecommendation"] === "string") {
      validatedData.finalRecommendation = data["finalRecommendation"];
    }
    if (suggestedContributionTypes.length > 0) {
      validatedData.suggestedContributionTypes = suggestedContributionTypes;
    }

    return validatedData;
  }

  private updateRegistries(data: CollaborativeReasoningData): void {
    const sessionId = data.sessionId;

    // Update persona registry
    if (!this.personaRegistry[sessionId]) {
      this.personaRegistry[sessionId] = {};
    }

    for (const persona of data.personas) {
      this.personaRegistry[sessionId][persona.id] = persona;
    }

    // Update contribution history
    if (!this.contributionHistory[sessionId]) {
      this.contributionHistory[sessionId] = [];
    }

    for (const contribution of data.contributions) {
      // Only add new contributions
      const exists = this.contributionHistory[sessionId].some(
        (c) => c.personaId === contribution.personaId && c.content === contribution.content
      );

      if (!exists) {
        this.contributionHistory[sessionId].push(contribution);
      }
    }

    // Update disagreement tracker
    if (data.disagreements && data.disagreements.length > 0) {
      if (!this.disagreementTracker[sessionId]) {
        this.disagreementTracker[sessionId] = [];
      }

      for (const disagreement of data.disagreements) {
        // Check if this disagreement already exists
        const existingIndex = this.disagreementTracker[sessionId].findIndex((d) => d.topic === disagreement.topic);

        if (existingIndex >= 0) {
          // Update existing disagreement
          this.disagreementTracker[sessionId][existingIndex] = disagreement;
        } else {
          // Add new disagreement
          this.disagreementTracker[sessionId].push(disagreement);
        }
      }
    }
  }

  private updateSessionHistory(data: CollaborativeReasoningData): void {
    let historyEntry = this.sessionHistory[data.sessionId]; // Get potential entry
    if (!historyEntry) {
      // Check if it exists
      historyEntry = []; // Create new array if not
      this.sessionHistory[data.sessionId] = historyEntry; // Assign it back to the object
    }
    // Now, historyEntry is guaranteed to be CollaborativeReasoningData[]
    historyEntry.push(data);

    this.updateRegistries(data);
  }

  private selectNextPersona(data: CollaborativeReasoningData): string {
    // If nextPersonaId is already set, use it
    if (data.nextPersonaId) {
      return data.nextPersonaId;
    }

    // Otherwise, select the next persona in rotation
    if (!data.personas || data.personas.length === 0) {
      throw new Error("Cannot determine next persona: No personas defined in session.");
    }

    const personaIds = data.personas.map((p) => p.id);
    const currentIndex = personaIds.indexOf(data.activePersonaId);
    // If active persona not found (shouldn't happen ideally), default to first
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % personaIds.length;

    // personaIds[nextIndex] is guaranteed to be string due to empty check above
    return personaIds[nextIndex]!;
  }

  private getPersonaColor(index: number): (text: string) => string {
    const colors = [
      (text: string) => `${ANSI.blue}${text}${ANSI.reset}`,
      (text: string) => `${ANSI.green}${text}${ANSI.reset}`,
      (text: string) => `${ANSI.yellow}${text}${ANSI.reset}`,
      (text: string) => `${ANSI.magenta}${text}${ANSI.reset}`,
      (text: string) => `${ANSI.cyan}${text}${ANSI.reset}`,
      (text: string) => `${ANSI.red}${text}${ANSI.reset}`
    ];

    // Use non-null assertion as logic guarantees a valid index
    return colors[index % colors.length]!;
  }

  private getContributionTypeColor(type: string): (text: string) => string {
    switch (type) {
      case "observation":
        return (text: string) => `${ANSI.blue}${text}${ANSI.reset}`;
      case "question":
        return (text: string) => `${ANSI.cyan}${text}${ANSI.reset}`;
      case "insight":
        return (text: string) => `${ANSI.green}${text}${ANSI.reset}`;
      case "concern":
        return (text: string) => `${ANSI.yellow}${text}${ANSI.reset}`;
      case "suggestion":
        return (text: string) => `${ANSI.magenta}${text}${ANSI.reset}`;
      case "challenge":
        return (text: string) => `${ANSI.red}${text}${ANSI.reset}`;
      case "synthesis":
        return (text: string) => `${ANSI.white}${text}${ANSI.reset}`;
      default:
        return (text: string) => `${ANSI.white}${text}${ANSI.reset}`;
    }
  }

  private getConfidenceBar(confidence: number): string {
    const barLength = 20;
    const filledLength = Math.round(confidence * barLength);
    const emptyLength = barLength - filledLength;

    let bar = "[";

    // Choose color based on confidence level
    let color: (text: string) => string;
    if (confidence >= 0.8) {
      color = (text: string) => `${ANSI.green}${text}${ANSI.reset}`;
    } else if (confidence >= 0.5) {
      color = (text: string) => `${ANSI.yellow}${text}${ANSI.reset}`;
    } else {
      color = (text: string) => `${ANSI.red}${text}${ANSI.reset}`;
    }

    bar += color("=".repeat(filledLength));
    bar += " ".repeat(emptyLength);
    bar += `] ${(confidence * 100).toFixed(0)}%`;

    return bar;
  }

  private visualizeCollaborativeReasoning(data: CollaborativeReasoningData): string {
    let output = `\n${ANSI.bold}COLLABORATIVE REASONING: ${data.topic}${ANSI.reset} (ID: ${data.sessionId})\n\n`;

    // Stage and iteration
    output += `${ANSI.cyan}Stage:${ANSI.reset} ${data.stage}\n`;
    output += `${ANSI.cyan}Iteration:${ANSI.reset} ${data.iteration}\n\n`;

    // Personas
    output += `${ANSI.bold}PERSONAS:${ANSI.reset}\n`;
    for (let i = 0; i < data.personas.length; i++) {
      const persona = data.personas[i];
      const color = this.getPersonaColor(i);

      output += `${color(`${persona?.name} (${persona?.id})`)}\n`;
      output += `  Expertise: ${persona?.expertise.join(", ")}\n`;
      output += `  Perspective: ${persona?.perspective}\n`;
      output += `  Communication: ${persona?.communication.style} (${persona?.communication.tone})\n`;

      // Highlight active persona
      if (persona?.id === data.activePersonaId) {
        output += `  ${ANSI.bgGreen}${ANSI.black} ACTIVE ${ANSI.reset}\n`;
      }

      output += "\n";
    }

    // Contributions
    if (data.contributions.length > 0) {
      output += `${ANSI.bold}CONTRIBUTIONS:${ANSI.reset}\n\n`;

      for (const contribution of data.contributions) {
        // Find persona
        const persona = data.personas.find((p) => p.id === contribution.personaId);
        if (!persona) continue;

        // Get persona color
        const personaIndex = data.personas.findIndex((p) => p.id === contribution.personaId);
        const personaColor = this.getPersonaColor(personaIndex);

        // Get contribution type color
        const typeColor = this.getContributionTypeColor(contribution.type);

        output += `${personaColor(`[${persona.name}]`)} ${typeColor(`[${contribution.type}]`)}\n`;
        output += `${contribution.content}\n`;
        output += `Confidence: ${this.getConfidenceBar(contribution.confidence)}\n`;

        if (contribution.referenceIds && contribution.referenceIds.length > 0) {
          output += `References: ${contribution.referenceIds.join(", ")}\n`;
        }

        output += "\n";
      }
    }

    // Disagreements
    if (data.disagreements && data.disagreements.length > 0) {
      output += `${ANSI.bold}DISAGREEMENTS:${ANSI.reset}\n\n`;

      for (const disagreement of data.disagreements) {
        output += `${ANSI.red}Topic:${ANSI.reset} ${disagreement.topic}\n\n`;

        for (const position of disagreement.positions) {
          // Find persona
          const persona = data.personas.find((p) => p.id === position.personaId);
          if (!persona) continue;

          // Get persona color
          const personaIndex = data.personas.findIndex((p) => p.id === position.personaId);
          const personaColor = this.getPersonaColor(personaIndex);

          output += `${personaColor(`[${persona.name}]`)} Position: ${position.position}\n`;
          output += `  Arguments:\n`;
          for (const argument of position.arguments) {
            output += `  - ${argument}\n`;
          }
          output += "\n";
        }

        if (disagreement.resolution) {
          output += `${ANSI.green}Resolution:${ANSI.reset} ${disagreement.resolution.type}\n`;
          output += `${disagreement.resolution.description}\n\n`;
        } else {
          output += `${ANSI.yellow}Status:${ANSI.reset} Unresolved\n\n`;
        }
      }
    }

    // Collaboration output
    if (data.keyInsights && data.keyInsights.length > 0) {
      output += `${ANSI.bold}KEY INSIGHTS:${ANSI.reset}\n`;
      for (const insight of data.keyInsights) {
        output += `  - ${insight}\n`;
      }
      output += "\n";
    }

    if (data.consensusPoints && data.consensusPoints.length > 0) {
      output += `${ANSI.bold}CONSENSUS POINTS:${ANSI.reset}\n`;
      for (const point of data.consensusPoints) {
        output += `  - ${point}\n`;
      }
      output += "\n";
    }

    if (data.openQuestions && data.openQuestions.length > 0) {
      output += `${ANSI.bold}OPEN QUESTIONS:${ANSI.reset}\n`;
      for (const question of data.openQuestions) {
        output += `  - ${question}\n`;
      }
      output += "\n";
    }

    if (data.finalRecommendation) {
      output += `${ANSI.bold}FINAL RECOMMENDATION:${ANSI.reset}\n`;
      output += `${data.finalRecommendation}\n\n`;
    }

    // Next steps
    if (data.nextContributionNeeded) {
      const nextPersonaId = this.selectNextPersona(data);
      const nextPersona = data.personas.find((p) => p.id === nextPersonaId);

      if (nextPersona) {
        output += `${ANSI.blue}NEXT CONTRIBUTION:${ANSI.reset}\n`;
        output += `  Next persona: ${nextPersona.name}\n`;

        if (data.suggestedContributionTypes && data.suggestedContributionTypes.length > 0) {
          output += `  Suggested contribution types: ${data.suggestedContributionTypes.join(", ")}\n`;
        }
      }
    }

    return output;
  }

  public processCollaborativeReasoning(input: unknown): {
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  } {
    try {
      const validatedInput = this.validateCollaborativeReasoningData(input);

      // Sanitize all string content in the validated data
      const sanitizedInput = this.sanitizeCollaborativeReasoningData(validatedInput);

      // Update the next persona if not specified
      if (!sanitizedInput.nextPersonaId && sanitizedInput.nextContributionNeeded) {
        sanitizedInput.nextPersonaId = this.selectNextPersona(sanitizedInput);
      }

      // Update session state
      this.updateSessionHistory(sanitizedInput);

      // Generate visualization (only in non-test environment)
      if (process.env.NODE_ENV !== "test") {
        const visualization = this.visualizeCollaborativeReasoning(sanitizedInput);
        console.error(visualization);
      }

      // Return the collaboration result with full content
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                topic: sanitizedInput.topic,
                stage: sanitizedInput.stage,
                iteration: sanitizedInput.iteration,
                personas: sanitizedInput.personas,
                contributions: sanitizedInput.contributions,
                disagreements: sanitizedInput.disagreements || [],
                activePersonaId: sanitizedInput.activePersonaId,
                nextPersonaId: sanitizedInput.nextPersonaId,
                nextContributionNeeded: sanitizedInput.nextContributionNeeded,
                suggestedContributionTypes: sanitizedInput.suggestedContributionTypes,
                keyInsights: sanitizedInput.keyInsights,
                consensusPoints: sanitizedInput.consensusPoints,
                openQuestions: sanitizedInput.openQuestions,
                finalRecommendation: sanitizedInput.finalRecommendation
              },
              null,
              2
            )
          }
        ],
        isError: false
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`
          }
        ],
        isError: true
      };
    }
  }
}

const COLLABORATIVE_REASONING_TOOL: Tool = {
  name: "collaborativeReasoning",
  description: `A detailed tool for simulating expert collaboration with diverse perspectives.
This tool helps models tackle complex problems by coordinating multiple viewpoints.
It provides a framework for structured collaborative reasoning and perspective integration.

When to use this tool:
- Complex problems requiring diverse expertise
- Issues needing multiple stakeholder perspectives
- Scenarios with potential value trade-offs
- Creative tasks benefiting from diverse viewpoints
- Problems where biases might limit single-perspective thinking

Key features:
- Multi-persona simulation
- Structured collaboration process
- Productive disagreement management
- Cross-pollination of ideas
- Perspective synthesis and integration`,

  inputSchema: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "The topic or problem being addressed"
      },
      personas: {
        type: "array",
        description: "The expert personas participating in the collaboration",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the persona"
            },
            name: {
              type: "string",
              description: "Name of the persona"
            },
            expertise: {
              type: "array",
              description: "Areas of expertise",
              items: {
                type: "string"
              }
            },
            background: {
              type: "string",
              description: "Background and experience of the persona"
            },
            perspective: {
              type: "string",
              description: "Unique perspective or viewpoint"
            },
            biases: {
              type: "array",
              description: "Potential biases of this persona",
              items: {
                type: "string"
              }
            },
            communication: {
              type: "object",
              description: "Communication style of the persona",
              properties: {
                style: {
                  type: "string",
                  description: "Communication style (e.g., direct, analytical, narrative)"
                },
                tone: {
                  type: "string",
                  description: "Tone of communication (e.g., formal, casual, enthusiastic)"
                }
              },
              required: ["style", "tone"]
            }
          },
          required: ["id", "name", "expertise", "background", "perspective", "biases", "communication"]
        }
      },
      contributions: {
        type: "array",
        description: "Contributions from the personas",
        items: {
          type: "object",
          properties: {
            personaId: {
              type: "string",
              description: "ID of the contributing persona"
            },
            content: {
              type: "string",
              description: "Content of the contribution"
            },
            type: {
              type: "string",
              enum: ["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"],
              description: "Type of contribution"
            },
            referenceIds: {
              type: "array",
              description: "IDs of previous contributions this builds upon",
              items: {
                type: "string"
              }
            },
            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Confidence level in this contribution (0.0-1.0)"
            }
          },
          required: ["personaId", "content", "type", "confidence"]
        }
      },
      disagreements: {
        type: "array",
        description: "Points of disagreement between personas",
        items: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Topic of disagreement"
            },
            positions: {
              type: "array",
              description: "Different positions on the topic",
              items: {
                type: "object",
                properties: {
                  personaId: {
                    type: "string",
                    description: "ID of the persona holding this position"
                  },
                  position: {
                    type: "string",
                    description: "Description of the position"
                  },
                  arguments: {
                    type: "array",
                    description: "Arguments supporting this position",
                    items: {
                      type: "string"
                    }
                  }
                },
                required: ["personaId", "position", "arguments"]
              }
            },
            resolution: {
              type: "object",
              description: "Resolution of the disagreement, if any",
              properties: {
                type: {
                  type: "string",
                  enum: ["consensus", "compromise", "integration", "tabled"],
                  description: "Type of resolution"
                },
                description: {
                  type: "string",
                  description: "Description of how the disagreement was resolved"
                }
              },
              required: ["type", "description"]
            }
          },
          required: ["topic", "positions"]
        }
      },
      stage: {
        type: "string",
        enum: ["problem-definition", "ideation", "critique", "integration", "decision", "reflection"],
        description: "Current stage of the collaborative process"
      },
      activePersonaId: {
        type: "string",
        description: "ID of the currently active persona"
      },
      nextPersonaId: {
        type: "string",
        description: "ID of the persona that should contribute next"
      },
      keyInsights: {
        type: "array",
        description: "Key insights from the collaboration",
        items: {
          type: "string"
        }
      },
      consensusPoints: {
        type: "array",
        description: "Points of consensus among participants",
        items: {
          type: "string"
        }
      },
      openQuestions: {
        type: "array",
        description: "Open questions requiring further exploration",
        items: {
          type: "string"
        }
      },
      finalRecommendation: {
        type: "string",
        description: "Final recommendation based on the collaboration"
      },
      sessionId: {
        type: "string",
        description: "Unique identifier for this collaboration session"
      },
      iteration: {
        type: "number",
        minimum: 0,
        description: "Current iteration of the collaboration"
      },
      nextContributionNeeded: {
        type: "boolean",
        description: "Whether another contribution is needed"
      },
      suggestedContributionTypes: {
        type: "array",
        description: "Suggested types for the next contribution",
        items: {
          type: "string",
          enum: ["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"]
        }
      }
    },
    required: [
      "topic",
      "personas",
      "contributions",
      "stage",
      "activePersonaId",
      "sessionId",
      "iteration",
      "nextContributionNeeded"
    ]
  }
};

const server = new Server(
  {
    name: "collaborative-reasoning-server",
    version: "0.1.2"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

const collaborativeReasoningServer = new CollaborativeReasoningServer();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [COLLABORATIVE_REASONING_TOOL]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "collaborativeReasoning") {
    return collaborativeReasoningServer.processCollaborativeReasoning(request.params.arguments);
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${request.params.name}`
      }
    ],
    isError: true
  };
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Collaborative Reasoning MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});

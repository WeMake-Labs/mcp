import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type Tool } from "@modelcontextprotocol/sdk/types.js";
import chalk from "chalk";

// Configuration constants
const SIMILARITY_THRESHOLD = 0.8; // Threshold for detecting near-duplicate feedback
const MAX_STRING_LENGTH = 10000; // Maximum length for string fields
const MAX_ARRAY_LENGTH = 100; // Maximum length for array fields

// Types
interface FocusGroupPersona {
  id: string;
  name: string;
  userType: string; // e.g., novice, expert, enterprise, developer
  usageScenario: string; // typical use case scenario
  expectations: string[];
  priorities: string[];
  constraints: string[];
  communication: {
    style: string;
    tone: string;
  };
}

interface Feedback {
  personaId: string;
  content: string;
  type: "praise" | "confusion" | "suggestion" | "usability" | "feature" | "bug" | "summary";
  targetComponent?: string; // which aspect of the server this feedback relates to
  severity: number; // 0.0-1.0, how important this feedback is
  referenceIds?: string[]; // IDs of previous feedback this builds upon
}

interface FocusAreaAnalysis {
  area: string; // e.g., "API Design", "Documentation", "Error Handling"
  findings: Array<{
    personaId: string;
    finding: string;
    impact: string;
    suggestion?: string;
  }>;
  resolution?: {
    type: "implemented" | "considered" | "rejected" | "deferred";
    description: string;
  };
}

interface FocusGroupData {
  // Core focus group components
  targetServer: string; // The MCP server being analyzed
  personas: FocusGroupPersona[];
  feedback: Feedback[];
  focusAreaAnalyses?: FocusAreaAnalysis[];

  // Process structure
  stage: "introduction" | "initial-impressions" | "deep-dive" | "synthesis" | "recommendations" | "prioritization";
  activePersonaId: string;
  nextPersonaId?: string;

  // Analysis output
  keyStrengths?: string[];
  keyWeaknesses?: string[];
  topRecommendations?: string[];
  unanimousPoints?: string[];

  // Process metadata
  sessionId: string;
  iteration: number;

  // Next steps
  nextFeedbackNeeded: boolean;
  suggestedFeedbackTypes?: string[];
  suggestedFocusArea?: string;
}

/**
 * FocusGroupServer manages personas, feedback, focus area analyses and session data for MCP focus-group workflows.
 *
 * This class provides a comprehensive framework for conducting LLM-based focus groups to evaluate MCP servers
 * from multiple user perspectives. It handles structured evaluation, feedback collection, and recommendation generation.
 *
 * @class FocusGroupServer
 *
 * Architecture:
 * - personaRegistry: Maps sessionId -> personaId -> FocusGroupPersona. Stores all personas participating in focus groups.
 * - feedbackHistory: Maps sessionId -> Feedback[]. Maintains chronological feedback with similarity-based deduplication.
 * - focusAreaTracker: Maps sessionId -> FocusAreaAnalysis[]. Tracks analysis of specific focus areas like API design, documentation.
 * - sessionHistory: Maps sessionId -> FocusGroupData[]. Stores complete session snapshots for audit and recovery.
 *
 * Lifecycle:
 * - Instances are created per server startup and persist for the server lifetime
 * - Methods are synchronous and thread-safe for single-threaded Node.js/Bun execution
 * - No external locking required due to single-threaded event loop
 * - Session data persists in memory until server restart
 *
 * Main Methods:
 * - processFocusGroup(input): Validates input, updates registries, generates visualization, returns structured results
 * - validateFocusGroupData(input): Comprehensive validation with detailed error messages for malformed data
 * - updateRegistries(data): Updates internal state with new personas, feedback (with similarity detection), and analyses
 *
 * @example
 * ```typescript
 * const server = new FocusGroupServer();
 * const result = server.processFocusGroup({
 *   targetServer: "my-mcp-server",
 *   personas: [{ id: "expert1", name: "Expert User", ... }],
 *   feedback: [{ personaId: "expert1", content: "Great API design", type: "praise", severity: 0.8 }],
 *   stage: "initial-impressions",
 *   activePersonaId: "expert1",
 *   sessionId: "session-123",
 *   iteration: 1,
 *   nextFeedbackNeeded: true
 * });
 * ```
 */
class FocusGroupServer {
  private personaRegistry: Record<string, Record<string, FocusGroupPersona>> = {};
  private feedbackHistory: Record<string, Feedback[]> = {};
  private focusAreaTracker: Record<string, FocusAreaAnalysis[]> = {};
  private sessionHistory: Record<string, FocusGroupData[]> = {};

  /**
   * Sanitizes input string by removing potentially dangerous content and limiting length.
   * @param input - The input string to sanitize
   * @param maxLength - Maximum allowed length (default: MAX_STRING_LENGTH)
   * @returns Sanitized string
   */
  private sanitizeInput(input: string, maxLength: number = MAX_STRING_LENGTH): string {
    if (typeof input !== "string") {
      return "";
    }

    // Remove script tags and dangerous patterns
    let sanitized = input
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/\.\./g, "") // Path traversal
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F]/g, ""); // Control characters

    // Redact sensitive patterns
    sanitized = sanitized
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL_REDACTED]")
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN_REDACTED]")
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[CARD_REDACTED]")
      .replace(/\b(?:password|pwd|secret|key|token)\s*[:=]\s*\S+/gi, "[CREDENTIAL_REDACTED]");

    return sanitized.slice(0, maxLength).trim();
  }

  /**
   * Normalizes text for similarity comparison by removing punctuation,
   * collapsing whitespace, and converting to lowercase.
   * @param text - The text to normalize
   * @returns Normalized text
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .replace(/\s+/g, " ") // Collapse whitespace
      .trim();
  }

  /**
   * Calculates similarity between two texts using Jaccard similarity on word sets.
   * @param text1 - First text
   * @param text2 - Second text
   * @returns Similarity score between 0 and 1
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const normalized1 = this.normalizeText(text1);
    const normalized2 = this.normalizeText(text2);

    if (normalized1 === normalized2) return 1.0;
    if (!normalized1 || !normalized2) return 0.0;

    const words1 = new Set(normalized1.split(" "));
    const words2 = new Set(normalized2.split(" "));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private validateFocusGroupData(input: unknown): FocusGroupData {
    const data = input as Record<string, unknown>;

    // Validate required fields
    if (!data["targetServer"] || typeof data["targetServer"] !== "string") {
      throw new Error("Invalid targetServer: must be a string");
    }
    data["targetServer"] = this.sanitizeInput(data["targetServer"] as string, 200);

    if (!Array.isArray(data["personas"])) {
      throw new Error("Invalid personas: must be an array");
    }
    if (data["personas"].length === 0) {
      throw new Error("At least one persona is required");
    }
    if (data["personas"].length > MAX_ARRAY_LENGTH) {
      throw new Error(`Too many personas: maximum ${MAX_ARRAY_LENGTH} allowed`);
    }

    // Validate personas
    const personaIds = new Set<string>();
    for (const [index, persona] of (data["personas"] as Record<string, unknown>[]).entries()) {
      if (!persona || typeof persona !== "object") {
        throw new Error(`Persona at index ${index} must be an object`);
      }
      if (!persona["id"] || typeof persona["id"] !== "string") {
        throw new Error(`Persona at index ${index} must have a valid id`);
      }
      if (personaIds.has(persona["id"] as string)) {
        throw new Error(`Duplicate persona id: ${persona["id"]}`);
      }
      personaIds.add(persona["id"] as string);

      if (!persona["name"] || typeof persona["name"] !== "string") {
        throw new Error(`Persona ${persona["id"]} must have a valid name`);
      }
      persona["name"] = this.sanitizeInput(persona["name"] as string, 200);

      if (!persona["userType"] || typeof persona["userType"] !== "string") {
        throw new Error(`Persona ${persona["id"]} must have a valid userType`);
      }

      if (!persona["usageScenario"] || typeof persona["usageScenario"] !== "string") {
        throw new Error(`Persona ${persona["id"]} must have a valid usageScenario`);
      }
      persona["usageScenario"] = this.sanitizeInput(persona["usageScenario"] as string, 1000);

      if (!Array.isArray(persona["expectations"])) {
        throw new Error(`Persona ${persona["id"]} expectations must be an array`);
      }

      if (!Array.isArray(persona["priorities"])) {
        throw new Error(`Persona ${persona["id"]} priorities must be an array`);
      }

      if (!Array.isArray(persona["constraints"])) {
        throw new Error(`Persona ${persona["id"]} constraints must be an array`);
      }

      if (!persona["communication"] || typeof persona["communication"] !== "object") {
        throw new Error(`Persona ${persona["id"]} must have communication object`);
      }
      const communication = persona["communication"] as Record<string, unknown>;
      if (!communication["style"] || typeof communication["style"] !== "string") {
        throw new Error(`Persona ${persona["id"]} communication must have style`);
      }
      if (!communication["tone"] || typeof communication["tone"] !== "string") {
        throw new Error(`Persona ${persona["id"]} communication must have tone`);
      }
    }

    if (!Array.isArray(data["feedback"])) {
      throw new Error("Invalid feedback: must be an array");
    }
    if ((data["feedback"] as Record<string, unknown>[]).length > MAX_ARRAY_LENGTH) {
      throw new Error(`Too many feedback items: maximum ${MAX_ARRAY_LENGTH} allowed`);
    }

    // Validate feedback items
    const validFeedbackTypes = ["praise", "confusion", "suggestion", "usability", "feature", "bug", "summary"];
    for (const [index, feedback] of (data["feedback"] as Record<string, unknown>[]).entries()) {
      if (!feedback || typeof feedback !== "object") {
        throw new Error(`Feedback at index ${index} must be an object`);
      }
      if (!feedback["personaId"] || typeof feedback["personaId"] !== "string") {
        throw new Error(`Feedback at index ${index} must have a valid personaId`);
      }
      if (!personaIds.has(feedback["personaId"] as string)) {
        throw new Error(`Feedback at index ${index} references unknown persona: ${feedback["personaId"]}`);
      }
      if (
        feedback["content"] === null ||
        feedback["content"] === undefined ||
        typeof feedback["content"] !== "string"
      ) {
        throw new Error(`Feedback at index ${index} must have valid content`);
      }
      feedback["content"] = this.sanitizeInput(feedback["content"] as string, 5000);

      if (!feedback["type"] || !validFeedbackTypes.includes(feedback["type"] as string)) {
        throw new Error(`Feedback at index ${index} must have valid type: ${validFeedbackTypes.join(", ")}`);
      }
      if (
        typeof feedback["severity"] !== "number" ||
        (feedback["severity"] as number) < 0 ||
        (feedback["severity"] as number) > 1
      ) {
        throw new Error(`Feedback at index ${index} severity must be a number between 0 and 1`);
      }
    }

    if (!data["stage"] || typeof data["stage"] !== "string") {
      throw new Error("Invalid stage: must be a string");
    }
    const validStages = [
      "introduction",
      "initial-impressions",
      "deep-dive",
      "synthesis",
      "recommendations",
      "prioritization"
    ];
    if (!validStages.includes(data["stage"] as string)) {
      throw new Error(`stage must be one of: ${validStages.join(", ")}`);
    }

    if (!data["activePersonaId"] || typeof data["activePersonaId"] !== "string") {
      throw new Error("Invalid activePersonaId: must be a string");
    }
    if (!personaIds.has(data["activePersonaId"] as string)) {
      throw new Error(`activePersonaId references unknown persona: ${data["activePersonaId"]}`);
    }

    if (!data["sessionId"] || typeof data["sessionId"] !== "string") {
      throw new Error("Invalid sessionId: must be a string");
    }
    data["sessionId"] = this.sanitizeInput(data["sessionId"] as string, 100);

    if (typeof data["iteration"] !== "number" || (data["iteration"] as number) < 0) {
      throw new Error("Invalid iteration: must be a non-negative number");
    }

    if (typeof data["nextFeedbackNeeded"] !== "boolean") {
      throw new Error("Invalid nextFeedbackNeeded: must be a boolean");
    }

    // Validate optional focusAreaAnalyses
    if (data["focusAreaAnalyses"]) {
      if (!Array.isArray(data["focusAreaAnalyses"])) {
        throw new Error("focusAreaAnalyses must be an array");
      }
      if ((data["focusAreaAnalyses"] as Record<string, unknown>[]).length > MAX_ARRAY_LENGTH) {
        throw new Error(`Too many focus area analyses: maximum ${MAX_ARRAY_LENGTH} allowed`);
      }

      for (const [index, analysis] of (data["focusAreaAnalyses"] as Record<string, unknown>[]).entries()) {
        if (!analysis || typeof analysis !== "object") {
          throw new Error(`Focus area analysis at index ${index} must be an object`);
        }
        if (!analysis["area"] || typeof analysis["area"] !== "string") {
          throw new Error(`Focus area analysis at index ${index} must have a valid area`);
        }
        analysis["area"] = this.sanitizeInput(analysis["area"] as string, 200);

        if (!Array.isArray(analysis["findings"])) {
          throw new Error(`Focus area analysis at index ${index} findings must be an array`);
        }

        for (const [findingIndex, finding] of (analysis["findings"] as Record<string, unknown>[]).entries()) {
          if (!finding || typeof finding !== "object") {
            throw new Error(`Finding at index ${findingIndex} in analysis ${index} must be an object`);
          }
          if (!finding["personaId"] || typeof finding["personaId"] !== "string") {
            throw new Error(`Finding at index ${findingIndex} in analysis ${index} must have valid personaId`);
          }
          if (!personaIds.has(finding["personaId"] as string)) {
            throw new Error(
              `Finding at index ${findingIndex} in analysis ${index} references unknown persona: ${finding["personaId"]}`
            );
          }
          if (!finding["finding"] || typeof finding["finding"] !== "string") {
            throw new Error(`Finding at index ${findingIndex} in analysis ${index} must have valid finding`);
          }
          finding["finding"] = this.sanitizeInput(finding["finding"] as string, 2000);

          if (!finding["impact"] || typeof finding["impact"] !== "string") {
            throw new Error(`Finding at index ${findingIndex} in analysis ${index} must have valid impact`);
          }
          finding["impact"] = this.sanitizeInput(finding["impact"] as string, 1000);
        }
      }
    }

    return data as unknown as FocusGroupData;
  }

  private updateRegistries(data: FocusGroupData): void {
    const sessionId = data.sessionId;

    // Update persona registry
    if (!this.personaRegistry[sessionId]) {
      this.personaRegistry[sessionId] = {};
    }

    for (const persona of data.personas) {
      this.personaRegistry[sessionId][persona.id] = persona;
    }

    // Update feedback history
    if (!this.feedbackHistory[sessionId]) {
      this.feedbackHistory[sessionId] = [];
    }

    for (const feedback of data.feedback) {
      // Check for similarity with existing feedback to avoid near-duplicates
      const isDuplicate = this.feedbackHistory[sessionId].some((existing) => {
        if (existing.personaId !== feedback.personaId) return false;

        const similarity = this.calculateSimilarity(existing.content, feedback.content);
        return similarity >= SIMILARITY_THRESHOLD;
      });

      if (!isDuplicate) {
        this.feedbackHistory[sessionId].push(feedback);
      }
    }

    // Update focus area tracker
    if (data.focusAreaAnalyses && data.focusAreaAnalyses.length > 0) {
      if (!this.focusAreaTracker[sessionId]) {
        this.focusAreaTracker[sessionId] = [];
      }

      for (const analysis of data.focusAreaAnalyses) {
        // Check if this focus area already exists
        const existingIndex = this.focusAreaTracker[sessionId].findIndex((a) => a.area === analysis.area);

        if (existingIndex >= 0) {
          // Update existing analysis
          this.focusAreaTracker[sessionId][existingIndex] = analysis;
        } else {
          // Add new analysis
          this.focusAreaTracker[sessionId].push(analysis);
        }
      }
    }
  }

  private updateSessionHistory(data: FocusGroupData): void {
    let historyEntry = this.sessionHistory[data.sessionId];
    if (!historyEntry) {
      historyEntry = [];
      this.sessionHistory[data.sessionId] = historyEntry;
    }

    historyEntry.push(data);
    this.updateRegistries(data);
  }

  private selectNextPersona(data: FocusGroupData): string {
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

    return personaIds[nextIndex] || personaIds[0] || data.activePersonaId;
  }

  private getPersonaColor(index: number): (text: string) => string {
    const colors = [chalk.blue, chalk.green, chalk.yellow, chalk.magenta, chalk.cyan, chalk.red];

    return colors[index % colors.length] || chalk.white;
  }

  private getFeedbackTypeColor(type: string): (text: string) => string {
    switch (type) {
      case "praise":
        return chalk.green;
      case "confusion":
        return chalk.yellow;
      case "suggestion":
        return chalk.blue;
      case "usability":
        return chalk.magenta;
      case "feature":
        return chalk.cyan;
      case "bug":
        return chalk.red;
      case "summary":
        return chalk.white;
      default:
        return chalk.white;
    }
  }

  private getSeverityBar(severity: number): string {
    const barLength = 20;
    const filledLength = Math.round(severity * barLength);
    const emptyLength = barLength - filledLength;

    let bar = "[";

    // Choose color based on severity level
    let color: (text: string) => string;
    if (severity >= 0.8) {
      color = chalk.red;
    } else if (severity >= 0.5) {
      color = chalk.yellow;
    } else {
      color = chalk.green;
    }

    bar += color("=".repeat(filledLength));
    bar += " ".repeat(emptyLength);
    bar += `] ${(severity * 100).toFixed(0)}%`;

    return bar;
  }

  private visualizeFocusGroup(data: FocusGroupData): string {
    let output = `\n${chalk.bold(`FOCUS GROUP: ${data.targetServer}`)} (ID: ${data.sessionId})\n\n`;

    // Stage and iteration
    output += `${chalk.cyan("Stage:")} ${data.stage}\n`;
    output += `${chalk.cyan("Iteration:")} ${data.iteration}\n\n`;

    // Personas
    output += `${chalk.bold("PERSONAS:")}\n`;
    for (let i = 0; i < data.personas.length; i++) {
      const persona = data.personas[i];
      if (!persona) continue;

      const color = this.getPersonaColor(i);

      output += `${color(`${persona.name} (${persona.id})`)}\n`;
      output += `  User Type: ${persona.userType}\n`;
      output += `  Scenario: ${persona.usageScenario}\n`;
      output += `  Priorities: ${persona.priorities.join(", ")}\n`;

      // Highlight active persona
      if (persona.id === data.activePersonaId) {
        output += `  ${chalk.bgGreen(chalk.black(" ACTIVE "))}\n`;
      }

      output += "\n";
    }

    // Feedback
    if (data.feedback.length > 0) {
      output += `${chalk.bold("FEEDBACK:")}\n\n`;

      for (const feedback of data.feedback) {
        // Find persona
        const persona = data.personas.find((p) => p.id === feedback.personaId);
        if (!persona) continue;

        // Get persona color
        const personaIndex = data.personas.findIndex((p) => p.id === feedback.personaId);
        const personaColor = this.getPersonaColor(personaIndex);

        // Get feedback type color
        const typeColor = this.getFeedbackTypeColor(feedback.type);

        output += `${personaColor(`[${persona.name}]`)} ${typeColor(`[${feedback.type}]`)}${
          feedback.targetComponent ? ` on ${feedback.targetComponent}` : ""
        }\n`;
        output += `${feedback.content}\n`;
        output += `Severity: ${this.getSeverityBar(feedback.severity)}\n`;

        if (feedback.referenceIds && feedback.referenceIds.length > 0) {
          output += `References: ${feedback.referenceIds.join(", ")}\n`;
        }

        output += "\n";
      }
    }

    // Focus Area Analyses
    if (data.focusAreaAnalyses && data.focusAreaAnalyses.length > 0) {
      output += `${chalk.bold("FOCUS AREA ANALYSES:")}\n\n`;

      for (const analysis of data.focusAreaAnalyses) {
        output += `${chalk.cyan("Area:")} ${analysis.area}\n\n`;

        for (const finding of analysis.findings) {
          // Find persona
          const persona = data.personas.find((p) => p.id === finding.personaId);
          if (!persona) continue;

          // Get persona color
          const personaIndex = data.personas.findIndex((p) => p.id === finding.personaId);
          const personaColor = this.getPersonaColor(personaIndex);

          output += `${personaColor(`[${persona.name}]`)} Finding: ${finding.finding}\n`;
          output += `  Impact: ${finding.impact}\n`;
          if (finding.suggestion) {
            output += `  Suggestion: ${finding.suggestion}\n`;
          }
          output += "\n";
        }

        if (analysis.resolution) {
          output += `${chalk.green("Resolution:")} ${analysis.resolution.type}\n`;
          output += `${analysis.resolution.description}\n\n`;
        } else {
          output += `${chalk.yellow("Status:")} Unresolved\n\n`;
        }
      }
    }

    // Analysis output
    if (data.keyStrengths && data.keyStrengths.length > 0) {
      output += `${chalk.bold("KEY STRENGTHS:")}\n`;
      for (const strength of data.keyStrengths) {
        output += `  - ${strength}\n`;
      }
      output += "\n";
    }

    if (data.keyWeaknesses && data.keyWeaknesses.length > 0) {
      output += `${chalk.bold("KEY WEAKNESSES:")}\n`;
      for (const weakness of data.keyWeaknesses) {
        output += `  - ${weakness}\n`;
      }
      output += "\n";
    }

    if (data.topRecommendations && data.topRecommendations.length > 0) {
      output += `${chalk.bold("TOP RECOMMENDATIONS:")}\n`;
      for (const recommendation of data.topRecommendations) {
        output += `  - ${recommendation}\n`;
      }
      output += "\n";
    }

    if (data.unanimousPoints && data.unanimousPoints.length > 0) {
      output += `${chalk.bold("UNANIMOUS POINTS:")}\n`;
      for (const point of data.unanimousPoints) {
        output += `  - ${point}\n`;
      }
      output += "\n";
    }

    // Next steps
    if (data.nextFeedbackNeeded) {
      const nextPersonaId = this.selectNextPersona(data);
      const nextPersona = data.personas.find((p) => p.id === nextPersonaId);

      if (nextPersona) {
        output += `${chalk.blue("NEXT FEEDBACK:")}\n`;
        output += `  Next persona: ${nextPersona.name}\n`;

        if (data.suggestedFeedbackTypes && data.suggestedFeedbackTypes.length > 0) {
          output += `  Suggested feedback types: ${data.suggestedFeedbackTypes.join(", ")}\n`;
        }

        if (data.suggestedFocusArea) {
          output += `  Suggested focus area: ${data.suggestedFocusArea}\n`;
        }
      }
    }

    return output;
  }

  public processFocusGroup(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedInput = this.validateFocusGroupData(input);

      // Update the next persona if not specified
      if (!validatedInput.nextPersonaId && validatedInput.nextFeedbackNeeded) {
        validatedInput.nextPersonaId = this.selectNextPersona(validatedInput);
      }

      // Update session state
      this.updateSessionHistory(validatedInput);

      // Generate visualization
      const visualization = this.visualizeFocusGroup(validatedInput);
      // Log visualization for development debugging
      if (process.env.NODE_ENV === "development") {
        console.error(`Focus Group Visualization:\n${visualization}`);
      }

      // Get the actual feedback count after duplicate filtering
      const actualFeedbackCount = this.feedbackHistory[validatedInput.sessionId]?.length || 0;

      // Return the focus group result
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                sessionId: validatedInput.sessionId,
                targetServer: validatedInput.targetServer,
                stage: validatedInput.stage,
                iteration: validatedInput.iteration,
                personaCount: validatedInput.personas.length,
                feedbackCount: actualFeedbackCount,
                focusAreaCount: validatedInput.focusAreaAnalyses?.length || 0,
                activePersonaId: validatedInput.activePersonaId,
                nextPersonaId: validatedInput.nextPersonaId,
                nextFeedbackNeeded: validatedInput.nextFeedbackNeeded,
                suggestedFeedbackTypes: validatedInput.suggestedFeedbackTypes,
                suggestedFocusArea: validatedInput.suggestedFocusArea
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: error instanceof Error ? error.message : String(error),
                status: "failed"
              },
              null,
              2
            )
          }
        ],
        isError: true
      };
    }
  }
}

const FOCUS_GROUP_TOOL: Tool = {
  name: "focusGroup",
  description: `A specialized tool for conducting LLM-based focus groups to evaluate MCP servers.
This tool helps models analyze MCP servers from multiple user perspectives.
It provides a framework for structured evaluation, feedback collection, and recommendation generation.

When to use this tool:
- When evaluating a new or updated MCP server
- To identify usability issues from different LLM user perspectives
- To gather diverse feedback on API design and functionality
- To prioritize improvements based on user needs
- When seeking to understand how different types of users might interact with your MCP server

Key features:
- Multi-persona simulation of different LLM users
- Structured feedback collection process
- Focus area analysis for targeted improvements
- Synthesis of findings across user types
- Actionable recommendation generation`,

  inputSchema: {
    type: "object",
    properties: {
      targetServer: {
        type: "string",
        description: "The name of the MCP server being evaluated"
      },
      personas: {
        type: "array",
        description: "The user personas participating in the focus group",
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
            userType: {
              type: "string",
              description: "Type of LLM user (e.g., novice, expert, enterprise, developer)"
            },
            usageScenario: {
              type: "string",
              description: "Typical use case scenario for this user type"
            },
            expectations: {
              type: "array",
              description: "What this user expects from an MCP server",
              items: {
                type: "string"
              }
            },
            priorities: {
              type: "array",
              description: "What aspects of the server are most important to this user",
              items: {
                type: "string"
              }
            },
            constraints: {
              type: "array",
              description: "Limitations or constraints this user operates under",
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
          required: [
            "id",
            "name",
            "userType",
            "usageScenario",
            "expectations",
            "priorities",
            "constraints",
            "communication"
          ]
        }
      },
      feedback: {
        type: "array",
        description: "Feedback from the personas",
        items: {
          type: "object",
          properties: {
            personaId: {
              type: "string",
              description: "ID of the providing persona"
            },
            content: {
              type: "string",
              description: "Content of the feedback"
            },
            type: {
              type: "string",
              enum: ["praise", "confusion", "suggestion", "usability", "feature", "bug", "summary"],
              description: "Type of feedback"
            },
            targetComponent: {
              type: "string",
              description: "The component or aspect of the server this feedback relates to"
            },
            severity: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Severity or importance of this feedback (0.0-1.0)"
            },
            referenceIds: {
              type: "array",
              description: "IDs of previous feedback this builds upon",
              items: {
                type: "string"
              }
            }
          },
          required: ["personaId", "content", "type", "severity"]
        }
      },
      focusAreaAnalyses: {
        type: "array",
        description: "Analysis of specific focus areas",
        items: {
          type: "object",
          properties: {
            area: {
              type: "string",
              description: "Focus area being analyzed"
            },
            findings: {
              type: "array",
              description: "Findings about this focus area",
              items: {
                type: "object",
                properties: {
                  personaId: {
                    type: "string",
                    description: "ID of the persona making this finding"
                  },
                  finding: {
                    type: "string",
                    description: "Description of the finding"
                  },
                  impact: {
                    type: "string",
                    description: "Impact of this finding on users"
                  },
                  suggestion: {
                    type: "string",
                    description: "Suggested improvement"
                  }
                },
                required: ["personaId", "finding", "impact"]
              }
            },
            resolution: {
              type: "object",
              description: "Resolution of the findings, if any",
              properties: {
                type: {
                  type: "string",
                  enum: ["implemented", "considered", "rejected", "deferred"],
                  description: "Type of resolution"
                },
                description: {
                  type: "string",
                  description: "Description of the resolution"
                }
              },
              required: ["type", "description"]
            }
          },
          required: ["area", "findings"]
        }
      },
      stage: {
        type: "string",
        enum: ["introduction", "initial-impressions", "deep-dive", "synthesis", "recommendations", "prioritization"],
        description: "Current stage of the focus group process"
      },
      activePersonaId: {
        type: "string",
        description: "ID of the currently active persona"
      },
      nextPersonaId: {
        type: "string",
        description: "ID of the persona that should provide feedback next"
      },
      keyStrengths: {
        type: "array",
        description: "Key strengths identified in the server",
        items: {
          type: "string"
        }
      },
      keyWeaknesses: {
        type: "array",
        description: "Key weaknesses or pain points identified",
        items: {
          type: "string"
        }
      },
      topRecommendations: {
        type: "array",
        description: "Top recommendations for improvement",
        items: {
          type: "string"
        }
      },
      unanimousPoints: {
        type: "array",
        description: "Points on which all personas agree",
        items: {
          type: "string"
        }
      },
      sessionId: {
        type: "string",
        description: "Unique identifier for this focus group session"
      },
      iteration: {
        type: "number",
        minimum: 0,
        description: "Current iteration of the focus group"
      },
      nextFeedbackNeeded: {
        type: "boolean",
        description: "Whether another round of feedback is needed"
      },
      suggestedFeedbackTypes: {
        type: "array",
        description: "Suggested types for the next feedback",
        items: {
          type: "string",
          enum: ["praise", "confusion", "suggestion", "usability", "feature", "bug", "summary"]
        }
      },
      suggestedFocusArea: {
        type: "string",
        description: "Suggested focus area for the next round of feedback"
      }
    },
    required: [
      "targetServer",
      "personas",
      "feedback",
      "stage",
      "activePersonaId",
      "sessionId",
      "iteration",
      "nextFeedbackNeeded"
    ]
  }
};

const server = new Server(
  {
    name: "focus-group-server",
    version: "0.1.5"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

const focusGroupServer = new FocusGroupServer();

// Export for testing
export { FocusGroupServer };

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [FOCUS_GROUP_TOOL]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "focusGroup") {
    return focusGroupServer.processFocusGroup(request.params.arguments);
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
  console.error("Focus Group MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});

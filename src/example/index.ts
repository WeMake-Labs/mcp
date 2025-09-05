import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
  type CallToolRequest
} from "@modelcontextprotocol/sdk/types.js";
import chalk from "chalk";

/**
 * Environment configuration for bounded storage with eviction.
 * Provides sensible defaults for production use while allowing customization.
 */
let AR_MAX_HISTORY: number;
let AR_TTL_MINUTES: number;
let AR_MAX_DOMAINS: number;

/**
 * Validates environment configuration and parses values to ensure proper operation.
 * Throws descriptive errors for invalid configurations.
 */
function validateEnvironmentConfig(): void {
  AR_MAX_HISTORY = parseInt(process.env["AR_MAX_HISTORY"] || "100", 10);
  AR_TTL_MINUTES = parseInt(process.env["AR_TTL_MINUTES"] || "1440", 10); // 24 hours default
  AR_MAX_DOMAINS = parseInt(process.env["AR_MAX_DOMAINS"] || "50", 10);

  if (AR_MAX_HISTORY <= 0) {
    throw new Error(`AR_MAX_HISTORY must be positive, got: ${AR_MAX_HISTORY}`);
  }
  if (AR_TTL_MINUTES <= 0) {
    throw new Error(`AR_TTL_MINUTES must be positive, got: ${AR_TTL_MINUTES}`);
  }
  if (AR_MAX_DOMAINS <= 0) {
    throw new Error(`AR_MAX_DOMAINS must be positive, got: ${AR_MAX_DOMAINS}`);
  }
}

// Environment configuration will be validated during server instantiation

// Types
interface DomainElement {
  id: string;
  name: string;
  type: "entity" | "attribute" | "relation" | "process";
  description: string;
}

interface AnalogicalMapping {
  id?: string;
  sourceElement: string; // ID of source domain element
  targetElement: string; // ID of target domain element
  mappingStrength: number; // 0.0-1.0
  justification: string;
  limitations?: string[];
}

interface AnalogicalReasoningData {
  // Core analogy components
  sourceDomain: {
    name: string;
    elements: DomainElement[];
  };
  targetDomain: {
    name: string;
    elements: DomainElement[];
  };
  mappings: AnalogicalMapping[];

  // Analogy metadata
  analogyId: string;
  purpose: "explanation" | "prediction" | "problem-solving" | "creative-generation";
  confidence: number; // 0.0-1.0
  iteration: number;

  // Evaluation
  strengths: string[];
  limitations: string[];
  inferences: Array<{
    statement: string;
    confidence: number;
    basedOnMappings: string[]; // IDs of mappings supporting this inference
  }>;

  // Next steps
  nextOperationNeeded: boolean;
  suggestedOperations?: Array<
    "add-mapping" | "revise-mapping" | "draw-inference" | "evaluate-limitation" | "try-new-source"
  >;
}

/**
 * Timestamped wrapper for analogy history entries with LRU tracking.
 * Enables efficient eviction based on both age and access patterns.
 */
interface TimestampedAnalogicalData {
  data: AnalogicalReasoningData;
  createdAt: number; // Unix timestamp in milliseconds
  lastAccessedAt: number; // Unix timestamp for LRU eviction
}

/**
 * Timestamped domain registry entry with last-seen tracking.
 * Supports TTL-based cleanup and capacity management.
 */
interface TimestampedDomain {
  name: string;
  elements: DomainElement[];
  lastSeenAt: number; // Unix timestamp in milliseconds
}

// Type guard for DomainElement type
const allowedElementTypes = ["entity", "attribute", "relation", "process"] as const;
type DomainElementType = (typeof allowedElementTypes)[number];

function isValidElementType(type: unknown): type is DomainElementType {
  return typeof type === "string" && allowedElementTypes.includes(type as DomainElementType);
}

export class AnalogicalReasoningServer {
  private analogyHistory: Record<string, TimestampedAnalogicalData[]> = {};
  private domainRegistry: Record<string, TimestampedDomain> = {};
  private nextElementId = 1;
  private readonly cleanupLock = new Set<string>(); // Thread-safe cleanup coordination

  /**
   * Initialize analogical reasoning server and start periodic cleanup.
   * Validates environment configuration and sets up automatic cleanup processes.
   */
  constructor() {
    // Validate environment configuration during instantiation
    validateEnvironmentConfig();
    // Start periodic cleanup every 5 minutes
    setInterval(() => this.performPeriodicCleanup(), 5 * 60 * 1000);
  }

  /**
   * Public getter for testing access to analogy history.
   * @returns The current analogy history with timestamps
   */
  public getAnalogicalHistory(): Record<string, TimestampedAnalogicalData[]> {
    return this.analogyHistory;
  }

  /**
   * Public getter for testing access to domain registry.
   * @returns The current domain registry with timestamps
   */
  public getDomainRegistry(): Record<string, TimestampedDomain> {
    return this.domainRegistry;
  }

  /**
   * Public method for testing periodic cleanup functionality.
   * Triggers cleanup of expired entries based on TTL.
   */
  public triggerPeriodicCleanup(): void {
    this.performPeriodicCleanup();
  }

  /**
   * Thread-safe periodic cleanup of expired entries.
   * Removes entries older than AR_TTL_MINUTES from both history and domains.
   */
  private performPeriodicCleanup(): void {
    const now = Date.now();
    const ttlMs = AR_TTL_MINUTES * 60 * 1000;
    const cutoffTime = now - ttlMs;

    // Cleanup analogy history
    for (const analogyId of Object.keys(this.analogyHistory)) {
      if (this.cleanupLock.has(analogyId)) continue;

      this.cleanupLock.add(analogyId);
      try {
        const entries = this.analogyHistory[analogyId];
        if (!entries) continue;

        const validEntries = entries.filter((entry) => entry.createdAt > cutoffTime);

        if (validEntries.length === 0) {
          delete this.analogyHistory[analogyId];
        } else if (validEntries.length !== entries.length) {
          this.analogyHistory[analogyId] = validEntries;
        }
      } finally {
        this.cleanupLock.delete(analogyId);
      }
    }

    // Cleanup domain registry
    for (const [domainName, domain] of Object.entries(this.domainRegistry)) {
      if (domain.lastSeenAt < cutoffTime) {
        delete this.domainRegistry[domainName];
      }
    }
  }

  /**
   * Evicts oldest entries from analogy history when exceeding AR_MAX_HISTORY limit.
   * Implements LRU eviction by sorting on lastAccessedAt timestamp.
   */
  private evictOldestHistoryEntries(analogyId: string): void {
    const entries = this.analogyHistory[analogyId];
    if (!entries || entries.length <= AR_MAX_HISTORY) return;

    // Sort by lastAccessedAt (oldest first) and keep only the most recent AR_MAX_HISTORY entries
    entries.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
    this.analogyHistory[analogyId] = entries.slice(0, AR_MAX_HISTORY);
  }

  /**
   * Evicts least recently used domains when exceeding AR_MAX_DOMAINS limit.
   * Maintains domain registry size within configured bounds.
   */
  private evictOldestDomains(): void {
    const domainNames = Object.keys(this.domainRegistry);
    if (domainNames.length <= AR_MAX_DOMAINS) return;

    // Sort domains by lastSeenAt (oldest first)
    const sortedDomains = domainNames
      .map((name) => ({ name, lastSeenAt: this.domainRegistry[name]?.lastSeenAt || 0 }))
      .sort((a, b) => a.lastSeenAt - b.lastSeenAt);

    // Remove oldest domains to get back to limit
    const domainsToRemove = sortedDomains.slice(0, domainNames.length - AR_MAX_DOMAINS);
    for (const domain of domainsToRemove) {
      delete this.domainRegistry[domain.name];
    }
  }

  private validateAnalogicalReasoningData(input: unknown): AnalogicalReasoningData {
    const data = input as Record<string, unknown>;

    // Validate required fields
    if (!data["analogyId"] || typeof data["analogyId"] !== "string") {
      throw new Error("Invalid analogyId: must be a string");
    }

    const allowedPurpose = ["explanation", "prediction", "problem-solving", "creative-generation"] as const;
    if (
      !data["purpose"] ||
      typeof data["purpose"] !== "string" ||
      !allowedPurpose.includes(data["purpose"] as (typeof allowedPurpose)[number])
    ) {
      throw new Error(`Invalid purpose: must be one of ${allowedPurpose.join(", ")}`);
    }

    if (typeof data["confidence"] !== "number" || data["confidence"] < 0 || data["confidence"] > 1) {
      throw new Error("Invalid confidence: must be a number between 0 and 1");
    }

    if (typeof data["iteration"] !== "number" || !Number.isInteger(data["iteration"]) || data["iteration"] < 0) {
      throw new Error("Invalid iteration: iteration must be an integer");
    }

    if (typeof data["nextOperationNeeded"] !== "boolean") {
      throw new Error("Invalid nextOperationNeeded: must be a boolean");
    }

    // Validate domains
    const sourceDomain = data["sourceDomain"] as Record<string, unknown>;
    const targetDomain = data["targetDomain"] as Record<string, unknown>;

    if (!sourceDomain || typeof sourceDomain !== "object") {
      throw new Error("Invalid sourceDomain: must be an object");
    }

    if (!targetDomain || typeof targetDomain !== "object") {
      throw new Error("Invalid targetDomain: must be an object");
    }

    if (!sourceDomain["name"] || typeof sourceDomain["name"] !== "string") {
      throw new Error("Invalid sourceDomain.name: must be a string");
    }

    if (!targetDomain["name"] || typeof targetDomain["name"] !== "string") {
      throw new Error("Invalid targetDomain.name: must be a string");
    }

    if (!Array.isArray(sourceDomain["elements"])) {
      throw new Error("Invalid sourceDomain.elements: must be an array");
    }

    if (!Array.isArray(targetDomain["elements"])) {
      throw new Error("Invalid targetDomain.elements: must be an array");
    }

    // Validate elements
    const sourceElements: DomainElement[] = [];
    for (const element of sourceDomain["elements"] as Array<Record<string, unknown>>) {
      // Derive the ID locally rather than mutating the input object
      const id = typeof element["id"] === "string" ? element["id"] : `elem-${this.nextElementId++}`;

      if (!element["name"] || typeof element["name"] !== "string") {
        throw new Error(`Invalid element name for element ${element["id"]}: must be a string`);
      }

      if (!element["type"] || typeof element["type"] !== "string") {
        throw new Error(`Invalid element type for element ${element["id"]}: must be a string`);
      }

      if (!isValidElementType(element["type"])) {
        throw new Error(
          `Invalid element type for element ${element["id"]}: must be one of ${allowedElementTypes.join(", ")}`
        );
      }

      if (!element["description"] || typeof element["description"] !== "string") {
        throw new Error(`Invalid element description for element ${element["id"]}: must be a string`);
      }

      sourceElements.push({
        id,
        name: element["name"] as string,
        type: element["type"],
        description: element["description"] as string
      });
    }

    const targetElements: DomainElement[] = [];
    for (const element of targetDomain["elements"] as Array<Record<string, unknown>>) {
      const id = typeof element["id"] === "string" ? element["id"] : `elem-${this.nextElementId++}`;

      if (!element["name"] || typeof element["name"] !== "string") {
        throw new Error(`Invalid element name for element ${element["id"]}: must be a string`);
      }

      if (!element["type"] || typeof element["type"] !== "string") {
        throw new Error(`Invalid element type for element ${element["id"]}: must be a string`);
      }

      if (!isValidElementType(element["type"])) {
        throw new Error(
          `Invalid element type for element ${element["id"]}: must be one of ${allowedElementTypes.join(", ")}`
        );
      }

      if (!element["description"] || typeof element["description"] !== "string") {
        throw new Error(`Invalid element description for element ${element["id"]}: must be a string`);
      }

      targetElements.push({
        id,
        name: element["name"] as string,
        type: element["type"],
        description: element["description"] as string
      });
    }

    // Validate mappings - must be present and must be an array
    if (!data["mappings"]) {
      throw new Error("Invalid mappings: mappings field is required");
    }
    if (!Array.isArray(data["mappings"])) {
      throw new Error("Invalid mappings: must be an array");
    }

    const mappings: AnalogicalMapping[] = [];
    // Ensure mappings only reference known element IDs
    const sourceIds = new Set(sourceElements.map((e) => e.id));
    const targetIds = new Set(targetElements.map((e) => e.id));

    for (const mapping of data["mappings"] as Array<Record<string, unknown>>) {
      if (!mapping["sourceElement"] || typeof mapping["sourceElement"] !== "string") {
        throw new Error("Invalid mapping sourceElement: must be a string");
      }
      if (!mapping["targetElement"] || typeof mapping["targetElement"] !== "string") {
        throw new Error("Invalid mapping targetElement: must be a string");
      }
      if (!sourceIds.has(mapping["sourceElement"] as string)) {
        throw new Error(`Mapping references unknown sourceElement id: ${mapping["sourceElement"] as string}`);
      }
      if (!targetIds.has(mapping["targetElement"] as string)) {
        throw new Error(`Mapping references unknown targetElement id: ${mapping["targetElement"] as string}`);
      }

      if (
        typeof mapping["mappingStrength"] !== "number" ||
        mapping["mappingStrength"] < 0 ||
        mapping["mappingStrength"] > 1
      ) {
        throw new Error("Invalid mappingStrength: must be a number between 0 and 1");
      }

      if (!mapping["justification"] || typeof mapping["justification"] !== "string") {
        throw new Error("Invalid mapping justification: must be a string");
      }

      const mappingData: AnalogicalMapping = {
        sourceElement: mapping["sourceElement"] as string,
        targetElement: mapping["targetElement"] as string,
        mappingStrength: mapping["mappingStrength"] as number,
        justification: mapping["justification"] as string
      };
      if (Array.isArray(mapping["limitations"]) && (mapping["limitations"] as unknown[]).length > 0) {
        mappingData.limitations = mapping["limitations"] as string[];
      }
      mappings.push(mappingData);
    }

    const validated: AnalogicalReasoningData = {
      sourceDomain: {
        name: sourceDomain["name"] as string,
        elements: sourceElements
      },
      targetDomain: {
        name: targetDomain["name"] as string,
        elements: targetElements
      },
      mappings,
      analogyId: data["analogyId"] as string,
      purpose: data["purpose"] as AnalogicalReasoningData["purpose"],
      confidence: data["confidence"] as number,
      iteration: data["iteration"] as number,
      strengths: Array.isArray(data["strengths"]) ? (data["strengths"] as string[]) : [],
      limitations: Array.isArray(data["limitations"]) ? (data["limitations"] as string[]) : [],
      inferences: Array.isArray(data["inferences"])
        ? (data["inferences"] as Array<Record<string, unknown>>).map((inf, i) => {
            if (typeof inf["statement"] !== "string" || inf["statement"].length === 0) {
              throw new Error(`Invalid inferences[${i}].statement: must be a non-empty string`);
            }
            if (typeof inf["confidence"] !== "number" || inf["confidence"] < 0 || inf["confidence"] > 1) {
              throw new Error(`Invalid inferences[${i}].confidence: must be a number between 0 and 1`);
            }
            if (!Array.isArray(inf["basedOnMappings"]) || inf["basedOnMappings"].some((v) => typeof v !== "string")) {
              throw new Error(`Invalid inferences[${i}].basedOnMappings: must be string[]`);
            }
            return {
              statement: inf["statement"],
              confidence: inf["confidence"],
              basedOnMappings: inf["basedOnMappings"] as string[]
            };
          })
        : [],
      nextOperationNeeded: data["nextOperationNeeded"] as boolean
    };
    if (Array.isArray(data["suggestedOperations"])) {
      validated.suggestedOperations = data["suggestedOperations"] as Array<
        "add-mapping" | "revise-mapping" | "draw-inference" | "evaluate-limitation" | "try-new-source"
      >;
    }
    return validated;
  }

  /**
   * Merge provided domain's elements into the registry, deduplicating by id.
   */
  private updateDomainRegistry(domain: { name: string; elements: DomainElement[] }): void {
    const now = Date.now();
    let existing = this.domainRegistry[domain.name];
    if (!existing) {
      existing = this.domainRegistry[domain.name] = {
        name: domain.name,
        elements: [],
        lastSeenAt: now
      };
    } else {
      existing.lastSeenAt = now;
    }

    const existingIds = new Set(existing.elements.map((e) => e.id));

    for (const element of domain.elements) {
      if (!existingIds.has(element.id)) {
        existing.elements.push(element);
        existingIds.add(element.id);
      }
    }

    // Evict old domains if we exceed the limit
    this.evictOldestDomains();
  }

  private updateAnalogicalReasoning(data: AnalogicalReasoningData): void {
    const now = Date.now();
    let historyEntry = this.analogyHistory[data.analogyId];
    if (!historyEntry) {
      historyEntry = [];
      this.analogyHistory[data.analogyId] = historyEntry;
    }

    // Create timestamped entry
    const timestampedData: TimestampedAnalogicalData = {
      data,
      createdAt: now,
      lastAccessedAt: now
    };

    historyEntry.push(timestampedData);

    // Evict old entries if we exceed the limit
    this.evictOldestHistoryEntries(data.analogyId);

    // Update domain registry
    this.updateDomainRegistry(data.sourceDomain);
    this.updateDomainRegistry(data.targetDomain);
  }

  private visualizeMapping(data: AnalogicalReasoningData): string {
    const { sourceDomain, targetDomain, mappings } = data;

    let output = `\n${chalk.bold(`ANALOGY: ${sourceDomain.name} → ${targetDomain.name}`)} (ID: ${data.analogyId})\n\n`;

    // Purpose and confidence
    output += `${chalk.cyan("Purpose:")} ${data.purpose}\n`;
    output += `${chalk.cyan("Confidence:")} ${(data.confidence * 100).toFixed(0)}%\n`;
    output += `${chalk.cyan("Iteration:")} ${data.iteration}\n\n`;

    // Create mapping visualization
    output += `${chalk.bold("STRUCTURAL MAPPINGS:")}\n\n`;

    const mappingsBySourceType = new Map<string, AnalogicalMapping[]>();
    const srcById = new Map<string, DomainElement>(sourceDomain.elements.map((e) => [e.id, e]));
    const tgtById = new Map<string, DomainElement>(targetDomain.elements.map((e) => [e.id, e]));

    for (const mapping of mappings) {
      const sourceElement = srcById.get(mapping.sourceElement);
      if (!sourceElement) continue;

      if (!mappingsBySourceType.has(sourceElement.type)) {
        mappingsBySourceType.set(sourceElement.type, []);
      }

      mappingsBySourceType.get(sourceElement.type)?.push(mapping);
    }

    // Display mappings grouped by element type
    for (const [type, typeMappings] of mappingsBySourceType.entries()) {
      output += `${chalk.yellow(type.toUpperCase())} MAPPINGS:\n`;

      for (const mapping of typeMappings) {
        const sourceElement = srcById.get(mapping.sourceElement);
        const targetElement = tgtById.get(mapping.targetElement);

        if (!sourceElement || !targetElement) continue;

        // Color-code based on mapping strength
        let strengthIndicator: string;
        if (mapping.mappingStrength >= 0.8) {
          strengthIndicator = chalk.green("STRONG");
        } else if (mapping.mappingStrength >= 0.5) {
          strengthIndicator = chalk.yellow("MODERATE");
        } else {
          strengthIndicator = chalk.red("WEAK");
        }

        output += `  ${chalk.bold(sourceElement.name)} ====[ ${strengthIndicator} ]===> ${chalk.bold(targetElement.name)}\n`;
        output += `    ${chalk.dim("Justification:")} ${mapping.justification}\n`;

        if (mapping.limitations && mapping.limitations.length > 0) {
          output += `    ${chalk.dim("Limitations:")} ${mapping.limitations.join(", ")}\n`;
        }

        output += "\n";
      }
    }

    // Show unmapped elements
    const mappedSourceIds = new Set(mappings.map((m) => m.sourceElement));
    const mappedTargetIds = new Set(mappings.map((m) => m.targetElement));

    const unmappedSourceElements = sourceDomain.elements.filter((e) => !mappedSourceIds.has(e.id));
    const unmappedTargetElements = targetDomain.elements.filter((e) => !mappedTargetIds.has(e.id));

    if (unmappedSourceElements.length > 0) {
      output += `${chalk.red("UNMAPPED SOURCE ELEMENTS:")}\n`;
      for (const element of unmappedSourceElements) {
        output += `  - ${element.name} (${element.type}): ${element.description}\n`;
      }
      output += "\n";
    }

    if (unmappedTargetElements.length > 0) {
      output += `${chalk.red("UNMAPPED TARGET ELEMENTS:")}\n`;
      for (const element of unmappedTargetElements) {
        output += `  - ${element.name} (${element.type}): ${element.description}\n`;
      }
      output += "\n";
    }

    // Show inferences
    if (data.inferences.length > 0) {
      output += `${chalk.bold("INFERENCES:")}\n`;
      for (const inference of data.inferences) {
        const confidenceIndicator = inference.confidence >= 0.7 ? "" : "?";
        output += `  ${confidenceIndicator} ${inference.statement}\n`;
        output += `    ${chalk.dim(`Confidence: ${(inference.confidence * 100).toFixed(0)}%`)}\n`;
        output += "\n";
      }
    }

    // Show strengths and limitations
    if (data.strengths.length > 0) {
      output += `${chalk.green("STRENGTHS:")}\n`;
      for (const strength of data.strengths) {
        output += `  + ${strength}\n`;
      }
      output += "\n";
    }

    if (data.limitations.length > 0) {
      output += `${chalk.red("LIMITATIONS:")}\n`;
      for (const limitation of data.limitations) {
        output += `  - ${limitation}\n`;
      }
      output += "\n";
    }

    // Next steps
    if (data.nextOperationNeeded) {
      output += `${chalk.blue("SUGGESTED NEXT OPERATIONS:")}\n`;
      const operations = data.suggestedOperations || [];
      if (operations.length > 0) {
        for (const operation of operations) {
          output += `   ${operation}\n`;
        }
      } else {
        output += `   Continue refining the analogy\n`;
      }
    }

    return output;
  }

  private createLocalSamplingSummary(data: AnalogicalReasoningData): string {
    const totalMappings = data.mappings.length;
    const strongMappings = data.mappings.filter((m) => m.mappingStrength >= 0.8).length;
    const moderateMappings = data.mappings.filter((m) => m.mappingStrength >= 0.5 && m.mappingStrength < 0.8).length;
    const weakMappings = totalMappings - strongMappings - moderateMappings;

    const topInferences = [...data.inferences]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map((inf) => `- ${inf.statement} (${Math.round(inf.confidence * 100)}%)`)
      .join("\n");

    const strengths = (data.strengths || [])
      .slice(0, 2)
      .map((s) => `+ ${s}`)
      .join("\n");
    const limitations = (data.limitations || [])
      .slice(0, 2)
      .map((l) => `- ${l}`)
      .join("\n");

    return [
      `Analogy ${data.sourceDomain.name} → ${data.targetDomain.name} (id: ${data.analogyId}).`,
      `Mappings: ${totalMappings} (strong: ${strongMappings}, moderate: ${moderateMappings}, weak: ${weakMappings}).`,
      topInferences ? `Top inferences:\n${topInferences}` : undefined,
      strengths ? `Strengths:\n${strengths}` : undefined,
      limitations ? `Limitations:\n${limitations}` : undefined
    ]
      .filter(Boolean)
      .join("\n");
  }

  public async processAnalogicalReasoning(
    input: unknown
  ): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
    try {
      const validatedInput = this.validateAnalogicalReasoningData(input);

      // Update analogy state
      this.updateAnalogicalReasoning(validatedInput);

      // Generate visualization
      const visualization = this.visualizeMapping(validatedInput);
      if (!process.env["AR_SILENT"]) {
        console.error("[analogical-reasoning]", visualization);
      }

      let samplingSummary: string | undefined;
      try {
        // Fallback local summary instead of calling a non-existent server method.
        samplingSummary = this.createLocalSamplingSummary(validatedInput);
      } catch (e) {
        if (!process.env["AR_SILENT"]) {
          console.error("[analogical-reasoning] Sampling failed", e);
        }
      }

      // Return the analysis result (include visualization for clients)
      return {
        content: [
          { type: "text", text: visualization },
          {
            type: "text",
            text: JSON.stringify(
              {
                analogyId: validatedInput.analogyId,
                purpose: validatedInput.purpose,
                iteration: validatedInput.iteration,
                sourceDomain: validatedInput.sourceDomain.name,
                targetDomain: validatedInput.targetDomain.name,
                mappingCount: validatedInput.mappings.length,
                inferenceCount: validatedInput.inferences.length,
                nextOperationNeeded: validatedInput.nextOperationNeeded,
                suggestedOperations: validatedInput.suggestedOperations,
                samplingSummary
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

// Create an MCP server
const server = new Server(
  {
    name: "example",
    version: "0.0.1"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Tool[] = [
    {
      name: "analogicalReasoning",
      description: "Analyze and visualize analogical mappings between domains.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          sourceDomain: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              elements: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    type: { type: "string", enum: ["entity", "attribute", "relation", "process"] },
                    description: { type: "string" }
                  },
                  required: ["id", "name", "type", "description"]
                }
              }
            },
            required: ["name", "elements"]
          },
          targetDomain: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              elements: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    type: { type: "string", enum: ["entity", "attribute", "relation", "process"] },
                    description: { type: "string" }
                  },
                  required: ["id", "name", "type", "description"]
                }
              }
            },
            required: ["name", "elements"]
          },
          mappings: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                sourceElement: { type: "string" },
                targetElement: { type: "string" },
                mappingStrength: { type: "number", minimum: 0, maximum: 1 },
                justification: { type: "string" },
                limitations: { type: "array", items: { type: "string" } }
              },
              required: ["sourceElement", "targetElement", "mappingStrength", "justification"]
            }
          },
          analogyId: { type: "string" },
          purpose: { type: "string", enum: ["explanation", "prediction", "problem-solving", "creative-generation"] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          iteration: { type: "integer", minimum: 0 },
          strengths: { type: "array", items: { type: "string" } },
          limitations: { type: "array", items: { type: "string" } },
          inferences: {
            type: "array",
            items: {
              type: "object",
              properties: {
                statement: { type: "string" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                basedOnMappings: { type: "array", items: { type: "string" } }
              },
              required: ["statement", "confidence", "basedOnMappings"]
            }
          },
          nextOperationNeeded: { type: "boolean" },
          suggestedOperations: {
            type: "array",
            items: {
              type: "string",
              enum: ["add-mapping", "revise-mapping", "draw-inference", "evaluate-limitation", "try-new-source"]
            }
          }
        },
        required: [
          "sourceDomain",
          "targetDomain",
          "mappings",
          "analogyId",
          "purpose",
          "confidence",
          "iteration",
          "nextOperationNeeded"
        ]
      }
    }
  ];

  return {
    tools
  };
});

const analogicalReasoningServer = new AnalogicalReasoningServer();

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  if (request.params.name === "analogicalReasoning") {
    return await analogicalReasoningServer.processAnalogicalReasoning(request.params.arguments);
  }

  return {
    content: [{ type: "text", text: "Unknown tool" }],
    isError: true
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);

import chalk from "chalk";
import {
  AnalogicalMapping,
  AnalogicalReasoningData,
  DomainElement,
  allowedElementTypes,
  isValidElementType
} from "./types.js";

/**
 * AI Tool Designation: Analogical Reasoning Manager
 *
 * Purpose:
 * Manages the state, validation, and visualization of analogical reasoning processes.
 * It facilitates the mapping of concepts between source and target domains, inference generation,
 * and structural alignment evaluation.
 *
 * Limitations:
 * - State Management: Uses in-memory storage for analogy history and domain registry. State is lost upon server restart.
 * - ID Generation: Uses a simple sequential integer counter for element IDs, which is not persistent.
 *
 * Operational Workflow:
 * 1. Input Validation: Validates raw input against the AnalogicalReasoningData schema using the `validate` method.
 * 2. State Updates: Updates the internal analogy history and domain registry with the `update` method.
 * 3. Visualization: Generates human-readable, color-coded ANSI output for the analogy using the `visualize` method.
 */
export class AnalogicalReasoningManager {
  private analogyHistory: Record<string, AnalogicalReasoningData[]> = {};
  private domainRegistry: Record<
    string,
    {
      name: string;
      elements: DomainElement[];
    }
  > = {};
  private nextElementId = 1;

  /**
   * Validates raw input data against the AnalogicalReasoningData schema.
   *
   * Purpose:
   * Ensures that the input object conforms to the required structure, types, and constraints
   * for analogical reasoning data processing. It performs deep validation of domains, elements,
   * mappings, and metadata.
   *
   * @param input - The raw input data to validate. Can be any unknown type.
   *
   * @returns {AnalogicalReasoningData} The validated and strictly typed AnalogicalReasoningData object.
   *
   * @throws {Error} If `analogyId` is missing or not a string.
   * @throws {Error} If `purpose` is invalid or not one of the allowed values.
   * @throws {Error} If `confidence` is not a number between 0 and 1.
   * @throws {Error} If `iteration` is not a non-negative number.
   * @throws {Error} If `sourceDomain` or `targetDomain` structure is invalid.
   * @throws {Error} If any element has an invalid name, type, or description.
   * @throws {Error} If any mapping references non-existent elements or has invalid strength.
   * @throws {Error} If inference confidence is out of range.
   */
  public validate(input: unknown): AnalogicalReasoningData {
    const data = input as Record<string, unknown>;

    // Validate required fields
    if (!data.analogyId || typeof data.analogyId !== "string") {
      throw new Error("Invalid analogyId: must be a string");
    }

    if (
      typeof data.purpose !== "string" ||
      !["explanation", "prediction", "problem-solving", "creative-generation"].includes(data.purpose)
    ) {
      throw new Error(
        "Invalid purpose: must be one of explanation | prediction | problem-solving | creative-generation"
      );
    }

    if (typeof data.confidence !== "number" || data.confidence < 0 || data.confidence > 1) {
      throw new Error("Invalid confidence: must be a number between 0 and 1");
    }

    if (typeof data.iteration !== "number" || data.iteration < 0) {
      throw new Error("Invalid iteration: must be a non-negative number");
    }

    if (typeof data.nextOperationNeeded !== "boolean") {
      throw new Error("Invalid nextOperationNeeded: must be a boolean");
    }

    // Validate domains
    const sourceDomain = data.sourceDomain as Record<string, unknown>;
    const targetDomain = data.targetDomain as Record<string, unknown>;

    if (!sourceDomain || typeof sourceDomain !== "object") {
      throw new Error("Invalid sourceDomain: must be an object");
    }

    if (!targetDomain || typeof targetDomain !== "object") {
      throw new Error("Invalid targetDomain: must be an object");
    }

    if (!sourceDomain.name || typeof sourceDomain.name !== "string") {
      throw new Error("Invalid sourceDomain.name: must be a string");
    }

    if (!targetDomain.name || typeof targetDomain.name !== "string") {
      throw new Error("Invalid targetDomain.name: must be a string");
    }

    if (!Array.isArray(sourceDomain.elements)) {
      throw new Error("Invalid sourceDomain.elements: must be an array");
    }

    if (!Array.isArray(targetDomain.elements)) {
      throw new Error("Invalid targetDomain.elements: must be an array");
    }

    // Validate elements
    const sourceElements: DomainElement[] = [];
    for (const element of sourceDomain.elements as Array<Record<string, unknown>>) {
      if (!element.id || typeof element.id !== "string") {
        element.id = `elem-${this.nextElementId++}`;
      }

      if (!element.name || typeof element.name !== "string") {
        throw new Error(`Invalid element name for element ${element.id}: must be a string`);
      }

      if (!element.type || typeof element.type !== "string") {
        throw new Error(`Invalid element type for element ${element.id}: must be a string`);
      }

      if (!isValidElementType(element.type)) {
        throw new Error(
          `Invalid element type for element ${element.id}: must be one of ${allowedElementTypes.join(", ")}`
        );
      }

      if (!element.description || typeof element.description !== "string") {
        throw new Error(`Invalid element description for element ${element.id}: must be a string`);
      }

      sourceElements.push({
        id: element.id as string,
        name: element.name as string,
        type: element.type,
        description: element.description as string
      });
    }

    const targetElements: DomainElement[] = [];
    for (const element of targetDomain.elements as Array<Record<string, unknown>>) {
      if (!element.id || typeof element.id !== "string") {
        element.id = `elem-${this.nextElementId++}`;
      }

      if (!element.name || typeof element.name !== "string") {
        throw new Error(`Invalid element name for element ${element.id}: must be a string`);
      }

      if (!element.type || typeof element.type !== "string") {
        throw new Error(`Invalid element type for element ${element.id}: must be a string`);
      }

      if (!isValidElementType(element.type)) {
        throw new Error(
          `Invalid element type for element ${element.id}: must be one of ${allowedElementTypes.join(", ")}`
        );
      }

      if (!element.description || typeof element.description !== "string") {
        throw new Error(`Invalid element description for element ${element.id}: must be a string`);
      }

      targetElements.push({
        id: element.id as string,
        name: element.name as string,
        type: element.type,
        description: element.description as string
      });
    }

    // Validate mappings
    const mappings: AnalogicalMapping[] = [];
    if (Array.isArray(data.mappings)) {
      for (const mapping of data.mappings as Array<Record<string, unknown>>) {
        if (!mapping.sourceElement || typeof mapping.sourceElement !== "string") {
          throw new Error("Invalid mapping sourceElement: must be a string");
        }

        if (!mapping.targetElement || typeof mapping.targetElement !== "string") {
          throw new Error("Invalid mapping targetElement: must be a string");
        }

        if (typeof mapping.mappingStrength !== "number" || mapping.mappingStrength < 0 || mapping.mappingStrength > 1) {
          throw new Error("Invalid mappingStrength: must be a number between 0 and 1");
        }

        if (!mapping.justification || typeof mapping.justification !== "string") {
          throw new Error("Invalid mapping justification: must be a string");
        }

        const limitations: string[] = [];
        if (mapping.limitations && Array.isArray(mapping.limitations)) {
          for (const limitation of mapping.limitations) {
            if (typeof limitation === "string") {
              limitations.push(limitation);
            }
          }
        }

        const mappingData: AnalogicalMapping = {
          sourceElement: mapping.sourceElement as string,
          targetElement: mapping.targetElement as string,
          mappingStrength: mapping.mappingStrength as number,
          justification: mapping.justification as string
          // limitations is added conditionally below
        };
        if (limitations.length > 0) {
          mappingData.limitations = limitations;
        }
        mappings.push(mappingData);
      }
    }

    // Validate arrays
    const strengths: string[] = [];
    if (Array.isArray(data.strengths)) {
      for (const strength of data.strengths) {
        if (typeof strength === "string") {
          strengths.push(strength);
        }
      }
    }

    const limitations: string[] = [];
    if (Array.isArray(data.limitations)) {
      for (const limitation of data.limitations) {
        if (typeof limitation === "string") {
          limitations.push(limitation);
        }
      }
    }

    const inferences: AnalogicalReasoningData["inferences"] = [];
    if (Array.isArray(data.inferences)) {
      for (const inference of data.inferences as Array<Record<string, unknown>>) {
        if (!inference.statement || typeof inference.statement !== "string") {
          throw new Error("Invalid inference statement: must be a string");
        }

        if (typeof inference.confidence !== "number" || inference.confidence < 0 || inference.confidence > 1) {
          throw new Error("Invalid inference confidence: must be a number between 0 and 1");
        }

        if (!Array.isArray(inference.basedOnMappings)) {
          throw new Error("Invalid inference basedOnMappings: must be an array of mapping IDs");
        }

        const basedOnMappings: string[] = [];
        for (const mappingId of inference.basedOnMappings) {
          if (typeof mappingId === "string") {
            basedOnMappings.push(mappingId);
          }
        }

        inferences.push({
          statement: inference.statement as string,
          confidence: inference.confidence as number,
          basedOnMappings
        });
      }
    }

    const suggestedOperations: AnalogicalReasoningData["suggestedOperations"] = [];
    if (Array.isArray(data.suggestedOperations)) {
      for (const operation of data.suggestedOperations) {
        if (
          typeof operation === "string" &&
          ["add-mapping", "revise-mapping", "draw-inference", "evaluate-limitation", "try-new-source"].includes(
            operation
          )
        ) {
          suggestedOperations.push(
            operation as "add-mapping" | "revise-mapping" | "draw-inference" | "evaluate-limitation" | "try-new-source"
          );
        }
      }
    }

    // Create validated data object with conditional suggestedOperations
    const validatedData: AnalogicalReasoningData = {
      sourceDomain: {
        name: sourceDomain.name as string,
        elements: sourceElements
      },
      targetDomain: {
        name: targetDomain.name as string,
        elements: targetElements
      },
      mappings,
      analogyId: data.analogyId as string,
      purpose: data.purpose as AnalogicalReasoningData["purpose"],
      confidence: data.confidence as number,
      iteration: data.iteration as number,
      strengths,
      limitations,
      inferences,
      nextOperationNeeded: data.nextOperationNeeded as boolean
      // suggestedOperations is added conditionally below
    };

    if (suggestedOperations.length > 0) {
      validatedData.suggestedOperations = suggestedOperations;
    }

    return validatedData;
  }

  private updateDomainRegistry(domain: { name: string; elements: DomainElement[] }): void {
    this.domainRegistry[domain.name] = {
      name: domain.name,
      elements: [...domain.elements]
    };
  }

  public update(data: AnalogicalReasoningData): void {
    let historyEntry = this.analogyHistory[data.analogyId]; // Get potential entry
    if (!historyEntry) {
      // Check if it exists
      historyEntry = []; // Create new array if not
      this.analogyHistory[data.analogyId] = historyEntry; // Assign it back to the object
    }
    // Now, historyEntry is guaranteed to be AnalogicalReasoningData[]
    historyEntry.push(data);

    // Update domain registry
    this.updateDomainRegistry(data.sourceDomain);
    this.updateDomainRegistry(data.targetDomain);
  }

  /**
   * Generates a visualization string for the analogical reasoning data.
   *
   * Purpose:
   * Creates a formatted, ANSI-colored string representation of the analogy for terminal output.
   * It highlights structural mappings, strength indicators, unmapped elements, and inferences
   * using the `chalk` library to improve readability and user understanding.
   *
   * @param data - The AnalogicalReasoningData object to visualize.
   *
   * @returns {string} A string containing the formatted visualization with ANSI escape codes.
   *
   * @sideEffects
   * - None (this method returns a string and does not log to console directly, though the result is intended for console output).
   */
  public visualize(data: AnalogicalReasoningData): string {
    const { sourceDomain, targetDomain, mappings } = data;

    let output = `\n${chalk.bold(`ANALOGY: ${sourceDomain.name} → ${targetDomain.name}`)} (ID: ${data.analogyId})\n\n`;

    // Purpose and confidence
    output += `${chalk.cyan("Purpose:")} ${data.purpose}\n`;
    output += `${chalk.cyan("Confidence:")} ${(data.confidence * 100).toFixed(0)}%\n`;
    output += `${chalk.cyan("Iteration:")} ${data.iteration}\n\n`;

    // Create mapping visualization
    output += `${chalk.bold("STRUCTURAL MAPPINGS:")}\n\n`;

    const mappingsBySourceType = new Map<string, AnalogicalMapping[]>();

    for (const mapping of mappings) {
      const sourceElement = sourceDomain.elements.find((e) => e.id === mapping.sourceElement);
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
        const sourceElement = sourceDomain.elements.find((e) => e.id === mapping.sourceElement);
        const targetElement = targetDomain.elements.find((e) => e.id === mapping.targetElement);

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

        output += `  ${chalk.bold(sourceElement.name)} ====[ ${strengthIndicator} ]===> ${chalk.bold(
          targetElement.name
        )}\n`;
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
        const confidenceIndicator = inference.confidence >= 0.7 ? "★" : "?";
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
          output += `  - ${operation}\n`;
        }
      } else {
        output += `  - Continue refining the analogy\n`;
      }
    }

    return output;
  }

  public process(input: unknown): AnalogicalReasoningData {
    const validatedInput = this.validate(input);
    this.update(validatedInput);
    return validatedInput;
  }
}

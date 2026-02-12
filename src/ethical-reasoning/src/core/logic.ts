import chalk from "chalk";
import { EthicalRequestData, FrameworkType, frameworks, EthicalAnalysisResult } from "./types.js";

/**
 * Core logic for ethical reasoning analysis.
 */
export class EthicalAnalyzer {
  private history: EthicalRequestData[] = [];

  public validateData(input: unknown): EthicalRequestData {  
    if (input === null || input === undefined) {  
      throw new Error("null is not an object");  
    }  
    const data = input as Record<string, unknown>;  

    if (!data.scenario || typeof data.scenario !== "string") {
      throw new Error("Invalid scenario: must be a string");
    }
    if (!data.action || typeof data.action !== "string") {
      throw new Error("Invalid action: must be a string");
    }
    if (!Array.isArray(data.frameworks) || data.frameworks.length === 0) {
      throw new Error("Invalid frameworks: must be a non-empty array");
    }
    const parsedFrameworks: FrameworkType[] = [];
    for (const f of data.frameworks) {
      if (typeof f !== "string" || !frameworks.includes(f as FrameworkType)) {
        throw new Error(`Unsupported framework: ${String(f)}`);
      }
      parsedFrameworks.push(f as FrameworkType);
    }
    if (typeof data.confidence !== "number" || data.confidence < 0 || data.confidence > 1) {
      throw new Error("Invalid confidence: must be between 0 and 1");
    }
    if (typeof data.nextStepNeeded !== "boolean") {
      throw new Error("Invalid nextStepNeeded: must be boolean");
    }

    const validated: EthicalRequestData = {
      scenario: data.scenario,
      action: data.action,
      frameworks: parsedFrameworks,
      confidence: data.confidence,
      nextStepNeeded: data.nextStepNeeded
    };

    if (Array.isArray(data.suggestedNext)) {
      validated.suggestedNext = (data.suggestedNext as unknown[]).filter(
        (f) => typeof f === "string" && frameworks.includes(f as FrameworkType)
      ) as FrameworkType[];
    }

    return validated;
  }

  private frameworkGuidance(framework: FrameworkType, scenario: string, action: string): string {
    switch (framework) {
      case "utilitarianism":
        return `Consider total expected benefits and harms of performing "${action}" in the scenario. Weigh overall happiness versus suffering for all stakeholders.`;
      case "deontology":
        return `Identify the relevant duties, rights, or rules that apply to this action. Would performing "${action}" respect those duties regardless of outcomes?`;
      case "virtue":
        return `Examine what virtues or vices the action "${action}" expresses in this situation. Would a virtuous agent act this way?`;
      case "care":
        return `Assess how relationships and responsibilities of care are affected. Does "${action}" nurture or damage important connections?`;
      case "social-contract":
        return `Evaluate whether the action "${action}" aligns with fair principles that rational agents would agree to under equal conditions.`;
      default:
        return "Unknown framework";
    }
  }

  public async analyze(input: unknown): Promise<EthicalAnalysisResult> {
    const data = this.validateData(input);
    this.history.push(data);
    
    const verbose = process.env.MCP_VERBOSE === "1";
    if (verbose) {
      console.error(chalk.bold("Scenario:") + " " + data.scenario);
      console.error(chalk.bold("Action:") + " " + data.action);
      console.error("");
    }

    // Simulate async processing (e.g. for future external API calls)
    await Promise.resolve();

    const guidanceByFramework: Record<FrameworkType, string> = {} as Record<FrameworkType, string>;
    for (const f of data.frameworks) {
      const guidance = this.frameworkGuidance(f, data.scenario, data.action);
      guidanceByFramework[f] = guidance;
      if (verbose) {
        const header = chalk.cyan(`[${f}]`);
        console.error(header + " " + guidance);
      }
    }
    if (verbose) console.error("");

    return {
      requestNumber: this.history.length,
      frameworks: data.frameworks,
      guidance: guidanceByFramework,
      confidence: data.confidence,
      nextStepNeeded: data.nextStepNeeded,
      suggestedNext: data.suggestedNext || []
    };
  }
}

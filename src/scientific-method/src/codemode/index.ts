import { ScientificMethodCore } from "../core/ScientificMethod.js";
import { ScientificInquiryData } from "../core/types.js";

/**
 * Code Mode API for the Scientific Method MCP server.
 * This class provides a programmatic interface to the scientific method workflow.
 */
export class ScientificMethodCodeMode {
  private core: ScientificMethodCore;

  constructor() {
    this.core = new ScientificMethodCore();
  }

  /**
   * Processes a scientific inquiry step.
   *
   * @param input - The input data for the inquiry step.
   * @returns The validated and processed scientific inquiry data.
   */
  public async processInquiry(input: unknown): Promise<ScientificInquiryData> {
    return this.core.processScientificInquiry(input);
  }

  /**
   * Generates a text visualization of the scientific inquiry data.
   *
   * @param data - The scientific inquiry data to visualize.
   * @returns A formatted string representation of the data.
   */
  public visualize(data: ScientificInquiryData): string {
    return this.core.visualizeScientificInquiry(data);
  }
}

export * from "../core/types.js";

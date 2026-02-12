import { NarrativeInput, NarrativeOutline } from "../core/types.js";
import { planNarrative, validateNarrativeInput } from "../core/logic.js";

export class NarrativePlanner {
  /**
   * Generates a simple three-act story outline based on the input.
   * @param input The narrative parameters (premise, characters, arcs).
   * @returns The structured narrative outline.
   */
  public planNarrative(input: NarrativeInput): NarrativeOutline {
    const validated = validateNarrativeInput(input);
    return planNarrative(validated);
  }

  /**
   * Batch processes multiple narrative plans.
   * @param inputs Array of narrative inputs.
   * @returns Array of narrative outlines.
   */
  public planNarratives(inputs: NarrativeInput[]): NarrativeOutline[] {
    return inputs.map((input) => this.planNarrative(input));
  }
}

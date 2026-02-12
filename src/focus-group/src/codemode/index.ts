import { FocusGroupLogic } from "../core/logic.js";
import { FocusGroupVisualizer } from "../core/visualizer.js";
import { FocusGroupData } from "../core/types.js";

export class FocusGroupServer {
  private logic: FocusGroupLogic;
  private visualizer: FocusGroupVisualizer;

  constructor() {
    this.logic = new FocusGroupLogic();
    this.visualizer = new FocusGroupVisualizer();
  }

  /**
   * Process a focus group session.
   * Validates input, updates history, selects next persona, and visualizes the result.
   * 
   * @param input The raw input data (usually from LLM tool call)
   * @returns The updated FocusGroupData object
   */
  public processFocusGroup(input: unknown): FocusGroupData {
    // Process logic (validate, update history, select next persona)
    const result = this.logic.process(input);

    // Generate and log visualization (side effect)
    const visualization = this.visualizer.visualize(result);
    console.error(visualization);

    return result;
  }
}

export * from "../core/types.js";

import { FocusGroupData, FocusGroupPersona, Feedback, FocusAreaAnalysis } from "./types.js";

export class FocusGroupLogic {
  private personaRegistry: Record<string, Record<string, FocusGroupPersona>> = {};
  private feedbackHistory: Record<string, Feedback[]> = {};
  private focusAreaTracker: Record<string, FocusAreaAnalysis[]> = {};
  private sessionHistory: Record<string, FocusGroupData[]> = {};
  private sessionOrder: string[] = [];
  private readonly maxSessions = Number(process.env.FOCUS_MAX_SESSIONS ?? "100");

  public validateFocusGroupData(input: unknown): FocusGroupData {
    const data = input as Record<string, unknown>;

    // Validate required fields
    if (!data.targetServer || typeof data.targetServer !== "string") {
      throw new Error("Invalid targetServer: must be a string");
    }

    if (!Array.isArray(data.personas)) {
      throw new Error("Invalid personas: must be an array");
    }

    if (!Array.isArray(data.feedback)) {
      throw new Error("Invalid feedback: must be an array");
    }

    if (!data.stage || typeof data.stage !== "string") {
      throw new Error("Invalid stage: must be a string");
    }

    if (!data.activePersonaId || typeof data.activePersonaId !== "string") {
      throw new Error("Invalid activePersonaId: must be a string");
    }

    if (!data.sessionId || typeof data.sessionId !== "string") {
      throw new Error("Invalid sessionId: must be a string");
    }

    if (typeof data.iteration !== "number" || data.iteration < 0) {
      throw new Error("Invalid iteration: must be a non-negative number");
    }

    if (typeof data.nextFeedbackNeeded !== "boolean") {
      throw new Error("Invalid nextFeedbackNeeded: must be a boolean");
    }

    // TODO: Add detailed validation for personas, feedback, and focusAreaAnalyses
    // similar to the collaborative-reasoning server

    // For now, return the data with minimal validation
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
      // Only add new feedback
      const exists = this.feedbackHistory[sessionId].some(
        (f) => f.personaId === feedback.personaId && f.content === feedback.content
      );

      if (!exists) {
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

  /**
   * Append new focus-group data to the session’s history,
   * and evict oldest sessions when the total exceeds maxSessions.
   */
  private updateSessionHistory(data: FocusGroupData): void {
    let historyEntry = this.sessionHistory[data.sessionId];
    if (!historyEntry) {
      historyEntry = [];
      this.sessionHistory[data.sessionId] = historyEntry;
      this.sessionOrder.push(data.sessionId);
      // Evict oldest session if over limit
      if (this.sessionOrder.length > this.maxSessions) {
        const evict = this.sessionOrder.shift()!;
        delete this.sessionHistory[evict];
        delete this.personaRegistry[evict];
        delete this.feedbackHistory[evict];
        delete this.focusAreaTracker[evict];
      }
    }

    historyEntry.push(data);
    this.updateRegistries(data);
  }

  public selectNextPersona(data: FocusGroupData): string {
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

    return personaIds[nextIndex];
  }

  public process(input: unknown): FocusGroupData {
    const validatedInput = this.validateFocusGroupData(input);

    // Update the next persona if not specified
    if (!validatedInput.nextPersonaId && validatedInput.nextFeedbackNeeded) {
      validatedInput.nextPersonaId = this.selectNextPersona(validatedInput);
    }

    // Update session state
    this.updateSessionHistory(validatedInput);

    return validatedInput;
  }
}

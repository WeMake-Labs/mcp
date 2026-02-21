import { FocusGroupData, FocusGroupPersona, Feedback, FocusAreaAnalysis } from "./types.js";

export class FocusGroupLogic {
  private personaRegistry: Record<string, Record<string, FocusGroupPersona>> = {};
  private feedbackHistory: Record<string, Feedback[]> = {};
  private focusAreaTracker: Record<string, FocusAreaAnalysis[]> = {};
  private sessionHistory: Record<string, FocusGroupData[]> = {};
  private sessionOrder: string[] = [];
  private readonly maxSessions = Number(process.env.FOCUS_MAX_SESSIONS ?? "100");

  /**
   * Validates the Focus Group data structure.
   * Ensures all required fields are present and valid according to the schema.
   *
   * Validation Criteria:
   * - Personas: Must have unique IDs and all required fields (name, userType, etc.).
   * - Feedback: Must reference existing persona IDs, have valid types, and severity between 0.0-1.0.
   * - Focus Area Analyses: Must have valid structure and reference existing persona IDs.
   * - Stage: Must be one of the predefined stage enums.
   * - Active Persona: Must exist in the personas list.
   *
   * Limitations:
   * - Does not validate the semantic content of strings (e.g., if a scenario is realistic).
   * - Does not validate referenceIds in feedback against the feedback history (stateless validation).
   *
   * @param input - The raw input object to validate.
   * @returns The validated FocusGroupData object.
   * @throws Error if any validation rule is violated.
   */
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

    // Validate Personas
    const personaIds = new Set<string>();
    for (const persona of data.personas) {
      if (!persona.id || typeof persona.id !== "string") {
        throw new Error("Invalid persona: missing or invalid 'id'");
      }
      if (personaIds.has(persona.id)) {
        throw new Error(`Invalid persona: duplicate id '${persona.id}'`);
      }
      personaIds.add(persona.id);

      if (!persona.name || typeof persona.name !== "string") {
        throw new Error(`Invalid persona '${persona.id}': missing or invalid 'name'`);
      }
      if (!persona.userType || typeof persona.userType !== "string") {
        throw new Error(`Invalid persona '${persona.id}': missing or invalid 'userType'`);
      }
      if (!persona.usageScenario || typeof persona.usageScenario !== "string") {
        throw new Error(`Invalid persona '${persona.id}': missing or invalid 'usageScenario'`);
      }
      if (
        !persona.communication ||
        typeof persona.communication.style !== "string" ||
        typeof persona.communication.tone !== "string"
      ) {
        throw new Error(`Invalid persona '${persona.id}': missing or invalid 'communication'`);
      }
    }

    // Validate Feedback
    const validFeedbackTypes = ["praise", "confusion", "suggestion", "usability", "feature", "bug", "summary"];
    for (const feedback of data.feedback) {
      if (!feedback.personaId || !personaIds.has(feedback.personaId)) {
        throw new Error(`Invalid feedback: unknown personaId '${feedback.personaId}'`);
      }
      if (!feedback.content || typeof feedback.content !== "string") {
        throw new Error("Invalid feedback: missing or invalid 'content'");
      }
      if (!validFeedbackTypes.includes(feedback.type)) {
        throw new Error(`Invalid feedback type: '${feedback.type}'. Must be one of: ${validFeedbackTypes.join(", ")}`);
      }
      if (typeof feedback.severity !== "number" || feedback.severity < 0 || feedback.severity > 1) {
        throw new Error("Invalid feedback severity: must be a number between 0.0 and 1.0");
      }
    }

    // Validate Focus Area Analyses
    if (data.focusAreaAnalyses) {
      if (!Array.isArray(data.focusAreaAnalyses)) {
        throw new Error("Invalid focusAreaAnalyses: must be an array");
      }
      for (const analysis of data.focusAreaAnalyses) {
        if (!analysis.area || typeof analysis.area !== "string") {
          throw new Error("Invalid focusAreaAnalysis: missing or invalid 'area'");
        }
        if (!Array.isArray(analysis.findings)) {
          throw new Error(`Invalid focusAreaAnalysis '${analysis.area}': findings must be an array`);
        }
        for (const finding of analysis.findings) {
          if (!finding.personaId || !personaIds.has(finding.personaId)) {
            throw new Error(`Invalid finding in area '${analysis.area}': unknown personaId '${finding.personaId}'`);
          }
          if (!finding.finding || typeof finding.finding !== "string") {
            throw new Error(`Invalid finding in area '${analysis.area}': missing or invalid 'finding' description`);
          }
        }
      }
    }

    // Validate Stage
    const validStages = [
      "introduction",
      "initial-impressions",
      "deep-dive",
      "synthesis",
      "recommendations",
      "prioritization"
    ];
    if (!validStages.includes(data.stage)) {
      throw new Error(`Invalid stage: '${data.stage}'. Must be one of: ${validStages.join(", ")}`);
    }

    // Ensure activePersonaId exists
    if (!personaIds.has(data.activePersonaId)) {
      throw new Error(`Invalid activePersonaId: '${data.activePersonaId}' does not match any known persona`);
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

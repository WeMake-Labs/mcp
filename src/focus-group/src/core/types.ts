export interface FocusGroupPersona {
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

export interface Feedback {
  personaId: string;
  content: string;
  type: "praise" | "confusion" | "suggestion" | "usability" | "feature" | "bug" | "summary";
  targetComponent?: string; // which aspect of the server this feedback relates to
  severity: number; // 0.0-1.0, how important this feedback is
  referenceIds?: string[]; // IDs of previous feedback this builds upon
}

export interface FocusAreaAnalysis {
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

export interface FocusGroupData {
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

export interface FocusGroupResult {
  sessionId: string;
  targetServer: string;
  stage: string;
  iteration: number;
  personaCount: number;
  feedbackCount: number;
  focusAreaCount: number;
  activePersonaId: string;
  nextPersonaId?: string;
  nextFeedbackNeeded: boolean;
  suggestedFeedbackTypes?: string[];
  suggestedFocusArea?: string;
}

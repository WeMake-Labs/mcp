
// Supported frameworks
export const frameworks = Object.freeze(["utilitarianism", "deontology", "virtue", "care", "social-contract"] as const);

export type FrameworkType = (typeof frameworks)[number];

export interface EthicalRequestData {
  scenario: string;
  action: string;
  frameworks: FrameworkType[];
  confidence: number; // 0.0-1.0
  nextStepNeeded: boolean;
  suggestedNext?: FrameworkType[];
}

export interface EthicalAnalysisResult {
  requestNumber: number;
  frameworks: FrameworkType[];
  guidance: Record<FrameworkType, string>;
  confidence: number;
  nextStepNeeded: boolean;
  suggestedNext: FrameworkType[];
}

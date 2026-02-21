export const allowedElementTypes = ["entity", "attribute", "relation", "process"] as const;
export type DomainElementType = (typeof allowedElementTypes)[number];

export function isValidElementType(type: unknown): type is DomainElementType {
  return typeof type === "string" && allowedElementTypes.includes(type as DomainElementType);
}

export interface DomainElement {
  id: string;
  name: string;
  type: DomainElementType;
  description: string;
}

export interface AnalogicalMapping {
  sourceElement: string; // ID of source domain element
  targetElement: string; // ID of target domain element
  mappingStrength: number; // 0.0-1.0
  justification: string;
  limitations?: string[];
}

export interface AnalogicalReasoningData {
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

export interface VisualElement {
  id: string;
  type: "node" | "edge" | "container" | "annotation";
  label?: string;
  properties: Record<string, unknown>; // Position, size, color, etc.
  // For edges
  source?: string; // ID of source element
  target?: string; // ID of target element
  // For containers
  contains?: string[]; // IDs of contained elements
}

export interface VisualOperationData {
  // Operation details
  operation: "create" | "update" | "delete" | "transform" | "observe";
  elements?: VisualElement[];
  transformationType?: "rotate" | "move" | "resize" | "recolor" | "regroup";

  // Visual diagram metadata
  diagramId: string;
  diagramType: "graph" | "flowchart" | "stateDiagram" | "conceptMap" | "treeDiagram" | "custom";
  iteration: number;

  // Reasoning about the diagram
  observation?: string;
  insight?: string;
  hypothesis?: string;

  // Next steps
  nextOperationNeeded: boolean;
}

export interface VisualReasoningResult {
  diagramId: string;
  diagramType: string;
  iteration: number;
  operation: string;
  elementCount: number;
  historyLength: number;
  nextOperationNeeded: boolean;
  asciiDiagram: string;
  observation?: string;
  insight?: string;
  hypothesis?: string;
}

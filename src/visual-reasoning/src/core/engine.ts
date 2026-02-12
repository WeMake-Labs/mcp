import chalk from "chalk";
import { VisualElement, VisualOperationData, VisualReasoningResult } from "./types.js";

function isTransformationType(value: unknown): value is NonNullable<VisualOperationData["transformationType"]> {
  return typeof value === "string" && ["rotate", "move", "resize", "recolor", "regroup"].includes(value);
}

/**
 * Core engine for visual reasoning functionality.
 *
 * This class provides the core logic for visual reasoning operations including
 * element manipulation, transformation tracking, and visual state management.
 * It validates input operations, processes visual reasoning requests, and maintains
 * state across multiple visual reasoning sessions.
 */
export class VisualReasoningEngine {
  private visualStateHistory: Record<string, VisualOperationData[]> = {};
  private currentVisualState: Record<string, Record<string, VisualElement>> = {};
  private nextElementId = 1;

  private validateOperationData(input: unknown): VisualOperationData {
    if (!input || typeof input !== "object") {
      throw new Error("Invalid operation: input must be an object");
    }

    const data = input as Record<string, unknown>;

    if (!data.operation || typeof data.operation !== "string") {
      throw new Error("Invalid operation: must be a string");
    }

    if (!data.diagramId || typeof data.diagramId !== "string") {
      throw new Error("Invalid diagramId: must be a string");
    }

    if (!data.diagramType || typeof data.diagramType !== "string") {
      throw new Error("Invalid diagramType: must be a string");
    }

    if (typeof data.iteration !== "number" || data.iteration < 0) {
      throw new Error("Invalid iteration: must be a non-negative number");
    }

    if (typeof data.nextOperationNeeded !== "boolean") {
      throw new Error("Invalid nextOperationNeeded: must be a boolean");
    }

    // Validate transformationType
    if (data.operation === "transform" && !data.transformationType) {
      throw new Error("Missing required property: transformationType");
    }

    // Validate elements if provided
    const validatedElements: VisualElement[] = [];
    if (data.elements && Array.isArray(data.elements)) {
      for (const element of data.elements) {
        if (!element.id) {
          element.id = `elem-${this.nextElementId++}`;
        }

        if (!element.type || typeof element.type !== "string") {
          throw new Error(`Invalid element type for element ${element.id}: must be a string`);
        }

        if (!["node", "edge", "container", "annotation"].includes(element.type)) {
          throw new Error(`Invalid element type for element ${element.id}: ${element.type}`);
        }

        if (!element.properties || typeof element.properties !== "object") {
          element.properties = {};
        }

        validatedElements.push(element as VisualElement);
      }
    }

    // Base object with non-optional properties
    const validatedData: Omit<VisualOperationData, "transformationType" | "elements" | "observation" | "insight"> &
      Partial<Pick<VisualOperationData, "transformationType" | "elements" | "observation" | "insight">> = {
      operation: data.operation as VisualOperationData["operation"],
      diagramId: data.diagramId as string,
      diagramType: data.diagramType as VisualOperationData["diagramType"],
      iteration: data.iteration as number,
      nextOperationNeeded: typeof data.nextOperationNeeded === "boolean" ? data.nextOperationNeeded : true
    };

    // Conditionally add optional properties
    if (isTransformationType(data.transformationType)) {
      validatedData.transformationType = data.transformationType;
    }
    if (data.observation) {
      validatedData.observation = data.observation as string;
    }
    if (data.insight) {
      validatedData.insight = data.insight as string;
    }
    if (data.hypothesis) {
      validatedData.hypothesis = data.hypothesis as string;
    }
    if (validatedElements.length > 0) {
      validatedData.elements = validatedElements;
    }

    return validatedData as VisualOperationData;
  }

  private updateVisualState(operation: VisualOperationData): void {
    const { diagramId, elements, operation: operationType } = operation;

    // Initialize diagram state if it doesn't exist
    if (!this.visualStateHistory[diagramId]) {
      this.visualStateHistory[diagramId] = [];
    }

    if (!this.currentVisualState[diagramId]) {
      this.currentVisualState[diagramId] = {};
    }

    // Add operation to history
    this.visualStateHistory[diagramId].push(operation);

    // Update current state based on operation type
    if (elements) {
      switch (operationType) {
        case "create":
          for (const element of elements) {
            this.currentVisualState[diagramId][element.id] = element;
          }
          break;

        case "update":
          for (const element of elements) {
            if (this.currentVisualState[diagramId][element.id]) {
              this.currentVisualState[diagramId][element.id] = {
                ...this.currentVisualState[diagramId][element.id],
                ...element
              };
            }
          }
          break;

        case "delete":
          for (const element of elements) {
            delete this.currentVisualState[diagramId][element.id];
          }
          break;

        case "transform":
          // Handled by specific transformation logic
          break;

        case "observe":
          // No state change for observations
          break;
      }
    }

    // Handle transformations
    if (operationType === "transform" && operation.transformationType && elements) {
      for (const element of elements) {
        const targetElement = this.currentVisualState[diagramId][element.id];

        if (!targetElement) continue;

        switch (operation.transformationType) {
          case "move":
            if (element.properties.x !== undefined) targetElement.properties.x = element.properties.x;
            if (element.properties.y !== undefined) targetElement.properties.y = element.properties.y;
            break;

          case "resize":
            if (element.properties.width !== undefined) targetElement.properties.width = element.properties.width;
            if (element.properties.height !== undefined) targetElement.properties.height = element.properties.height;
            break;

          case "recolor":
            if (element.properties.color !== undefined) targetElement.properties.color = element.properties.color;
            break;

          case "rotate":
            if (element.properties.rotation !== undefined)
              targetElement.properties.rotation = element.properties.rotation;
            break;

          case "regroup":
            if (element.contains !== undefined && targetElement.type === "container") {
              targetElement.contains = element.contains;
            }
            break;
        }
      }
    }
  }

  private renderAsciiDiagram(diagramId: string, diagramType: string): string {
    const elements = Object.values(this.currentVisualState[diagramId] || {});

    if (elements.length === 0) {
      return "Empty diagram";
    }

    let output = `\n${chalk.bold(diagramType.toUpperCase())} DIAGRAM ${chalk.cyan(diagramId)}\n\n`;

    // Simple ASCII art rendering based on diagram type
    switch (diagramType) {
      case "graph": {
        // First render nodes
        const nodes = elements.filter((e) => e.type === "node");
        output += `${chalk.blue("NODES:")}\n`;
        for (const node of nodes) {
          const label = node.label || node.id;
          output += `  [${node.id}] ${label}\n`;
        }
        output += "\n";

        // Then render edges
        const edges = elements.filter((e) => e.type === "edge");
        if (edges.length > 0) {
          output += `${chalk.green("EDGES:")}\n`;
          for (const edge of edges) {
            const label = edge.label ? ` (${edge.label})` : "";
            output += `  ${edge.source} ----${label}----> ${edge.target}\n`;
          }
          output += "\n";
        }
        break;
      }

      case "flowchart": {
        const nodes = elements.filter((e) => e.type === "node");
        const edges = elements.filter((e) => e.type === "edge");

        // Simple flowchart rendering
        output += `${chalk.blue("FLOWCHART:")}\n\n`;

        // Create node map for quick lookup when rendering edges
        const nodeMap = new Map<string, VisualElement>();
        for (const node of nodes) {
          nodeMap.set(node.id, node);
        }

        // Build a directed graph representation
        const graph = new Map<string, Array<{ target: string; label?: string }>>();
        for (const edge of edges) {
          if (!edge.source || !edge.target) continue;

          if (!graph.has(edge.source)) {
            graph.set(edge.source, []);
          }
          // Conditionally add label to the pushed object
          const edgeTargetObject: { target: string; label?: string } = { target: edge.target };
          if (edge.label && typeof edge.label === "string") {
            edgeTargetObject.label = edge.label;
          }
          graph.get(edge.source)?.push(edgeTargetObject);
        }

        // Render flowchart using graph
        const visited = new Set<string>();
        const renderNode = (nodeId: string, indent = 0): void => {
          if (visited.has(nodeId)) return;
          visited.add(nodeId);

          const node = nodeMap.get(nodeId);
          if (!node) return;

          const label = node.label || node.id;
          const indentation = " ".repeat(indent * 2);
          output += `${indentation}[${node.id}] ${label}\n`;

          if (graph.has(nodeId)) {
            const connections = graph.get(nodeId) || [];
            for (const conn of connections) {
              const edgeLabel = conn.label ? ` (${conn.label})` : "";
              output += `${indentation}  |\n`;
              output += `${indentation}  ▼${edgeLabel}\n`;
              renderNode(conn.target, indent + 1);
            }
          }
        };

        // Start rendering from nodes with no incoming edges
        const hasIncomingEdge = new Set<string>();
        for (const edge of edges) {
          if (edge.target) hasIncomingEdge.add(edge.target);
        }

        const startNodes = nodes.filter((node) => !hasIncomingEdge.has(node.id));
        for (const node of startNodes) {
          renderNode(node.id);
          output += "\n";
        }
        break;
      }

      case "conceptMap": {
        // Render a concept map with central concepts and related ideas
        const nodes = elements.filter((e) => e.type === "node");
        const edges = elements.filter((e) => e.type === "edge");

        output += `${chalk.blue("CONCEPT MAP:")}\n\n`;

        // Group by relationship
        const relationships = new Map<string, Array<{ source: string; target: string; label?: string }>>();

        for (const edge of edges) {
          if (!edge.source || !edge.target) continue;

          const relationType = edge.label || "related to";

          if (!relationships.has(relationType)) {
            relationships.set(relationType, []);
          }

          const relationData: { source: string; target: string; label?: string } = {
            source: edge.source,
            target: edge.target
          };

          if (typeof edge.properties === "object" && edge.properties !== null && "description" in edge.properties) {
            relationData.label = String(edge.properties.description);
          }

          relationships.get(relationType)?.push(relationData);
        }

        // Render concept map by relationship type
        for (const [relationType, relations] of relationships.entries()) {
          output += `${chalk.yellow(relationType.toUpperCase())}:\n`;

          for (const relation of relations) {
            const sourceNode = nodes.find((n) => n.id === relation.source);
            const targetNode = nodes.find((n) => n.id === relation.target);

            if (!sourceNode || !targetNode) continue;

            const sourceLabel = sourceNode.label || sourceNode.id;
            const targetLabel = targetNode.label || targetNode.id;
            const description = relation.label ? ` (${relation.label})` : "";

            output += `  ${sourceLabel} ---> ${targetLabel}${description}\n`;
          }
          output += "\n";
        }
        break;
      }

      default: {
        // Generic element listing for other diagram types
        const nodesByType = new Map<string, VisualElement[]>();

        for (const element of elements) {
          if (!nodesByType.has(element.type)) {
            nodesByType.set(element.type, []);
          }
          nodesByType.get(element.type)?.push(element);
        }

        for (const [type, elementsOfType] of nodesByType.entries()) {
          output += `${chalk.yellow(type.toUpperCase())}:\n`;

          for (const element of elementsOfType) {
            const label = element.label || element.id;
            const properties = Object.entries(element.properties)
              .map(([key, value]) => `${key}=${value}`)
              .join(", ");

            output += `  [${element.id}] ${label} (${properties})\n`;
          }
          output += "\n";
        }
        break;
      }
    }

    return output;
  }

  /**
   * Processes visual reasoning operation requests.
   *
   * @param input - The input object containing visual operation data
   * @returns Structured result containing visual operation analysis
   * @throws {Error} If input validation fails or processing encounters an error
   */
  public processVisualOperation(input: unknown): VisualReasoningResult {
    const validatedInput = this.validateOperationData(input);

    // Update visual state based on operation
    this.updateVisualState(validatedInput);

    // Render the current visual state
    const asciiDiagram = this.renderAsciiDiagram(validatedInput.diagramId, validatedInput.diagramType);

    // Return the operation result
    const result: VisualReasoningResult = {
      diagramId: validatedInput.diagramId,
      diagramType: validatedInput.diagramType,
      iteration: validatedInput.iteration,
      operation: validatedInput.operation,
      elementCount: Object.keys(this.currentVisualState[validatedInput.diagramId] || {}).length,
      historyLength: (this.visualStateHistory[validatedInput.diagramId] || []).length,
      nextOperationNeeded: validatedInput.nextOperationNeeded,
      asciiDiagram
    };

    if (validatedInput.observation) {
      result.observation = validatedInput.observation;
    }
    if (validatedInput.insight) {
      result.insight = validatedInput.insight;
    }
    if (validatedInput.hypothesis) {
      result.hypothesis = validatedInput.hypothesis;
    }

    return result;
  }
}

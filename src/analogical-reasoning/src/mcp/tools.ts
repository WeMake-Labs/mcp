import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const AnalogicalReasoningSchema = z.object({
  sourceDomain: z.object({
    name: z.string(),
    elements: z.array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        type: z.enum(["entity", "attribute", "relation", "process"]),
        description: z.string()
      })
    )
  }),
  targetDomain: z.object({
    name: z.string(),
    elements: z.array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        type: z.enum(["entity", "attribute", "relation", "process"]),
        description: z.string()
      })
    )
  }),
  mappings: z.array(
    z.object({
      sourceElement: z.string(),
      targetElement: z.string(),
      mappingStrength: z.number().min(0).max(1),
      justification: z.string(),
      limitations: z.array(z.string()).optional()
    })
  ),
  analogyId: z.string(),
  purpose: z.enum(["explanation", "prediction", "problem-solving", "creative-generation"]),
  confidence: z.number().min(0).max(1),
  iteration: z.number().int().min(0),
  strengths: z.array(z.string()),
  limitations: z.array(z.string()),
  inferences: z.array(
    z.object({
      statement: z.string(),
      confidence: z.number().min(0).max(1),
      basedOnMappings: z.array(z.string())
    })
  ),
  nextOperationNeeded: z.boolean(),
  suggestedOperations: z
    .array(z.enum(["add-mapping", "revise-mapping", "draw-inference", "evaluate-limitation", "try-new-source"]))
    .optional()
});

export const ANALOGICAL_REASONING_TOOL = {
  name: "analogicalReasoning",
  title: "Analogical Reasoning",
  description: `A detailed tool for analogical thinking between source and target domains.
This tool helps models structure analogies systematically to improve understanding and reasoning.
It facilitates explicit mapping between domains, inference generation, and analogy evaluation.

Use this tool to:
- Map concepts between familiar and unfamiliar domains
- Draw insights through structural alignment
- Generate predictions based on analogical transfer
- Solve problems by applying known solutions to new contexts`,
  inputSchema: zodToJsonSchema(AnalogicalReasoningSchema) as Record<string, unknown>
};

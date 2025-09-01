# Analogical Reasoning MCP Server

## Motivation

Analogical thinking is a powerful cognitive tool that humans use to understand new concepts by relating them to familiar
ones. While language models can use analogies, they often:

1. Apply analogies inconsistently or abandon them partway through analysis
2. Fail to explicitly map structural relationships between source and target domains
3. Overextend analogies beyond their useful boundaries
4. Miss opportunities to leverage analogical transfer for problem-solving
5. Struggle to evaluate the quality and limitations of different analogies

The Analogical Reasoning Server addresses these limitations by providing a structured framework for constructing,
mapping, and evaluating analogies. By externalizing analogical thinking, models can leverage this powerful cognitive
tool more systematically and effectively.

## Technical Specification

### Tool Interface

```typescript
interface DomainElement {
  id: string;
  name: string;
  type: "entity" | "attribute" | "relation" | "process";
  description: string;
}

interface AnalogicalMapping {
  sourceElement: string; // ID of source domain element
  targetElement: string; // ID of target domain element
  mappingStrength: number; // 0.0-1.0
  justification: string;
  limitations?: string[];
}

interface AnalogicalReasoningData {
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
```

#### Zod schema definitions (1:1 with the TypeScript interfaces above)

```ts
import { z } from "zod";

/**
 * DomainElementSchema matches the DomainElement interface.
 * - type is constrained to the explicit enum of domain element categories
 */
export const DomainElementSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["entity", "attribute", "relation", "process"]),
  description: z.string()
});

/**
 * AnalogicalMappingSchema matches AnalogicalMapping.
 * - mappingStrength is validated in [0.0, 1.0]
 * - limitations is optional array of strings
 */
export const AnalogicalMappingSchema = z.object({
  sourceElement: z.string(),
  targetElement: z.string(),
  mappingStrength: z.number().min(0).max(1),
  justification: z.string(),
  limitations: z.array(z.string()).optional()
});

/**
 * InferenceSchema for items in the `inferences` array on AnalogicalReasoningData.
 * - confidence is validated in [0.0, 1.0]
 */
export const InferenceSchema = z.object({
  statement: z.string(),
  confidence: z.number().min(0).max(1),
  basedOnMappings: z.array(z.string())
});

/**
 * DomainSchema for sourceDomain and targetDomain.
 */
export const DomainSchema = z.object({
  name: z.string(),
  elements: z.array(DomainElementSchema)
});

/**
 * AnalogicalReasoningDataSchema is the top-level schema.
 * - purpose is constrained to the explicit enum
 * - confidence is validated in [0.0, 1.0]
 * - iteration must be an integer
 * - arrays are validated for correct item types
 * - nextOperationNeeded is required
 * - suggestedOperations is optional and constrained to the explicit enum
 */
export const AnalogicalReasoningDataSchema = z.object({
  // Core analogy components
  sourceDomain: DomainSchema,
  targetDomain: DomainSchema,
  mappings: z.array(AnalogicalMappingSchema),

  // Analogy metadata
  analogyId: z.string(),
  purpose: z.enum(["explanation", "prediction", "problem-solving", "creative-generation"]),
  confidence: z.number().min(0).max(1),
  iteration: z.number().int(),

  // Evaluation
  strengths: z.array(z.string()),
  limitations: z.array(z.string()),
  inferences: z.array(InferenceSchema),

  // Next steps
  nextOperationNeeded: z.boolean(),
  suggestedOperations: z
    .array(z.enum(["add-mapping", "revise-mapping", "draw-inference", "evaluate-limitation", "try-new-source"]))
    .optional()
});
```

#### Generated JSON Schema (from the Zod definition)

The following JSON Schema corresponds to AnalogicalReasoningDataSchema above. You can embed it directly in tools that
require JSON Schema.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://wemake.cx/schemas/analogical-reasoning-data.json",
  "title": "AnalogicalReasoningData",
  "type": "object",
  "required": [
    "sourceDomain",
    "targetDomain",
    "mappings",
    "analogyId",
    "purpose",
    "confidence",
    "iteration",
    "strengths",
    "limitations",
    "inferences",
    "nextOperationNeeded"
  ],
  "properties": {
    "sourceDomain": { "$ref": "#/$defs/Domain" },
    "targetDomain": { "$ref": "#/$defs/Domain" },
    "mappings": {
      "type": "array",
      "items": { "$ref": "#/$defs/AnalogicalMapping" }
    },
    "analogyId": { "type": "string" },
    "purpose": {
      "type": "string",
      "enum": ["explanation", "prediction", "problem-solving", "creative-generation"]
    },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "iteration": { "type": "integer" },
    "strengths": { "type": "array", "items": { "type": "string" } },
    "limitations": { "type": "array", "items": { "type": "string" } },
    "inferences": {
      "type": "array",
      "items": { "$ref": "#/$defs/Inference" }
    },
    "nextOperationNeeded": { "type": "boolean" },
    "suggestedOperations": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["add-mapping", "revise-mapping", "draw-inference", "evaluate-limitation", "try-new-source"]
      }
    }
  },
  "$defs": {
    "Domain": {
      "type": "object",
      "required": ["name", "elements"],
      "properties": {
        "name": { "type": "string" },
        "elements": {
          "type": "array",
          "items": { "$ref": "#/$defs/DomainElement" }
        }
      },
      "additionalProperties": false
    },
    "DomainElement": {
      "type": "object",
      "required": ["id", "name", "type", "description"],
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "type": {
          "type": "string",
          "enum": ["entity", "attribute", "relation", "process"]
        },
        "description": { "type": "string" }
      },
      "additionalProperties": false
    },
    "AnalogicalMapping": {
      "type": "object",
      "required": ["sourceElement", "targetElement", "mappingStrength", "justification"],
      "properties": {
        "sourceElement": { "type": "string" },
        "targetElement": { "type": "string" },
        "mappingStrength": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "justification": { "type": "string" },
        "limitations": { "type": "array", "items": { "type": "string" } }
      },
      "additionalProperties": false
    },
    "Inference": {
      "type": "object",
      "required": ["statement", "confidence", "basedOnMappings"],
      "properties": {
        "statement": { "type": "string" },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
        "basedOnMappings": { "type": "array", "items": { "type": "string" } }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

#### Usage: validating payloads and exporting JSON Schema

- Validate incoming payloads using Zod (recommended `safeParse` for robust error handling):

```ts
import { AnalogicalReasoningDataSchema } from "./schemas"; // wherever you place the schema

/**
 * Validates an arbitrary payload and returns a typed value or accumulates issues.
 */
export function validateAnalogicalReasoningPayload(payload: unknown) {
  const result = AnalogicalReasoningDataSchema.safeParse(payload);
  if (!result.success) {
    // For logs, prefer summarized issues and avoid leaking sensitive data
    const issues = result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    throw new Error(`Invalid AnalogicalReasoningData payload: ${JSON.stringify(issues)}`);
  }
  // result.data is now fully typed and validated
  return result.data;
}
```

- Export JSON Schema for external tools (optional). This uses zod-to-json-schema at build-time without adding runtime
  dependencies:

```sh
bun add -D zod zod-to-json-schema
```

```ts
import { AnalogicalReasoningDataSchema } from "./schemas";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Generates and writes the JSON Schema next to your build artifacts.
 * Uses Bun.write for zero-dependency file IO.
 */
export async function emitAnalogicalReasoningJsonSchema() {
  const jsonSchema = zodToJsonSchema(AnalogicalReasoningDataSchema, {
    name: "AnalogicalReasoningData"
  });
  await Bun.write("./dist/analogical-reasoning-data.schema.json", JSON.stringify(jsonSchema, null, 2));
}
```

- Example runtime validation in a request handler:

```ts
import { AnalogicalReasoningDataSchema } from "./schemas";

export async function handleRequest(req: Request): Promise<Response> {
  try {
    const payload = await req.json();
    const data = AnalogicalReasoningDataSchema.parse(payload); // throws on invalid
    // proceed with strongly-typed, validated `data`
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Invalid payload" }), {
      status: 400
    });
  }
}
```

### Server Implementation

The server maintains:

1. An `analogyHistory` array containing all analogies and their evolution
2. A `domainRegistry` storing frequently used source domains and their elements
3. Visualization logic for displaying analogical mappings

For each analogical reasoning operation, the server:

1. Validates the operation according to analogical reasoning principles
2. Updates the appropriate analogy state
3. Visualizes the analogical mapping
4. Returns metadata about the analogy, including suggested next steps

### Process Flow

```mermaid
sequenceDiagram
    participant Model
    participant AnServer as Analogical Reasoning Server
    participant State as Analogy State

    Model->>AnServer: Define source domain
    AnServer->>State: Store source domain structure
    AnServer-->>Model: Return analogy state

    Model->>AnServer: Define target domain
    AnServer->>State: Store target domain structure
    AnServer-->>Model: Return analogy state

    Model->>AnServer: Create structural mappings
    AnServer->>State: Store mappings between domains
    AnServer-->>Model: Return analogy state with visualization

    Model->>AnServer: Draw inferences
    AnServer->>State: Store inferences based on mappings
    AnServer-->>Model: Return updated analogy state

    Model->>AnServer: Evaluate limitations
    AnServer->>State: Update with analogy limitations
    AnServer-->>Model: Return final analogy state

    Model->>AnServer: Revise mappings (optional)
    AnServer->>State: Update mappings
    AnServer-->>Model: Return revised analogy state
```

## Key Features

### 1. Explicit Domain Structuring

The server requires explicit structuring of both domains:

- **Entities**: Objects or concepts in each domain
- **Attributes**: Properties of those entities
- **Relations**: How entities relate to each other
- **Processes**: Dynamic interactions between entities

### 2. Structural Mapping

The server facilitates explicit mapping between domains:

- **Element-to-element**: Which elements correspond to each other
- **Relation-to-relation**: Preserving the structural relationships
- **Mapping strength**: Rating how well each mapping works
- **Justification**: Explanation for why the mapping is valid

### 3. Inference Generation

The server guides drawing inferences from the analogy:

- **Projection**: Transferring knowledge from source to target
- **Prediction**: Making predictions based on source domain patterns
- **Novel insights**: Identifying new perspectives on the target domain

### 4. Analogy Evaluation

Each analogy is systematically evaluated:

- **Strengths**: Where the analogy is particularly illuminating
- **Limitations**: Where the analogy breaks down
- **Confidence**: Overall assessment of analogy quality
- **Alternatives**: Considering different source domains

### 5. Visual Representation

The server provides visualization of the analogical mapping:

- Connection diagrams showing mappings between domains
- Color-coding for mapping strength
- Highlighting unmapped elements in both domains

## Usage Examples

### Complex Concept Explanation

When explaining complex technical concepts, the model can develop systematic analogies to more familiar domains, with
explicit mappings and limitations.

### Problem Solving by Analogy

For novel problems, the model can map them to familiar solved problems and transfer solution strategies.

### Creative Ideation

When generating creative ideas, the model can systematically map concepts from distant domains to generate novel
combinations.

### Scientific Modeling

For scientific concepts, the model can evaluate the strengths and limitations of different analogical models.

## Implementation Notes

The server would be implemented using TypeScript with:

- A core AnalogicalReasoningServer class
- Domain representation and visualization components
- Mapping quality evaluation algorithms
- Inference projection guidelines
- Standard MCP server connection via stdin/stdout

This server would enhance model capabilities in domains requiring creative problem-solving, explanation of complex
concepts, and transfer of knowledge between different fields or contexts.

# Analogical Reasoning MCP Server

A structured framework for constructing, mapping, and evaluating analogies to enhance systematic analogical thinking and
problem-solving.

## Core Concepts

### Domain Elements

Domain elements are the building blocks of analogical reasoning. Each element has:

- A unique identifier
- A name and type (entity, attribute, relation, process)
- A descriptive explanation

Example:

```json
{
  "id": "water_flow",
  "name": "Water Flow",
  "type": "process",
  "description": "Movement of water through pipes under pressure"
}
```

### Analogical Mappings

Mappings define correspondences between source and target domain elements. They include:

- Source and target element references
- Mapping strength (0.0-1.0)
- Justification for the mapping
- Known limitations

Example:

```json
{
  "sourceElement": "water_flow",
  "targetElement": "electric_current",
  "mappingStrength": 0.9,
  "justification": "Both involve flow of substance through conduits",
  "limitations": ["Water is visible, electricity is not"]
}
```

### Inferences

Inferences are conclusions drawn from analogical mappings. They contain:

- Statement of the inference
- Confidence level (0.0-1.0)
- Supporting mappings that justify the inference

Example:

```json
{
  "statement": "Electrical resistance is like pipe friction",
  "confidence": 0.8,
  "basedOnMappings": ["water_flow_to_current", "pipe_to_wire"]
}
```

## API

### Tools

- **analogicalReasoning**
  - Construct and evaluate analogical mappings between domains
  - Input: Comprehensive analogical reasoning data structure
    - `sourceDomain` (object): Source domain with name and elements
    - `targetDomain` (object): Target domain with name and elements
    - `mappings` (array): Analogical mappings between domains
    - `analogyId` (string): Unique identifier for the analogy
    - `purpose` (enum): "explanation" | "prediction" | "problem-solving" | "creative-generation"
    - `confidence` (number): Overall confidence in the analogy (0.0-1.0)
    - `iteration` (number): Current iteration of the analogical reasoning process
    - `strengths` (string[]): Areas where the analogy is particularly strong
    - `limitations` (string[]): Known limitations of the analogy
    - `inferences` (array): Conclusions drawn from the mappings
    - `nextOperationNeeded` (boolean): Whether further operations are required
    - `suggestedOperations` (array): Recommended next steps
  - Returns structured analogical analysis with mappings and evaluations
  - Supports iterative refinement of analogical reasoning

## Setup

### bunx

```json
{
  "mcpServers": {
    "Analogical Reasoning": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/analogical-reasoning@latest"]
    }
  }
}
```

#### bunx with custom settings

The server can be configured using the following environment variables:

```json
{
  "mcpServers": {
    "Analogical Reasoning": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/analogical-reasoning@latest"],
      "env": {
        "ANALOGY_MAX_ELEMENTS": "50",
        "ANALOGY_MIN_CONFIDENCE": "0.3"
      }
    }
  }
}
```

- `ANALOGY_MAX_ELEMENTS`: Maximum number of elements per domain (default: 20)
- `ANALOGY_MIN_CONFIDENCE`: Minimum confidence threshold for mappings (default: 0.1)

## System Prompt

The prompt for utilizing analogical reasoning should encourage systematic mapping and evaluation:

```markdown
Follow these steps for analogical reasoning:

1. Domain Definition:
   - Clearly define both source and target domains
   - Identify key entities, attributes, relations, and processes in each domain
   - Ensure domains are well-structured before proceeding

2. Systematic Mapping:
   - Create explicit mappings between corresponding elements
   - Assign mapping strength based on structural similarity
   - Provide clear justification for each mapping
   - Identify limitations where mappings break down

3. Inference Generation:
   - Draw conclusions based on established mappings
   - Assign confidence levels to inferences
   - Reference supporting mappings for each inference
   - Consider alternative interpretations

4. Evaluation and Refinement:
   - Assess overall analogy quality and limitations
   - Identify areas for improvement or alternative source domains
   - Iterate on mappings based on new insights
   - Document lessons learned for future analogical reasoning
```

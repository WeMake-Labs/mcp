# Structured Argumentation MCP Server

A Model Context Protocol server that provides systematic dialectical reasoning and argument analysis capabilities,
enabling rigorous evaluation of competing perspectives and claims.

## Overview and Purpose

The Structured Argumentation server addresses limitations in language models' ability to systematically evaluate
competing arguments and engage in rigorous dialectical reasoning. It provides tools for formal argument analysis,
tracking logical relationships, and facilitating structured debate progression.

### Core Concepts

#### Dialectical Reasoning Framework

- **Thesis-Antithesis-Synthesis**: Classical dialectical progression for exploring competing ideas
- **Argument mapping**: Visual and logical representation of argument relationships
- **Claim evaluation**: Systematic assessment of propositions and their supporting evidence
- **Logical consistency**: Validation of argument structure and reasoning chains

#### Argument Types

- **Thesis**: Initial proposition or claim being advanced
- **Antithesis**: Counter-argument or opposing perspective to the thesis
- **Synthesis**: Integration of thesis and antithesis into a higher-order understanding
- **Objection**: Specific challenge to an argument's premises or reasoning
- **Rebuttal**: Response to an objection, defending the original argument

#### Argument Analysis

- **Premise evaluation**: Assessment of the strength and validity of supporting evidence
- **Logical structure**: Analysis of reasoning chains and inference patterns
- **Strength/weakness identification**: Systematic evaluation of argument quality
- **Relationship mapping**: Tracking how arguments support, contradict, or build upon each other

## Architecture

This server follows the "Code Mode" architecture, separating concerns into:

- **Core (`src/core`)**: Pure business logic and domain models.
- **Code Mode (`src/codemode`)**: Public TypeScript API for programmatic usage.
- **MCP Adapter (`src/mcp`)**: Adapter for the Model Context Protocol.

## Capabilities

### Tools

#### `structuredArgumentation`

Systematic dialectical reasoning and argument analysis tool.

**Input Schema:**

```json
{
  "claim": "string - The central proposition being argued",
  "premises": ["string - Supporting evidence or assumptions"],
  "conclusion": "string - The logical consequence of accepting the claim",
  "argumentId": "string - Optional unique identifier for this argument",
  "argumentType": "string - Type of argument (thesis|antithesis|synthesis|objection|rebuttal)",
  "confidence": "number - Confidence level in this argument (0.0-1.0)",
  "respondsTo": "string - ID of the argument this directly responds to",
  "supports": ["string - IDs of arguments this supports"],
  "contradicts": ["string - IDs of arguments this contradicts"],
  "strengths": ["string - Notable strong points of the argument"],
  "weaknesses": ["string - Notable weak points of the argument"],
  "nextArgumentNeeded": "boolean - Whether another argument is needed in the dialectic",
  "suggestedNextTypes": ["string - Suggested types for the next argument"]
}
```

**Output:** Structured argument analysis with logical evaluation, relationship mapping, dialectical progression
assessment, and recommendations for next argumentative steps.

**Error Cases:**

- Invalid argument type
- Circular reasoning detection
- Insufficient premise support
- Logical fallacy identification
- Inconsistent argument relationships

### Programmatic API (Code Mode)

You can use the `StructuredArgumentation` class directly in your TypeScript/JavaScript applications.

```typescript
import { StructuredArgumentation } from "@wemake.cx/structured-argumentation";

const argumentation = new StructuredArgumentation();

const result = await argumentation.processArgument({
  claim: "AI will transform education",
  premises: ["AI can personalize learning", "AI provides instant feedback"],
  conclusion: "Therefore, education will be transformed",
  argumentType: "thesis",
  confidence: 0.8,
  nextArgumentNeeded: false
});

console.log(result.argumentId);
```

## Setup

### bunx

```json
{
  "mcpServers": {
    "Structured Argumentation": {
      "command": "bunx",
      "args": ["@wemake.cx/structured-argumentation@latest"]
    }
  }
}
```

### Environment Variables

- `ARGUMENT_DEPTH`: Set maximum argument chain depth (default: "15")
- `DIALECTICAL_RIGOR`: Set validation strictness ("lenient" | "standard" | "strict", default: "standard")
- `FALLACY_DETECTION`: Enable logical fallacy detection ("true" | "false", default: "true")
- `SYNTHESIS_THRESHOLD`: Minimum arguments required for synthesis (default: "3")

### System Prompt Template

```markdown
You are an expert in structured argumentation and dialectical reasoning. Use the structured argumentation tool to:

1. Analyze arguments systematically using formal logical structures
2. Identify strengths and weaknesses in reasoning chains
3. Track relationships between competing claims and evidence
4. Facilitate dialectical progression through thesis-antithesis-synthesis
5. Detect logical fallacies and reasoning errors
6. Synthesize opposing viewpoints into higher-order understanding

Always specify the argument type that best fits your contribution:

- Thesis: For initial propositions and primary claims
- Antithesis: For counter-arguments and opposing perspectives
- Synthesis: For integration of competing viewpoints
- Objection: For specific challenges to premises or reasoning
- Rebuttal: For responses defending against objections

Ensure each argument includes clear premises, logical reasoning, and explicit conclusions.
```

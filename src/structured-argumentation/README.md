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

## Setup

### bunx

```json
{
  "mcpServers": {
    "Structured Argumentation": {
      "command": "bunx",
      "args": ["@wemake.cx/structured-argumentation@alpha"]
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

## Example

```typescript
// Analyzing a policy proposal through dialectical reasoning
const policyAnalysis = {
  claim: "Universal Basic Income should be implemented nationwide",
  premises: [
    "Automation is displacing traditional jobs at an accelerating rate",
    "Current welfare systems create poverty traps and bureaucratic inefficiency",
    "UBI pilot programs have shown positive outcomes in reducing poverty"
  ],
  conclusion: "A universal basic income would provide economic security while simplifying social support systems",
  argumentType: "thesis",
  confidence: 0.75,
  strengths: [
    "Addresses technological unemployment proactively",
    "Reduces administrative overhead compared to means-tested programs",
    "Provides dignity and choice to recipients"
  ],
  weaknesses: [
    "High fiscal cost requiring significant tax increases",
    "Potential inflationary effects on consumer goods",
    "May reduce work incentives for some individuals"
  ],
  nextArgumentNeeded: true,
  suggestedNextTypes: ["antithesis", "objection"]
};

// Counter-argument development
const counterArgument = {
  claim: "Universal Basic Income implementation would be economically destabilizing",
  premises: [
    "The fiscal cost would require unsustainable levels of government spending",
    "Historical evidence shows that unconditional transfers reduce work participation",
    "Targeted assistance programs are more cost-effective than universal programs"
  ],
  conclusion: "UBI would create more economic problems than it solves",
  argumentType: "antithesis",
  respondsTo: "thesis-ubi-001",
  contradicts: ["thesis-ubi-001"],
  confidence: 0.68,
  nextArgumentNeeded: true,
  suggestedNextTypes: ["rebuttal", "synthesis"]
};
```

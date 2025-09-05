# Sequential Thinking MCP Server

A Model Context Protocol server that provides structured sequential thinking capabilities for complex reasoning tasks,
enabling systematic problem breakdown and iterative refinement.

## Overview and Purpose

The Sequential Thinking server addresses limitations in language models' ability to maintain coherent reasoning chains
across complex, multi-step problems. It provides a framework for systematic thought progression, ensuring logical
consistency and context preservation throughout extended reasoning processes.

### Core Concepts

#### Sequential Reasoning Framework

- **Step-by-step progression**: Systematic breakdown of complex problems into manageable sequential steps
- **Logical dependencies**: Clear relationships between reasoning steps and conclusions
- **Context preservation**: Maintaining coherent context throughout multi-step processes
- **Iterative refinement**: Support for revising and improving reasoning chains based on new insights

#### Reasoning Approaches

- **Analytical**: Systematic, logical analysis with clear cause-and-effect relationships
- **Creative**: Exploratory thinking with divergent and convergent phases
- **Diagnostic**: Problem identification and solution development through systematic elimination
- **Strategic**: Long-term planning with sequential decision points and contingencies

#### Thought Validation

- **Consistency checking**: Ensuring logical coherence across reasoning chains
- **Assumption tracking**: Identifying and validating underlying assumptions
- **Evidence evaluation**: Assessing the strength of supporting evidence for each step
- **Alternative consideration**: Exploring alternative reasoning paths and conclusions

## Capabilities

### Tools

#### `sequential_thinking`

Structured sequential thinking tool for complex reasoning tasks.

**Input Schema:**

```json
{
  "task": "string - The problem or question to analyze",
  "thoughts": [
    {
      "step": "number - Sequential step number",
      "content": "string - The thought or reasoning step",
      "reasoning": "string - Explanation of the reasoning behind this step",
      "assumptions": ["string - List of assumptions made in this step"],
      "evidence": ["string - Supporting evidence or data"],
      "confidence": "number - Confidence level (0.0-1.0)",
      "alternatives": ["string - Alternative approaches or interpretations"]
    }
  ],
  "framework": "string - Reasoning approach (analytical|creative|diagnostic|strategic)",
  "stage": "string - Current stage (problem-definition|analysis|synthesis|evaluation|conclusion)",
  "iteration": "number - Current iteration number",
  "confidence": "number - Overall confidence in reasoning chain (0.0-1.0)",
  "nextThoughtNeeded": "boolean - Whether additional thoughts are required",
  "suggestedNextSteps": ["string - Recommended next reasoning steps"]
}
```

**Output:** Structured reasoning analysis with validated thought progression, logical consistency assessment, and
recommendations for next steps.

**Error Cases:**

- Invalid framework type
- Missing required reasoning steps
- Logical inconsistencies in thought progression
- Insufficient evidence for conclusions

## Setup

### bunx

```json
{
  "mcpServers": {
    "Sequential Thinking": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/sequential-thinking@latest"]
    }
  }
}
```

### Environment Variables

- `REASONING_DEPTH`: Set maximum reasoning depth (default: "10")
- `VALIDATION_STRICTNESS`: Set validation level ("lenient" | "standard" | "strict", default: "standard")
- `FRAMEWORK_FLEXIBILITY`: Allow framework switching mid-process ("true" | "false", default: "true")
- `CONFIDENCE_THRESHOLD`: Minimum confidence for step acceptance (default: "0.6")

### System Prompt Template

```markdown
You are an expert in sequential thinking and systematic reasoning. Use the sequential thinking tool to:

1. Break down complex problems into logical, sequential steps
2. Maintain coherent reasoning chains with clear dependencies
3. Validate assumptions and evidence at each step
4. Consider alternative approaches and interpretations
5. Provide confidence assessments for each reasoning step
6. Suggest next steps for continued analysis

Always specify the reasoning framework that best fits the problem type:

- Analytical: For systematic, logical analysis
- Creative: For exploratory and innovative thinking
- Diagnostic: For problem identification and troubleshooting
- Strategic: For long-term planning and decision-making

Ensure each thought builds logically on previous steps and contributes to the overall reasoning objective.
```

## Example

```typescript
// Analyze a complex business problem using sequential thinking
const businessAnalysis = await sequentialthinking({
  task: "Determine the best market entry strategy for a new SaaS product targeting small businesses",
  thoughts: [
    {
      step: 1,
      content: "Define the target market characteristics and size",
      reasoning: "Understanding the market is fundamental to any entry strategy",
      assumptions: ["Small businesses are defined as 1-50 employees", "SaaS adoption is growing in this segment"],
      evidence: [
        "Market research shows 32M small businesses in target regions",
        "SaaS adoption rate of 73% among small businesses"
      ],
      confidence: 0.8,
      alternatives: ["Focus on micro-businesses (<10 employees)", "Target specific industries first"]
    },
    {
      step: 2,
      content: "Analyze competitive landscape and positioning opportunities",
      reasoning: "Competitive analysis reveals differentiation opportunities and market gaps",
      assumptions: ["Current solutions have identifiable weaknesses", "Price sensitivity varies by business size"],
      evidence: ["Top 3 competitors have 45% market share", "Customer reviews indicate pain points in user experience"],
      confidence: 0.75,
      alternatives: ["Blue ocean strategy", "Direct competition with feature superiority"]
    },
    {
      step: 3,
      content: "Evaluate go-to-market channel options",
      reasoning: "Channel strategy determines reach, cost, and scalability of market entry",
      assumptions: ["Digital channels are most cost-effective", "Small businesses prefer self-service onboarding"],
      evidence: ["70% of small businesses research software online", "Self-service reduces CAC by 60%"],
      confidence: 0.7,
      alternatives: ["Partner channel strategy", "Hybrid direct + partner approach", "Pure direct sales model"]
    }
  ],
  framework: "strategic",
  stage: "analysis",
  iteration: 1,
  confidence: 0.75,
  nextThoughtNeeded: true,
  suggestedNextSteps: [
    "Develop pricing strategy based on market analysis",
    "Create detailed implementation timeline",
    "Identify key success metrics and milestones"
  ]
});
```

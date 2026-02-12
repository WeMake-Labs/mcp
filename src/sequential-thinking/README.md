# Sequential Thinking MCP Server

A Model Context Protocol server that provides structured sequential thinking capabilities for complex reasoning tasks,
enabling systematic problem breakdown and iterative refinement.

## Overview and Purpose

The Sequential Thinking server addresses limitations in language models' ability to maintain coherent reasoning chains
across complex, multi-step problems. It provides a framework for systematic thought progression, ensuring logical
consistency and context preservation throughout extended reasoning processes.

## Architecture: Code Mode

This server follows the "Code Mode" architecture, exposing a strict TypeScript API that allows LLMs to interact with the
thinking process directly via code, rather than just through JSON-RPC tool calls. This enables more complex, stateful,
and performant interactions.

### Core Concepts

- **Step-by-step progression**: Systematic breakdown of complex problems into manageable sequential steps
- **Context preservation**: Maintaining coherent context throughout multi-step processes
- **Iterative refinement**: Support for revising and improving reasoning chains based on new insights
- **Branching**: Support for exploring alternative lines of reasoning

## Capabilities

### Tools

#### `sequentialthinking`

Structured sequential thinking tool for complex reasoning tasks.

**Input Schema:**

```typescript
interface ThoughtData {
  thought: string; // The current thinking step
  thoughtNumber: number; // Current step number
  totalThoughts: number; // Estimated total steps
  nextThoughtNeeded: boolean; // Whether more steps are needed
  isRevision?: boolean; // Is this revising a previous thought?
  revisesThought?: number; // Which thought is being revised
  branchFromThought?: number; // Branching point
  branchId?: string; // Branch identifier
  needsMoreThoughts?: boolean; // If more thoughts are needed than estimated
}
```

## Setup

### bunx

```json
{
  "mcpServers": {
    "Sequential Thinking": {
      "command": "bunx",
      "args": ["@wemake.cx/sequential-thinking@latest"]
    }
  }
}
```

## Usage

### Code Mode (Recommended)

LLMs can use the TypeScript API directly for better performance and type safety:

```typescript
import { SequentialThinking } from "@wemake.cx/sequential-thinking";

const thinker = new SequentialThinking();

// Step 1: Initial thought
thinker.think({
  thought: "Analyzing the user's request to migrate to Code Mode",
  thoughtNumber: 1,
  totalThoughts: 3,
  nextThoughtNeeded: true
});

// Step 2: Detailed planning
thinker.think({
  thought: "I need to separate the Core logic from the MCP transport layer",
  thoughtNumber: 2,
  totalThoughts: 3,
  nextThoughtNeeded: true
});

// Step 3: Execution
thinker.think({
  thought: "Implementation complete. Verifying tests.",
  thoughtNumber: 3,
  totalThoughts: 3,
  nextThoughtNeeded: false
});
```

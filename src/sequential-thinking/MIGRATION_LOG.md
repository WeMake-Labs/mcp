# Migration Log: Sequential Thinking to Code Mode Architecture

## Overview

This document records the migration of the `sequential-thinking` MCP server to the "Code Mode" architecture, enabling
better integration with LLMs via a strictly-typed TypeScript API.

## Changes

### 1. Architectural Restructuring

The codebase has been refactored from a monolithic `index.ts` into a modular layered architecture:

- **Core Layer (`src/core/`)**: Contains pure business logic, types, and state management.
  - `types.ts`: TypeScript interfaces (`ThoughtData`).
  - `tracker.ts`: `SequentialThinkingTracker` class handling validation and state.
  - `formatter.ts`: Output formatting logic.
- **Code Mode Layer (`src/codemode/`)**:
  - `index.ts`: Exposes the `SequentialThinking` class with a `think()` method.
- **MCP Layer (`src/mcp/`)**:
  - `server.ts`: MCP server implementation using the Code Mode API.
  - `tools.ts`: Tool definitions.

### 2. Type Safety Enhancements

- Enforced strict type checking in the Code Mode API.
- Added runtime validation for all inputs in the Core layer.
- `Partial<ThoughtData>` is no longer accepted in the public API; inputs must be fully formed or validated.

### 3. Testing

- Migrated tests to `tests/` directory.
- Split tests into:
  - `tests/core/tracker.test.ts`: Validates business logic.
  - `tests/codemode/api.test.ts`: Validates the new TypeScript API.
  - `tests/mcp/server.test.ts`: Validates server configuration.

### 4. Backward Compatibility

- `src/index.ts` acts as the entry point, re-exporting `createServer` and running the server when executed directly.
- The MCP tool name `sequentialthinking` and its schema remain unchanged.

## Rollback Plan

In case of critical failures, revert to the previous version (git tag `v0.3.0` or commit hash before migration). The
previous implementation consisted of a single `src/index.ts` file.

## Usage

### MCP Server (Standard)

```bash
bun start
```

### Code Mode (New)

```typescript
import { SequentialThinking } from "@wemake.cx/sequential-thinking";

const thinker = new SequentialThinking();
const result = thinker.think({
  thought: "Analyzing problem...",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
});
```

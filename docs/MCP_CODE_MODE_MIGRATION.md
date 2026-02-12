# MCP Code Mode Migration Guide

## Introduction

This document outlines the technical specifications and migration process for transforming Model Context Protocol (MCP)
servers into **Code Mode** implementations. This architecture, inspired by Cloudflare's Code Mode, exposes tools as a
strongly-typed TypeScript API that LLMs can program against directly, rather than just exposing JSON-RPC tools.

### Why Code Mode?

- **Programmability:** LLMs can write loops, conditionals, and complex logic using the tools as native functions.
- **Type Safety:** Strict TypeScript interfaces ensure valid data flow.
- **Performance:** Reduces round-trips by allowing LLMs to batch operations or process data locally in the generated
  code before returning a final result.
- **Testability:** The core logic and API can be tested with standard unit tests, independent of the MCP transport
  layer.

---

## Architecture Overview

The Code Mode architecture separates concerns into three distinct layers:

1.  **Core Layer (`src/core/`)**
    - Contains pure business logic and domain models.
    - No dependencies on MCP SDK or transport layers.
    - Defines shared types and interfaces.

2.  **Code Mode Layer (`src/codemode/`)**
    - The public TypeScript API exposed to LLMs.
    - Wraps the Core layer.
    - Provides a clean, strictly-typed class-based interface.

3.  **MCP Layer (`src/mcp/`)**
    - Adapts the Code Mode API to the standard MCP protocol.
    - Ensures backward compatibility for clients expecting standard MCP tools.
    - Handles JSON-RPC request/response mapping.

### Directory Structure

```text
src/
├── codemode/          # The Programmable API
│   └── index.ts       # Exports the main API class
├── core/              # Business Logic & Types
│   ├── types.ts       # Shared interfaces
│   └── logic.ts       # Domain implementation
├── mcp/               # MCP Protocol Adapter
│   ├── server.ts      # Server instantiation
│   └── tools.ts       # Tool definitions (JSON Schema)
└── index.ts           # Entry point (Exports API + Runs Server)
```

---

## Migration Guidelines

### Phase 1: Preparation

1.  **Identify the Server:** Select a legacy server from `src/` (e.g., `memory`, `scientific-method`).
2.  **Create Directories:**
    ```bash
    mkdir -p src/core src/codemode src/mcp
    ```

### Phase 2: Core Extraction

1.  **Extract Types:** Move all interface definitions to `src/core/types.ts`.
2.  **Extract Logic:** Move the main logic class (e.g., `KnowledgeGraphManager`) to `src/core/manager.ts`.
    - Ensure it returns typed objects, not MCP `CallToolResult` structures.
    - Remove MCP-specific code (like `CallToolRequestSchema`).

### Phase 3: Code Mode Implementation

1.  **Create API Class:** In `src/codemode/index.ts`, create a class that wraps the Core logic.

    ```typescript
    import { Manager } from "../core/manager.js";
    import { InputType, OutputType } from "../core/types.js";

    export class ServiceName {
      private manager: Manager;

      constructor() {
        this.manager = new Manager();
      }

      public doSomething(input: InputType): OutputType {
        return this.manager.execute(input);
      }
    }
    ```

### Phase 4: MCP Adapter

1.  **Define Tools:** In `src/mcp/tools.ts`, define the tool schemas using the standard MCP SDK.
2.  **Implement Server:** In `src/mcp/server.ts`:
    - Instantiate the Code Mode API class.
    - Map `callTool` requests to API method calls.
    - Format API results into MCP `CallToolResult` objects.

### Phase 5: Entry Point & Cleanup

1.  **Update `index.ts`:**
    - Re-export the Code Mode API.
    - Run the MCP server if executed directly.
2.  **Migrate Tests:** Move tests to `tests/core`, `tests/codemode`, and `tests/mcp` to match the new structure.

---

## Migration Strategy & Status

### Priority 1: Core Utilities

- [x] `sequential-thinking` (Migrated)
- [x] `metacognitive-monitoring` (Migrated)
- [ ] `memory`
- [ ] `goal-tracker`

### Priority 2: Reasoning Modules

- [ ] `scientific-method`
- [ ] `structured-argumentation`
- [ ] `decision-framework`
- [ ] `ethical-reasoning`

### Priority 3: Collaboration & specialized

- [ ] `collaborative-reasoning`
- [ ] `focus-group`
- [ ] `visual-reasoning`
- [ ] `multimodal-synthesizer`

---

## Example: Memory Server Migration

### Before (`src/index.ts`)

```typescript
// Monolithic file
class KnowledgeGraphManager {
  // Logic mixed with MCP handlers
}

const server = new Server(...)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Direct logic execution
});
```

### After

**`src/core/types.ts`**

```typescript
export interface Entity {
  name: string;
  type: string;
}
```

**`src/codemode/index.ts`**

```typescript
import { KnowledgeGraphManager } from "../core/manager.js";

export class Memory {
  private manager = new KnowledgeGraphManager();

  public async createEntity(entity: Entity): Promise<void> {
    return this.manager.addEntity(entity);
  }
}
```

**`src/mcp/server.ts`**

```typescript
const memory = new Memory();
// Map tool call "create_entity" -> memory.createEntity(...)
```

---

## Testing Procedures

1.  **Core Tests:** Unit test the business logic in isolation.
2.  **Code Mode Tests:** Test the API class to ensure it correctly delegates to Core and handles inputs/outputs.
3.  **MCP Tests:** Test the server to ensure tool names and arguments are correctly mapped to the API.

## Performance & Optimization

### Benchmarks

- **Latency:** Code Mode significantly reduces latency for multi-step tasks. Instead of `N` round-trips (LLM -> Tool ->
  LLM), an LLM can generate a script that performs `N` operations in a single execution.
- **Token Usage:** Reduces input/output tokens by eliminating intermediate JSON-RPC formatting overhead.

### Optimization Recommendations

- **Batch Operations:** In your Code Mode API, expose methods that accept arrays of inputs (e.g.,
  `addEntities(entities: Entity[])`) to allow bulk processing.
- **Rich Return Types:** Return full objects rather than summarized text. The LLM can decide what parts of the object it
  needs, or use the object in subsequent logic without re-parsing.
- **State Management:** Keep the `Core` logic stateless where possible, or explicitly manage state persistence (like
  `memory.jsonl`) to ensure consistency across script executions.

## Troubleshooting

- **Import Errors:** Ensure all local imports use `.js` extension (Bun/ESM requirement).
- **Type Mismatches:** If the MCP SDK expects a specific result shape, ensure the `src/mcp/server.ts` layer handles the
  conversion from the pure Code Mode return type.

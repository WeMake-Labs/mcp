I have analyzed the `visual-reasoning` codebase and the migration guide. Here is the detailed plan to migrate the server
to the Code Mode architecture.

### Phase 1: Preparation

1.  Create the necessary directory structure:
    - `src/core`
    - `src/codemode`
    - `src/mcp`

### Phase 2: Core Layer (`src/core/`)

1.  **`src/core/types.ts`**: Extract all interfaces and types from `src/index.ts`.
    - `VisualElement`
    - `VisualOperationData`
    - `VisualReasoningResult` (New type for the pure return value)
2.  **`src/core/engine.ts`**: Extract the logic from `VisualReasoningServer`.
    - Rename class to `VisualReasoningEngine`.
    - Remove MCP-specific dependencies (e.g., `CallToolRequest`).
    - Refactor `processVisualOperation` to return a typed object (including the ASCII diagram string) instead of an MCP
      `CallToolResult`.
    - Ensure `renderAsciiDiagram` returns the string (it already does).
    - Remove `console.error` calls from the core logic; return the strings instead.

### Phase 3: Code Mode Layer (`src/codemode/`)

1.  **`src/codemode/index.ts`**: Create the Code Mode API.
    - Export class `VisualReasoning`.
    - Wrap `VisualReasoningEngine`.
    - Expose `processOperation` method that takes typed inputs and returns typed outputs.

### Phase 4: MCP Layer (`src/mcp/`)

1.  **`src/mcp/tools.ts`**: Define the `VISUAL_REASONING_TOOL` schema (moved from `src/index.ts`).
2.  **`src/mcp/server.ts`**: Implement the MCP Server.
    - Import `VisualReasoning` from `../codemode/index.js`.
    - Implement `createServer` function.
    - Map `visualReasoning` tool calls to `visualReasoning.processOperation`.
    - Handle the output: Log the ASCII diagram to stderr (preserving original behavior) and return the JSON summary as
      the tool result.

### Phase 5: Entry Point & Cleanup

1.  **`src/index.ts`**: Update to export the Code Mode API and run the server if executed directly.
2.  **`src/index.test.ts`**: Update tests to verify the new structure (testing `VisualReasoning` class and MCP server).

### Phase 6: Verification

1.  Run `npm run build` (or `bun build`) to ensure compilation.
2.  Run `npm test` (or `bun test`) to ensure functionality is preserved.

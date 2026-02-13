# Migration Log - Structured Argumentation

## [0.4.0] - Code Mode Migration

Migrated the `structured-argumentation` MCP server to the Code Mode architecture.

### Architectural Changes

1.  **Core Layer (`src/core/`)**:
    -   Extracted `ArgumentData`, `ArgumentType`, `RelationshipGraph` and other types to `src/core/types.ts`.
    -   Moved business logic (`ArgumentationManager`) to `src/core/manager.ts`.
    -   Moved formatting logic to `src/core/formatter.ts`.
    -   Ensured Core layer has no dependencies on MCP SDK.

2.  **Code Mode Layer (`src/codemode/`)**:
    -   Created `StructuredArgumentation` class in `src/codemode/index.ts`.
    -   Exposed a clean, typed API: `processArgument(input: unknown): Promise<ArgumentAnalysis>`.

3.  **MCP Adapter (`src/mcp/`)**:
    -   Moved tool definition to `src/mcp/tools.ts`.
    -   Created MCP server factory in `src/mcp/index.ts` that uses the Code Mode API.

4.  **Entry Point**:
    -   Updated `src/index.ts` to export the Code Mode API and conditionally run the MCP server.

### Breaking Changes

-   Internal class `ArgumentationServer` is replaced by `StructuredArgumentation` (Code Mode) and `ArgumentationManager` (Core).
-   `processArgument` in Code Mode now returns a typed `ArgumentAnalysis` object instead of an MCP `CallToolResult`. The MCP adapter handles the conversion.

### Testing

-   Refactored `src/index.test.ts` to test the Code Mode API directly.
-   Updated build configuration to exclude tests from the production build using `tsconfig.build.json`.

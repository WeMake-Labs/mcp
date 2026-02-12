---
alwaysApply: false
globs: src/**/*.ts
description: Steps to migrate legacy MCP servers to Code Mode architecture.
---

# MCP Migration Checklist

1. **Prep**: `mkdir -p src/core src/codemode src/mcp`.
2. **Core Extraction**:
   - Move interfaces to `src/core/types.ts`.
   - Move logic to `src/core/manager.ts`.
   - Return typed objects, NOT `CallToolResult`.
   - Remove MCP-specific code.
3. **Code Mode**:
   - Create wrapper class in `src/codemode/index.ts`.
   - Import Manager & Types from Core.
   - Expose methods: `doSomething(input: InputType): OutputType`.
4. **MCP Adapter**:
   - Define tools in `src/mcp/tools.ts`.
   - In `src/mcp/server.ts`, instantiate API class.
   - Map `callTool` to API methods.
   - Format results to `CallToolResult`.
5. **Cleanup**:
   - Update `src/index.ts` to export API.
   - Migrate tests to `tests/core`, `tests/codemode`, `tests/mcp`.

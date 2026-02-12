---
alwaysApply: false
globs: src/**/*.ts, **/README.md
description: Enforce 3-layer architecture (Core, Code Mode, MCP) for MCP servers.
---

# MCP Code Mode Architecture

Follow this 3-layer architecture for all MCP servers:

1. **Core (`src/core/`)**
   - Pure business logic & domain models.
   - NO dependencies on MCP SDK/transport.
   - `types.ts`: Shared interfaces.
   - `logic.ts`/`manager.ts`: Domain implementation.

2. **Code Mode (`src/codemode/`)**
   - Public TypeScript API exposed to LLMs.
   - Wraps Core layer.
   - Clean, strictly-typed class-based interface.
   - `index.ts`: Exports main API class.

3. **MCP Adapter (`src/mcp/`)**
   - Adapts Code Mode API to MCP protocol.
   - `server.ts`: Server instantiation & request mapping.
   - `tools.ts`: Tool definitions (JSON Schema).

**Directory Structure:**

```text
src/
├── codemode/   # Programmable API
├── core/       # Logic & Types
├── mcp/        # Protocol Adapter
└── index.ts    # Entry point
```

# Migration Log: Scientific Method MCP Server

## 1. Preparation & Structure
- Created standard Code Mode directory structure:
  - `src/core/`: Business logic and types
  - `src/codemode/`: Public API
  - `src/mcp/`: Protocol adapter
- Configured `tsconfig.build.json` for separated build process.

## 2. Core Extraction (`src/core/`)
- **Types**: Extracted interfaces to `src/core/types.ts`:
  - `ScientificInquiryData`
  - `HypothesisData`
  - `ExperimentData`
  - `Prediction`
  - `Variable`
- **Logic**: Moved `ScientificMethodServer` logic to `src/core/ScientificMethod.ts` as `ScientificMethodCore`.
  - Decoupled from MCP SDK.
  - Refactored `processScientificInquiry` to return typed objects.
  - Preserved validation logic and state management.

## 3. Code Mode API (`src/codemode/`)
- Created `ScientificMethodCodeMode` class in `src/codemode/index.ts`.
- Exposed strictly typed methods:
  - `processInquiry(input: unknown): Promise<ScientificInquiryData>`
  - `visualize(data: ScientificInquiryData): string`

## 4. MCP Adapter (`src/mcp/`)
- Extracted tool definition to `src/mcp/tools.ts`.
- Implemented MCP server in `src/mcp/index.ts` using `ScientificMethodCodeMode`.
- Mapped `scientificMethod` tool to Code Mode API.

## 5. Entry Point & Configuration
- Updated `src/index.ts` to export Code Mode API and conditionally run MCP server.
- Updated `package.json`:
  - `exports` pointing to Code Mode API.
  - `types` pointing to generated declarations.
  - `build` script to use `tsconfig.build.json`.

## 6. Testing
- Created `tests/scientific-method.test.ts` testing the Code Mode API directly.
- Verified functionality for all stages (observation, hypothesis, etc.).
- Verified validation logic.

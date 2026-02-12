# Migration Map: Constraint Solver to Code Mode

This document outlines the migration of `src/constraint-solver` from a monolithic MCP server to the modular Code Mode architecture.

## Source Analysis
Current implementation is in `src/index.ts`.
- **Core Logic**: `evaluateConstraint`, `solve`.
- **Types**: `Result`, `ConstraintSolverInput`.
- **MCP Adapter**: `CONSTRAINT_SOLVER_TOOL`, `ConstraintSolverServer` (mixed logic/adapter), `createServer`.

## Target Architecture

### 1. Core Layer (`src/core/`)
Pure business logic, no dependencies on MCP SDK.

- **`src/core/types.ts`**:
  - `ConstraintSolverInput`: Renamed to `ConstraintProblem`.
  - `ConstraintResult`: New typed result interface (satisfied: boolean, unsatisfied: string[]).
  
- **`src/core/logic.ts`**:
  - `evaluateConstraint(expr: string, vars: Record<string, number>): boolean`
  - `solve(input: ConstraintProblem): ConstraintResult`
  - Move logic from `src/index.ts` lines 14-34.

### 2. Code Mode Layer (`src/codemode/`)
Public TypeScript API.

- **`src/codemode/index.ts`**:
  - Class `ConstraintSolver`.
  - Method `check(input: ConstraintProblem): Promise<ConstraintResult>`.
  - Delegates to `solve` from core logic.
  - Handles validation (checking input types) if not already handled by Types.

### 3. MCP Adapter Layer (`src/mcp/`)
Protocol Adapter.

- **`src/mcp/tools.ts`**:
  - `CONSTRAINT_SOLVER_TOOL` definition (JSON Schema).
  - Move from `src/index.ts` lines 36-60.

- **`src/mcp/server.ts`**:
  - Class `ConstraintMcpServer` (renamed from `ConstraintSolverServer` to avoid confusion).
  - Instantiates `ConstraintSolver` from codemode.
  - Implements `process(input: unknown)` to adapt MCP request to Code Mode API.
  - Returns `CallToolResult` (text/json content).

### 4. Entry Point (`src/index.ts`)
- Exports `ConstraintSolver` from `src/codemode/index.ts`.
- Checks `import.meta.main` to run MCP server (using `src/mcp/server.ts` logic).

## Migration Steps
1.  Extract types and logic to `src/core`.
2.  Create `ConstraintSolver` class in `src/codemode`.
3.  Create MCP adapter in `src/mcp`.
4.  Update `src/index.ts` to wire everything together.

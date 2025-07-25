# Testing Strategy for MCP Monorepo

## Introduction

This document outlines an automated, reliable, scalable, and streamlined testing
strategy for the MCP monorepo using Vitest, integrated with Bun. MCP is a
Bun-managed TypeScript monorepo with workspaces under `src/*`, including
packages like `deep-thinking`, `knowledge-graph-memory`, and `tasks`. The
strategy leverages Vitest's Test Projects for monorepo support, ensuring
parallel execution, CI automation, and best practices for maintainability.

Key goals:

- **Automated**: CI/CD integration for tests on pushes/PRs.
- **Reliable**: Coverage thresholds, watch mode, error handling.
- **Scalable**: Unified config, parallel runs for growing packages.
- **Streamlined**: Easy setup with Bun, minimal overhead.

## Setup

### Prerequisites

- Bun installed (already in use).
- TypeScript configured (existing `tsconfig.json`).

### Installation

1. Add Vitest and dependencies to root `package.json`:

   ```json
   "devDependencies": {
     "vitest": "^1.0.0",
     "@vitest/coverage-v8": "^1.0.0",
     "@types/bun": "^1.0.0",
     "vite-tsconfig-paths": "^4.3.0"
   }
   ```

2. Run `bun install`.

### Directory Structure

- Root: `vitest.config.ts`, `package.json`.
- Packages: Add `tests/` folders in `src/deep-thinking`, etc., with `*.test.ts`
  files.

## Configuration

Create `vitest.config.ts` in root:

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 }
    },
    projects: [
      {
        name: "deep-thinking",
        dir: "./src/deep-thinking",
        config: {
          test: {
            /* package-specific */
          }
        }
      },
      {
        name: "knowledge-graph-memory",
        dir: "./src/knowledge-graph-memory",
        config: {
          test: {
            /* */
          }
        }
      },
      {
        name: "tasks",
        dir: "./src/tasks",
        config: {
          test: {
            /* */
          }
        }
      }
    ]
  }
});
```

- Use `projects` for per-package configs.
- Custom export conditions for TypeScript resolution.

### Handling TypeScript in Monorepos

To ensure live type resolution, add custom export conditions in package.json of
each package:

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.mjs",
    "require": "./dist/index.js",
    "bun": "./src/index.ts"  // For live resolution
  }
}
```

This allows Bun to resolve source files directly during testing.

Add scripts to `package.json`:

```json
"scripts": {
  "test": "bun run vitest",
  "test:watch": "bun run vitest --watch",
  "test:coverage": "bun run vitest --coverage"
}
```

## CI Integration

Update `.github/workflows/typescript.yml` (or create new):

```yaml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test --coverage
```

- Cache with Turborepo-like setup if scaling.

## Best Practices

- **Test Types**: Unit for functions, integration for MCP servers/tools.
- **Naming**: `functionName.test.ts`.
- **Mocking**: Use `vi.mock` for dependencies.
- **Coverage**: Merge reports manually if needed.
- **Watch Mode**: For dev feedback.
- **Parallelism**: Vitest handles automatically.

## Examples

Example test in `src/deep-thinking/tests/index.test.ts`:

```ts
import { expect, test } from "vitest";
import { someFunction } from "../index";

test("someFunction works", () => {
  expect(someFunction()).toBe(true);
});
```

## Implementation Guide

1. Install deps and config as above.
2. Write tests per package.
3. Run `bun test` locally.
4. Commit and verify CI.
5. Monitor coverage, refine as needed.

This strategy ensures MCP's testing is efficient and scales with the monorepo.

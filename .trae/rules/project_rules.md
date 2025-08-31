# Project Rules

## Core Guidelines

- **Bun-First Development**: EXCLUSIVELY use Bun for all operations: `bun install`, `bun run`, `bun test`, `bun build`,
  and `Bun.serve()` for servers. PROHIBITED: Node.js, npm, yarn, pnpm, express, vite, webpack, esbuild, or any non-Bun
  alternatives unless technically impossible.

- **Bun Built-in APIs**: MANDATORY use of Bun's native APIs: `Bun.serve()` for HTTP/WebSocket servers, `bun:sqlite` for
  SQLite, `Bun.redis` for Redis, `Bun.sql` for PostgreSQL, `Bun.file` for file operations, `Bun.$` for shell commands,
  and `Bun.password` for secure hashing. PROHIBITED: External libraries like better-sqlite3, ioredis, pg, ws, execa, or
  dotenv.

- **Enterprise Monorepo Architecture**: Leverage Bun workspaces for `src/*` packages. Implement automated builds, tests,
  and deployment via root package.json. ENSURE operational simplicity, enterprise scalability, and GDPR compliance by
  design.

- **AI-First Development Principles**: Prioritize code understanding and review quality over generation speed. The real
  bottlenecks are code reviews, knowledge transfer, testing, and coordination - not writing code. Design for
  comprehensive code understanding with detailed JSDoc comments explaining purpose, business context, and decision
  rationale. Implement automated testing and self-healing systems while ensuring human reviewers can easily understand
  AI-generated code.

- **Enterprise Testing Standards**: Use Bun's native test runner exclusively with `bun test` execution. MANDATORY 90%+
  coverage for lines, functions, branches, and statements. Place tests in `tests/` folders using `functionName.test.ts`
  naming. Configure test environment via `bunfig.toml` for monorepo projects. Integrate with GitHub Actions for CI/CD
  with coverage enforcement and automated deployment to Cloudflare Workers.

- **Modern Frontend Architecture**: Use HTML imports with `Bun.serve()` for SSR/SPA hybrid approach. Import
  .tsx/.jsx/.js and .css files directly in HTML with Bun's native bundling. Support React, TypeScript, and Tailwind CSS.
  Enable HMR and comprehensive error logging in development.

- **MCP Server Excellence**: Implement Model Context Protocol servers following enterprise security patterns: tool
  discovery, schema validation, transactional integrity, least-privilege access, Human-in-the-Loop (HITL) for sensitive
  operations, comprehensive audit logging, and GDPR-compliant data handling.

## Bun Native Test Runner Standards

### Core Testing Principles

- **Bun-First Testing**: EXCLUSIVELY use Bun's native test runner with `bun:test` imports. PROHIBITED: Vitest, Jest,
  Mocha, or any external test frameworks. Bun's test runner provides 10-30x faster execution than alternatives.

- **Jest-Compatible API**: Leverage Bun's built-in Jest-compatible API including `describe`, `it`, `test`, `expect`,
  `beforeEach`, `afterEach`, `beforeAll`, `afterAll`. Full compatibility with Jest matchers and mocking patterns.

- **TypeScript Global Support**: Enable TypeScript support for global test functions with triple-slash directive:
  `/// <reference types="bun/test-globals" />` in any single `.ts` file in your project.

### Test File Organization

```typescript
#!/usr/bin/env bun
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { MyModule } from "../src/myModule.ts";

/**
 * Test suite for MyModule functionality.
 * Validates core business logic and edge cases.
 */
describe("MyModule", () => {
  beforeEach(() => {
    // Setup code
  });

  it("should handle valid input correctly", () => {
    expect(MyModule.process("valid")).toBe("expected");
  });
});
```

### Test Discovery Patterns

Bun automatically discovers test files matching these patterns:

- `*.test.{js|jsx|ts|tsx}`
- `*_test.{js|jsx|ts|tsx}`
- `*.spec.{js|jsx|ts|tsx}`
- `*_spec.{js|jsx|ts|tsx}`

### Configuration via bunfig.toml

```toml
[test]
# Test environment configuration
root = "."
preload = ["./test-setup.ts"]

# Coverage reporting
[test.coverage]
threshold = 90
reports = ["text", "html", "json"]

# Test reporter configuration
[test.reporter]
junit = "test-results.xml"
```

### Migration from Vitest

1. **Remove Vitest Dependencies**: Delete `vitest.config.ts`, remove Vitest from `package.json`
2. **Update Imports**: Replace `import { test, expect } from 'vitest'` with `import { test, expect } from 'bun:test'`
3. **Configuration Migration**: Move test configuration from `vitest.config.ts` to `bunfig.toml`
4. **Mock Updates**: Use Bun's native mocking with `jest.fn()`, `jest.spyOn()`, or `vi.fn()` for Vitest compatibility

### Performance Benefits

- **10-30x Faster**: Bun's test runner significantly outperforms Jest, Vitest, and other alternatives
- **Native TypeScript**: No transpilation overhead, direct TypeScript execution
- **Built-in Coverage**: Integrated coverage reporting without additional dependencies
- **Watch Mode**: Fast incremental testing with `bun test --watch`

### Enterprise Test Commands

```sh
# Run all tests
bun test

# Run with coverage (90%+ required)
bun test --coverage

# Run specific test file
bun test ./tests/myModule.test.ts

# Run tests matching pattern
bun test --test-name-pattern "authentication"

# Watch mode for development
bun test --watch

# Generate JUnit XML for CI/CD
bun test --reporter=junit --reporter-outfile=junit.xml
```

### Zero-Shot CoT

**AI-First Reasoning Process:** For all development tasks, code generation, configuration, and troubleshooting:

1. **Enterprise Requirements Analysis:** Identify core requirements and map to WeMake's enterprise standards: Bun-first
   architecture, GDPR compliance, MCP protocol adherence, and Cloudflare Workers deployment compatibility. Prioritize
   code understanding and maintainability over generation speed. Resolve ambiguities using the most secure, scalable,
   and comprehensible approach that facilitates effective code reviews and knowledge transfer.

2. **Strategic Solution Planning:** Decompose tasks into atomic, testable components aligned with Bun ecosystem,
   TypeScript strict mode, and enterprise security patterns. Define clear interfaces, error boundaries, and monitoring
   points for self-healing systems.

3. **Implementation with Excellence:** Generate production-ready code optimized for understanding and review quality.
   Include comprehensive JSDoc documentation explaining not just what code does, but why specific solutions were chosen.
   Use strict TypeScript typing, enterprise security patterns, and GDPR compliance. Prioritize code clarity and
   maintainability to reduce review burden and facilitate knowledge transfer.

4. **Quality Assurance & Compliance:** Validate against enterprise standards: 90%+ test coverage, security best
   practices, performance benchmarks, accessibility requirements, and regulatory compliance. Implement automated quality
   gates and monitoring.

5. **Deployment-Ready Delivery:** Provide complete, self-contained solutions with deployment configurations, monitoring
   setup, documentation, and maintenance procedures. Include rollback strategies and incident response procedures.

### Enterprise Output Standards

- **Production-Ready Code:** TypeScript with strict mode, comprehensive JSDoc with business context, enterprise security
  patterns, GDPR compliance annotations, performance optimizations, and self-healing error recovery mechanisms.

- **Enterprise Architecture:** Complete monorepo structure with clear domain boundaries, dependency injection patterns,
  configuration management, secrets handling, audit logging, and compliance documentation.

- **Comprehensive Testing:** Bun native test suites with 90%+ coverage, integration tests, security tests, performance
  benchmarks, accessibility tests, and compliance validation. Leverage Bun's built-in Jest-compatible API with
  `bun:test` imports. Include test data management and mock strategies using Bun's native mocking capabilities.

- **Enterprise Documentation:** Technical specifications, API documentation, security assessments, compliance reports,
  deployment guides, incident response procedures, and business continuity plans.

- **Cloud-Native Deployment:** Cloudflare Workers configurations, infrastructure as code, monitoring and alerting setup,
  automated scaling policies, disaster recovery procedures, and compliance audit trails.

- **AI Agent Integration:** Self-documenting code with clear interfaces for AI agents, automated quality gates,
  continuous improvement feedback loops, and minimal human intervention requirements.

- **Response Format:** ALWAYS use markdown with code blocks for files/scripts. Include full file contents with
  TypeScript types, comprehensive comments, and tests. Be thorough yet concise, professional and directive. Limit to
  rule-compliant solutions; explain violations and suggest alternatives.

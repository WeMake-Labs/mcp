**Core Behavioral Guidelines:**

- ALWAYS default to Bun for all operations: Use `bun install`, `bun run`, `bun test`, `bun build`, and `Bun.serve()` for
  servers. You MUST NOT use Node.js, npm, yarn, pnpm, express, vite, webpack, esbuild, or any non-Bun alternatives
  unless explicitly impossible.
- For APIs and databases: EXCLUSIVELY use Bun's built-ins like `Bun.serve()` for servers (including WebSockets and
  routes), `bun:sqlite` for SQLite, `Bun.redis` for Redis, `Bun.sql` for Postgres, `Bun.file` for file operations, and
  `Bun.$` for shell commands. You MUST NOT use external libraries like better-sqlite3, ioredis, pg, ws, execa, or
  dotenv.
- In monorepos: Leverage Bun's workspace features for packages in `src/*`. Automate builds, tests, and scripts via root
  package.json using `bun run`. ENSURE operational simplicity by avoiding complex setups.
- Development Principles: Prioritize velocity through automated tests and linting. Focus on simple architectures with
  minimal dependencies. Add comments to functions detailing their purpose and key logic.
- Testing: Use Vitest as the primary framework with `bun test` for execution. Configure vitest.config.ts in the root
  with test projects for monorepo support. Maintain at least 80% coverage for lines, functions, branches, and
  statements. Place tests in `tests/` folders within each package, using naming like `functionName.test.ts`. Integrate
  with CI via GitHub Actions, enforcing coverage thresholds.
- Frontend: Use HTML imports with `Bun.serve()`. Directly import .tsx/.jsx/.js and .css files in HTML; let Bun handle
  bundling and transpiling. Support React and Tailwind via imports. Enable HMR and console in development mode.
- For MCP Servers: Strictly follow Model Context Protocol best practices, including tool discovery, schema contracts,
  transactional patterns, and security measures like least-privilege and HITL for sensitive actions.

**Reasoning Process for Tasks (Zero-Shot CoT):** When responding to any request (e.g., generating code, setting up
configurations, or troubleshooting):

1. **Analyze the Request:** First, identify the key requirements and map them to the project rules. Explicitly note any
   potential ambiguities and resolve them by assuming the simplest, rule-compliant approach.
2. **Plan the Solution:** Break down the task into logical steps, ensuring alignment with Bun, TypeScript, and testing
   guidelines. Specify tools, scripts, and structures to use.
3. **Generate Output:** Produce the code, config, or script with strict adherence to rules. Include exhaustive details:
   exact file structures, comments, and explanations.
4. **Verify Compliance:** Review against all rules, coverage needs, and simplicity. If revisions are needed, iterate
   internally before final output.
5. **Conclude:** Provide the final artifact in a comprehensive, self-contained format (e.g., code blocks, file
   contents). Reiterate key rules applied.

**Output Specification:**

- ALWAYS format responses in markdown with code blocks for files/scripts.
- For code generation: Include full file contents, with TypeScript types, comments, and tests if applicable. ENSURE
  outputs are detailed, multi-faceted, and cover edge cases.
- Length: Be comprehensive but concise; aim for thoroughness without unnecessary verbosity.
- Tone: Professional, precise, and directive.
- Scope: Limit to rule-compliant solutions; if a request violates rules, explain and suggest alternatives.

**Critical Constraints (Reiterated):** You MUST use Bun exclusively for all operations. ENSURE strict TypeScript, 80%
test coverage via Vitest, and simple monorepo setups. You MUST NOT introduce external dependencies or complex tools.
Prioritize velocity, automation, and maintainability for a single developer.

# Project Rules

## Monorepo Best Practices

- Use Bun's workspace features for managing multiple packages in `src/*`.
- Automate builds and tests across workspaces with `bun run` scripts in the root package.json.
- Simplify operations by leveraging Bun's built-in tools for dependency management and scripting.

## TypeScript

- Use TypeScript for all code.
- Follow the project's tsconfig.json settings.
- Enable strict type checking.

## Development Principles

- Prioritize velocity: Focus on rapid iteration while maintaining code quality through automated tests and linting.
- Add function-level comments when generating code, explaining purpose and key logic.
- Optimize for a single full-stack developer: Emphasize simple, maintainable architectures and minimal dependencies.

## Additional Guidelines

- Focus on automation: Use scripts for common tasks like building, testing, and publishing.
- Ensure operational simplicity: Avoid complex setups; prefer Bun's native capabilities.
- For MCP servers: Follow Model Context Protocol best practices as per documentation.

## Bun

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

### APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

### Testing

Use `bun test` to run tests.

```ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

### Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts
import index from "./index.html";

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    },
  },
  development: {
    hmr: true,
    console: true,
  },
});
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx
import React from "react";

// import .css files directly and it works
import "./index.css";

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

## Vitest

Use Vitest as the primary testing framework for this MCP monorepo.

- Configure Vitest using vitest.config.ts or integrate with vite.config.ts for unified setup. <mcreference link="https://vitest.dev/config/" index="1">1</mcreference>
- Leverage Vitest's fast execution and parallel testing for velocity in monorepos. <mcreference link="https://dev.to/shannonlal/unit-testing-react-applications-in-a-nx-nrwl-monorepo-with-vitest-322o" index="2">2</mcreference>
- Write tests with TypeScript support, ensuring strict type checking. <mcreference link="https://colinhacks.com/essays/live-types-typescript-monorepo" index="3">3</mcreference>
- Add function-level comments in test files explaining test purpose and logic.
- Optimize for single developer: Use simple test setups, automate runs with scripts.
- Enable coverage reports and use reporters for quality insights. <mcreference link="https://vitest.dev/guide/" index="5">5</mcreference>
- Follow best practices for monorepo: Use project configurations for different packages. <mcreference link="https://thijs-koerselman.medium.com/my-quest-for-the-perfect-ts-monorepo-62653d3047eb" index="4">4</mcreference>
- Example test:

```ts
// sum.test.ts
import { expect, test } from "vitest";
import { sum } from "./sum";

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
```

For configuration details, refer to Vitest docs. <mcreference link="https://vitest.dev/config/" index="1">1</mcreference> <mcreference link="https://vitest.dev/guide/" index="5">5</mcreference>

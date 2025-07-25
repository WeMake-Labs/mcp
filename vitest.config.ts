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
      "./src/deep-thinking",
      "./src/knowledge-graph-memory",
      "./src/tasks"
    ]
  }
});

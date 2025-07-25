import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 }
    },
    projects: [
      "./src/deep-thinking",
      "./src/knowledge-graph-memory",
      "./src/tasks"
    ],
    watch: false
  }
});

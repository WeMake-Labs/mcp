import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

/**
 * Enterprise-grade Vitest configuration for WeMake AI MCP servers
 * Optimized for Bun runtime with comprehensive testing coverage
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/types": resolve(__dirname, "./src/types"),
      "@/utils": resolve(__dirname, "./src/utils"),
      "@/mcp": resolve(__dirname, "./src/mcp"),
      "@/tests": resolve(__dirname, "./src/tests"),
      "@/config": resolve(__dirname, "./src/config"),
      "@/enterprise": resolve(__dirname, "./src/enterprise"),
      "@/ai": resolve(__dirname, "./src/ai")
    }
  },
  test: {
    globals: true,
    environment: "node",

    // Enterprise coverage thresholds (90%+ for production)
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/**",
        "dist/**",
        "build/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/tests/**",
        "**/__tests__/**",
        "**/*.test.*",
        "**/*.spec.*"
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90
      },
      all: true,
      skipFull: false
    },

    // Monorepo project configuration (will be enabled when individual configs exist)
    // projects: [
    //   "./src/deep-thinking/vitest.config.ts",
    //   "./src/knowledge-graph-memory/vitest.config.ts",
    //   "./src/tasks/vitest.config.ts",
    //   "./src/enterprise/vitest.config.ts",
    //   "./src/ai/vitest.config.ts"
    // ],

    // Test execution configuration
    watch: false,
    passWithNoTests: false,
    bail: 1,
    retry: 2,
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,

    // File patterns
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}", "**/tests/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*"
    ],

    // Enterprise testing features
    reporters: ["verbose", "json", "html"],
    outputFile: {
      json: "./test-results.json",
      html: "./test-results.html"
    },

    // Performance and reliability
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        useAtomics: true
      }
    },

    // Environment setup
    setupFiles: ["./src/tests/setup.ts"],
    globalSetup: ["./src/tests/global-setup.ts"],

    // GDPR and enterprise compliance
    env: {
      NODE_ENV: "test",
      GDPR_ENABLED: "true",
      AUDIT_LOG_LEVEL: "test",
      TEST_ENVIRONMENT: "enterprise"
    },

    // Bun-specific optimizations
    deps: {
      external: ["bun:*"]
    }
  }
});

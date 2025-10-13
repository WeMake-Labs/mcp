import { DecisionFrameworkServer, DecisionAnalysisData } from "./index.js";

/**
 * Testing-only accessor for validateDecisionAnalysisData method.
 * This is intentionally separate from the main module to avoid exposing
 * internal implementation details in production code.
 */
export function validateDecisionAnalysisDataForTest(input: unknown) {
  const server = new DecisionFrameworkServer();
  // Intentionally access internal method only for tests
  return (
    server as unknown as { validateDecisionAnalysisData: (input: unknown) => DecisionAnalysisData }
  ).validateDecisionAnalysisData(input);
}

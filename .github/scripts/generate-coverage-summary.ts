#!/usr/bin/env bun

/**
 * Coverage Summary Generator
 *
 * Business Context: Aggregates test coverage data from all affected packages
 * in the monorepo and generates a consolidated markdown summary for GitHub
 * Actions step summary and PR comments.
 *
 * Decision Rationale: Using Bun's native file operations for fast coverage
 * aggregation. The script outputs to GITHUB_STEP_SUMMARY for CI visibility
 * and provides actionable insights on coverage quality.
 *
 * Edge Cases Handled:
 * - Missing coverage files - gracefully skipped with warnings
 * - Invalid JSON in coverage-summary.json - logged and skipped
 * - No packages with coverage - outputs informational message
 * - GITHUB_STEP_SUMMARY not set - outputs to console for local testing
 */

import { readdirSync, statSync } from "fs";
import { join } from "path";

interface CoverageSummary {
  total: {
    lines: { total: number; covered: number; pct: number };
    statements: { total: number; covered: number; pct: number };
    functions: { total: number; covered: number; pct: number };
    branches: { total: number; covered: number; pct: number };
  };
}

interface PackageCoverage {
  packageName: string;
  lines: number;
  statements: number;
  functions: number;
  branches: number;
}

/**
 * Reads and parses a coverage-summary.json file
 */
async function readCoverageSummary(coveragePath: string): Promise<CoverageSummary | null> {
  try {
    const summaryPath = join(coveragePath, "coverage-summary.json");
    const summaryFile = Bun.file(summaryPath);

    if (!(await summaryFile.exists())) {
      return null;
    }

    const summary = await summaryFile.json();
    return summary as CoverageSummary;
  } catch (error) {
    console.error(`Warning: Failed to read coverage summary from ${coveragePath}:`, error);
    return null;
  }
}

/**
 * Finds all package directories with coverage data
 */
async function findPackagesWithCoverage(): Promise<string[]> {
  const coverageReportsDir = "coverage-reports";

  try {
    const entries = readdirSync(coverageReportsDir);
    const packages: string[] = [];

    for (const entry of entries) {
      const fullPath = join(coverageReportsDir, entry);
      if (statSync(fullPath).isDirectory()) {
        packages.push(entry);
      }
    }

    return packages;
  } catch {
    // coverage-reports directory doesn't exist
    return [];
  }
}

/**
 * Aggregates coverage from all packages
 */
async function aggregateCoverage(): Promise<PackageCoverage[]> {
  const packages = await findPackagesWithCoverage();
  const coverageData: PackageCoverage[] = [];

  for (const packageName of packages) {
    const coveragePath = join("coverage-reports", packageName);
    const summary = await readCoverageSummary(coveragePath);

    if (summary?.total) {
      coverageData.push({
        packageName,
        lines: summary.total.lines.pct,
        statements: summary.total.statements.pct,
        functions: summary.total.functions.pct,
        branches: summary.total.branches.pct
      });
    }
  }

  return coverageData;
}

/**
 * Generates a markdown table from coverage data
 */
function generateMarkdownTable(coverageData: PackageCoverage[]): string {
  if (coverageData.length === 0) {
    return "ℹ️ No coverage data found for affected packages.\n";
  }

  let markdown = "## 📊 Test Coverage Summary\n\n";
  markdown += "| Package | Lines | Statements | Functions | Branches |\n";
  markdown += "|---------|-------|------------|-----------|----------|\n";

  for (const pkg of coverageData) {
    const linesIcon = pkg.lines >= 80 ? "✅" : pkg.lines >= 70 ? "⚠️" : "❌";
    const statementsIcon = pkg.statements >= 80 ? "✅" : pkg.statements >= 70 ? "⚠️" : "❌";
    const functionsIcon = pkg.functions >= 80 ? "✅" : pkg.functions >= 70 ? "⚠️" : "❌";
    const branchesIcon = pkg.branches >= 80 ? "✅" : pkg.branches >= 70 ? "⚠️" : "❌";

    markdown += `| **${pkg.packageName}** | ${linesIcon} ${pkg.lines.toFixed(2)}% | ${statementsIcon} ${pkg.statements.toFixed(2)}% | ${functionsIcon} ${pkg.functions.toFixed(2)}% | ${branchesIcon} ${pkg.branches.toFixed(2)}% |\n`;
  }

  // Calculate overall averages
  const avgLines = coverageData.reduce((sum, pkg) => sum + pkg.lines, 0) / coverageData.length;
  const avgStatements = coverageData.reduce((sum, pkg) => sum + pkg.statements, 0) / coverageData.length;
  const avgFunctions = coverageData.reduce((sum, pkg) => sum + pkg.functions, 0) / coverageData.length;
  const avgBranches = coverageData.reduce((sum, pkg) => sum + pkg.branches, 0) / coverageData.length;

  markdown += `| **Average** | **${avgLines.toFixed(2)}%** | **${avgStatements.toFixed(2)}%** | **${avgFunctions.toFixed(2)}%** | **${avgBranches.toFixed(2)}%** |\n`;

  markdown += "\n### Coverage Legend\n";
  markdown += "- ✅ 80%+ (Meets enterprise standards)\n";
  markdown += "- ⚠️ 70-89% (Needs improvement)\n";
  markdown += "- ❌ <70% (Critical - requires immediate attention)\n";

  return markdown;
}

/**
 * Main function to generate coverage summary
 */
async function main() {
  console.log("📊 Generating coverage summary...\n");

  const coverageData = await aggregateCoverage();
  const markdownSummary = generateMarkdownTable(coverageData);

  // Output to console
  console.log(markdownSummary);

  // Output to GitHub Actions step summary if available
  const githubStepSummary = process.env.GITHUB_STEP_SUMMARY;
  if (githubStepSummary) {
    try {
      const summaryFile = Bun.file(githubStepSummary);
      const existingContent = (await summaryFile.exists()) ? await summaryFile.text() : "";
      await Bun.write(githubStepSummary, existingContent + "\n" + markdownSummary + "\n");
      console.log("\n✅ Coverage summary written to GitHub Actions step summary");
    } catch (error) {
      console.error("\n⚠️ Failed to write to GITHUB_STEP_SUMMARY:", error);
    }
  } else {
    console.log("\nℹ️ GITHUB_STEP_SUMMARY not set (running locally)");
  }

  // Check if any package is below threshold
  const belowThreshold = coverageData.filter(
    (pkg) => pkg.lines < 80 || pkg.statements < 80 || pkg.functions < 80 || pkg.branches < 80
  );

  if (belowThreshold.length > 0) {
    console.log("\n⚠️ WARNING: The following packages are below 80% coverage threshold:");
    for (const pkg of belowThreshold) {
      console.log(`  - ${pkg.packageName}`);
    }
  }

  process.exit(0);
}

main();

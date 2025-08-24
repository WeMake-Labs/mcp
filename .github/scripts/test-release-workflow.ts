#!/usr/bin/env bun
/**
 * Release workflow integration test script
 * Tests the complete automated release pipeline for MCP server packages
 *
 * @fileoverview End-to-end testing for release automation system
 * @author WeMake Enterprise Team
 * @license BUSL-1.1
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

// Bun global type declaration
declare const Bun: {
  spawnSync: (args: string[], options?: { cwd?: string }) => { exitCode: number; stdout: Buffer; stderr: Buffer };
};

/**
 * Test result interface
 */
interface TestResult {
  name: string;
  status: "pass" | "fail" | "skip";
  message: string;
  duration?: number;
  details?: string;
}

/**
 * Test suite for release workflow validation
 */
class ReleaseWorkflowTester {
  private results: TestResult[] = [];
  private testPackage = "analogical-reasoning";
  private originalVersion = "";

  /**
   * Run a single test with timing and error handling
   */
  private async runTest(name: string, testFn: () => Promise<void> | void): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(`🧪 Running: ${name}`);
      await testFn();

      const duration = Date.now() - startTime;
      this.results.push({
        name,
        status: "pass",
        message: "Test passed successfully",
        duration
      });

      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        status: "fail",
        message: "Test failed",
        duration,
        details: String(error)
      });

      console.log(`❌ ${name} (${duration}ms): ${error}`);
    }
  }

  /**
   * Test package structure and metadata
   */
  private testPackageStructure(): void {
    const packagePath = `src/${this.testPackage}/package.json`;

    if (!existsSync(packagePath)) {
      throw new Error(`Package not found: ${packagePath}`);
    }

    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    this.originalVersion = packageJson.version;

    // Validate required fields
    const requiredFields = ["name", "version", "description", "license", "main", "bin"];
    for (const field of requiredFields) {
      if (!packageJson[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate build script
    if (!packageJson.scripts?.build) {
      throw new Error("Missing build script");
    }

    // Validate repository configuration
    if (!packageJson.repository?.url) {
      throw new Error("Missing repository URL");
    }
  }

  /**
   * Test version utilities functionality
   */
  private testVersionUtilities(): void {
    const versionUtilsPath = ".github/scripts/version-utils.ts";

    if (!existsSync(versionUtilsPath)) {
      throw new Error("Version utilities script not found");
    }

    // This would require importing and testing the actual functions
    // For now, we validate the file exists and has the expected structure
    const content = readFileSync(versionUtilsPath, "utf-8");

    const expectedFunctions = [
      "parseVersion",
      "incrementVersion",
      "determineBumpType",
      "generateChangelog",
      "updatePackageVersion"
    ];

    for (const fn of expectedFunctions) {
      if (!content.includes(`export function ${fn}`) && !content.includes(`function ${fn}`)) {
        throw new Error(`Missing function: ${fn}`);
      }
    }
  }

  /**
   * Test workflow file syntax and configuration
   */
  private testWorkflowConfiguration(): void {
    const workflowPath = ".github/workflows/release.yml";

    if (!existsSync(workflowPath)) {
      throw new Error("Release workflow file not found");
    }

    const workflowContent = readFileSync(workflowPath, "utf-8");

    // Test required workflow components
    const requiredComponents = [
      "workflow_run:",
      "contents: write",
      "packages: write",
      "oven-sh/setup-bun",
      "softprops/action-gh-release"
    ];

    for (const component of requiredComponents) {
      if (!workflowContent.includes(component)) {
        throw new Error(`Missing workflow component: ${component}`);
      }
    }

    // Test job structure
    const requiredJobs = ["check-ci-status", "detect-changes", "release"];
    for (const job of requiredJobs) {
      if (!workflowContent.includes(`${job}:`)) {
        throw new Error(`Missing job: ${job}`);
      }
    }
  }

  /**
   * Test Git repository state and configuration
   */
  private testGitConfiguration(): void {
    // Check Git repository status
    const gitStatus = Bun.spawnSync(["git", "status", "--porcelain"]);
    if (gitStatus.exitCode !== 0) {
      throw new Error("Git repository is not in a clean state");
    }

    // Check current branch
    const branchResult = Bun.spawnSync(["git", "branch", "--show-current"]);
    if (branchResult.exitCode !== 0) {
      throw new Error("Failed to determine current branch");
    }

    const currentBranch = branchResult.stdout.toString().trim();
    console.log(`   Current branch: ${currentBranch}`);

    // Check remote configuration
    const remoteResult = Bun.spawnSync(["git", "remote", "get-url", "origin"]);
    if (remoteResult.exitCode !== 0) {
      throw new Error("No remote origin configured");
    }

    const remoteUrl = remoteResult.stdout.toString().trim();
    console.log(`   Remote origin: ${remoteUrl}`);
  }

  /**
   * Test package build process
   */
  private testPackageBuild(): void {
    const packageDir = `src/${this.testPackage}`;

    // Run build command
    const buildResult = Bun.spawnSync(["bun", "run", "build"]);

    // Change to package directory for build
    const originalCwd = process.cwd();
    try {
      process.chdir(packageDir);
      const buildResult2 = Bun.spawnSync(["bun", "run", "build"]);
      if (buildResult2.exitCode !== 0) {
        const errorOutput = buildResult2.stderr.toString();
        throw new Error(`Build failed: ${errorOutput}`);
      }
    } finally {
      process.chdir(originalCwd);
    }

    if (buildResult.exitCode !== 0) {
      const errorOutput = buildResult.stderr.toString();
      throw new Error(`Build failed: ${errorOutput}`);
    }

    // Check if build artifacts exist
    const distPath = join(packageDir, "dist");
    if (!existsSync(distPath)) {
      throw new Error("Build artifacts not found in dist/ directory");
    }

    console.log(`   Build artifacts created in ${distPath}`);
  }

  /**
   * Test changelog generation simulation
   */
  private testChangelogGeneration(): void {
    // Simulate changelog generation by checking recent commits
    const logResult = Bun.spawnSync(["git", "log", "--oneline", "-10"]);

    if (logResult.exitCode !== 0) {
      throw new Error("Failed to retrieve git log");
    }

    const commits = logResult.stdout.toString().trim().split("\n");
    console.log(`   Found ${commits.length} recent commits for changelog`);

    // Test commit message parsing patterns
    const commitPatterns = {
      feat: /^feat(\(.+\))?:/,
      fix: /^fix(\(.+\))?:/,
      docs: /^docs(\(.+\))?:/,
      style: /^style(\(.+\))?:/,
      refactor: /^refactor(\(.+\))?:/,
      test: /^test(\(.+\))?:/,
      chore: /^chore(\(.+\))?:/
    };

    let categorizedCommits = 0;
    for (const commit of commits) {
      const message = commit.substring(8); // Remove hash
      for (const pattern of Object.values(commitPatterns)) {
        if (pattern.test(message)) {
          categorizedCommits++;
          break;
        }
      }
    }

    console.log(`   ${categorizedCommits}/${commits.length} commits follow conventional format`);
  }

  /**
   * Test security and permissions
   */
  private testSecurityConfiguration(): void {
    const workflowPath = ".github/workflows/release.yml";
    const workflowContent = readFileSync(workflowPath, "utf-8");

    // Check for least-privilege permissions
    if (!workflowContent.includes("contents: read") || !workflowContent.includes("contents: write")) {
      throw new Error("Missing proper content permissions");
    }

    // Check for secure token usage
    if (workflowContent.includes("${{ secrets.GITHUB_TOKEN }}") || workflowContent.includes("${{ github.token }}")) {
      console.log("   ✓ Secure token usage detected");
    } else {
      throw new Error("No secure token usage found");
    }

    // Check for input validation
    if (!workflowContent.includes("if:") || !workflowContent.includes("needs:")) {
      throw new Error("Missing workflow dependency and condition checks");
    }
  }

  /**
   * Test documentation completeness
   */
  private testDocumentation(): void {
    const docsPath = "docs/RELEASE_AUTOMATION.md";

    if (!existsSync(docsPath)) {
      throw new Error("Release automation documentation not found");
    }

    const docContent = readFileSync(docsPath, "utf-8");

    const requiredSections = [
      "# Release Automation",
      "## Architecture",
      "## Workflow Files",
      "## Security",
      "## Troubleshooting"
    ];

    for (const section of requiredSections) {
      if (!docContent.includes(section)) {
        throw new Error(`Missing documentation section: ${section}`);
      }
    }

    console.log(`   Documentation contains ${requiredSections.length} required sections`);
  }

  /**
   * Run all tests
   */
  public async runAllTests(): Promise<void> {
    console.log("🚀 Starting Release Workflow Integration Tests\n");
    console.log("=".repeat(60));

    await this.runTest("Package Structure Validation", () => this.testPackageStructure());
    await this.runTest("Version Utilities Testing", () => this.testVersionUtilities());
    await this.runTest("Workflow Configuration Testing", () => this.testWorkflowConfiguration());
    await this.runTest("Git Configuration Testing", () => this.testGitConfiguration());
    await this.runTest("Package Build Testing", () => this.testPackageBuild());
    await this.runTest("Changelog Generation Testing", () => this.testChangelogGeneration());
    await this.runTest("Security Configuration Testing", () => this.testSecurityConfiguration());
    await this.runTest("Documentation Completeness Testing", () => this.testDocumentation());

    this.printSummary();
  }

  /**
   * Print test results summary
   */
  private printSummary(): void {
    console.log("\n" + "=".repeat(60));
    console.log("📊 Test Results Summary\n");

    const passed = this.results.filter((r) => r.status === "pass").length;
    const failed = this.results.filter((r) => r.status === "fail").length;
    const skipped = this.results.filter((r) => r.status === "skip").length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);

    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);

    // Print failed tests details
    const failedTests = this.results.filter((r) => r.status === "fail");
    if (failedTests.length > 0) {
      console.log("\n❌ Failed Tests:");
      for (const test of failedTests) {
        console.log(`   • ${test.name}: ${test.message}`);
        if (test.details) {
          console.log(`     Details: ${test.details}`);
        }
      }
    }

    // Print performance summary
    const totalDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0);
    console.log(`\n⏱️  Total Duration: ${totalDuration}ms`);

    if (failed === 0) {
      console.log("\n🎉 All tests passed! Release automation is ready for production.");
    } else {
      console.log("\n🚨 Some tests failed. Please address the issues before proceeding.");
      process.exit(1);
    }
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const tester = new ReleaseWorkflowTester();
  await tester.runAllTests();
}

// Run tests if this script is executed directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  });
}

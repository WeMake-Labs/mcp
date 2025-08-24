#!/usr/bin/env bun
/**
 * Release workflow validation script
 * Validates the complete release automation setup for enterprise compliance
 *
 * @fileoverview Comprehensive validation for automated release system
 * @author WeMake Enterprise Team
 * @license BUSL-1.1
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

// Bun global type declaration
declare const Bun: {
  spawnSync: (args: string[]) => { exitCode: number; stdout: Buffer };
};

/**
 * Validation result interface
 */
interface ValidationResult {
  category: string;
  checks: Array<{
    name: string;
    status: "pass" | "fail" | "warning";
    message: string;
    details?: string;
  }>;
}

/**
 * Validate workflow file structure and syntax
 */
function validateWorkflowFiles(): ValidationResult {
  const result: ValidationResult = {
    category: "Workflow Files",
    checks: []
  };

  // Check CI/CD workflow exists
  const cicdPath = ".github/workflows/ci-cd.yml";
  if (existsSync(cicdPath)) {
    result.checks.push({
      name: "CI/CD Workflow File",
      status: "pass",
      message: "CI/CD workflow file exists"
    });
  } else {
    result.checks.push({
      name: "CI/CD Workflow File",
      status: "fail",
      message: "CI/CD workflow file not found",
      details: `Expected file at ${cicdPath}`
    });
  }

  // Check release workflow exists
  const releasePath = ".github/workflows/release.yml";
  if (existsSync(releasePath)) {
    result.checks.push({
      name: "Release Workflow File",
      status: "pass",
      message: "Release workflow file exists"
    });

    // Validate release workflow content
    try {
      const releaseContent = readFileSync(releasePath, "utf-8");

      // Check for required triggers
      if (releaseContent.includes("workflow_run:")) {
        result.checks.push({
          name: "Workflow Trigger",
          status: "pass",
          message: "Correct workflow_run trigger configured"
        });
      } else {
        result.checks.push({
          name: "Workflow Trigger",
          status: "fail",
          message: "Missing workflow_run trigger"
        });
      }

      // Check for proper permissions
      if (releaseContent.includes("contents: write") && releaseContent.includes("packages: write")) {
        result.checks.push({
          name: "Workflow Permissions",
          status: "pass",
          message: "Proper permissions configured"
        });
      } else {
        result.checks.push({
          name: "Workflow Permissions",
          status: "fail",
          message: "Missing required permissions (contents: write, packages: write)"
        });
      }

      // Check for Bun usage
      if (releaseContent.includes("oven-sh/setup-bun")) {
        result.checks.push({
          name: "Bun Integration",
          status: "pass",
          message: "Bun setup action configured"
        });
      } else {
        result.checks.push({
          name: "Bun Integration",
          status: "warning",
          message: "Bun setup action not found"
        });
      }
    } catch (error) {
      result.checks.push({
        name: "Release Workflow Syntax",
        status: "fail",
        message: "Failed to parse release workflow file",
        details: String(error)
      });
    }
  } else {
    result.checks.push({
      name: "Release Workflow File",
      status: "fail",
      message: "Release workflow file not found",
      details: `Expected file at ${releasePath}`
    });
  }

  return result;
}

/**
 * Validate package structure and configuration
 */
function validatePackageStructure(): ValidationResult {
  const result: ValidationResult = {
    category: "Package Structure",
    checks: []
  };

  // Check root package.json
  const rootPackagePath = "package.json";
  if (existsSync(rootPackagePath)) {
    try {
      const rootPackage = JSON.parse(readFileSync(rootPackagePath, "utf-8"));

      // Check workspaces configuration
      if (rootPackage.workspaces && rootPackage.workspaces.includes("src/*")) {
        result.checks.push({
          name: "Workspace Configuration",
          status: "pass",
          message: "Bun workspaces properly configured"
        });
      } else {
        result.checks.push({
          name: "Workspace Configuration",
          status: "fail",
          message: "Missing or incorrect workspace configuration"
        });
      }

      // Check Bun engine requirement
      if (rootPackage.engines?.bun) {
        result.checks.push({
          name: "Bun Engine Requirement",
          status: "pass",
          message: `Bun engine requirement: ${rootPackage.engines.bun}`
        });
      } else {
        result.checks.push({
          name: "Bun Engine Requirement",
          status: "warning",
          message: "No Bun engine requirement specified"
        });
      }
    } catch (error) {
      result.checks.push({
        name: "Root Package.json",
        status: "fail",
        message: "Failed to parse root package.json",
        details: String(error)
      });
    }
  } else {
    result.checks.push({
      name: "Root Package.json",
      status: "fail",
      message: "Root package.json not found"
    });
  }

  // Check bunfig.toml
  const bunfigPath = "bunfig.toml";
  if (existsSync(bunfigPath)) {
    result.checks.push({
      name: "Bun Configuration",
      status: "pass",
      message: "bunfig.toml exists"
    });
  } else {
    result.checks.push({
      name: "Bun Configuration",
      status: "warning",
      message: "bunfig.toml not found (optional but recommended)"
    });
  }

  return result;
}

/**
 * Validate MCP server packages
 */
function validateMCPPackages(): ValidationResult {
  const result: ValidationResult = {
    category: "MCP Packages",
    checks: []
  };

  // Find all packages in src/
  if (!existsSync("src")) {
    result.checks.push({
      name: "Source Directory",
      status: "fail",
      message: "src/ directory not found"
    });
    return result;
  }

  try {
    const findResult = Bun.spawnSync(["find", "src", "-name", "package.json", "-not", "-path", "*/node_modules/*"]);
    const packagePaths = findResult.stdout
      .toString()
      .trim()
      .split("\n")
      .filter((p) => p.length > 0);

    if (packagePaths.length === 0) {
      result.checks.push({
        name: "Package Discovery",
        status: "warning",
        message: "No MCP packages found in src/"
      });
      return result;
    }

    result.checks.push({
      name: "Package Discovery",
      status: "pass",
      message: `Found ${packagePaths.length} MCP package(s)`
    });

    // Validate each package
    for (const packagePath of packagePaths) {
      const packageDir = packagePath.replace("/package.json", "");
      const packageName = packageDir.replace("src/", "");

      try {
        const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));

        // Check required fields
        const requiredFields = ["name", "version", "description", "license"];
        const missingFields = requiredFields.filter((field) => !packageJson[field]);

        if (missingFields.length === 0) {
          result.checks.push({
            name: `Package ${packageName} - Metadata`,
            status: "pass",
            message: "All required fields present"
          });
        } else {
          result.checks.push({
            name: `Package ${packageName} - Metadata`,
            status: "fail",
            message: `Missing required fields: ${missingFields.join(", ")}`
          });
        }

        // Check build script
        if (packageJson.scripts?.build) {
          result.checks.push({
            name: `Package ${packageName} - Build Script`,
            status: "pass",
            message: "Build script configured"
          });
        } else {
          result.checks.push({
            name: `Package ${packageName} - Build Script`,
            status: "warning",
            message: "No build script found"
          });
        }

        // Check for README
        if (existsSync(join(packageDir, "README.md"))) {
          result.checks.push({
            name: `Package ${packageName} - Documentation`,
            status: "pass",
            message: "README.md exists"
          });
        } else {
          result.checks.push({
            name: `Package ${packageName} - Documentation`,
            status: "warning",
            message: "README.md not found"
          });
        }
      } catch (error) {
        result.checks.push({
          name: `Package ${packageName} - Validation`,
          status: "fail",
          message: "Failed to validate package",
          details: String(error)
        });
      }
    }
  } catch (error) {
    result.checks.push({
      name: "Package Discovery",
      status: "fail",
      message: "Failed to discover packages",
      details: String(error)
    });
  }

  return result;
}

/**
 * Validate Git configuration and repository state
 */
function validateGitConfiguration(): ValidationResult {
  const result: ValidationResult = {
    category: "Git Configuration",
    checks: []
  };

  // Check if we're in a Git repository
  try {
    const gitCheck = Bun.spawnSync(["git", "rev-parse", "--git-dir"]);
    if (gitCheck.exitCode === 0) {
      result.checks.push({
        name: "Git Repository",
        status: "pass",
        message: "Valid Git repository"
      });
    } else {
      result.checks.push({
        name: "Git Repository",
        status: "fail",
        message: "Not a Git repository"
      });
      return result;
    }
  } catch {
    result.checks.push({
      name: "Git Repository",
      status: "fail",
      message: "Git not available or repository invalid"
    });
    return result;
  }

  // Check for main branch
  try {
    const branchCheck = Bun.spawnSync(["git", "branch", "--list", "main"]);
    if (branchCheck.stdout.toString().includes("main")) {
      result.checks.push({
        name: "Main Branch",
        status: "pass",
        message: "Main branch exists"
      });
    } else {
      result.checks.push({
        name: "Main Branch",
        status: "warning",
        message: "Main branch not found (may use different default branch)"
      });
    }
  } catch {
    result.checks.push({
      name: "Main Branch",
      status: "fail",
      message: "Failed to check branch configuration"
    });
  }

  // Check for remote origin
  try {
    const remoteCheck = Bun.spawnSync(["git", "remote", "get-url", "origin"]);
    if (remoteCheck.exitCode === 0) {
      const remoteUrl = remoteCheck.stdout.toString().trim();
      result.checks.push({
        name: "Remote Origin",
        status: "pass",
        message: `Remote configured: ${remoteUrl}`
      });
    } else {
      result.checks.push({
        name: "Remote Origin",
        status: "warning",
        message: "No remote origin configured"
      });
    }
  } catch {
    result.checks.push({
      name: "Remote Origin",
      status: "fail",
      message: "Failed to check remote configuration"
    });
  }

  return result;
}

/**
 * Validate supporting scripts and utilities
 */
function validateSupportingFiles(): ValidationResult {
  const result: ValidationResult = {
    category: "Supporting Files",
    checks: []
  };

  // Check version utilities
  const versionUtilsPath = ".github/scripts/version-utils.ts";
  if (existsSync(versionUtilsPath)) {
    result.checks.push({
      name: "Version Utilities",
      status: "pass",
      message: "Version utilities script exists"
    });
  } else {
    result.checks.push({
      name: "Version Utilities",
      status: "fail",
      message: "Version utilities script not found"
    });
  }

  // Check documentation
  const docsPath = "docs/RELEASE_AUTOMATION.md";
  if (existsSync(docsPath)) {
    result.checks.push({
      name: "Release Documentation",
      status: "pass",
      message: "Release automation documentation exists"
    });
  } else {
    result.checks.push({
      name: "Release Documentation",
      status: "warning",
      message: "Release automation documentation not found"
    });
  }

  // Check TypeScript configuration for scripts
  const scriptsTsConfigPath = ".github/scripts/tsconfig.json";
  if (existsSync(scriptsTsConfigPath)) {
    result.checks.push({
      name: "Scripts TypeScript Config",
      status: "pass",
      message: "TypeScript configuration for scripts exists"
    });
  } else {
    result.checks.push({
      name: "Scripts TypeScript Config",
      status: "warning",
      message: "TypeScript configuration for scripts not found"
    });
  }

  return result;
}

/**
 * Print validation results in a formatted manner
 */
function printResults(results: ValidationResult[]): void {
  console.log("\n🔍 Release Automation Validation Report\n");
  console.log("=".repeat(50));

  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;
  let warningChecks = 0;

  for (const result of results) {
    console.log(`\n📋 ${result.category}`);
    console.log("-".repeat(30));

    for (const check of result.checks) {
      totalChecks++;

      const statusIcon = {
        pass: "✅",
        fail: "❌",
        warning: "⚠️"
      }[check.status];

      console.log(`${statusIcon} ${check.name}: ${check.message}`);

      if (check.details) {
        console.log(`   Details: ${check.details}`);
      }

      switch (check.status) {
        case "pass":
          passedChecks++;
          break;
        case "fail":
          failedChecks++;
          break;
        case "warning":
          warningChecks++;
          break;
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log(`   Total Checks: ${totalChecks}`);
  console.log(`   ✅ Passed: ${passedChecks}`);
  console.log(`   ❌ Failed: ${failedChecks}`);
  console.log(`   ⚠️  Warnings: ${warningChecks}`);

  const successRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  console.log(`   📈 Success Rate: ${successRate}%`);

  if (failedChecks === 0) {
    console.log("\n🎉 Release automation setup is ready!");
    if (warningChecks > 0) {
      console.log("   Consider addressing warnings for optimal setup.");
    }
  } else {
    console.log("\n🚨 Release automation setup has issues that need to be addressed.");
    console.log("   Please fix the failed checks before proceeding.");
  }
}

/**
 * Main validation function
 */
function main(): void {
  console.log("🚀 Validating Release Automation Setup...");

  const validationResults = [
    validateWorkflowFiles(),
    validatePackageStructure(),
    validateMCPPackages(),
    validateGitConfiguration(),
    validateSupportingFiles()
  ];

  printResults(validationResults);

  // Exit with appropriate code
  const hasFailures = validationResults.some((result) => result.checks.some((check) => check.status === "fail"));

  process.exit(hasFailures ? 1 : 0);
}

// Run validation if this script is executed directly
if (import.meta.main) {
  main();
}

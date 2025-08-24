#!/usr/bin/env bun
/**
 * Enterprise versioning utilities for MCP server releases
 * Provides semantic versioning, changelog generation, and release validation
 *
 * @fileoverview Bun-native utilities for automated package versioning
 * @author WeMake Enterprise Team
 * @license BUSL-1.1
 */

import { $ } from "bun";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Semantic version interface for type safety
 */
interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

/**
 * Commit analysis result for version bump determination
 */
interface CommitAnalysis {
  bumpType: "major" | "minor" | "patch";
  breakingChanges: string[];
  features: string[];
  fixes: string[];
  commits: string[];
}

// Interface for release metadata (used in workflow)
export interface ReleaseMetadata {
  version: string;
  changelog: string;
  packagePath: string;
  packageName: string;
}

/**
 * Parse semantic version string into structured object
 * @param version - Version string (e.g., "1.2.3-alpha.1+build.123")
 * @returns Parsed semantic version object
 */
export function parseSemanticVersion(version: string): SemanticVersion {
  const versionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-(\S+))?(?:\+(\S+))?$/;
  const match = version.match(versionRegex);

  if (!match) {
    throw new Error(`Invalid semantic version format: ${version}`);
  }

  return {
    major: parseInt(match[1]!, 10),
    minor: parseInt(match[2]!, 10),
    patch: parseInt(match[3]!, 10),
    ...(match[4] && { prerelease: match[4] }),
    ...(match[5] && { build: match[5] })
  };
}

/**
 * Parse semantic version string into components
 */
export function parseVersion(version: string): SemanticVersion {
  return parseSemanticVersion(version);
}

/**
 * Increment version based on bump type
 */
export function incrementVersion(version: SemanticVersion, bumpType: "major" | "minor" | "patch"): SemanticVersion {
  return incrementSemanticVersion(version, bumpType);
}

/**
 * Increment semantic version based on bump type
 * @param version - Current semantic version object
 * @param bumpType - Type of version increment
 * @returns New semantic version object
 */
function incrementSemanticVersion(version: SemanticVersion, bumpType: "major" | "minor" | "patch"): SemanticVersion {
  const newVersion = { ...version };

  // Remove prerelease and build metadata on version bump
  delete newVersion.prerelease;
  delete newVersion.build;

  switch (bumpType) {
    case "major":
      newVersion.major += 1;
      newVersion.minor = 0;
      newVersion.patch = 0;
      break;
    case "minor":
      newVersion.minor += 1;
      newVersion.patch = 0;
      break;
    case "patch":
      newVersion.patch += 1;
      break;
    default:
      throw new Error(`Invalid bump type: ${bumpType}`);
  }

  return newVersion;
}

/**
 * Convert semantic version object to string
 * @param version - Semantic version object
 * @returns Version string
 */
export function versionToString(version: SemanticVersion): string {
  let versionString = `${version.major}.${version.minor}.${version.patch}`;

  if (version.prerelease) {
    versionString += `-${version.prerelease}`;
  }

  if (version.build) {
    versionString += `+${version.build}`;
  }

  return versionString;
}

/**
 * Determine version bump type from commit messages
 */
export function determineBumpType(commits: string[]): "major" | "minor" | "patch" {
  for (const commit of commits) {
    // Check for breaking changes (highest priority)
    if (
      /BREAKING CHANGE/i.test(commit) ||
      /^[^(]*!:/i.test(commit) ||
      /breaking:/i.test(commit) ||
      /major:/i.test(commit)
    ) {
      return "major";
    }
    // Check for features (medium priority)
    else if (/^feat(\([^)]*\))?:/i.test(commit) || /^feature:/i.test(commit) || /minor:/i.test(commit)) {
      return "minor";
    }
  }
  // Default to patch
  return "patch";
}

/**
 * Analyze commit messages to determine version bump type and categorize changes
 * @param packagePath - Path to the package directory
 * @param fromCommit - Starting commit hash (exclusive)
 * @returns Commit analysis with bump type and categorized changes
 */
export async function analyzeCommits(packagePath: string, fromCommit?: string): Promise<CommitAnalysis> {
  const gitRange = fromCommit ? `${fromCommit}..HEAD` : "HEAD~1..HEAD";

  // Get commit messages for the package
  const commitOutput = await $`git log --pretty=format:"%H|%s|%b" ${gitRange} -- ${packagePath}`.text();

  const commits = commitOutput
    .trim()
    .split("\n")
    .filter((line) => line.length > 0);

  const analysis: CommitAnalysis = {
    bumpType: "patch",
    breakingChanges: [],
    features: [],
    fixes: [],
    commits: []
  };

  for (const commit of commits) {
    const [hash, subject, body] = commit.split("|");
    if (!hash || !subject) continue;

    const fullMessage = `${subject}\n${body || ""}`;

    analysis.commits.push(`${hash.substring(0, 7)} ${subject}`);

    // Check for breaking changes (highest priority)
    if (
      /BREAKING CHANGE/i.test(fullMessage) ||
      /^[^(]*!:/i.test(subject) ||
      /breaking:/i.test(subject) ||
      /major:/i.test(subject)
    ) {
      analysis.bumpType = "major";
      analysis.breakingChanges.push(subject);
    }
    // Check for features (medium priority, only if not already major)
    else if (
      analysis.bumpType !== "major" &&
      (/^feat(\([^)]*\))?:/i.test(subject) || /^feature:/i.test(subject) || /minor:/i.test(subject))
    ) {
      analysis.bumpType = "minor";
      analysis.features.push(subject);
    }
    // Everything else is a patch
    else {
      analysis.fixes.push(subject);
    }
  }

  return analysis;
}

/**
 * Generate comprehensive changelog from commit analysis
 * @param analysis - Commit analysis result
 * @param newVersion - New version string
 * @param packageName - Name of the package
 * @returns Formatted changelog content
 */
export function generateChangelog(analysis: CommitAnalysis, newVersion: string, packageName: string): string {
  const date = new Date().toISOString().split("T")[0];

  let changelog = `# ${packageName} v${newVersion}\n\n`;
  changelog += `*Released on ${date}*\n\n`;

  // Add version bump type indicator
  const bumpEmoji = {
    major: "🚀",
    minor: "✨",
    patch: "🐛"
  };

  changelog += `${bumpEmoji[analysis.bumpType]} **${analysis.bumpType.toUpperCase()} RELEASE**\n\n`;

  // Breaking changes section (if any)
  if (analysis.breakingChanges.length > 0) {
    changelog += `## 💥 BREAKING CHANGES\n\n`;
    for (const change of analysis.breakingChanges) {
      changelog += `- ${change}\n`;
    }
    changelog += "\n";
  }

  // New features section (if any)
  if (analysis.features.length > 0) {
    changelog += `## ✨ New Features\n\n`;
    for (const feature of analysis.features) {
      changelog += `- ${feature}\n`;
    }
    changelog += "\n";
  }

  // Bug fixes and improvements section
  if (analysis.fixes.length > 0) {
    changelog += `## 🐛 Bug Fixes & Improvements\n\n`;
    for (const fix of analysis.fixes) {
      changelog += `- ${fix}\n`;
    }
    changelog += "\n";
  }

  // All commits section for transparency
  if (analysis.commits.length > 0) {
    changelog += `## 📝 All Changes\n\n`;
    for (const commit of analysis.commits) {
      changelog += `- ${commit}\n`;
    }
    changelog += "\n";
  }

  // Add footer with package info
  changelog += `---\n\n`;
  changelog += `**Full Changelog**: [View on GitHub](https://github.com/wemake-ai/mcp/compare/${packageName}-v${newVersion})\n`;
  changelog += `**Package**: \`${packageName}\`\n`;
  changelog += `**Version**: \`${newVersion}\`\n`;

  return changelog;
}

/**
 * Update package.json version and return metadata
 * @param packagePath - Path to package directory
 * @param newVersion - New version string
 * @returns Updated package metadata
 */
export function updatePackageVersion(
  packagePath: string,
  newVersion: string
): { name: string; oldVersion: string; newVersion: string; packageJson: Record<string, unknown> } {
  const packageJsonPath = join(packagePath, "package.json");

  if (!existsSync(packageJsonPath)) {
    throw new Error(`package.json not found at ${packageJsonPath}`);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  const oldVersion = packageJson.version;

  packageJson.version = newVersion;

  // Update package.json with proper formatting
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

  return {
    name: packageJson.name,
    oldVersion,
    newVersion,
    packageJson
  };
}

/**
 * Validate package structure and readiness for release
 * @param packagePath - Path to package directory
 * @returns Validation result with any issues found
 */
export function validatePackageForRelease(packagePath: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check required files
  const requiredFiles = ["package.json", "README.md"];
  for (const file of requiredFiles) {
    if (!existsSync(join(packagePath, file))) {
      issues.push(`Missing required file: ${file}`);
    }
  }

  // Validate package.json structure
  try {
    const packageJsonPath = join(packagePath, "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

    const requiredFields = ["name", "version", "description", "license"];
    for (const field of requiredFields) {
      if (!packageJson[field]) {
        issues.push(`Missing required package.json field: ${field}`);
      }
    }

    // Validate semantic version format
    if (packageJson.version) {
      try {
        parseSemanticVersion(packageJson.version);
      } catch {
        issues.push(`Invalid version format in package.json: ${packageJson.version}`);
      }
    }
  } catch {
    issues.push("Invalid package.json format");
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Main CLI interface for version utilities
 */
if (import.meta.main) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "analyze": {
      const packagePath = args[1] || ".";
      const fromCommit = args[2];

      analyzeCommits(packagePath, fromCommit)
        .then((analysis) => {
          console.log(JSON.stringify(analysis, null, 2));
        })
        .catch((error) => {
          console.error("Error analyzing commits:", error);
          process.exit(1);
        });
      break;
    }

    case "validate": {
      const validatePath = args[1] || ".";
      const validation = validatePackageForRelease(validatePath);

      if (validation.valid) {
        console.log("✅ Package is ready for release");
      } else {
        console.log("❌ Package validation failed:");
        validation.issues.forEach((issue) => console.log(`  - ${issue}`));
        process.exit(1);
      }
      break;
    }

    default:
      console.log("Usage: bun run version-utils.ts <command> [args...]");
      console.log("Commands:");
      console.log("  analyze <package-path> [from-commit] - Analyze commits for version bump");
      console.log("  validate <package-path>              - Validate package for release");
      process.exit(1);
  }
}

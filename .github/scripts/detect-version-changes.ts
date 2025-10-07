#!/usr/bin/env bun
/// <reference types="bun-types" />

/**
 * Version Change Detection Script
 *
 * Business Context: Detects packages with version changes by comparing current
 * package.json versions against the previous git tag. This ensures we only
 * publish packages that have been intentionally versioned for release.
 *
 * Decision Rationale: Using git tags as the source of truth for version comparison
 * allows us to maintain a clear audit trail and prevents accidental republishing
 * of unchanged packages. This approach integrates seamlessly with semantic versioning
 * and release workflows.
 *
 * Edge Cases Handled:
 * - No previous tags exist (first release) - all packages are considered changed
 * - Package doesn't exist in previous tag - package is considered new/changed
 * - Invalid package.json - package is skipped with warning
 * - Git command failures - script exits with clear error message
 */

import { $ } from "bun";
import { readdirSync, statSync } from "fs";
import { join } from "path";

interface PackageInfo {
  name: string;
  path: string;
  currentVersion: string;
  previousVersion?: string;
  hasVersionChange: boolean;
}

/**
 * Gets the latest git tag, or null if no tags exist
 */
async function getLatestTag(): Promise<string | null> {
  try {
    const result = await $`git describe --tags --abbrev=0`.text();
    return result.trim();
  } catch {
    // No tags exist yet
    return null;
  }
}

/**
 * Reads the version from a package.json file
 */
async function readPackageVersion(packagePath: string): Promise<string | null> {
  try {
    const packageJsonPath = join(packagePath, "package.json");
    const packageFile = Bun.file(packageJsonPath);
    if (!(await packageFile.exists())) {
      return null;
    }
    const packageJson = await packageFile.json();
    return packageJson.version || null;
  } catch (error) {
    console.error(`Warning: Failed to read version from ${packagePath}:`, error);
    return null;
  }
}

/**
 * Reads the version from a package.json at a specific git tag
 */
async function readPackageVersionAtTag(tag: string, packageName: string): Promise<string | null> {
  try {
    const gitPath = `${tag}:src/${packageName}/package.json`;
    const result = await $`git show ${gitPath}`.text();
    const packageJson = JSON.parse(result);
    return packageJson.version || null;
  } catch {
    // Package might not exist at this tag
    return null;
  }
}

/**
 * Gets all package directories in src/
 */
async function getPackageDirectories(): Promise<string[]> {
  const srcDir = "src";

  const entries = readdirSync(srcDir);
  const dirs: string[] = [];

  for (const entry of entries) {
    const fullPath = join(srcDir, entry);
    const packageJsonPath = join(fullPath, "package.json");

    if (statSync(fullPath).isDirectory() && (await Bun.file(packageJsonPath).exists())) {
      dirs.push(fullPath);
    }
  }

  return dirs;
}

/**
 * Main function to detect version changes
 */
async function detectVersionChanges(): Promise<PackageInfo[]> {
  const latestTag = await getLatestTag();

  if (!latestTag) {
    console.log("No previous tags found. Treating all packages as changed (first release).");
  } else {
    console.log(`Comparing against previous tag: ${latestTag}`);
  }

  const packageDirs = await getPackageDirectories();
  const packageInfos: PackageInfo[] = [];

  for (const packagePath of packageDirs) {
    const packageName = packagePath.split("/").pop()!;
    const currentVersion = await readPackageVersion(packagePath);

    if (!currentVersion) {
      console.warn(`Skipping ${packageName}: No version found in package.json`);
      continue;
    }

    let previousVersion: string | null = null;
    let hasVersionChange = true;

    if (latestTag) {
      previousVersion = await readPackageVersionAtTag(latestTag, packageName);
      hasVersionChange = previousVersion !== currentVersion;
    }

    const packageInfo: PackageInfo = {
      name: packageName,
      path: packagePath,
      currentVersion,
      hasVersionChange
    };

    if (previousVersion !== null) {
      packageInfo.previousVersion = previousVersion;
    }

    packageInfos.push(packageInfo);

    if (hasVersionChange) {
      const changeType = previousVersion ? `${previousVersion} → ${currentVersion}` : `new package (${currentVersion})`;
      console.log(`✓ ${packageName}: ${changeType}`);
    } else {
      console.log(`  ${packageName}: no change (${currentVersion})`);
    }
  }

  return packageInfos;
}

/**
 * Entry point
 */
async function main() {
  try {
    const allPackages = await detectVersionChanges();
    const changedPackages = allPackages.filter((pkg) => pkg.hasVersionChange);

    console.log("\n" + "=".repeat(60));
    console.log(`Summary: ${changedPackages.length} of ${allPackages.length} packages have version changes`);
    console.log("=".repeat(60));

    if (changedPackages.length === 0) {
      console.log("\nNo packages to publish.");
      // Output empty JSON array for workflow using new GitHub Actions syntax
      const githubOutput = process.env.GITHUB_OUTPUT;
      if (githubOutput) {
        // Append to GITHUB_OUTPUT file
        const outputFile = Bun.file(githubOutput);
        const existingContent = (await outputFile.exists()) ? await outputFile.text() : "";
        await Bun.write(githubOutput, existingContent + `packages=[]\nhas_changes=false\n`);
      } else {
        // Fallback for local testing
        console.log("\npackages=[]");
        console.log("has_changes=false");
      }
    } else {
      // Output changed package paths as JSON for GitHub Actions
      const packagePaths = changedPackages.map((pkg) => pkg.path);
      const packagesJson = JSON.stringify(packagePaths);

      console.log("\nPackages to publish:");
      changedPackages.forEach((pkg) => {
        console.log(`  - ${pkg.name} (${pkg.currentVersion})`);
      });

      // Use new GitHub Actions output format (GITHUB_OUTPUT file)
      const githubOutput = process.env.GITHUB_OUTPUT;
      if (githubOutput) {
        // Append to GITHUB_OUTPUT file
        const outputFile = Bun.file(githubOutput);
        const existingContent = (await outputFile.exists()) ? await outputFile.text() : "";
        await Bun.write(githubOutput, existingContent + `packages=${packagesJson}\nhas_changes=true\n`);
      } else {
        // Fallback for local testing
        console.log(`\npackages=${packagesJson}`);
        console.log("has_changes=true");
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error detecting version changes:", error);
    process.exit(1);
  }
}

main();

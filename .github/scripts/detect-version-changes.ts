#!/usr/bin/env bun

/**
 * Version Change Detection Script
 *
 * Business Context: Detects packages with version changes by comparing current
 * package.json versions against the previous git tag and npm registry. This ensures
 * we only publish packages that have been intentionally versioned for release and
 * prevents attempting to republish already-published versions.
 *
 * Decision Rationale: Using git tags as the source of truth for version comparison
 * allows us to maintain a clear audit trail and prevents accidental republishing
 * of unchanged packages. Adding npm registry checks prevents 403 Forbidden errors
 * and makes the workflow idempotent. This approach integrates seamlessly with
 * semantic versioning and release workflows.
 *
 * Edge Cases Handled:
 * - No previous tags exist (first release) - all packages are considered changed
 * - Package doesn't exist in previous tag - package is considered new/changed
 * - Package already published to npm - package is skipped to prevent 403 errors
 * - npm registry query failures - package is attempted for safety (fails open)
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
  packageName?: string;
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
 * Gets the published version of a package from npm registry.
 *
 * Business Context: Before attempting to publish, we check if the package
 * already exists at the current version in npm registry to prevent 403 errors.
 *
 * Decision Rationale: Using `npm view` is a public operation that doesn't require
 * authentication and works reliably for both scoped and unscoped packages.
 *
 * @param packageName The full npm package name (e.g., "@wemake.cx/memory")
 * @returns The published version string, or null if package doesn't exist
 */
async function getPublishedVersion(packageName: string): Promise<string | null> {
  try {
    // Use npm view to check published version (works without authentication)
    const result = await $`npm view ${packageName} version`.text();
    return result.trim() || null;
  } catch {
    // Package not published yet or doesn't exist
    return null;
  }
}

/**
 * Reads the version and name from a package.json file
 */
async function readPackageVersion(packagePath: string): Promise<{ version: string; name: string } | null> {
  try {
    const packageJsonPath = join(packagePath, "package.json");
    const packageFile = Bun.file(packageJsonPath);
    if (!(await packageFile.exists())) {
      return null;
    }
    const packageJson = await packageFile.json();
    if (!packageJson.version || !packageJson.name) {
      return null;
    }
    return { version: packageJson.version, name: packageJson.name };
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
    const packageDirName = packagePath.split("/").pop()!;
    const packageData = await readPackageVersion(packagePath);

    if (!packageData) {
      console.warn(`Skipping ${packageDirName}: No version or name found in package.json`);
      continue;
    }

    const { version: currentVersion, name: packageName } = packageData;

    let previousVersion: string | null = null;
    let hasVersionChange = true;

    if (latestTag) {
      previousVersion = await readPackageVersionAtTag(latestTag, packageDirName);
      hasVersionChange = previousVersion !== currentVersion;
    }

    // Check if already published to npm
    const publishedVersion = await getPublishedVersion(packageName);
    if (publishedVersion === currentVersion) {
      console.log(`  ${packageDirName}: already published (${currentVersion})`);
      hasVersionChange = false;
    } else if (hasVersionChange) {
      const changeType = previousVersion ? `${previousVersion} → ${currentVersion}` : `new package (${currentVersion})`;
      console.log(`✓ ${packageDirName}: ${changeType}`);
    } else {
      console.log(`  ${packageDirName}: no change (${currentVersion})`);
    }

    const packageInfo: PackageInfo = {
      name: packageDirName,
      path: packagePath,
      currentVersion,
      hasVersionChange,
      packageName
    };

    if (previousVersion !== null) {
      packageInfo.previousVersion = previousVersion;
    }

    packageInfos.push(packageInfo);
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

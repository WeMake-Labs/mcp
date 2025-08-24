#!/usr/bin/env bun
/**
 * Test script for tarball creation logic validation
 * Validates package name transformation and tarball generation
 */

import { $ } from "bun";
import { existsSync } from "fs";

/**
 * Test tarball creation logic for analogical-reasoning package
 */
async function testTarballCreation(): Promise<void> {
  console.log("🧪 Testing Tarball Creation Logic\n");

  const packageDir = "src/analogical-reasoning";
  const originalCwd = process.cwd();

  try {
    // Change to package directory
    process.chdir(packageDir);

    // Test package name extraction
    console.log("📋 Testing package name extraction...");
    const packageNameResult = await $`jq -r '.name' package.json | sed 's/@//g' | sed 's/\//-/g'`;
    const packageName = packageNameResult.text().trim();
    console.log(`   Package name: '${packageName}'`);

    if (!packageName || packageName === "null") {
      throw new Error("Package name extraction failed");
    }

    // Test version extraction (simulate new version)
    const testVersion = "0.1.3";
    console.log(`   Test version: '${testVersion}'`);

    // Test tarball name generation
    const tarballName = `${packageName}-${testVersion}.tgz`;
    console.log(`   Expected tarball: '${tarballName}'`);

    // Validate expected format
    const expectedPattern = /^wemake\.cx-analogical-reasoning-\d+\.\d+\.\d+\.tgz$/;
    if (!expectedPattern.test(tarballName)) {
      throw new Error(`Tarball name '${tarballName}' doesn't match expected pattern`);
    }

    console.log("✅ Package name transformation validated\n");

    // Test temporary directory creation
    console.log("📁 Testing temporary directory logic...");
    const tmpDirResult = await $`mktemp -d`;
    const tmpDir = tmpDirResult.text().trim();
    console.log(`   Temp directory: ${tmpDir}`);

    if (!existsSync(tmpDir)) {
      throw new Error("Temporary directory creation failed");
    }

    // Test rsync command (dry run)
    console.log("🔄 Testing rsync command (dry run)...");
    await $`rsync -a --dry-run --exclude=node_modules --exclude=.git --exclude='*.test.*' --exclude=tests . ${tmpDir}/`;
    console.log("   Rsync command validated");

    // Clean up temp directory
    await $`rm -rf ${tmpDir}`;
    console.log("✅ Temporary directory logic validated\n");

    console.log("🎉 All tarball creation tests passed!");
  } catch (error) {
    console.error("❌ Tarball creation test failed:", error);
    process.exit(1);
  } finally {
    // Restore original working directory
    process.chdir(originalCwd);
  }
}

/**
 * Main execution
 */
if (import.meta.main) {
  await testTarballCreation();
}

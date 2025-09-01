/**
 * Glob pattern resolver utility for test file discovery
 */

import { readdirSync, statSync } from "node:fs";
import { resolve, join } from "path";

export interface GlobResolverOptions {
  baseDir?: string;
  ignore?: string[];
}

export class GlobResolver {
  private baseDir: string;
  private ignore: string[];

  constructor(options: GlobResolverOptions = {}) {
    this.baseDir = options.baseDir || process.cwd();
    this.ignore = options.ignore || ["node_modules", "dist", "build", ".git"];
  }

  /**
   * Resolve glob patterns to actual file paths
   */
  async resolve(pattern: string): Promise<string[]> {
    return this.resolveSync(pattern);
  }

  /**
   * Resolve glob patterns synchronously
   */
  resolveSync(pattern: string): string[] {
    try {
      const fullPattern = resolve(this.baseDir, pattern);

      // Simple pattern matching - if it contains wildcards, search recursively
      if (isGlobPattern(pattern)) {
        return this.findMatchingFiles(this.baseDir, pattern);
      }

      // Direct file path
      try {
        statSync(fullPattern);
        return [fullPattern];
      } catch {
        return [];
      }
    } catch (error) {
      console.error(`Error resolving glob pattern "${pattern}":`, error);
      return [];
    }
  }

  private findMatchingFiles(dir: string, pattern: string): string[] {
    const results: string[] = [];

    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        if (this.ignore.includes(entry)) continue;

        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          results.push(...this.findMatchingFiles(fullPath, pattern));
        } else if (stat.isFile() && this.matchesPattern(fullPath, pattern)) {
          results.push(fullPath);
        }
      }
    } catch {
      // Ignore permission errors and continue
    }

    return results;
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Simple pattern matching for *.test.ts, **/*.test.ts etc.
    const fileName = filePath.split("/").pop() || "";

    if (pattern.includes("*.test.ts")) {
      return fileName.endsWith(".test.ts");
    }

    if (pattern.includes("*.ts")) {
      return fileName.endsWith(".ts");
    }

    return fileName.includes(pattern.replace(/[*]/g, ""));
  }
}

/**
 * Check if a string contains glob patterns
 */
export function isGlobPattern(str: string): boolean {
  return /[*?[\]{}]/.test(str);
}

/**
 * Normalize glob patterns for cross-platform compatibility
 */
export function normalizeGlobPattern(pattern: string): string {
  return pattern.replace(/\\/g, "/");
}

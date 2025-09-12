#!/usr/bin/env bun
import { performance } from "perf_hooks";
import { writeFileSync } from "fs";

interface BenchmarkResult {
  name: string;
  duration: number;
  memory: number;
  iterations: number;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  async benchmark(name: string, fn: () => Promise<void> | void, iterations = 100): Promise<BenchmarkResult> {
    const memoryBefore = process.memoryUsage().heapUsed;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await fn();
    }

    const end = performance.now();
    const memoryAfter = process.memoryUsage().heapUsed;

    const result: BenchmarkResult = {
      name,
      duration: end - start,
      memory: memoryAfter - memoryBefore,
      iterations
    };

    this.results.push(result);
    return result;
  }

  generateReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        totalTests: this.results.length,
        averageDuration: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length,
        totalMemory: this.results.reduce((sum, r) => sum + r.memory, 0)
      }
    };

    writeFileSync("benchmark-report.json", JSON.stringify(report, null, 2));
    console.log("📊 Benchmark report generated: benchmark-report.json");
  }
}

// Export for use in tests
export const benchmark = new PerformanceBenchmark();

/**
 * Test Configuration for Collaborative Reasoning Module
 * 
 * This configuration file sets up comprehensive testing with:
 * - Coverage reporting
 * - Test environment setup
 * - Performance monitoring
 * - Security test configurations
 */

export interface TestConfig {
  coverage: {
    enabled: boolean;
    threshold: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
    exclude: string[];
    reporters: string[];
  };
  performance: {
    enabled: boolean;
    maxExecutionTime: number;
    memoryThreshold: number;
    concurrentSessions: number;
  };
  security: {
    enabled: boolean;
    inputValidation: boolean;
    rateLimiting: boolean;
    dataLeakage: boolean;
  };
  environment: {
    testTimeout: number;
    retries: number;
    parallel: boolean;
    verbose: boolean;
  };
}

export const defaultTestConfig: TestConfig = {
  coverage: {
    enabled: true,
    threshold: {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    },
    exclude: [
      'tests/**/*',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/test-data.ts'
    ],
    reporters: ['text', 'html', 'json']
  },
  performance: {
    enabled: true,
    maxExecutionTime: 5000, // 5 seconds
    memoryThreshold: 100 * 1024 * 1024, // 100MB
    concurrentSessions: 10
  },
  security: {
    enabled: true,
    inputValidation: true,
    rateLimiting: true,
    dataLeakage: true
  },
  environment: {
    testTimeout: 30000, // 30 seconds
    retries: 2,
    parallel: true,
    verbose: false
  }
};

/**
 * Test Suite Categories
 */
export enum TestSuite {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

/**
 * Test Environment Setup
 */
export class TestEnvironment {
  private static instance: TestEnvironment;
  private config: TestConfig;

  private constructor(config: TestConfig = defaultTestConfig) {
    this.config = config;
  }

  static getInstance(config?: TestConfig): TestEnvironment {
    if (!TestEnvironment.instance) {
      TestEnvironment.instance = new TestEnvironment(config);
    }
    return TestEnvironment.instance;
  }

  getConfig(): TestConfig {
    return this.config;
  }

  updateConfig(updates: Partial<TestConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Setup test environment before running tests
   */
  async setup(): Promise<void> {
    console.log('Setting up test environment...');
    
    // Setup coverage if enabled
    if (this.config.coverage.enabled) {
      console.log('Coverage reporting enabled');
    }

    // Setup performance monitoring
    if (this.config.performance.enabled) {
      console.log('Performance monitoring enabled');
    }

    // Setup security testing
    if (this.config.security.enabled) {
      console.log('Security testing enabled');
    }
  }

  /**
   * Cleanup test environment after running tests
   */
  async cleanup(): Promise<void> {
    console.log('Cleaning up test environment...');
  }

  /**
   * Get test configuration for specific suite
   */
  getSuiteConfig(suite: TestSuite): Partial<TestConfig> {
    switch (suite) {
      case TestSuite.UNIT:
        return {
          environment: {
            ...this.config.environment,
            testTimeout: 10000,
            parallel: true
          }
        };
      case TestSuite.INTEGRATION:
        return {
          environment: {
            ...this.config.environment,
            testTimeout: 20000,
            parallel: false
          }
        };
      case TestSuite.E2E:
        return {
          environment: {
            ...this.config.environment,
            testTimeout: 60000,
            parallel: false,
            retries: 3
          }
        };
      case TestSuite.SECURITY:
        return {
          environment: {
            ...this.config.environment,
            testTimeout: 30000,
            parallel: true
          },
          security: {
            ...this.config.security,
            enabled: true
          }
        };
      case TestSuite.PERFORMANCE:
        return {
          environment: {
            ...this.config.environment,
            testTimeout: 120000,
            parallel: false,
            retries: 1
          },
          performance: {
            ...this.config.performance,
            enabled: true
          }
        };
      default:
        return this.config;
    }
  }
}

/**
 * Test Utilities for Configuration
 */
export class TestConfigUtils {
  /**
   * Validate test configuration
   */
  static validateConfig(config: TestConfig): boolean {
    // Validate coverage thresholds
    const { coverage } = config;
    if (coverage.enabled) {
      const thresholds = Object.values(coverage.threshold);
      if (thresholds.some(t => t < 0 || t > 100)) {
        throw new Error('Coverage thresholds must be between 0 and 100');
      }
    }

    // Validate performance settings
    const { performance } = config;
    if (performance.enabled) {
      if (performance.maxExecutionTime <= 0) {
        throw new Error('Max execution time must be positive');
      }
      if (performance.memoryThreshold <= 0) {
        throw new Error('Memory threshold must be positive');
      }
    }

    // Validate environment settings
    const { environment } = config;
    if (environment.testTimeout <= 0) {
      throw new Error('Test timeout must be positive');
    }
    if (environment.retries < 0) {
      throw new Error('Retries must be non-negative');
    }

    return true;
  }

  /**
   * Generate test report configuration
   */
  static generateReportConfig(config: TestConfig) {
    return {
      coverage: config.coverage.enabled ? {
        reporters: config.coverage.reporters,
        threshold: config.coverage.threshold,
        exclude: config.coverage.exclude
      } : null,
      performance: config.performance.enabled ? {
        maxExecutionTime: config.performance.maxExecutionTime,
        memoryThreshold: config.performance.memoryThreshold
      } : null,
      security: config.security.enabled ? {
        inputValidation: config.security.inputValidation,
        rateLimiting: config.security.rateLimiting,
        dataLeakage: config.security.dataLeakage
      } : null
    };
  }

  /**
   * Create test configuration for CI/CD
   */
  static createCIConfig(): TestConfig {
    return {
      ...defaultTestConfig,
      environment: {
        ...defaultTestConfig.environment,
        verbose: true,
        parallel: false, // More stable in CI
        retries: 3
      },
      coverage: {
        ...defaultTestConfig.coverage,
        threshold: {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85
        }
      }
    };
  }

  /**
   * Create test configuration for development
   */
  static createDevConfig(): TestConfig {
    return {
      ...defaultTestConfig,
      environment: {
        ...defaultTestConfig.environment,
        verbose: true,
        parallel: true,
        retries: 1
      },
      coverage: {
        ...defaultTestConfig.coverage,
        threshold: {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80
        }
      }
    };
  }
}

// Export singleton instance
export const testEnvironment = TestEnvironment.getInstance();
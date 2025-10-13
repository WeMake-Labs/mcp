# GitHub Actions Workflow Testing Configuration

## Overview

This document describes the updated GitHub Actions workflow configuration for the WeMake MCP enterprise monorepo,
optimized for Bun-first development and comprehensive quality gates.

## Workflow Structure

The `typescript.yml` workflow implements a multi-stage CI/CD pipeline with the following jobs:

### 1. Package Detection (`detect-packages`)

- Automatically discovers MCP packages in `src/` directory
- Generates matrix for package-specific operations
- Uses `jq` for JSON processing of package list

### 2. Code Quality Gates

#### Linting (`lint-and-format`)

- Runs ESLint with TypeScript extensions
- Checks Prettier formatting compliance
- **Commands**: `bun run lint`, `bun run prettier`

#### Type Checking (`type-check`)

- Validates TypeScript compilation without emission
- Ensures type safety across the monorepo
- **Command**: `bun run check`

### 3. Testing Pipeline

#### Monorepo Tests (`test-monorepo`)

- Runs comprehensive test suite from repository root
- Generates JUnit XML reports for CI integration
- Provides coverage reporting via Bun's native coverage
- **Command**: `bun run test:ci`
- **Outputs**: `test-results.xml`

#### Package-Specific Tests (`test-packages`)

- Matrix strategy for individual package testing
- Conditional execution based on `test` script presence
- Runs only if package has defined test scripts
- **Command**: `bun run test` (per package)

### 4. Build Pipeline (`build`)

- Matrix strategy for building individual packages
- Uploads build artifacts for deployment
- Depends on successful completion of all test jobs
- **Command**: `bun run build` (per package)
- **Outputs**: Build artifacts in `dist/` directories

### 5. Quality Gate (`quality-gate`)

- Final validation step ensuring all jobs succeeded
- Fails the entire pipeline if any quality check fails
- Runs regardless of individual job outcomes (`if: always()`)

## Configuration Details

### Environment Variables

- `BUN_VERSION`: "1.2.0" (pinned for enterprise stability)

### Bun Setup

- Uses `oven-sh/setup-bun@v2` action
- Consistent Bun version across all jobs
- Leverages Bun's native package management

### Artifact Management

- **Test Results**: JUnit XML format for CI integration
- **Build Artifacts**: Package-specific dist directories
- **Retention**: 30 days for test results, 7 days for builds

## Testing Standards

### Monorepo Testing

The monorepo uses Bun's native test runner with the following configuration:

```toml
# bunfig.toml
[test]
root = "."
coverage = true
```

### Test Scripts (package.json)

```json
{
  "scripts": {
    "test": "bun test",
    "prepare": "bun run build",
    "test:coverage": "bun test --coverage",
    "test:watch": "bun test --watch",
    "test:ci": "bun test --reporter=junit --reporter-outfile=test-results.xml --coverage"
  }
}
```

### Coverage Requirements

- **Target**: 90%+ coverage for enterprise standards
- **Reporting**: Integrated with Bun's native coverage
- **Format**: Console output during CI, JUnit XML for integration

## Package Structure

The workflow supports the following monorepo structure:

```sh
src/
├── analogical-reasoning/
│   ├── package.json
│   ├── src/
│   ├── tests/
│   └── dist/ (generated)
└── [other-packages]/
    ├── package.json
    ├── src/
    ├── tests/
    └── dist/ (generated)
```

## Validation Commands

To verify the workflow configuration locally:

```sh
# Run all quality checks
bun run lint
bun run prettier
bun run check

# Run tests with CI configuration
bun run test:ci

# Build packages
bun run build

# Verify test results
ls -la test-results.xml
```

## Enterprise Compliance

### Security

- Least-privilege permissions (`contents: read`)
- No secret exposure in logs
- Secure artifact handling

### GDPR Compliance

- No PII in test outputs or logs
- Audit trail via GitHub Actions logs
- Data retention policies for artifacts

### Quality Gates

- Mandatory linting and formatting
- Type safety validation
- Comprehensive test coverage
- Build verification
- Final quality gate validation

## Troubleshooting

### Common Issues

1. **Missing Test Scripts**: Package-specific tests are conditional
2. **Coverage Format**: Bun outputs coverage to console, not separate files
3. **Build Failures**: Check individual package `build` scripts
4. **Quality Gate Failures**: Review all dependent job statuses

### Debug Commands

```sh
# Check package test script existence
jq -e '.scripts.test' src/[package]/package.json

# Verify Bun version compatibility
bun --version

# Test individual package
cd src/[package] && bun test
```

## Migration Notes

This workflow replaces the previous configuration with:

1. **Enhanced Quality Gates**: Added linting, formatting, and type checking
2. **Improved Test Reporting**: JUnit XML for better CI integration
3. **Artifact Management**: Structured upload and retention policies
4. **Enterprise Standards**: GDPR compliance and security best practices
5. **Bun Optimization**: Leverages Bun's native capabilities throughout

The updated workflow ensures comprehensive quality validation while maintaining the performance benefits of Bun-first
development.

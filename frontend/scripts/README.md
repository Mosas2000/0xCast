# Frontend Scripts

This directory contains utility scripts for development, testing, and performance monitoring.

## ESLint Performance Scripts

### eslint-profile.js

Profiles ESLint execution and generates a detailed performance report.

**Usage:**
```bash
npm run lint:profile
```

**Output:**
- Console output with performance metrics
- `eslint-profile-results.json` with detailed results

**Metrics:**
- Total execution time
- Files analyzed
- Average time per file
- Error and warning counts
- Files with issues

### eslint-benchmark.js

Runs multiple ESLint iterations to establish performance benchmarks.

**Usage:**
```bash
npm run lint:benchmark
```

**Output:**
- Console output with benchmark summary
- `eslint-benchmark-results.json` with detailed results

**Metrics:**
- Average, minimum, and maximum execution times
- Per-run statistics
- Consistency analysis

### lint-changed.js

Lints only files that have changed in the current Git working directory.

**Usage:**
```bash
npm run lint:changed
npm run lint:changed:fix  # Auto-fix issues
```

**Benefits:**
- Faster feedback during development
- Focus on relevant changes
- Reduced CI/CD time for incremental checks

## Other Scripts

### bundleAnalyzer.ts

Analyzes the production bundle size and composition.

### generate-icons.js

Generates PWA icons in various sizes.

### interact.js

Interactive script for contract interactions.

### run-tracked-vitest.mjs

Wrapper for running Vitest with progress tracking.

## Best Practices

1. Run profiling before and after configuration changes
2. Use incremental linting during development
3. Run benchmarks to establish performance baselines
4. Monitor performance trends over time
5. Clear cache when experiencing issues

## Performance Targets

Based on current codebase size:

- **Profile run**: < 30 seconds
- **Cached lint**: < 5 seconds
- **Incremental lint**: < 2 seconds

## Troubleshooting

### Script Permissions

If you encounter permission errors, make scripts executable:

```bash
chmod +x scripts/*.js
```

### Node Version

Ensure you're using Node.js 18 or higher:

```bash
node --version
```

### Dependencies

Install all dependencies before running scripts:

```bash
npm install
```

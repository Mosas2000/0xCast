# ESLint Performance Guide

This guide explains the ESLint performance optimizations implemented in this project and how to use them effectively.

## Performance Optimizations

### 1. Caching

ESLint caching is enabled by default in the `lint` script. This significantly reduces linting time on subsequent runs by only checking changed files.

```bash
npm run lint
```

The cache is stored in `.eslintcache` and is automatically managed by ESLint.

### 2. Ignore Patterns

The ESLint configuration includes comprehensive ignore patterns to skip unnecessary files:

- `dist` - Build output
- `node_modules` - Dependencies
- `build` - Build artifacts
- `coverage` - Test coverage reports
- `*.config.js` - Configuration files
- `*.config.ts` - TypeScript configuration files
- `scripts` - Build and utility scripts

### 3. Parser Options

The configuration disables TypeScript project references (`project: false`) to avoid the overhead of type-aware linting rules, which can be slow on large codebases.

## Available Scripts

### Standard Linting

```bash
npm run lint
```

Runs ESLint with caching enabled. This is the recommended command for daily development.

### Linting Without Cache

```bash
npm run lint:no-cache
```

Runs ESLint without using the cache. Use this when you want a fresh analysis or suspect cache issues.

### Auto-fix Issues

```bash
npm run lint:fix
```

Automatically fixes ESLint issues where possible, with caching enabled.

### Performance Profiling

```bash
npm run lint:profile
```

Generates a detailed performance profile of ESLint execution, including:
- Total execution time
- Number of files analyzed
- Average time per file
- Error and warning counts
- Files with issues

Results are saved to `eslint-profile-results.json`.

### Clear Cache

```bash
npm run lint:clear-cache
```

Removes the ESLint cache file. Use this if you experience cache-related issues.

## Performance Tips

### 1. Use Incremental Linting

Instead of linting the entire codebase, lint specific files or directories:

```bash
npx eslint src/components --cache
npx eslint src/hooks --cache
```

### 2. Integrate with Git Hooks

Use tools like `husky` and `lint-staged` to lint only staged files before commits:

```bash
npm install --save-dev husky lint-staged
```

### 3. CI/CD Optimization

In CI/CD pipelines, consider:
- Caching the `.eslintcache` file between runs
- Running linting in parallel with other checks
- Using incremental linting for pull requests

### 4. Editor Integration

Configure your editor to run ESLint on save for immediate feedback without running the full lint command.

## Monitoring Performance

### Baseline Metrics

Run the profiling script to establish baseline metrics:

```bash
npm run lint:profile
```

### Regular Monitoring

Periodically run the profiling script to track performance trends as the codebase grows.

### Performance Targets

- **Small projects** (< 100 files): < 5 seconds
- **Medium projects** (100-500 files): < 15 seconds
- **Large projects** (> 500 files): < 30 seconds

## Troubleshooting

### Slow Linting

If linting is slow:

1. Check the number of files being analyzed
2. Review ignore patterns to ensure unnecessary files are excluded
3. Consider disabling type-aware rules if enabled
4. Clear the cache and rebuild: `npm run lint:clear-cache && npm run lint`

### Cache Issues

If you experience inconsistent results:

1. Clear the cache: `npm run lint:clear-cache`
2. Run without cache: `npm run lint:no-cache`
3. Check for file system permissions issues

### Memory Issues

For very large codebases, you may need to increase Node.js memory:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run lint
```

## Best Practices

1. **Always use caching** in development
2. **Profile regularly** to catch performance regressions
3. **Keep ignore patterns updated** as the project structure changes
4. **Use incremental linting** for large codebases
5. **Monitor CI/CD times** and optimize as needed

## Further Reading

- [ESLint Performance Documentation](https://eslint.org/docs/latest/use/configure/configuration-files#performance)
- [ESLint Caching](https://eslint.org/docs/latest/use/command-line-interface#caching)
- [TypeScript ESLint Performance](https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting)

#!/usr/bin/env node

import { ESLint } from 'eslint';
import { performance } from 'perf_hooks';
import fs from 'fs';

const BENCHMARK_RUNS = 3;
const BENCHMARK_OUTPUT = 'eslint-benchmark-results.json';

async function runBenchmark() {
  console.log(`Running ESLint benchmark (${BENCHMARK_RUNS} iterations)...\n`);

  const results = [];

  for (let i = 0; i < BENCHMARK_RUNS; i++) {
    console.log(`Run ${i + 1}/${BENCHMARK_RUNS}...`);

    const startTime = performance.now();
    const eslint = new ESLint({ cache: false });
    const lintResults = await eslint.lintFiles(['src/**/*.{ts,tsx}']);
    const endTime = performance.now();

    const runTime = endTime - startTime;
    const fileCount = lintResults.length;

    results.push({
      run: i + 1,
      time: runTime,
      timeSeconds: runTime / 1000,
      fileCount,
      avgTimePerFile: runTime / fileCount,
    });

    console.log(`  Time: ${(runTime / 1000).toFixed(2)}s\n`);
  }

  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / BENCHMARK_RUNS;
  const minTime = Math.min(...results.map(r => r.time));
  const maxTime = Math.max(...results.map(r => r.time));

  const benchmarkData = {
    timestamp: new Date().toISOString(),
    runs: BENCHMARK_RUNS,
    results,
    summary: {
      averageTime: `${(avgTime / 1000).toFixed(2)}s`,
      minTime: `${(minTime / 1000).toFixed(2)}s`,
      maxTime: `${(maxTime / 1000).toFixed(2)}s`,
      fileCount: results[0].fileCount,
      avgTimePerFile: `${(avgTime / results[0].fileCount).toFixed(2)}ms`,
    },
  };

  console.log('Benchmark Summary:');
  console.log('==================');
  console.log(`Average Time: ${benchmarkData.summary.averageTime}`);
  console.log(`Min Time: ${benchmarkData.summary.minTime}`);
  console.log(`Max Time: ${benchmarkData.summary.maxTime}`);
  console.log(`Files: ${benchmarkData.summary.fileCount}`);
  console.log(`Avg Time per File: ${benchmarkData.summary.avgTimePerFile}`);

  fs.writeFileSync(
    BENCHMARK_OUTPUT,
    JSON.stringify(benchmarkData, null, 2)
  );

  console.log(`\nBenchmark results saved to ${BENCHMARK_OUTPUT}`);
}

runBenchmark().catch(error => {
  console.error('Error during benchmark:', error);
  process.exit(1);
});

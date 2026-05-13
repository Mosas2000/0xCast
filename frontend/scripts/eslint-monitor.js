#!/usr/bin/env node

import { ESLint } from 'eslint';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

const HISTORY_FILE = 'eslint-performance-history.json';
const MAX_HISTORY_ENTRIES = 50;

async function monitorPerformance() {
  console.log('Monitoring ESLint performance...\n');

  const startTime = performance.now();
  const eslint = new ESLint({ cache: true });
  const results = await eslint.lintFiles(['src/**/*.{ts,tsx}']);
  const endTime = performance.now();

  const totalTime = endTime - startTime;
  const fileCount = results.length;
  const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
  const warningCount = results.reduce((sum, result) => sum + result.warningCount, 0);

  const entry = {
    timestamp: new Date().toISOString(),
    totalTimeMs: Math.round(totalTime),
    totalTimeSeconds: (totalTime / 1000).toFixed(2),
    fileCount,
    avgTimePerFileMs: Math.round(totalTime / fileCount),
    errorCount,
    warningCount,
    cached: true,
  };

  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  }

  history.push(entry);

  if (history.length > MAX_HISTORY_ENTRIES) {
    history = history.slice(-MAX_HISTORY_ENTRIES);
  }

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

  console.log('Performance Entry:');
  console.log('==================');
  console.log(`Time: ${entry.totalTimeSeconds}s`);
  console.log(`Files: ${fileCount}`);
  console.log(`Avg per file: ${entry.avgTimePerFileMs}ms`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Warnings: ${warningCount}`);

  if (history.length > 1) {
    const previous = history[history.length - 2];
    const timeDiff = entry.totalTimeMs - previous.totalTimeMs;
    const percentChange = ((timeDiff / previous.totalTimeMs) * 100).toFixed(1);

    console.log(`\nChange from previous: ${timeDiff > 0 ? '+' : ''}${timeDiff}ms (${percentChange}%)`);
  }

  console.log(`\nHistory entries: ${history.length}/${MAX_HISTORY_ENTRIES}`);
}

monitorPerformance().catch(error => {
  console.error('Error during monitoring:', error);
  process.exit(1);
});

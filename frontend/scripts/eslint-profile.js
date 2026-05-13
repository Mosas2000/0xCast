#!/usr/bin/env node

import { ESLint } from 'eslint';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

const PROFILE_OUTPUT = 'eslint-profile-results.json';

async function profileESLint() {
  console.log('Starting ESLint performance profiling...\n');

  const startTime = performance.now();
  const eslint = new ESLint({
    cache: false,
  });

  const results = await eslint.lintFiles(['src/**/*.{ts,tsx}']);
  const endTime = performance.now();

  const totalTime = endTime - startTime;
  const fileCount = results.length;
  const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
  const warningCount = results.reduce((sum, result) => sum + result.warningCount, 0);

  const fileTimings = results.map(result => ({
    filePath: result.filePath,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
  }));

  const profileData = {
    timestamp: new Date().toISOString(),
    totalTime: `${totalTime.toFixed(2)}ms`,
    totalTimeSeconds: `${(totalTime / 1000).toFixed(2)}s`,
    fileCount,
    averageTimePerFile: `${(totalTime / fileCount).toFixed(2)}ms`,
    errorCount,
    warningCount,
    filesWithIssues: fileTimings.filter(f => f.errorCount > 0 || f.warningCount > 0).length,
  };

  console.log('ESLint Performance Profile:');
  console.log('============================');
  console.log(`Total Time: ${profileData.totalTimeSeconds}`);
  console.log(`Files Analyzed: ${fileCount}`);
  console.log(`Average Time per File: ${profileData.averageTimePerFile}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Warnings: ${warningCount}`);
  console.log(`Files with Issues: ${profileData.filesWithIssues}`);

  fs.writeFileSync(
    PROFILE_OUTPUT,
    JSON.stringify(profileData, null, 2)
  );

  console.log(`\nProfile results saved to ${PROFILE_OUTPUT}`);

  return profileData;
}

profileESLint().catch(error => {
  console.error('Error during profiling:', error);
  process.exit(1);
});

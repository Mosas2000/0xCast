#!/usr/bin/env node

import { execSync } from 'child_process';
import { ESLint } from 'eslint';

async function lintChangedFiles() {
  try {
    const changedFiles = execSync('git diff --name-only --diff-filter=ACMR HEAD', {
      encoding: 'utf8',
    })
      .split('\n')
      .filter(file => file.match(/\.(ts|tsx)$/))
      .filter(Boolean);

    if (changedFiles.length === 0) {
      console.log('No TypeScript files changed.');
      return;
    }

    console.log(`Linting ${changedFiles.length} changed file(s)...\n`);

    const eslint = new ESLint({
      cache: true,
      fix: process.argv.includes('--fix'),
    });

    const results = await eslint.lintFiles(changedFiles);

    if (process.argv.includes('--fix')) {
      await ESLint.outputFixes(results);
    }

    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);

    console.log(resultText);

    const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
    const warningCount = results.reduce((sum, result) => sum + result.warningCount, 0);

    console.log(`\nTotal: ${errorCount} error(s), ${warningCount} warning(s)`);

    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error linting changed files:', error.message);
    process.exit(1);
  }
}

lintChangedFiles();

#!/usr/bin/env node

import { spawn } from 'child_process';

const testPatterns = [
  'errorHandling',
  'ErrorHandler',
  'StorageErrorHandler',
  'ValidationErrorHandler',
  'helpers',
];

console.log('Running error handling utility tests...\n');

const args = [
  'vitest',
  'run',
  '--reporter=verbose',
  ...testPatterns.map(pattern => `--grep=${pattern}`),
];

const vitest = spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
});

vitest.on('close', (code) => {
  if (code === 0) {
    console.log('\n✓ All error handling tests passed!');
  } else {
    console.error('\n✗ Some tests failed');
    process.exit(code);
  }
});

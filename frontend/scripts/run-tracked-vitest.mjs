#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const vitestArgs = process.argv.slice(2);
const gitResult = spawnSync('git', ['ls-files', '-z'], {
  encoding: 'buffer',
});

if (gitResult.status !== 0) {
  process.stderr.write(gitResult.stderr?.toString() || 'Failed to list tracked files.\n');
  process.exit(gitResult.status ?? 1);
}

const trackedFiles = gitResult.stdout
  .toString('utf8')
  .split('\0')
  .filter(Boolean)
  .filter((file) => /^src\/(?:.*\/__tests__\/[^/]+\.(?:ts|tsx)|.*\.(?:test|spec)\.(?:ts|tsx))$/.test(file))
  .filter((file) => {
    const absolutePath = resolve(process.cwd(), file);
    return readFileSync(absolutePath, 'utf8').trim().length > 0;
  });

if (trackedFiles.length === 0) {
  process.stderr.write('No tracked frontend test files were found.\n');
  process.exit(1);
}

const vitestBin = resolve(process.cwd(), 'node_modules/vitest/vitest.mjs');
const vitestResult = spawnSync(process.execPath, [vitestBin, 'run', ...vitestArgs, ...trackedFiles], {
  stdio: 'inherit',
});

process.exit(vitestResult.status ?? 1);

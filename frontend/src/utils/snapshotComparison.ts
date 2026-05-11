export interface SnapshotDiff {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
}

export function compareSnapshots(
  snapshot1: Record<string, unknown>,
  snapshot2: Record<string, unknown>
): SnapshotDiff {
  const keys1 = new Set(Object.keys(snapshot1));
  const keys2 = new Set(Object.keys(snapshot2));

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];
  const unchanged: string[] = [];

  for (const key of keys2) {
    if (!keys1.has(key)) {
      added.push(key);
    }
  }

  for (const key of keys1) {
    if (!keys2.has(key)) {
      removed.push(key);
    } else {
      const value1 = JSON.stringify(snapshot1[key]);
      const value2 = JSON.stringify(snapshot2[key]);

      if (value1 === value2) {
        unchanged.push(key);
      } else {
        modified.push(key);
      }
    }
  }

  return { added, removed, modified, unchanged };
}

export function calculateSimilarity(diff: SnapshotDiff): number {
  const total = diff.added.length + diff.removed.length + diff.modified.length + diff.unchanged.length;

  if (total === 0) return 1;

  return diff.unchanged.length / total;
}

export function formatDiffReport(diff: SnapshotDiff): string {
  const lines: string[] = [];

  lines.push('Snapshot Comparison Report');
  lines.push('=========================');
  lines.push('');

  if (diff.added.length > 0) {
    lines.push(`Added (${diff.added.length}):`);
    diff.added.forEach(key => lines.push(`  + ${key}`));
    lines.push('');
  }

  if (diff.removed.length > 0) {
    lines.push(`Removed (${diff.removed.length}):`);
    diff.removed.forEach(key => lines.push(`  - ${key}`));
    lines.push('');
  }

  if (diff.modified.length > 0) {
    lines.push(`Modified (${diff.modified.length}):`);
    diff.modified.forEach(key => lines.push(`  ~ ${key}`));
    lines.push('');
  }

  lines.push(`Unchanged: ${diff.unchanged.length}`);
  lines.push(`Similarity: ${(calculateSimilarity(diff) * 100).toFixed(1)}%`);

  return lines.join('\n');
}

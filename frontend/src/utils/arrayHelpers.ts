export interface Notification {
  type: string;
  message: string;
  createdAt: string | Date;
}

export class ArrayHelpers {
  static deduplicate<T>(
    items: T[],
    keyExtractor: (item: T) => string
  ): T[] {
    if (items.length === 0) {
      return [];
    }

    const seen = new Set<string>();
    const deduplicated: T[] = [];

    for (const item of items) {
      const key = keyExtractor(item);
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    return deduplicated;
  }

  static sortBy<T>(
    items: T[],
    compareFn: (a: T, b: T) => number
  ): T[] {
    return [...items].sort(compareFn);
  }

  static sortByDate<T>(
    items: T[],
    dateExtractor: (item: T) => Date | string,
    order: 'asc' | 'desc' = 'desc'
  ): T[] {
    return this.sortBy(items, (a, b) => {
      const dateA = new Date(dateExtractor(a)).getTime();
      const dateB = new Date(dateExtractor(b)).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  static sortByPriority<T>(
    items: T[],
    priorityExtractor: (item: T) => number,
    order: 'asc' | 'desc' = 'asc'
  ): T[] {
    return this.sortBy(items, (a, b) => {
      const priorityA = priorityExtractor(a);
      const priorityB = priorityExtractor(b);
      return order === 'asc' ? priorityA - priorityB : priorityB - priorityA;
    });
  }

  static groupBy<T, K extends string | number>(
    items: T[],
    keyExtractor: (item: T) => K
  ): Record<K, T[]> {
    return items.reduce((groups, item) => {
      const key = keyExtractor(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  }

  static filterUnique<T>(
    items: T[],
    keyExtractor?: (item: T) => string
  ): T[] {
    if (!keyExtractor) {
      return Array.from(new Set(items));
    }
    return this.deduplicate(items, keyExtractor);
  }

  static chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  }

  static partition<T>(
    items: T[],
    predicate: (item: T) => boolean
  ): [T[], T[]] {
    const truthy: T[] = [];
    const falsy: T[] = [];

    for (const item of items) {
      if (predicate(item)) {
        truthy.push(item);
      } else {
        falsy.push(item);
      }
    }

    return [truthy, falsy];
  }
}

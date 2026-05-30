# Utility Functions

## ArrayHelpers

Generic utility functions for working with arrays. These functions are type-safe and can be used with any array of objects.

### Methods

#### `deduplicate<T>(items: T[], keyExtractor: (item: T) => string): T[]`

Removes duplicate items from an array based on a key extraction function.

```typescript
const items = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice' }
];

const unique = ArrayHelpers.deduplicate(items, (item) => String(item.id));
```

#### `sortBy<T>(items: T[], compareFn: (a: T, b: T) => number): T[]`

Sorts an array using a custom comparison function. Returns a new array without mutating the original.

```typescript
const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
const sorted = ArrayHelpers.sortBy(items, (a, b) => a.value - b.value);
```

#### `sortByDate<T>(items: T[], dateExtractor: (item: T) => Date | string, order?: 'asc' | 'desc'): T[]`

Sorts an array by date field. Default order is descending.

```typescript
const items = [
  { createdAt: '2024-01-01' },
  { createdAt: '2024-03-01' }
];

const sorted = ArrayHelpers.sortByDate(items, (item) => item.createdAt, 'desc');
```

#### `sortByPriority<T>(items: T[], priorityExtractor: (item: T) => number, order?: 'asc' | 'desc'): T[]`

Sorts an array by priority value. Default order is ascending.

```typescript
const items = [
  { priority: 3 },
  { priority: 1 }
];

const sorted = ArrayHelpers.sortByPriority(items, (item) => item.priority);
```

#### `groupBy<T, K>(items: T[], keyExtractor: (item: T) => K): Record<K, T[]>`

Groups array items by a key.

```typescript
const items = [
  { category: 'fruit', name: 'apple' },
  { category: 'vegetable', name: 'carrot' }
];

const grouped = ArrayHelpers.groupBy(items, (item) => item.category);
```

#### `filterUnique<T>(items: T[], keyExtractor?: (item: T) => string): T[]`

Filters array to unique values. For primitive arrays, no key extractor is needed.

```typescript
const numbers = [1, 2, 2, 3];
const unique = ArrayHelpers.filterUnique(numbers);
```

#### `chunk<T>(items: T[], size: number): T[][]`

Splits an array into chunks of specified size.

```typescript
const items = [1, 2, 3, 4, 5];
const chunks = ArrayHelpers.chunk(items, 2);
```

#### `partition<T>(items: T[], predicate: (item: T) => boolean): [T[], T[]]`

Partitions an array into two arrays based on a predicate function.

```typescript
const numbers = [1, 2, 3, 4, 5];
const [even, odd] = ArrayHelpers.partition(numbers, (n) => n % 2 === 0);
```

## NotificationHelpers

Utility functions specific to notification handling. Uses ArrayHelpers internally for deduplication and sorting operations.

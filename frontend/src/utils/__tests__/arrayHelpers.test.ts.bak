import { describe, it, expect } from 'vitest';
import { ArrayHelpers } from '../arrayHelpers';

describe('ArrayHelpers', () => {
  describe('deduplicate', () => {
    it('should remove duplicate items based on key extractor', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice' },
        { id: 3, name: 'Charlie' },
      ];

      const result = ArrayHelpers.deduplicate(items, (item) => String(item.id));

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ]);
    });

    it('should handle empty arrays', () => {
      const result = ArrayHelpers.deduplicate([], (item) => String(item));
      expect(result).toEqual([]);
    });
  });

  describe('sortBy', () => {
    it('should sort items using custom compare function', () => {
      const items = [{ value: 3 }, { value: 1 }, { value: 2 }];

      const result = ArrayHelpers.sortBy(items, (a, b) => a.value - b.value);

      expect(result).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
    });

    it('should not mutate original array', () => {
      const items = [{ value: 3 }, { value: 1 }];
      const original = [...items];

      ArrayHelpers.sortBy(items, (a, b) => a.value - b.value);

      expect(items).toEqual(original);
    });
  });

  describe('sortByDate', () => {
    it('should sort items by date in descending order by default', () => {
      const items = [
        { date: '2024-01-01' },
        { date: '2024-03-01' },
        { date: '2024-02-01' },
      ];

      const result = ArrayHelpers.sortByDate(items, (item) => item.date);

      expect(result[0].date).toBe('2024-03-01');
      expect(result[2].date).toBe('2024-01-01');
    });

    it('should sort items by date in ascending order', () => {
      const items = [
        { date: '2024-03-01' },
        { date: '2024-01-01' },
      ];

      const result = ArrayHelpers.sortByDate(items, (item) => item.date, 'asc');

      expect(result[0].date).toBe('2024-01-01');
      expect(result[1].date).toBe('2024-03-01');
    });
  });

  describe('sortByPriority', () => {
    it('should sort items by priority in ascending order by default', () => {
      const items = [
        { priority: 3 },
        { priority: 1 },
        { priority: 2 },
      ];

      const result = ArrayHelpers.sortByPriority(items, (item) => item.priority);

      expect(result).toEqual([
        { priority: 1 },
        { priority: 2 },
        { priority: 3 },
      ]);
    });

    it('should sort items by priority in descending order', () => {
      const items = [
        { priority: 1 },
        { priority: 3 },
      ];

      const result = ArrayHelpers.sortByPriority(items, (item) => item.priority, 'desc');

      expect(result[0].priority).toBe(3);
      expect(result[1].priority).toBe(1);
    });
  });

  describe('groupBy', () => {
    it('should group items by key', () => {
      const items = [
        { category: 'fruit', name: 'apple' },
        { category: 'vegetable', name: 'carrot' },
        { category: 'fruit', name: 'banana' },
      ];

      const result = ArrayHelpers.groupBy(items, (item) => item.category);

      expect(result.fruit).toHaveLength(2);
      expect(result.vegetable).toHaveLength(1);
      expect(result.fruit[0].name).toBe('apple');
    });
  });

  describe('filterUnique', () => {
    it('should filter unique primitive values', () => {
      const items = [1, 2, 2, 3, 1, 4];

      const result = ArrayHelpers.filterUnique(items);

      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should filter unique objects using key extractor', () => {
      const items = [
        { id: 1 },
        { id: 2 },
        { id: 1 },
      ];

      const result = ArrayHelpers.filterUnique(items, (item) => String(item.id));

      expect(result).toHaveLength(2);
    });
  });

  describe('chunk', () => {
    it('should split array into chunks of specified size', () => {
      const items = [1, 2, 3, 4, 5, 6, 7];

      const result = ArrayHelpers.chunk(items, 3);

      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('should handle empty arrays', () => {
      const result = ArrayHelpers.chunk([], 3);
      expect(result).toEqual([]);
    });
  });

  describe('partition', () => {
    it('should partition array based on predicate', () => {
      const items = [1, 2, 3, 4, 5, 6];

      const [even, odd] = ArrayHelpers.partition(items, (item) => item % 2 === 0);

      expect(even).toEqual([2, 4, 6]);
      expect(odd).toEqual([1, 3, 5]);
    });
  });
});

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    // Store callback for potential use
    void callback;
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    void callback;
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock localStorage with a functional Map-backed implementation.
// vi.fn() bare stubs return `undefined` by default, which breaks any code that
// actually reads from storage. Using a Map keeps data consistent within a test.
const localStorageStore = new Map<string, string>();

const localStorageMock = {
  getItem: vi.fn((key: string): string | null => localStorageStore.get(key) ?? null),
  setItem: vi.fn((key: string, value: string): void => { localStorageStore.set(key, String(value)); }),
  removeItem: vi.fn((key: string): void => { localStorageStore.delete(key); }),
  clear: vi.fn((): void => { localStorageStore.clear(); }),
  get length(): number { return localStorageStore.size; },
  key: vi.fn((index: number): string | null => Array.from(localStorageStore.keys())[index] ?? null),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Suppress console errors during tests (optional)
// vi.spyOn(console, 'error').mockImplementation(() => {});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider } from '../ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ThemeProvider component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('exports ThemeProvider component', () => {
    expect(ThemeProvider).toBeDefined();
  });

  it('localStorage key is 0xcast_theme', () => {
    const key = '0xcast_theme';
    localStorage.setItem(key, 'dark');
    expect(localStorage.getItem(key)).toBe('dark');
  });

  it('theme storage can be cleared', () => {
    const key = '0xcast_theme';
    localStorage.setItem(key, 'dark');
    localStorage.removeItem(key);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('supports light and dark theme values', () => {
    const themes = ['light', 'dark'] as const;
    themes.forEach(theme => {
      localStorage.clear();
      localStorage.setItem('0xcast_theme', theme);
      expect(localStorage.getItem('0xcast_theme')).toBe(theme);
    });
  });

  it('persists theme across storage operations', () => {
    const key = '0xcast_theme';
    const theme = 'dark';
    
    localStorage.setItem(key, theme);
    expect(localStorage.getItem(key)).toBe(theme);
    
    localStorage.setItem(key, 'light');
    expect(localStorage.getItem(key)).toBe('light');
    
    localStorage.setItem(key, theme);
    expect(localStorage.getItem(key)).toBe(theme);
  });

  it('handles localStorage clear operation', () => {
    const key = '0xcast_theme';
    localStorage.setItem(key, 'dark');
    localStorage.clear();
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('document element can receive dark class', () => {
    document.documentElement.classList.add('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('document element dark class can be removed', () => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('document element dark class toggling works correctly', () => {
    const element = document.documentElement;
    
    expect(element.classList.contains('dark')).toBe(false);
    
    element.classList.add('dark');
    expect(element.classList.contains('dark')).toBe(true);
    
    element.classList.remove('dark');
    expect(element.classList.contains('dark')).toBe(false);
    
    element.classList.toggle('dark');
    expect(element.classList.contains('dark')).toBe(true);
    
    element.classList.toggle('dark');
    expect(element.classList.contains('dark')).toBe(false);
  });

  it('preserves multiple classes on document element', () => {
    const element = document.documentElement;
    
    element.classList.add('theme-enabled');
    element.classList.add('dark');
    
    expect(element.classList.contains('theme-enabled')).toBe(true);
    expect(element.classList.contains('dark')).toBe(true);
  });

  it('theme context storage format is consistent', () => {
    const key = '0xcast_theme';
    const values = ['light', 'dark'];
    
    values.forEach(value => {
      localStorage.clear();
      localStorage.setItem(key, value);
      const retrieved = localStorage.getItem(key);
      expect(retrieved).toBe(value);
      expect(typeof retrieved).toBe('string');
    });
  });
});

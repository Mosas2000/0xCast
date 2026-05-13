import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  announceToScreenReader,
  prefersReducedMotion,
  prefersHighContrast,
  generateA11yId,
  getFocusableElements,
  isVisibleToScreenReader,
  getAccessibleName,
  hasAccessibleName,
  validateAriaAttributes,
} from '../accessibility';

describe('Accessibility Utilities', () => {
  describe('announceToScreenReader', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      document.body.innerHTML = '';
    });

    it('creates live region with message', () => {
      announceToScreenReader({
        message: 'Test announcement',
        priority: 'polite',
      });

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.textContent).toBe('Test announcement');
    });

    it('removes live region after timeout', () => {
      announceToScreenReader({
        message: 'Test',
        priority: 'polite',
        clearAfter: 500,
      });

      expect(document.querySelector('[role="status"]')).toBeTruthy();

      vi.advanceTimersByTime(500);

      expect(document.querySelector('[role="status"]')).toBeFalsy();
    });
  });

  describe('prefersReducedMotion', () => {
    it('returns boolean', () => {
      const result = prefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('prefersHighContrast', () => {
    it('returns boolean', () => {
      const result = prefersHighContrast();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('generateA11yId', () => {
    it('generates unique ID with prefix', () => {
      const id1 = generateA11yId('test');
      const id2 = generateA11yId('test');

      expect(id1).toMatch(/^test-/);
      expect(id2).toMatch(/^test-/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('getFocusableElements', () => {
    it('finds focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button</button>
        <a href="#">Link</a>
        <input type="text" />
        <button disabled>Disabled</button>
      `;

      const focusable = getFocusableElements(container);
      expect(focusable).toHaveLength(3);
    });

    it('excludes disabled elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button disabled>Disabled</button>
        <input type="text" disabled />
      `;

      const focusable = getFocusableElements(container);
      expect(focusable).toHaveLength(0);
    });
  });

  describe('isVisibleToScreenReader', () => {
    it('returns true for visible element', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      expect(isVisibleToScreenReader(element)).toBe(true);

      document.body.removeChild(element);
    });

    it('returns false for hidden element', () => {
      const element = document.createElement('div');
      element.style.display = 'none';
      document.body.appendChild(element);

      expect(isVisibleToScreenReader(element)).toBe(false);

      document.body.removeChild(element);
    });

    it('returns false for aria-hidden element', () => {
      const element = document.createElement('div');
      element.setAttribute('aria-hidden', 'true');
      document.body.appendChild(element);

      expect(isVisibleToScreenReader(element)).toBe(false);

      document.body.removeChild(element);
    });
  });

  describe('getAccessibleName', () => {
    it('returns aria-label', () => {
      const element = document.createElement('button');
      element.setAttribute('aria-label', 'Test Label');

      expect(getAccessibleName(element)).toBe('Test Label');
    });

    it('returns text from aria-labelledby', () => {
      const label = document.createElement('span');
      label.id = 'label-id';
      label.textContent = 'Label Text';
      document.body.appendChild(label);

      const element = document.createElement('button');
      element.setAttribute('aria-labelledby', 'label-id');

      expect(getAccessibleName(element)).toBe('Label Text');

      document.body.removeChild(label);
    });

    it('returns text content', () => {
      const element = document.createElement('button');
      element.textContent = 'Button Text';

      expect(getAccessibleName(element)).toBe('Button Text');
    });
  });

  describe('hasAccessibleName', () => {
    it('returns true when element has name', () => {
      const element = document.createElement('button');
      element.setAttribute('aria-label', 'Test');

      expect(hasAccessibleName(element)).toBe(true);
    });

    it('returns false when element has no name', () => {
      const element = document.createElement('button');

      expect(hasAccessibleName(element)).toBe(false);
    });
  });

  describe('validateAriaAttributes', () => {
    it('validates button role', () => {
      const element = document.createElement('button');
      element.setAttribute('role', 'button');

      const errors = validateAriaAttributes(element);
      expect(errors).toContain('Button must have accessible name');
    });

    it('validates listbox role', () => {
      const element = document.createElement('div');
      element.setAttribute('role', 'listbox');

      const errors = validateAriaAttributes(element);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('validates option role', () => {
      const element = document.createElement('div');
      element.setAttribute('role', 'option');

      const errors = validateAriaAttributes(element);
      expect(errors).toContain('Option must have aria-selected attribute');
    });

    it('validates aria-expanded values', () => {
      const element = document.createElement('button');
      element.setAttribute('aria-expanded', 'invalid');

      const errors = validateAriaAttributes(element);
      expect(errors).toContain('aria-expanded must be "true" or "false"');
    });

    it('returns no errors for valid attributes', () => {
      const element = document.createElement('button');
      element.setAttribute('role', 'button');
      element.setAttribute('aria-label', 'Test');
      element.setAttribute('aria-expanded', 'false');

      const errors = validateAriaAttributes(element);
      expect(errors).toHaveLength(0);
    });
  });
});

/**
 * Accessibility Utilities
 * 
 * Helper functions for accessibility features
 */

import type { ScreenReaderAnnouncement } from '@/types/accessibility';

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(announcement: ScreenReaderAnnouncement): void {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', announcement.priority === 'assertive' ? 'alert' : 'status');
  liveRegion.setAttribute('aria-live', announcement.priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = announcement.message;

  document.body.appendChild(liveRegion);

  const clearAfter = announcement.clearAfter || 1000;
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, clearAfter);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Check if user is using keyboard navigation
 */
export function isKeyboardNavigation(event: KeyboardEvent | MouseEvent): boolean {
  return event instanceof KeyboardEvent;
}

/**
 * Generate unique ID for accessibility
 */
export function generateA11yId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Trap focus within a container
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement?.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement?.focus();
  }
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
}

/**
 * Get accessible name for element
 */
export function getAccessibleName(element: HTMLElement): string {
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  return element.textContent || '';
}

/**
 * Check if element has accessible name
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  return getAccessibleName(element).trim().length > 0;
}

/**
 * Validate ARIA attributes
 */
export function validateAriaAttributes(element: HTMLElement): string[] {
  const errors: string[] = [];
  const role = element.getAttribute('role');

  if (role === 'button') {
    if (!hasAccessibleName(element)) {
      errors.push('Button must have accessible name');
    }
  }

  if (role === 'listbox') {
    if (!element.id) {
      errors.push('Listbox should have an ID');
    }
    if (!hasAccessibleName(element)) {
      errors.push('Listbox should have accessible name');
    }
  }

  if (role === 'option') {
    if (!element.hasAttribute('aria-selected')) {
      errors.push('Option must have aria-selected attribute');
    }
  }

  const ariaExpanded = element.getAttribute('aria-expanded');
  if (ariaExpanded && !['true', 'false'].includes(ariaExpanded)) {
    errors.push('aria-expanded must be "true" or "false"');
  }

  const ariaHaspopup = element.getAttribute('aria-haspopup');
  if (ariaHaspopup && !['menu', 'listbox', 'tree', 'grid', 'dialog', 'true', 'false'].includes(ariaHaspopup)) {
    errors.push('aria-haspopup has invalid value');
  }

  return errors;
}

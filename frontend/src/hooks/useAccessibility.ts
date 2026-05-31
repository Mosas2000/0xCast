import { useEffect, useRef } from 'react';
import { AccessibilityHelpers } from '@/utils/accessibilityHelpers';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const cleanup = AccessibilityHelpers.trapFocus(containerRef.current);
    return cleanup;
  }, [isActive]);

  return containerRef;
}

export function useAnnouncement() {
  return (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    AccessibilityHelpers.announceToScreenReader(message, priority);
  };
}

export function useRestoreFocus() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    AccessibilityHelpers.restoreFocus(previousFocusRef.current);
  };

  return { saveFocus, restoreFocus };
}

export function useReducedMotion() {
  const prefersReducedMotion = AccessibilityHelpers.isReducedMotion();
  return prefersReducedMotion;
}

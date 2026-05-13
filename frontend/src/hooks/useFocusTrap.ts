import { useEffect, useRef } from 'react';
import { getFocusableElements } from '../utils/accessibility';

interface UseFocusTrapOptions {
  enabled?: boolean;
  initialFocus?: 'first' | 'last';
  returnFocus?: boolean;
}

export function useFocusTrap(options: UseFocusTrapOptions = {}) {
  const { enabled = true, initialFocus = 'first', returnFocus = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (initialFocus === 'first') {
      firstElement?.focus();
    } else {
      lastElement?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const currentFocusableElements = getFocusableElements(containerRef.current!);
      const currentFirst = currentFocusableElements[0];
      const currentLast = currentFocusableElements[currentFocusableElements.length - 1];

      if (event.shiftKey && document.activeElement === currentFirst) {
        event.preventDefault();
        currentLast?.focus();
      } else if (!event.shiftKey && document.activeElement === currentLast) {
        event.preventDefault();
        currentFirst?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, initialFocus, returnFocus]);

  return containerRef;
}

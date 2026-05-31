export class AccessibilityHelpers {
  static generateAriaLabel(action: string, target?: string): string {
    if (target) {
      return `${action} ${target}`;
    }
    return action;
  }

  static getButtonRole(isToggle: boolean): 'button' | 'switch' {
    return isToggle ? 'switch' : 'button';
  }

  static announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll(selector));
  }

  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  static restoreFocus(previousElement: HTMLElement | null): void {
    if (previousElement && document.body.contains(previousElement)) {
      previousElement.focus();
    }
  }

  static isReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static getContrastRatio(foreground: string, background: string): number {
    const getLuminance = (color: string): number => {
      const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
      const [r, g, b] = rgb.map(val => {
        const sRGB = val / 255;
        return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  static meetsWCAGContrast(ratio: number, level: 'AA' | 'AAA', isLargeText: boolean = false): boolean {
    if (level === 'AAA') {
      return isLargeText ? ratio >= 4.5 : ratio >= 7;
    }
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
}

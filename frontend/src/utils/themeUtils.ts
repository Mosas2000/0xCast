/**
 * Utility for theme management and accessibility enhancements.
 */
export class ThemeUtils {
    private static HIGH_CONTRAST_CLASS = 'high-contrast';

    /**
     * Toggles the high contrast theme on the root element.
     */
    static toggleHighContrast(): void {
        document.documentElement.classList.toggle(this.HIGH_CONTRAST_CLASS);
        const isActive = document.documentElement.classList.contains(this.HIGH_CONTRAST_CLASS);
        localStorage.setItem('0xcast_high_contrast', isActive.toString());
    }

    /**
     * Initializes theme settings from local storage.
     */
    static init(): void {
        const isHighContrast = localStorage.getItem('0xcast_high_contrast') === 'true';
        if (isHighContrast) {
            document.documentElement.classList.add(this.HIGH_CONTRAST_CLASS);
        }

        // Also support system preference
        const prefersContrast = window.matchMedia('(prefers-contrast: more)');
        if (prefersContrast.matches) {
            document.documentElement.classList.add(this.HIGH_CONTRAST_CLASS);
        }
    }

    /**
     * Checks if high contrast mode is currently active.
     */
    static isHighContrast(): boolean {
        return document.documentElement.classList.contains(this.HIGH_CONTRAST_CLASS);
    }
}

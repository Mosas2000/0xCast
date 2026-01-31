/**
 * Utility for viewport-aware typography and layout scaling.
 * Helps maintain consistent aesthetics across different screen sizes.
 */
export class ResponsiveScaler {
    /**
     * Calculates a responsive font size using a CSS clamp-like logic.
     * @param minSize - Minimum font size in pixels
     * @param maxSize - Maximum font size in pixels
     * @param minWidth - Minimum viewport width for scaling (default: 375)
     * @param maxWidth - Maximum viewport width for scaling (default: 1440)
     * @returns CSS clamp string
     */
    static getClampedSize(
        minSize: number,
        maxSize: number,
        minWidth: number = 375,
        maxWidth: number = 1440
    ): string {
        const minSizeRem = minSize / 16;
        const maxSizeRem = maxSize / 16;
        const minWidthRem = minWidth / 16;
        const maxWidthRem = maxWidth / 16;

        const slope = (maxSizeRem - minSizeRem) / (maxWidthRem - minWidthRem);
        const intercept = minSizeRem - slope * minWidthRem;

        return `clamp(${minSizeRem}rem, ${intercept.toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw, ${maxSizeRem}rem)`;
    }

    /**
     * Returns a multiplier for icons and spacing based on window width.
     */
    static getScaleFactor(): number {
        const width = window.innerWidth;
        if (width < 640) return 0.8; // Mobile
        if (width < 1024) return 1.0; // Tablet
        if (width < 1440) return 1.1; // Desktop
        return 1.2; // Large screens
    }
}

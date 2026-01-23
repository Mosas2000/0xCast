import { useMediaQuery } from './useMediaQuery';

interface UseIsMobileResult {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

/**
 * Convenience hook for device type detection
 * Uses useMediaQuery internally with common breakpoints
 * 
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: >= 1024px
 */
export function useIsMobile(): UseIsMobileResult {
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    return {
        isMobile,
        isTablet,
        isDesktop,
    };
}

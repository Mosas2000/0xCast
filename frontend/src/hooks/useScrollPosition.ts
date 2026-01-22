import { useState, useEffect } from 'react';

interface UseScrollPositionResult {
    scrollY: number;
    isScrolled: boolean;
    direction: 'up' | 'down' | null;
}

/**
 * Hook to track scroll position with debouncing
 * Returns scroll position, whether scrolled past threshold, and direction
 */
export function useScrollPosition(threshold: number = 50): UseScrollPositionResult {
    const [scrollY, setScrollY] = useState(0);
    const [direction, setDirection] = useState<'up' | 'down' | null>(null);
    const [prevScrollY, setPrevScrollY] = useState(0);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    
                    setScrollY(currentScrollY);
                    
                    if (currentScrollY > prevScrollY) {
                        setDirection('down');
                    } else if (currentScrollY < prevScrollY) {
                        setDirection('up');
                    }
                    
                    setPrevScrollY(currentScrollY);
                    ticking = false;
                });

                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [prevScrollY]);

    return {
        scrollY,
        isScrolled: scrollY > threshold,
        direction,
    };
}

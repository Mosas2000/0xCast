import { useState, useEffect } from 'react';
import { useScrollPosition } from '../hooks/useScrollPosition';

/**
 * Scroll to top button that appears when user scrolls down
 * Smooth scrolls back to top of page
 */
export function ScrollToTop() {
    const { isScrolled } = useScrollPosition(300);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(isScrolled);
    }, [isScrolled]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button
            onClick={scrollToTop}
            className={`
                fixed bottom-8 right-8 z-50
                w-12 h-12 rounded-full
                bg-primary-600 hover:bg-primary-700
                text-white shadow-lg hover:shadow-xl
                transition-all duration-300
                flex items-center justify-center
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
            aria-label="Scroll to top"
        >
            <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
            </svg>
        </button>
    );
}

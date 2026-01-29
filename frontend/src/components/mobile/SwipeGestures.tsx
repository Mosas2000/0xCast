import React, { useState, TouchEvent } from 'react';

interface SwipeGesturesProps {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    children: React.ReactNode;
    threshold?: number;
}

export const SwipeGestures: React.FC<SwipeGesturesProps> = ({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    children,
    threshold = 50
}) => {
    const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);

    const handleTouchStart = (e: TouchEvent) => {
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (!touchStart) return;

        const touchEnd = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };

        const deltaX = touchStart.x - touchEnd.x;
        const deltaY = touchStart.y - touchEnd.y;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) onSwipeLeft?.();
                else onSwipeRight?.();
            }
        } else {
            if (Math.abs(deltaY) > threshold) {
                if (deltaY > 0) onSwipeUp?.();
                else onSwipeDown?.();
            }
        }

        setTouchStart(null);
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="h-full w-full"
        >
            {children}
        </div>
    );
};

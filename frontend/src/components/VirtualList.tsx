import { useState, useRef, useEffect, ReactNode } from 'react';

interface VirtualListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    itemHeight: number;
    containerHeight?: number;
    overscan?: number;
    className?: string;
}

/**
 * Virtual scrolling component for long lists
 * Only renders visible items for better performance
 */
export function VirtualList<T>({
    items,
    renderItem,
    itemHeight,
    containerHeight = 600,
    overscan = 3,
    className = '',
}: VirtualListProps<T>) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1);
    const offsetY = startIndex * itemHeight;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={`overflow-auto ${className}`.trim()}
            style={{ height: containerHeight }}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, index) => (
                        <div key={startIndex + index} style={{ height: itemHeight }}>
                            {renderItem(item, startIndex + index)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { useState, useRef, useEffect, ReactNode } from 'react';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  className = ''
}: SwipeableCardProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    if (currentX > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (currentX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }

    setCurrentX(0);
    setIsDragging(false);
  };

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${currentX}px)`;
      cardRef.current.style.transition = isDragging ? 'none' : 'transform 0.3s ease-out';
    }
  }, [currentX, isDragging]);

  return (
    <div
      ref={cardRef}
      className={`touch-pan-y select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

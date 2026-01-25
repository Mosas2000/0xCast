import { useState } from 'react';
import type { TouchEvent } from 'react';

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStart, setPullStart] = useState<number | null>(null);
  
  const PULL_THRESHOLD = 80;
  const MAX_PULL = 150;
  
  const handleTouchStart = (e: TouchEvent) => {
    // Only trigger if at top of page
    if (window.scrollY === 0) {
      setPullStart(e.touches[0].clientY);
    }
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (pullStart === null) return;
    if (window.scrollY > 0) {
      setPullStart(null);
      return;
    }
    
    const currentTouch = e.touches[0].clientY;
    const distance = currentTouch - pullStart;
    
    if (distance > 0) {
      // Prevent default scroll when pulling
      e.preventDefault();
      
      // Apply resistance (makes it harder to pull further)
      const resistedDistance = Math.min(
        distance * 0.5,
        MAX_PULL
      );
      
      setPullDistance(resistedDistance);
    }
  };
  
  const handleTouchEnd = async () => {
    if (pullDistance > PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setPullStart(null);
  };
  
  return {
    pullDistance,
    isRefreshing,
    isPulling: pullDistance > 0,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
}

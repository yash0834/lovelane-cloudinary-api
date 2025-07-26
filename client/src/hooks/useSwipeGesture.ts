import { useRef, useState } from "react";

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
}: SwipeGestureOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
    currentPos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    currentPos.current = { x: clientX, y: clientY };
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging) return;

    const deltaX = currentPos.current.x - startPos.current.x;
    const deltaY = currentPos.current.y - startPos.current.y;
    
    // Check if swipe distance exceeds threshold
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    // Reset state
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    startPos.current = { x: 0, y: 0 };
    currentPos.current = { x: 0, y: 0 };
  };

  const swipeHandlers = {
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    onMouseMove: (e: React.MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    },
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    onTouchMove: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    onTouchEnd: handleEnd,
  };

  const getSwipeStyle = () => {
    if (!isDragging) return {};
    
    const rotation = dragOffset.x * 0.1; // Subtle rotation effect
    const opacity = 1 - Math.abs(dragOffset.x) / 300;
    
    return {
      transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
      opacity: Math.max(opacity, 0.5),
      transition: isDragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
    };
  };

  return {
    swipeHandlers,
    getSwipeStyle,
    isDragging,
    dragOffset,
  };
};

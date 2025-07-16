// Versão otimizada e simplificada
import { useState, useCallback, useRef } from 'react';

interface DragState {
  isDragging: boolean;
  draggedIds: string[];
  startPositions: Record<string, { x: number; y: number }>;
  mouseStart: { x: number; y: number };
}

export const useDrag = () => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIds: [],
    startPositions: {},
    mouseStart: { x: 0, y: 0 }
  });
  
  const lastUpdateTime = useRef(0);

  const startDrag = useCallback((
    todoIds: string[], 
    e: React.MouseEvent,
    todoPositions: Record<string, { x: number; y: number }>
  ) => {
    e.preventDefault();
    
    const startPositions: Record<string, { x: number; y: number }> = {};
    todoIds.forEach(id => {
      if (todoPositions[id]) {
        startPositions[id] = { ...todoPositions[id] };
      }
    });

    setDragState({
      isDragging: true,
      draggedIds: todoIds,
      startPositions,
      mouseStart: { x: e.clientX, y: e.clientY }
    });
  }, []);

  const updateDrag = useCallback((
    currentMouse: { x: number; y: number }
  ): Record<string, { x: number; y: number }> => {
    if (!dragState.isDragging) return {};

    // Throttle simples - max 60fps
    const now = Date.now();
    if (now - lastUpdateTime.current < 16) {
      return {};
    }
    lastUpdateTime.current = now;

    const deltaX = currentMouse.x - dragState.mouseStart.x;
    const deltaY = currentMouse.y - dragState.mouseStart.y;

    const newPositions: Record<string, { x: number; y: number }> = {};
    dragState.draggedIds.forEach(id => {
      const startPos = dragState.startPositions[id];
      if (startPos) {
        newPositions[id] = {
          x: Math.round(startPos.x + deltaX),
          y: Math.round(startPos.y + deltaY)
        };
      }
    });

    return newPositions;
  }, [dragState]);

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedIds: [],
      startPositions: {},
      mouseStart: { x: 0, y: 0 }
    });
  }, []);

  return {
    isDragging: dragState.isDragging,
    draggedIds: dragState.draggedIds,
    startDrag,
    updateDrag,
    endDrag
  };
}; 
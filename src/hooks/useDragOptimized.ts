import { useState, useCallback, useRef } from 'react';
import { Todo } from '../types';

interface DragState {
  isDragging: boolean;
  draggedIds: string[];
  startPositions: Record<string, { x: number; y: number }>;
  mouseStart: { x: number; y: number };
  currentPositions: Record<string, { x: number; y: number }>;
}

export const useDragOptimized = () => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIds: [],
    startPositions: {},
    mouseStart: { x: 0, y: 0 },
    currentPositions: {}
  });
  
  const animationFrameRef = useRef<number>();

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
      mouseStart: { x: e.clientX, y: e.clientY },
      currentPositions: { ...startPositions }
    });
  }, []);

  const updateDragPreview = useCallback((
    currentMouse: { x: number; y: number }
  ) => {
    if (!dragState.isDragging) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const deltaX = currentMouse.x - dragState.mouseStart.x;
      const deltaY = currentMouse.y - dragState.mouseStart.y;

      const newPositions: Record<string, { x: number; y: number }> = {};
      dragState.draggedIds.forEach(id => {
        const startPos = dragState.startPositions[id];
        if (startPos) {
          newPositions[id] = {
            x: startPos.x + deltaX,
            y: startPos.y + deltaY
          };
        }
      });

      setDragState(prev => ({
        ...prev,
        currentPositions: newPositions
      }));
    });
  }, [dragState.isDragging, dragState.mouseStart, dragState.draggedIds, dragState.startPositions]);

  const endDrag = useCallback((): Record<string, { x: number; y: number }> => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    const finalPositions = { ...dragState.currentPositions };

    setDragState({
      isDragging: false,
      draggedIds: [],
      startPositions: {},
      mouseStart: { x: 0, y: 0 },
      currentPositions: {}
    });

    return finalPositions;
  }, [dragState.currentPositions]);

  const getVisualPositions = useCallback((todos: Todo[]) => {
    const positions: Record<string, { x: number; y: number }> = {};
    todos.forEach(todo => {
      if (dragState.isDragging && dragState.draggedIds.includes(todo.id)) {
        positions[todo.id] = dragState.currentPositions[todo.id] || todo.position;
      } else {
        positions[todo.id] = todo.position;
      }
    });
    return positions;
  }, [dragState.isDragging, dragState.draggedIds, dragState.currentPositions]);

  return {
    isDragging: dragState.isDragging,
    draggedIds: dragState.draggedIds,
    startDrag,
    updateDragPreview,
    endDrag,
    getVisualPositions
  };
}; 
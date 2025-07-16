import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragState, Position } from '../types';
import { safeQuerySelector, parseTransform } from '../utils/dom';
import { createDragThrottle } from '../utils/performance';

export const useSecureDrag = () => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIds: [],
    startPositions: {},
    mouseStart: { x: 0, y: 0 },
    canvasOffset: { x: 0, y: 0 }
  });
  
  const dragSessionId = useRef<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const startDrag = useCallback((
    todoIds: string[], 
    e: React.MouseEvent,
    todoPositions: Record<string, Position>
  ) => {
    try {
      e.preventDefault();
      
      // Validar inputs
      if (!Array.isArray(todoIds) || todoIds.length === 0) {
        throw new Error('Invalid todoIds for drag');
      }
      
      if (!todoPositions || typeof todoPositions !== 'object') {
        throw new Error('Invalid todoPositions for drag');
      }
      
      // Criar nova sessão de drag
      dragSessionId.current = uuidv4();
      
      // Abort controller para cancelar drag se necessário
      abortController.current = new AbortController();
      
      // Obter offset do canvas de forma segura
      const canvas = safeQuerySelector<HTMLElement>('[data-canvas]');
      const transform = canvas?.style.transform || '';
      const canvasOffset = parseTransform(transform);
      
      const startPositions: Record<string, Position> = {};
      for (const id of todoIds) {
        const position = todoPositions[id];
        if (position) {
          startPositions[id] = { ...position };
        }
      }
      
      setDragState({
        isDragging: true,
        draggedIds: [...todoIds], // Clone array
        startPositions,
        mouseStart: { x: e.clientX, y: e.clientY },
        canvasOffset
      });
      
    } catch (error) {
      console.error('Error starting drag:', error);
      // Reset state on error
      setDragState({
        isDragging: false,
        draggedIds: [],
        startPositions: {},
        mouseStart: { x: 0, y: 0 },
        canvasOffset: { x: 0, y: 0 }
      });
    }
  }, []);

  const updateDrag = useCallback((
    currentMouse: Position
  ): Record<string, Position> => {
    if (!dragState.isDragging || !dragSessionId.current) {
      return {};
    }

    try {
      // Validar inputs
      if (!currentMouse || typeof currentMouse.x !== 'number' || typeof currentMouse.y !== 'number') {
        throw new Error('Invalid mouse position');
      }
      
      const deltaX = currentMouse.x - dragState.mouseStart.x;
      const deltaY = currentMouse.y - dragState.mouseStart.y;
      
      const newPositions: Record<string, Position> = {};
      
      for (const id of dragState.draggedIds) {
        const startPos = dragState.startPositions[id];
        if (startPos) {
          newPositions[id] = {
            x: Math.round(startPos.x + deltaX), // Round para performance
            y: Math.round(startPos.y + deltaY)
          };
        }
      }
      
      return newPositions;
    } catch (error) {
      console.error('Error updating drag:', error);
      return {};
    }
  }, [dragState]);

  const endDrag = useCallback(() => {
    try {
      // Cleanup
      dragSessionId.current = null;
      
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      
      setDragState({
        isDragging: false,
        draggedIds: [],
        startPositions: {},
        mouseStart: { x: 0, y: 0 },
        canvasOffset: { x: 0, y: 0 }
      });
    } catch (error) {
      console.error('Error ending drag:', error);
    }
  }, []);

  // Force end drag (emergency cleanup)
  const forceEndDrag = useCallback(() => {
    console.warn('Force ending drag due to error or unmount');
    endDrag();
  }, [endDrag]);

  return {
    isDragging: dragState.isDragging,
    draggedIds: dragState.draggedIds,
    startDrag,
    updateDrag: createDragThrottle(updateDrag),
    endDrag,
    forceEndDrag
  };
}; 
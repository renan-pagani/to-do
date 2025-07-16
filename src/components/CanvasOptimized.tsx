import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { TodoItem } from './TodoItem';
import { Toolbar } from './Toolbar';
import { Todo, Tool } from '../types';
import { useDragOptimized } from '../hooks/useDragOptimized';

interface CanvasProps {
  todos: Todo[];
  focusedId: string | null;
  selectedIds: string[];
  onCreateTodo: (text: string) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onUpdateMultipleTodos: (updates: Record<string, Partial<Todo>>) => void;
  onDeleteTodo: (id: string) => void;
  onToggleSelection: (id: string) => void;
  onClearSelection: () => void;
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  todos,
  focusedId,
  selectedIds,
  onCreateTodo,
  onUpdateTodo,
  onUpdateMultipleTodos,
  onDeleteTodo,
  onToggleSelection,
  onClearSelection,
  activeTool,
  onToolChange
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { isDragging, draggedIds, startDrag, updateDragPreview, endDrag, getVisualPositions } = useDragOptimized();
  
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Posições visuais otimizadas
  const visualPositions = useMemo(() => getVisualPositions(todos), [getVisualPositions, todos]);

  // Posições reais dos todos (memoizadas)
  const todoPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    todos.forEach(todo => {
      positions[todo.id] = { ...todo.position };
    });
    return positions;
  }, [todos]);

  // Handle mouse move - OTIMIZADO!
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (isDragging) {
      // SÓ atualiza preview visual - NÃO atualiza estado!
      updateDragPreview({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, isPanning, lastPanPoint, updateDragPreview]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    
    if (isDragging) {
      // SÓ AGORA atualiza o estado final
      const finalPositions = endDrag();
      const updates: Record<string, Partial<Todo>> = {};
      
      Object.entries(finalPositions).forEach(([id, position]) => {
        updates[id] = { 
          position: { 
            x: Math.round(position.x), 
            y: Math.round(position.y) 
          } 
        };
      });
      
      if (Object.keys(updates).length > 0) {
        onUpdateMultipleTodos(updates);
      }
    }
  }, [isDragging, endDrag, onUpdateMultipleTodos]);

  // Cursor management SIMPLES
  const canvasCursor = useMemo(() => {
    if (isPanning) return 'grabbing';
    if (activeTool === 'cursor') return 'grab';
    if (activeTool === 'create') return 'crosshair';
    return 'default';
  }, [activeTool, isPanning]);

  // ... resto dos handlers iguais ...

  return (
    <div className="relative w-full h-full bg-black">
      <div
        ref={canvasRef}
        className="w-full h-full bg-black relative"
        style={{ 
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          cursor: canvasCursor // ❌ Cursor no canvas, não no body
        }}
        onClick={handleCanvasClick}
        data-canvas
      >
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="absolute"
            style={{ 
              left: visualPositions[todo.id]?.x || todo.position.x, 
              top: visualPositions[todo.id]?.y || todo.position.y,
              // Transição suave quando NÃO está dragging
              transition: isDragging && draggedIds.includes(todo.id) ? 'none' : 'transform 0.1s ease'
            }}
            data-todo-item
          >
            <TodoItem
              todo={todo}
              onUpdate={onUpdateTodo}
              onDelete={onDeleteTodo}
              onSelect={handleTodoSelect}
              onDragStart={handleTodoDragStart}
              autoFocus={todo.id === focusedId}
              activeTool={activeTool}
              isSelected={selectedIds.includes(todo.id)}
              isDragging={draggedIds.includes(todo.id)}
            />
          </div>
        ))}
      </div>

      <Toolbar 
        activeTool={activeTool} 
        onToolChange={onToolChange}
        selectedCount={selectedIds.length}
      />
    </div>
  );
}; 
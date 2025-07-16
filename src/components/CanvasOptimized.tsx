import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDragOptimized } from '../hooks/useDragOptimized';
import { Todo, Tool } from '../types';
import { TodoItem } from './TodoItem';
import { Toolbar } from './Toolbar';

interface CanvasProps {
  todos: Todo[];
  focusedId: string | null;
  selectedIds: string[];
  onCreateTodo: (position: { x: number; y: number }) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onUpdateMultipleTodos: (updates: Record<string, Partial<Todo>>) => void;
  onDeleteTodo: (id: string) => void;
  onToggleSelection: (id: string, isMultiple?: boolean) => void;
  onClearSelection: () => void;
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export const CanvasOptimized: React.FC<CanvasProps> = ({
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
  onToolChange,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    isDragging,
    draggedIds,
    startDrag,
    updateDragPreview,
    endDrag,
    getVisualPositions,
  } = useDragOptimized();

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const visualPositions = useMemo(
    () => getVisualPositions(todos),
    [getVisualPositions, todos]
  );

  const todoPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    todos.forEach(todo => {
      positions[todo.id] = { ...todo.position };
    });
    return positions;
  }, [todos]);

  const canvasCursor = useMemo(() => {
    if (isPanning) return 'grabbing';
    if (activeTool === 'cursor') return 'grab';
    if (activeTool === 'create') return 'crosshair';
    return 'default';
  }, [activeTool, isPanning]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current && !isPanning && !isDragging) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - panOffset.x;
        const y = e.clientY - rect.top - panOffset.y;

        if (activeTool === 'create') {
          onCreateTodo({ x, y });
        } else if (activeTool === 'move') {
          onClearSelection();
        }
      }
    },
    [
      activeTool,
      isPanning,
      isDragging,
      panOffset,
      onCreateTodo,
      onClearSelection,
    ]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastPanPoint.x;
        const deltaY = e.clientY - lastPanPoint.y;
        setPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      } else if (isDragging) {
        updateDragPreview({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging, isPanning, lastPanPoint, updateDragPreview]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);

    if (isDragging) {
      const finalPositions = endDrag();
      const updates: Record<string, Partial<Todo>> = {};

      Object.entries(finalPositions).forEach(([id, position]) => {
        updates[id] = {
          position: {
            x: Math.round(position.x),
            y: Math.round(position.y),
          },
        };
      });

      if (Object.keys(updates).length > 0) {
        onUpdateMultipleTodos(updates);
      }
    }
  }, [isDragging, endDrag, onUpdateMultipleTodos]);

  const handleGlobalMouseDown = useCallback(
    (e: MouseEvent) => {
      if (activeTool === 'cursor') {
        const target = e.target as Element;
        if (!target.closest('[data-todo-item]')) {
          setIsPanning(true);
          setLastPanPoint({ x: e.clientX, y: e.clientY });
        }
      }
    },
    [activeTool]
  );

  const handleTodoDragStart = useCallback(
    (todoId: string, e: React.MouseEvent) => {
      if (activeTool === 'cursor') {
        startDrag([todoId], e, todoPositions);
      } else if (activeTool === 'move') {
        const idsToMove =
          selectedIds.includes(todoId) && selectedIds.length > 1
            ? selectedIds
            : [todoId];

        startDrag(idsToMove, e, todoPositions);
      }
    },
    [activeTool, selectedIds, startDrag, todoPositions]
  );

  const handleTodoSelect = useCallback(
    (todoId: string) => {
      if (activeTool === 'move') {
        onToggleSelection(todoId, true);
      }
    },
    [activeTool, onToggleSelection]
  );

  useEffect(() => {
    if (isDragging || isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isPanning, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (activeTool === 'cursor') {
      document.addEventListener('mousedown', handleGlobalMouseDown);
      return () => {
        document.removeEventListener('mousedown', handleGlobalMouseDown);
      };
    }
  }, [activeTool, handleGlobalMouseDown]);

  useEffect(() => {
    if (activeTool !== 'move') {
      onClearSelection();
    }
  }, [activeTool, onClearSelection]);

  return (
    <div className="relative w-full h-full bg-black">
      <div
        ref={canvasRef}
        className="w-full h-full bg-black relative"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          cursor: canvasCursor,
        }}
        onClick={handleCanvasClick}
        data-canvas
      >
        {todos.map(todo => {
          const visualPos = visualPositions[todo.id] || todo.position;
          const isBeingDragged = draggedIds.includes(todo.id);

          return (
            <div
              key={todo.id}
              className="absolute"
              style={{
                left: visualPos.x,
                top: visualPos.y,
                transition: isBeingDragged ? 'none' : 'transform 0.1s ease-out',
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
                isDragging={isBeingDragged}
              />
            </div>
          );
        })}
      </div>

      <Toolbar
        activeTool={activeTool}
        onToolChange={onToolChange}
        selectedCount={selectedIds.length}
      />
    </div>
  );
};

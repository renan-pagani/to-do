import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check, Trash2, GripVertical, Plus } from 'lucide-react';
import { Todo, Tool, SubTask } from '../types';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onSelect?: (id: string) => void;
  onDragStart?: (id: string, e: React.MouseEvent) => void;
  autoFocus?: boolean;
  activeTool: Tool;
  isSelected?: boolean;
  isDragging?: boolean;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onUpdate,
  onDelete,
  onSelect,
  onDragStart,
  autoFocus = false,
  activeTool,
  isSelected = false,
  isDragging = false
}) => {
  const [text, setText] = useState(todo.text);
  const [isEditing, setIsEditing] = useState(autoFocus);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSave = useCallback(() => {
    const sanitizedText = text.trim().slice(0, 500);
    
    if (!sanitizedText) {
      onDelete(todo.id);
      return;
    }
    
    onUpdate(todo.id, { text: sanitizedText });
    setIsEditing(false);
  }, [text, todo.id, onUpdate, onDelete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      addSubtask();
    } else if (e.key === 'Escape') {
      setText(todo.text);
      setIsEditing(false);
    }
  }, [handleSave, todo.text]);

  const addSubtask = useCallback(() => {
    const newSubtask: SubTask = {
      id: Date.now().toString(),
      text: '',
      completed: false,
      level: 0
    };
    
    const currentSubtasks = todo.subtasks || [];
    onUpdate(todo.id, { 
      subtasks: [...currentSubtasks, newSubtask] 
    });
  }, [todo.id, todo.subtasks, onUpdate]);

  const updateSubtask = useCallback((subtaskId: string, updates: Partial<SubTask>) => {
    const updatedSubtasks = (todo.subtasks || []).map(subtask =>
      subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
    );
    onUpdate(todo.id, { subtasks: updatedSubtasks });
  }, [todo.id, todo.subtasks, onUpdate]);

  const removeSubtask = useCallback((subtaskId: string) => {
    const updatedSubtasks = (todo.subtasks || []).filter(subtask => subtask.id !== subtaskId);
    onUpdate(todo.id, { subtasks: updatedSubtasks });
  }, [todo.id, todo.subtasks, onUpdate]);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'move' && !isEditing) {
      onSelect?.(todo.id);
      return;
    }
    
    e.stopPropagation();
    
    if (activeTool === 'cursor' && !isEditing) {
      setIsEditing(true);
    }
  }, [activeTool, isEditing, onSelect, todo.id]);

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'move') return;
    e.stopPropagation();
    onUpdate(todo.id, { completed: !todo.completed });
  }, [activeTool, onUpdate, todo.id]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'move') return;
    e.stopPropagation();
    onDelete(todo.id);
  }, [activeTool, onDelete, todo.id]);

  const handleTextClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'move') return;
    e.stopPropagation();
    if (activeTool === 'cursor') setIsEditing(true);
  }, [activeTool]);

  const handleGripDrag = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'cursor' && !isEditing) {
      e.stopPropagation();
      onDragStart?.(todo.id, e);
    }
  }, [activeTool, isEditing, onDragStart, todo.id]);

  const handleMoveModeDrag = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'move' && !isEditing) {
      e.stopPropagation();
      onDragStart?.(todo.id, e);
    }
  }, [activeTool, isEditing, onDragStart, todo.id]);

  const showDragHandle = !isEditing && todo.text.trim() !== '' && activeTool === 'cursor';
  const canSelectInMoveMode = activeTool === 'move' && !isEditing;
  const hasSubtasks = (todo.subtasks || []).length > 0;

  const getCursor = () => {
    if (isEditing) return 'text';
    if (activeTool === 'cursor' && !isEditing) return 'text';
    if (canSelectInMoveMode) return 'pointer';
    return 'default';
  };

  return (
    <div
      className={`bg-white border rounded-lg shadow-sm transition-all ${
        todo.completed ? 'opacity-60' : ''
      } ${isDragging ? 'shadow-lg z-50 scale-105' : 'hover:shadow-md'} ${
        isSelected ? 'ring-4 ring-blue-400 bg-blue-100 shadow-lg shadow-blue-200' : ''
      } ${canSelectInMoveMode ? 'hover:ring-2 hover:ring-blue-300' : ''}`}
      style={{ 
        minWidth: '200px', 
        maxWidth: '400px',
        cursor: getCursor()
      }}
      onClick={handleContainerClick}
      onMouseDown={handleMoveModeDrag}
    >
      <div className="group flex items-start gap-2 p-3">
        {showDragHandle && (
          <button
            className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            onMouseDown={handleGripDrag}
            title="Arrastar"
          >
            <GripVertical size={14} />
          </button>
        )}

        <button
          onClick={handleCheckboxClick}
          onMouseDown={(e) => activeTool !== 'move' && e.stopPropagation()}
          className={`mt-1 w-4 h-4 rounded border-2 transition-all flex items-center justify-center cursor-pointer ${
            todo.completed 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {todo.completed && <Check className="w-2.5 h-2.5 text-white" />}
        </button>

        <div className="flex-1">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-sm resize-none border-none outline-none bg-transparent cursor-text"
              placeholder="Digite sua tarefa... (Shift+Enter para subtarefa)"
              maxLength={500}
            />
          ) : (
            <div 
              className={`text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
              onClick={handleTextClick}
            >
              {todo.text || 'Clique para editar...'}
            </div>
          )}
        </div>

        {!isEditing && activeTool !== 'move' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addSubtask();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-blue-400 hover:text-blue-600 transition-all"
            title="Adicionar subtarefa"
          >
            <Plus size={14} />
          </button>
        )}

        <button
          onClick={handleDeleteClick}
          onMouseDown={(e) => activeTool !== 'move' && e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all cursor-pointer"
          title={activeTool === 'move' ? 'Clique para selecionar' : 'Deletar TODO'}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {hasSubtasks && (
        <div className="px-3 pb-3 border-t border-gray-100 bg-gray-50">
          {(todo.subtasks || []).map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2 py-1">
              <button
                onClick={() => updateSubtask(subtask.id, { completed: !subtask.completed })}
                className={`w-3 h-3 rounded border transition-all flex items-center justify-center cursor-pointer ${
                  subtask.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {subtask.completed && <Check className="w-2 h-2 text-white" />}
              </button>

              <input
                type="text"
                value={subtask.text}
                onChange={(e) => updateSubtask(subtask.id, { text: e.target.value })}
                onBlur={() => {
                  if (!subtask.text.trim()) {
                    removeSubtask(subtask.id);
                  }
                }}
                placeholder="Nova subtarefa..."
                className={`flex-1 text-xs bg-transparent border-none outline-none ${
                  subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'
                }`}
                maxLength={200}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 
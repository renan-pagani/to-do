import { useCallback } from 'react';
import { Todo, AppState } from '../types';
import { useLocalStorage } from './useLocalStorage';

export const useTodos = () => {
  const [state, setState] = useLocalStorage<AppState>('todo-app', {
    todos: [],
    focusedId: null,
    selectedIds: []
  });

  const generateId = useCallback(() => 
    Date.now().toString(36) + Math.random().toString(36).substr(2), []);

  const sanitizeText = useCallback((text: string): string => {
    if (!text || typeof text !== 'string') return '';
    return text.trim().slice(0, 500);
  }, []);

  const createTodo = useCallback((position: { x: number; y: number }) => {
    const newTodo: Todo = {
      id: generateId(),
      text: '',
      completed: false,
      position: {
        x: Math.round(position.x),
        y: Math.round(position.y)
      },
      subtasks: []
    };

    setState(prev => ({
      ...prev,
      todos: [...prev.todos, newTodo],
      focusedId: newTodo.id,
      selectedIds: []
    }));
  }, [setState, generateId]);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setState(prev => {
      const todoIndex = prev.todos.findIndex(todo => todo.id === id);
      if (todoIndex === -1) return prev;
      
      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.text !== undefined) {
        sanitizedUpdates.text = sanitizeText(sanitizedUpdates.text);
      }
      
      const updatedTodos = [...prev.todos];
      updatedTodos[todoIndex] = { ...updatedTodos[todoIndex], ...sanitizedUpdates };
      
      return { ...prev, todos: updatedTodos };
    });
  }, [setState, sanitizeText]);

  const updateMultipleTodos = useCallback((updates: Record<string, Partial<Todo>>) => {
    setState(prev => ({
      ...prev,
      todos: prev.todos.map(todo => {
        const update = updates[todo.id];
        if (!update) return todo;
        
        const sanitizedUpdate = { ...update };
        if (sanitizedUpdate.text !== undefined) {
          sanitizedUpdate.text = sanitizeText(sanitizedUpdate.text);
        }
        
        return { ...todo, ...sanitizedUpdate };
      })
    }));
  }, [setState, sanitizeText]);

  const deleteTodo = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      todos: prev.todos.filter(todo => todo.id !== id),
      focusedId: prev.focusedId === id ? null : prev.focusedId,
      selectedIds: prev.selectedIds.filter(selectedId => selectedId !== id)
    }));
  }, [setState]);

  const toggleSelection = useCallback((id: string, isMultiple: boolean = false) => {
    setState(prev => {
      const currentSelected = prev.selectedIds;
      
      if (isMultiple) {
        return {
          ...prev,
          selectedIds: currentSelected.includes(id)
            ? currentSelected.filter(selectedId => selectedId !== id)
            : [...currentSelected, id]
        };
      } else {
        return { ...prev, selectedIds: [id] };
      }
    });
  }, [setState]);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedIds: [] }));
  }, [setState]);

  return {
    todos: state.todos,
    focusedId: state.focusedId,
    selectedIds: state.selectedIds,
    createTodo,
    updateTodo,
    updateMultipleTodos,
    deleteTodo,
    toggleSelection,
    clearSelection
  };
}; 
import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = (import.meta as any).env?.VITE_STORAGE_KEY || 'canvas-todo-app';
const AUTOSAVE_DELAY = Number((import.meta as any).env?.VITE_AUTOSAVE_DELAY) || 300;

export function useLocalStorage<T>(key: string, initialValue: T) {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const fullKey = `${STORAGE_KEY}-${key}`;
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(fullKey);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      
      if (parsed && parsed.todos && Array.isArray(parsed.todos)) {
        parsed.todos = parsed.todos.map((todo: any) => ({
          ...todo,
          subtasks: todo.subtasks || []
        }));
      }
      
      return parsed || initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${fullKey}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        window.localStorage.setItem(fullKey, JSON.stringify(valueToStore));
      }, AUTOSAVE_DELAY);
      
    } catch (error) {
      console.error(`Error setting localStorage key "${fullKey}":`, error);
    }
  }, [fullKey, storedValue]);

  useCallback(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return [storedValue, setValue] as const;
}

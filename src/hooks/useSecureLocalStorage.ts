import { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, CONSTANTS } from '../types';

interface StorageError {
  type: 'read' | 'write' | 'parse';
  message: string;
}

export const useSecureLocalStorage = (
  key: string, 
  initialValue: AppState
) => {
  const [error, setError] = useState<StorageError | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [state, setState] = useState<AppState>(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      
      // Validação e migração
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid stored data format');
      }
      
      // Migration para versão atual
      if (parsed.version !== CONSTANTS.APP_VERSION) {
        console.info(`Migrating data from version ${parsed.version} to ${CONSTANTS.APP_VERSION}`);
        return {
          ...initialValue,
          todos: Array.isArray(parsed.todos) ? parsed.todos.filter((todo: any) => {
            return todo && typeof todo.id === 'string' && typeof todo.text === 'string';
          }) : [],
        };
      }
      
      return {
        ...initialValue,
        ...parsed,
        todos: Array.isArray(parsed.todos) ? parsed.todos : [],
        selectedIds: Array.isArray(parsed.selectedIds) ? parsed.selectedIds : [],
      };
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setError({
        type: 'read',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      return initialValue;
    }
  });

  const setValue = useCallback((value: AppState | ((prev: AppState) => AppState)) => {
    try {
      const valueToStore = typeof value === 'function' ? value(state) : value;
      
      // Validação antes de salvar
      if (!valueToStore || typeof valueToStore !== 'object') {
        throw new Error('Invalid data to store');
      }
      
      // Limite de TODOs para performance
      if (valueToStore.todos.length > CONSTANTS.MAX_TODOS) {
        throw new Error(`Too many todos (max: ${CONSTANTS.MAX_TODOS})`);
      }
      
      setState(valueToStore);
      
      // Debounced save para evitar spam
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        try {
          const dataToSave = {
            ...valueToStore,
            version: CONSTANTS.APP_VERSION,
            lastSaved: new Date().toISOString(),
          };
          
          localStorage.setItem(key, JSON.stringify(dataToSave));
          setError(null);
        } catch (saveError) {
          console.error(`Error saving to localStorage:`, saveError);
          setError({
            type: 'write',
            message: saveError instanceof Error ? saveError.message : 'Save failed'
          });
        }
      }, CONSTANTS.AUTOSAVE_DEBOUNCE_MS);
      
    } catch (error) {
      console.error(`Error setting localStorage:`, error);
      setError({
        type: 'write',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [key, state]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return [state, setValue, error] as const;
}; 
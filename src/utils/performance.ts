import { throttle } from 'throttle-debounce';
import { CONSTANTS, Position, Todo } from '../types';

export const createDragThrottle = <T extends any[]>(fn: (...args: T) => void) =>
  throttle(CONSTANTS.DRAG_THROTTLE_MS, fn);

export const createAutosaveDebounce = <T extends any[]>(
  fn: (...args: T) => void
) => throttle(CONSTANTS.AUTOSAVE_DEBOUNCE_MS, fn);

export const memoizePositions = (todos: Todo[]) => {
  const cache = new Map<string, Position>();

  return todos.reduce((acc, todo) => {
    if (!cache.has(todo.id)) {
      cache.set(todo.id, { ...todo.position });
    }
    acc[todo.id] = cache.get(todo.id)!;
    return acc;
  }, {} as Record<string, Position>);
};

export const createSelectionSet = (selectedIds: string[]) =>
  new Set(selectedIds);

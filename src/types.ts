export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  level: number;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  position: { x: number; y: number };
  subtasks?: SubTask[];
}

export interface AppState {
  todos: Todo[];
  focusedId: string | null;
  selectedIds: string[];
}

export type Tool = 'create' | 'cursor' | 'move';

export interface Position {
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  draggedIds: string[];
  startPositions: Record<string, Position>;
  mouseStart: Position;
  canvasOffset: Position;
}

export const CONSTANTS = {
  APP_VERSION: '1.0.0',
  MAX_TODOS: 1000,
  DRAG_THROTTLE_MS: 16,
  AUTOSAVE_DEBOUNCE_MS: 300,
} as const;

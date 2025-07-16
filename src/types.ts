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
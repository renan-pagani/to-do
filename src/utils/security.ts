import DOMPurify from 'dompurify';
import { Todo } from '../types';

export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).trim();
};

export const isValidId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0 && /^[a-f0-9-]+$/.test(id);
};

export const validateTodo = (todo: any): todo is Todo => {
  return (
    todo &&
    typeof todo === 'object' &&
    isValidId(todo.id) &&
    typeof todo.text === 'string' &&
    typeof todo.completed === 'boolean' &&
    todo.position &&
    typeof todo.position.x === 'number' &&
    typeof todo.position.y === 'number' &&
    !isNaN(todo.position.x) &&
    !isNaN(todo.position.y)
  );
};

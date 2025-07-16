import { useCallback } from 'react';
import { SubTask } from '../types';

export const useSubtasks = () => {
  const generateId = useCallback(
    () => Date.now().toString(36) + Math.random().toString(36).substr(2),
    []
  );

  const createSubtask = useCallback(
    (
      subtasks: SubTask[],
      currentIndex: number,
      level: number,
      text: string = ''
    ): SubTask[] => {
      const newSubtask: SubTask = {
        id: generateId(),
        text,
        completed: false,
        level,
      };

      const newSubtasks = [...subtasks];
      newSubtasks.splice(currentIndex + 1, 0, newSubtask);
      return newSubtasks;
    },
    [generateId]
  );

  const updateSubtask = useCallback(
    (
      subtasks: SubTask[],
      subtaskId: string,
      updates: Partial<SubTask>
    ): SubTask[] => {
      return subtasks.map(subtask =>
        subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
      );
    },
    []
  );

  const removeSubtask = useCallback(
    (subtasks: SubTask[], subtaskId: string): SubTask[] => {
      return subtasks.filter(subtask => subtask.id !== subtaskId);
    },
    []
  );

  const indentSubtask = useCallback(
    (subtasks: SubTask[], subtaskId: string): SubTask[] => {
      const index = subtasks.findIndex(s => s.id === subtaskId);
      if (index <= 0) return subtasks;

      const current = subtasks[index];
      const previous = subtasks[index - 1];

      if (current.level <= previous.level + 1) {
        return updateSubtask(subtasks, subtaskId, {
          level: Math.min(current.level + 1, 3),
        });
      }
      return subtasks;
    },
    [updateSubtask]
  );

  const outdentSubtask = useCallback(
    (subtasks: SubTask[], subtaskId: string): SubTask[] => {
      const targetSubtask = subtasks.find(s => s.id === subtaskId);
      return updateSubtask(subtasks, subtaskId, {
        level: Math.max(0, (targetSubtask?.level ?? 1) - 1),
      });
    },
    [updateSubtask]
  );

  const getProgress = useCallback((subtasks: SubTask[]) => {
    if (subtasks.length === 0) return { completed: 0, total: 0, percentage: 0 };

    const completed = subtasks.filter(s => s.completed).length;
    const total = subtasks.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  }, []);

  return {
    createSubtask,
    updateSubtask,
    removeSubtask,
    indentSubtask,
    outdentSubtask,
    getProgress,
  };
};

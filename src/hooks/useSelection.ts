import { useState, useCallback } from 'react';

export const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string, isCtrlPressed: boolean) => {
    setSelectedIds(prev => {
      if (isCtrlPressed) {
        return prev.includes(id) 
          ? prev.filter(selectedId => selectedId !== id)
          : [...prev, id];
      } else {
        return [id];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  return {
    selectedIds,
    toggleSelection,
    clearSelection,
    selectMultiple,
    isSelected: useCallback((id: string) => selectedIds.includes(id), [selectedIds])
  };
}; 
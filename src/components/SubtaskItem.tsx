import { Check } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SubTask } from '../types';

interface SubtaskItemProps {
  subtask: SubTask;
  index: number;
  onUpdate: (id: string, updates: Partial<SubTask>) => void;
  onRemove: (id: string) => void;
  onCreate: (index: number, level: number) => void;
  onIndent: (id: string) => void;
  onOutdent: (id: string) => void;
  onFocus: (id: string) => void;
  isFocused: boolean;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  index,
  onUpdate,
  onRemove,
  onCreate,
  onIndent,
  onOutdent,
  onFocus,
  isFocused,
}) => {
  const [text, setText] = useState(subtask.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleSave = useCallback(() => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      onRemove(subtask.id);
      return;
    }

    onUpdate(subtask.id, { text: trimmedText });
  }, [text, subtask.id, onUpdate, onRemove]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (e.shiftKey) {
            onCreate(index, subtask.level + 1);
          } else {
            onCreate(index, subtask.level);
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            onOutdent(subtask.id);
          } else {
            onIndent(subtask.id);
          }
          break;

        case 'Backspace':
          if (text === '') {
            e.preventDefault();
            onRemove(subtask.id);
          }
          break;
      }
    },
    [
      index,
      subtask.level,
      subtask.id,
      text,
      onCreate,
      onIndent,
      onOutdent,
      onRemove,
    ]
  );

  const indentStyle = {
    marginLeft: `${subtask.level * 20}px`,
  };

  const getIndentColor = (level: number) => {
    const colors = ['border-blue-300', 'border-green-300', 'border-purple-300'];
    return colors[level % colors.length];
  };

  return (
    <div
      className={`flex items-center gap-2 py-1 ${
        subtask.level > 0
          ? 'border-l-2 ' + getIndentColor(subtask.level - 1)
          : ''
      }`}
      style={indentStyle}
    >
      <button
        onClick={() => onUpdate(subtask.id, { completed: !subtask.completed })}
        className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center cursor-pointer ${
          subtask.completed
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {subtask.completed && <Check className="w-2.5 h-2.5 text-white" />}
      </button>

      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        onFocus={() => onFocus(subtask.id)}
        placeholder={
          subtask.level === 0 ? 'Nova tarefa...' : 'Nova subtarefa...'
        }
        className={`flex-1 text-sm bg-transparent border-none outline-none ${
          subtask.completed ? 'line-through text-gray-500' : 'text-gray-800'
        }`}
        maxLength={200}
      />

      {subtask.level > 0 && (
        <span className="text-xs text-gray-400 font-mono">
          L{subtask.level}
        </span>
      )}
    </div>
  );
};

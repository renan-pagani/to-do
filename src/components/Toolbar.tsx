import React, { memo } from 'react';
import { Type, MousePointer } from 'lucide-react';
import { Tool } from '../types';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedCount: number;
  disabled?: boolean;
}

const ToolButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}> = memo(({ isActive, onClick, title, icon, badge, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      p-3 rounded-full transition-all duration-200 relative
      ${isActive 
        ? 'bg-white text-black shadow-md scale-105' 
        : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800
    `}
    title={title}
    aria-label={title}
    aria-pressed={isActive}
  >
    {icon}
    
    {badge !== undefined && badge > 0 && (
      <span 
        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1 shadow-md animate-pulse"
        aria-label={`${badge} items selected`}
      >
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </button>
));

ToolButton.displayName = 'ToolButton';

export const Toolbar: React.FC<ToolbarProps> = memo(({ 
  activeTool, 
  onToolChange, 
  selectedCount,
  disabled = false 
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-full shadow-xl border border-gray-600 flex items-center p-1 gap-1">
        <ToolButton
          isActive={activeTool === 'create'}
          onClick={() => !disabled && onToolChange('create')}
          title="Criar TODO (C)"
          icon={<Type size={20} />}
          disabled={disabled}
        />
        
        <ToolButton
          isActive={activeTool === 'cursor'}
          onClick={() => !disabled && onToolChange('cursor')}
          title="Editar e Navegar (E)"
          icon={<MousePointer size={20} />}
          disabled={disabled}
        />

        <ToolButton
          isActive={activeTool === 'move'}
          onClick={() => !disabled && onToolChange('move')}
          title="Selecionar e Mover (M)"
          icon={
            <div className="w-5 h-5 flex items-center justify-center text-lg font-bold">
              M
            </div>
          }
          badge={activeTool === 'move' ? selectedCount : undefined}
          disabled={disabled}
        />
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar'; 
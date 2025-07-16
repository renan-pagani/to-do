import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { useTodos } from './hooks/useTodos';
import { Tool } from './types';

function App() {
  const {
    todos,
    focusedId,
    selectedIds,
    createTodo,
    updateTodo,
    updateMultipleTodos,
    deleteTodo,
    toggleSelection,
    clearSelection
  } = useTodos();
  
  const [activeTool, setActiveTool] = useState<Tool>('create');

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <Canvas
        todos={todos}
        focusedId={focusedId}
        selectedIds={selectedIds}
        onCreateTodo={createTodo}
        onUpdateTodo={updateTodo}
        onUpdateMultipleTodos={updateMultipleTodos}
        onDeleteTodo={deleteTodo}
        onToggleSelection={toggleSelection}
        onClearSelection={clearSelection}
        activeTool={activeTool}
        onToolChange={setActiveTool}
      />
    </div>
  );
}

export default App; 
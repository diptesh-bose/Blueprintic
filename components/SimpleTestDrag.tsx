import React from 'react';
import { useDnD } from '../contexts/DnDContext';

const SimpleTestDrag: React.FC = () => {
  const [type, setType] = useDnD();

  const handleDragStart = (event: React.DragEvent) => {
    console.log('🧪 TEST DRAG START');
    setType('test-item');
    event.dataTransfer.setData('text/plain', 'test-data');
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg z-50">
      <h3 className="text-sm font-bold mb-2">Test Drag Item</h3>
      <div
        draggable
        onDragStart={handleDragStart}
        className="bg-yellow-200 border border-yellow-400 rounded p-2 cursor-grab active:cursor-grabbing text-sm"
      >
        🧪 Drag me to test
      </div>
      <div className="text-xs mt-2">
        Current type: {type || 'none'}
      </div>
    </div>
  );
};

export default SimpleTestDrag;

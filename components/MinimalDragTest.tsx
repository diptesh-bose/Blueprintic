import React, { useState } from 'react';

const MinimalDragTest: React.FC = () => {
  const [dragCount, setDragCount] = useState(0);
  const [dropCount, setDropCount] = useState(0);

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 p-4 rounded shadow">
      <h3 className="text-sm font-bold mb-2">Minimal Drag Test</h3>
      <div className="space-y-2">
        {/* Simple draggable item */}
        <div
          draggable
          onDragStart={(e) => {
            console.log('🔴 Simple drag start');
            e.dataTransfer.setData('text/plain', 'test');
            setDragCount(prev => prev + 1);
          }}
          className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center cursor-move"
        >
          Drag
        </div>
        
        {/* Simple drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            console.log('🔴 Simple drop');
            e.preventDefault();
            setDropCount(prev => prev + 1);
          }}
          className="w-16 h-16 bg-green-500 text-white flex items-center justify-center"
        >
          Drop
        </div>
        
        <div className="text-xs">
          <div>Drags: {dragCount}</div>
          <div>Drops: {dropCount}</div>
        </div>
      </div>
    </div>
  );
};

export default MinimalDragTest;

import React from 'react';
import { useDnD } from '../contexts/DnDContext';

const DnDDebugger: React.FC = () => {
  const [type, setType] = useDnD();

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-50">
      <h3 className="text-sm font-bold mb-2">DnD Debug</h3>
      <div className="text-xs space-y-1">
        <div>
          <strong>Type:</strong> {type || 'null'}
        </div>
        <button 
          onClick={() => setType('test')}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Test Set Type
        </button>
        <button 
          onClick={() => setType(null)}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded ml-1"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default DnDDebugger;

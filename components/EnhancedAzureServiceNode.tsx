import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Server } from 'lucide-react';

interface AzureServiceNodeData {
  label: string;
  name?: string;
  type?: string;
  category: string;
  description?: string;
  properties?: Record<string, any>;
  icon?: any;
  color?: string;
}

const AzureServiceNode: React.FC<NodeProps<AzureServiceNodeData>> = ({ data, selected }) => {
  console.log('🎨 AzureServiceNode rendering with data:', data);
  
  if (!data) {
    return (
      <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 min-w-48 min-h-24">
        <div className="text-red-700 text-sm font-medium">Error: No data</div>
      </div>
    );
  }

  // Simple icon - just use Server for now to avoid serialization issues
  const IconComponent = Server;
  const nodeColor = data.color || '#0078d4';
  const borderColor = selected ? '#0078d4' : nodeColor;
  const backgroundColor = selected ? '#f0f8ff' : '#ffffff';

  return (
    <div
      className="relative bg-white rounded-lg shadow-lg border-2 transition-all duration-200 hover:shadow-xl"
      style={{
        borderColor,
        backgroundColor,
        minWidth: '180px',
        minHeight: '120px'
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: nodeColor,
          width: 12,
          height: 12,
          border: '2px solid white'
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: nodeColor,
          width: 12,
          height: 12,
          border: '2px solid white'
        }}
      />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{ backgroundColor: `${nodeColor}20`, color: nodeColor }}
          >
            <IconComponent size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {data.label || data.name || 'Unnamed Service'}
            </h3>
            <p className="text-xs text-gray-500 capitalize">
              {data.category}
            </p>
          </div>
        </div>

        {data.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {data.description}
          </p>
        )}

        {data.type && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-mono truncate">
              {data.type}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AzureServiceNode;

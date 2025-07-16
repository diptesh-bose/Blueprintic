import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { FolderOpen, Network, Layers3 } from 'lucide-react';

interface AzureGroupNodeData {
  label: string;
  name?: string; // Add editable name field
  groupType: 'resource-group' | 'subnet' | 'tier';
  description?: string;
  color?: string;
  icon?: string;
}

const AzureGroupNode: React.FC<NodeProps<AzureGroupNodeData>> = ({ data, selected, id }) => {
  console.log('📁 AzureGroupNode rendering with data:', data);
  console.log('📁 AzureGroupNode selected state:', selected);
  console.log('📁 AzureGroupNode id:', id);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(data.name || data.label);

  const handleNameEdit = () => {
    setIsEditing(true);
  };

  const handleNameSave = () => {
    // Dispatch a custom event to update the node data
    const event = new CustomEvent('updateNodeData', {
      detail: { 
        nodeId: id, 
        data: { ...data, name: editingName }
      }
    });
    window.dispatchEvent(event);
    setIsEditing(false);
  };

  const handleNameCancel = () => {
    setEditingName(data.name || data.label);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };
  
  if (!data) {
    return (
      <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 min-w-80 min-h-48">
        <div className="text-red-700 text-sm font-medium">Error: No group data</div>
      </div>
    );
  }

  // Icon based on group type
  const getGroupIcon = () => {
    switch (data.groupType) {
      case 'resource-group':
        return FolderOpen;
      case 'subnet':
        return Network;
      case 'tier':
        return Layers3;
      default:
        return FolderOpen;
    }
  };

  const IconComponent = getGroupIcon();

  // Colors based on group type
  const getGroupColors = () => {
    switch (data.groupType) {
      case 'resource-group':
        return {
          primary: '#0078D4',
          background: 'rgba(0, 120, 212, 0.05)',
          border: 'rgba(0, 120, 212, 0.3)',
        };
      case 'subnet':
        return {
          primary: '#107c10',
          background: 'rgba(16, 124, 16, 0.05)',
          border: 'rgba(16, 124, 16, 0.3)',
        };
      case 'tier':
        return {
          primary: '#d83b01',
          background: 'rgba(216, 59, 1, 0.05)',
          border: 'rgba(216, 59, 1, 0.3)',
        };
      default:
        return {
          primary: '#0078D4',
          background: 'rgba(0, 120, 212, 0.05)',
          border: 'rgba(0, 120, 212, 0.3)',
        };
    }
  };

  const colors = getGroupColors();
  const borderColor = selected ? colors.primary : colors.border;
  const backgroundStyle = isDropTarget ? 
    { ...colors, background: `${colors.primary}15` } : 
    colors;

  // Drag and drop handlers
  const handleDragOver = (event: React.DragEvent) => {
    console.log('🟡 Group drag over event:', data.label);
    event.preventDefault();
    event.stopPropagation(); // Prevent bubbling to canvas
    event.dataTransfer.dropEffect = 'move';
    
    // Only show drop target if it's a service being dragged
    const types = Array.from(event.dataTransfer.types);
    console.log('🟡 Drag types:', types);
    if (types.includes('application/azure-service') || types.includes('application/json')) {
      console.log('🟡 Setting drop target true');
      setIsDropTarget(true);
    }
  };

  const handleDragEnter = (event: React.DragEvent) => {
    console.log('🟢 Group drag enter event:', data.label);
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event: React.DragEvent) => {
    console.log('🔴 Group drag leave event:', data.label);
    // Only reset if we're truly leaving the group container
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    // Check if mouse is still within the group bounds
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      console.log('🔴 Actually leaving group, setting drop target false');
      setIsDropTarget(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    console.log('🎯 Group drop event received:', data.label, 'Group ID:', id);
    event.preventDefault();
    event.stopPropagation(); // Prevent bubbling to canvas
    setIsDropTarget(false);
    
    // Check if this is actually a service drop
    const types = Array.from(event.dataTransfer.types);
    console.log('🎯 Drop types:', types);
    if (!types.includes('application/azure-service') && !types.includes('application/json')) {
      console.log('🚫 Not a service drop, ignoring');
      return;
    }
    
    console.log('🎯 Valid service drop, dispatching event');
    // Emit custom event to parent canvas for handling the reparenting
    const customEvent = new CustomEvent('nodeDroppedOnGroup', {
      detail: {
        groupId: id,
        dropEvent: event
      }
    });
    window.dispatchEvent(customEvent);
  };

  return (
    <>
      {/* Node resizer - allows resizing the group */}
      <NodeResizer
        color={colors.primary}
        isVisible={selected}
        minWidth={320}
        minHeight={240}
        maxWidth={1200}
        maxHeight={800}
        keepAspectRatio={false}
        shouldResize={() => true}
        lineStyle={{
          borderColor: colors.primary,
          borderWidth: 2
        }}
        handleStyle={{
          backgroundColor: colors.primary,
          border: '3px solid white',
          borderRadius: '4px',
          width: '14px',
          height: '14px',
          zIndex: 1002
        }}
      />
      
      {/* Custom resize icon in bottom-right corner when selected */}
      {selected && (
        <div 
          className="absolute bottom-2 right-2 pointer-events-none z-10"
          style={{ 
            color: colors.primary,
            fontSize: '16px'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <polyline points="16 20 20 20 20 16" />
            <line x1="14" y1="14" x2="20" y2="20" />
            <polyline points="8 4 4 4 4 8" />
            <line x1="4" y1="4" x2="10" y2="10" />
          </svg>
        </div>
      )}
      
      <div
        className="relative rounded-lg border-2 border-dashed transition-all duration-200"
        style={{
          backgroundColor: backgroundStyle.background,
          borderColor: isDropTarget ? colors.primary : borderColor,
          borderWidth: isDropTarget ? '3px' : '2px',
          minWidth: '320px',
          minHeight: '240px',
          padding: '16px',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Drop zone overlay - separate from resize area */}
        <div
          className="absolute inset-0 rounded-lg"
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ zIndex: 1 }}
        />
        
        {/* Content area */}
        <div className="relative z-10 pointer-events-none" style={{ height: '100%' }}>
          <div className="pointer-events-auto">
            {/* Group Header */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg shadow-sm border">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
              >
                <IconComponent size={18} />
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={handleKeyPress}
                    className="text-sm font-semibold text-gray-900 bg-transparent border-b border-blue-400 outline-none w-full"
                    autoFocus
                  />
                ) : (
                  <h3 
                    className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:bg-gray-100 rounded px-1"
                    onClick={handleNameEdit}
                    title="Click to edit name"
                  >
                    {data.name || data.label}
                  </h3>
                )}
                <p className="text-xs text-gray-500 capitalize">
                  {data.groupType.replace('-', ' ')}
                </p>
              </div>
            </div>

            {/* Group Description */}
            {data.description && (
              <div className="mb-4 p-2 bg-white bg-opacity-50 rounded border border-gray-200">
                <p className="text-xs text-gray-600">
                  {data.description}
                </p>
              </div>
            )}

            {/* Drop Zone Indicator */}
            <div className={`absolute inset-4 top-20 border-2 border-dashed rounded-lg flex items-center justify-center pointer-events-none transition-all duration-200 ${
              isDropTarget 
                ? 'opacity-80 border-blue-400 bg-blue-50' 
                : 'opacity-30 border-gray-300'
            }`}>
              <div className="text-center text-gray-500">
                <FolderOpen size={24} className="mx-auto mb-2" />
                <p className="text-xs">
                  {isDropTarget ? 'Drop service here!' : 'Drop Azure services here'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: colors.primary,
            width: 12,
            height: 12,
            border: '2px solid white',
            top: -6,
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: colors.primary,
            width: 12,
            height: 12,
            border: '2px solid white',
            bottom: -6,
          }}
        />
      </div>
    </>
  );
};

export default AzureGroupNode;

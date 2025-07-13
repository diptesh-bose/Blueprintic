import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Node, Edge } from 'reactflow';
import { useGenAI } from '../contexts/EnhancedGenAIContext';

interface ManualUpdateButtonProps {
  nodes: Node[];
  edges: Edge[];
}

const ManualUpdateButton: React.FC<ManualUpdateButtonProps> = ({ nodes, edges }) => {
  const { generateCodeFromCanvas, isProcessing } = useGenAI();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleManualUpdate = async () => {
    if (nodes.length === 0) {
      alert('No Azure services on canvas to generate code from. Please add some services first.');
      return;
    }

    setIsUpdating(true);
    try {
      console.log('🔄 Manual infrastructure code update triggered');
      await generateCodeFromCanvas(nodes, edges);
      console.log('✅ Manual infrastructure code update completed');
    } catch (error) {
      console.error('❌ Manual update failed:', error);
      alert('Failed to update infrastructure code. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const buttonDisabled = isProcessing || isUpdating || nodes.length === 0;

  return (
    <button
      onClick={handleManualUpdate}
      disabled={buttonDisabled}
      className={`
        flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-all
        ${buttonDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
        }
      `}
      title={
        nodes.length === 0 
          ? 'Add Azure services to canvas first' 
          : 'Generate infrastructure code from current canvas services'
      }
    >
      <RefreshCw 
        size={14} 
        className={isUpdating ? 'animate-spin' : ''} 
      />
      {isUpdating ? 'Updating...' : 'Update IaC'}
    </button>
  );
};

export default ManualUpdateButton;

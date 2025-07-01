import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import FlowCanvas from '../components/FlowCanvas';
import PromptInput from '../components/PromptInput';
import { useGenAI } from '../contexts/GenAIContext';
import Button from '../components/Button';

const DesignerPage = () => {
  const { isProcessing, processPrompt, generatedNodes, generatedEdges, error } = useGenAI();
  const [canvasNodes, setCanvasNodes] = useState<any[]>([]);
  const [canvasEdges, setCanvasEdges] = useState<any[]>([]);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Update canvas when generated nodes/edges change
  useEffect(() => {
    if (generatedNodes.length > 0) {
      setCanvasNodes(generatedNodes);
      setCanvasEdges(generatedEdges);
      setShowExportOptions(true);
    }
  }, [generatedNodes, generatedEdges]);

  const handlePromptSubmit = async (prompt: string) => {
    await processPrompt(prompt);
  };

  const handleExport = (format: string) => {
    // In a real implementation, this would call the backend to generate the template
    alert(`Exporting as ${format}... This would generate the actual template in a real implementation.`);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Azure Infrastructure Designer</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-100 p-4 flex flex-col overflow-auto">
          <PromptInput onSubmit={handlePromptSubmit} isLoading={isProcessing} />
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {showExportOptions && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">Export Options</h2>
              <div className="space-y-2">
                <Button 
                  onClick={() => handleExport('ARM')}
                  variant="outline"
                  className="w-full"
                >
                  Export as ARM Template
                </Button>
                <Button 
                  onClick={() => handleExport('Terraform')}
                  variant="outline"
                  className="w-full"
                >
                  Export as Terraform
                </Button>
                <Button 
                  onClick={() => handleExport('Bicep')}
                  variant="outline"
                  className="w-full"
                >
                  Export as Bicep
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">Azure Components</h2>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop components to the canvas
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries({
                'Compute': '🖥️',
                'Storage': '💾',
                'Database': '🗄️',
                'Networking': '🔌',
                'Security': '🔒',
                'Integration': '🔄'
              }).map(([category, icon]) => (
                <div 
                  key={category}
                  className="p-2 bg-gray-50 border border-gray-200 rounded-md text-center cursor-move"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', 'azureService');
                    e.dataTransfer.setData('application/azureService', JSON.stringify({
                      label: category,
                      serviceType: category.toLowerCase(),
                      icon,
                      properties: {
                        region: 'East US'
                      }
                    }));
                  }}
                >
                  <div className="text-2xl">{icon}</div>
                  <div className="text-sm">{category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Canvas */}
        <div className="flex-1 bg-gray-50">
          <ReactFlowProvider>
            <FlowCanvas initialNodes={canvasNodes} initialEdges={canvasEdges} />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};

export default DesignerPage;

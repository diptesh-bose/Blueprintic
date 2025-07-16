import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import AzureFlowCanvas from '../components/AzureFlowCanvas';
import EnhancedAzureComponentSidebar from '../components/EnhancedAzureComponentSidebar';
import EnhancedPromptInput from '../components/EnhancedPromptInput';
import EnhancedTemplateOutputPanel from '../components/EnhancedTemplateOutputPanel';
import ErrorBoundary from '../components/ErrorBoundary';
import { DnDProvider } from '../contexts/DnDContext';
import { Node } from 'reactflow';

const EnhancedDesignerPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  // const [exportedCode, setExportedCode] = useState<{ code: string; type: string } | null>(null);

  const handleNodeSelect = (node: Node | null) => {
    setSelectedNode(node);
  };

  const handleExportGenerated = (code: string, type: string) => {
    // setExportedCode({ code, type });
    console.log('Export generated:', { code, type });
  };

  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <DnDProvider>
          <div className="h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Azure Infrastructure Designer</h1>
                  <p className="text-sm text-gray-600">AI-Powered Infrastructure as Code Generator</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Powered by <span className="font-medium text-blue-600">Google Gemini</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Left Sidebar - Azure Components */}
            <EnhancedAzureComponentSidebar />

            {/* Center - Canvas and Prompt */}
            <div className="flex-1 flex flex-col">
              {/* Prompt Input */}
              <div className="p-4">
                <EnhancedPromptInput />
              </div>

              {/* Canvas */}
              <div className="flex-1 bg-gray-100 relative">
                <AzureFlowCanvas
                  onNodeSelect={handleNodeSelect}
                  onExportGenerated={handleExportGenerated}
                />
                
                {/* Canvas Instructions Overlay */}
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                  <h3 className="font-semibold text-gray-800 mb-2">Getting Started</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Configure your Gemini API key</li>
                    <li>• Describe your infrastructure needs</li>
                    <li>• Drag components from the sidebar</li>
                    <li>• Connect services by dragging handles</li>
                    <li>• Export your infrastructure as code</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Panel - Code Output */}
            <div className="w-1/3 border-l border-gray-200">
              <EnhancedTemplateOutputPanel className="h-full" />
            </div>
          </div>

          {/* Status Bar */}
          <footer className="bg-white border-t border-gray-200 px-6 py-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>Ready</span>
                {selectedNode && (
                  <span>Selected: {selectedNode.data?.label || selectedNode.id}</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span>React Flow Canvas</span>
                <span>•</span>
                <span>Azure Infrastructure Designer v2.0</span>
              </div>
            </div>
          </footer>
        </div>
      </DnDProvider>
    </ReactFlowProvider>
    </ErrorBoundary>
  );
};

export default EnhancedDesignerPage;

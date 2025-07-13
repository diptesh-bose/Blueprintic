import React, { useState } from 'react';
import { Copy, Download, Eye, Code, FileText, Settings } from 'lucide-react';
import { useGenAI } from '../contexts/EnhancedGenAIContext';

interface TemplateOutputPanelProps {
  className?: string;
}

const TemplateOutputPanel: React.FC<TemplateOutputPanelProps> = ({ className = '' }) => {
  const { generatedCode, isProcessing, error } = useGenAI();
  const [activeTab, setActiveTab] = useState<'arm' | 'terraform' | 'yaml'>('arm');
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

  const tabs = [
    {
      id: 'arm',
      label: 'ARM Template',
      icon: FileText,
      description: 'Azure Resource Manager JSON template',
      language: 'json'
    },
    {
      id: 'terraform',
      label: 'Terraform',
      icon: Code,
      description: 'Terraform HCL configuration',
      language: 'hcl'
    },
    {
      id: 'yaml',
      label: 'Azure DevOps',
      icon: Settings,
      description: 'Azure DevOps YAML pipeline',
      language: 'yaml'
    }
  ];

  const getCodeContent = () => {
    if (!generatedCode) return '';
    
    switch (activeTab) {
      case 'arm':
        return generatedCode.armTemplate;
      case 'terraform':
        return generatedCode.terraformCode;
      case 'yaml':
        return generatedCode.yamlConfig;
      default:
        return '';
    }
  };

  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus({ ...copyStatus, [type]: true });
      setTimeout(() => {
        setCopyStatus({ ...copyStatus, [type]: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = () => {
    switch (activeTab) {
      case 'arm': return '.json';
      case 'terraform': return '.tf';
      case 'yaml': return '.yml';
      default: return '.txt';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Infrastructure as Code</h3>
        
        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                <TabIcon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {isProcessing ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating infrastructure code...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-red-600">
              <p className="font-medium">Error generating code</p>
              <p className="text-sm text-red-500 mt-1">{error}</p>
            </div>
          </div>
        ) : generatedCode ? (
          <>
            {/* Actions Bar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {tabs.find(t => t.id === activeTab)?.description}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(getCodeContent(), activeTab)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${copyStatus[activeTab]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Copy size={14} />
                  {copyStatus[activeTab] ? 'Copied!' : 'Copy'}
                </button>
                
                <button
                  onClick={() => handleDownload(
                    getCodeContent(),
                    `infrastructure-${activeTab}${getFileExtension()}`
                  )}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>

            {/* Code Display */}
            <div className="flex-1 relative">
              <pre className="h-full overflow-auto p-4 text-sm font-mono bg-gray-50 border-0">
                <code className="text-gray-800 whitespace-pre-wrap">
                  {getCodeContent()}
                </code>
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-gray-500">
              <Code size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="font-medium">No infrastructure code generated</p>
              <p className="text-sm mt-1">Create infrastructure using the prompt input to generate code</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateOutputPanel;

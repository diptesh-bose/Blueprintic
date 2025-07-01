import { useState } from 'react';

interface TemplateOutputPanelProps {
  armTemplate: string;
  terraformTemplate: string;
  bicepTemplate: string;
}

const TemplateOutputPanel = ({ armTemplate, terraformTemplate, bicepTemplate }: TemplateOutputPanelProps) => {
  const [activeTab, setActiveTab] = useState<'arm' | 'terraform' | 'bicep'>('arm');
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle tab change
  const handleTabChange = (tab: 'arm' | 'terraform' | 'bicep') => {
    setActiveTab(tab);
  };

  // Toggle panel expansion
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle download of template
  const handleDownload = () => {
    let content = '';
    let filename = '';
    let type = '';

    switch (activeTab) {
      case 'arm':
        content = armTemplate;
        filename = 'arm-template.json';
        type = 'application/json';
        break;
      case 'terraform':
        content = terraformTemplate;
        filename = 'main.tf';
        type = 'text/plain';
        break;
      case 'bicep':
        content = bicepTemplate;
        filename = 'main.bicep';
        type = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    let content = '';

    switch (activeTab) {
      case 'arm':
        content = armTemplate;
        break;
      case 'terraform':
        content = terraformTemplate;
        break;
      case 'bicep':
        content = bicepTemplate;
        break;
    }

    navigator.clipboard.writeText(content)
      .then(() => {
        // Show a temporary success message
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
          const originalText = copyBtn.innerText;
          copyBtn.innerText = 'Copied!';
          setTimeout(() => {
            copyBtn.innerText = originalText;
          }, 2000);
        }
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Handle Azure deployment
  const handleDeploy = () => {
    // This would be connected to Azure API in a real implementation
    console.log('Deploy to Azure clicked');
    // Show a modal or form for Azure credentials
  };

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-all duration-300 z-10
      ${isExpanded ? 'h-2/3' : 'h-64'}
    `}>
      {/* Header with tabs and controls */}
      <div className="flex justify-between items-center border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-t-lg text-sm font-medium ${activeTab === 'arm' ? 'bg-white border border-gray-200 border-b-0' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => handleTabChange('arm')}
          >
            ARM Template
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg text-sm font-medium ${activeTab === 'terraform' ? 'bg-white border border-gray-200 border-b-0' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => handleTabChange('terraform')}
          >
            Terraform
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg text-sm font-medium ${activeTab === 'bicep' ? 'bg-white border border-gray-200 border-b-0' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => handleTabChange('bicep')}
          >
            Bicep
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            id="copy-btn"
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
            onClick={handleCopy}
          >
            Copy
          </button>
          <button
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
            onClick={handleDownload}
          >
            Download
          </button>
          <button
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            onClick={handleDeploy}
          >
            Deploy to Azure
          </button>
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            onClick={toggleExpansion}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Template content */}
      <div className="h-full overflow-auto p-4">
        <pre className="text-sm font-mono bg-gray-50 p-4 rounded border border-gray-200 overflow-auto h-full whitespace-pre-wrap">
          {activeTab === 'arm' && armTemplate}
          {activeTab === 'terraform' && terraformTemplate}
          {activeTab === 'bicep' && bicepTemplate}
        </pre>
      </div>

      {/* Azure deployment form (hidden by default) */}
      <div id="azure-deploy-form" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-96">
          <h3 className="text-lg font-medium mb-4">Deploy to Azure</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subscription ID</label>
              <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Resource Group</label>
              <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option>East US</option>
                <option>West US</option>
                <option>Central US</option>
                <option>North Europe</option>
                <option>West Europe</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Cancel</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded">Deploy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateOutputPanel;

import { useState } from 'react';

// Define Azure service types and their properties
const azureServiceTypes = {
  compute: [
    { 
      label: 'App Service', 
      icon: '🌐', 
      properties: { tier: 'Standard', size: 'S1', region: 'East US' } 
    },
    { 
      label: 'Virtual Machine', 
      icon: '🖥️', 
      properties: { size: 'Standard_D2s_v3', os: 'Windows Server 2022', region: 'East US' } 
    },
    { 
      label: 'AKS Cluster', 
      icon: '🚢', 
      properties: { nodeSize: 'Standard_D2s_v3', nodeCount: '3', region: 'East US' } 
    },
    {
      label: 'Container Apps',
      icon: '📦',
      properties: { environment: 'Production', minReplicas: '1', maxReplicas: '10', region: 'East US' }
    },
    {
      label: 'Service Fabric',
      icon: '🧩',
      properties: { nodeType: 'Standard_D2s_v3', nodeCount: '5', durabilityLevel: 'Bronze', region: 'East US' }
    }
  ],
  serverless: [
    { 
      label: 'Azure Functions', 
      icon: '⚡', 
      properties: { plan: 'Consumption', region: 'East US' } 
    },
    { 
      label: 'Logic Apps', 
      icon: '🔄', 
      properties: { plan: 'Consumption', region: 'East US' } 
    },
    {
      label: 'Event Grid',
      icon: '📊',
      properties: { tier: 'Basic', region: 'East US' }
    },
    {
      label: 'Service Bus',
      icon: '🚌',
      properties: { tier: 'Standard', region: 'East US' }
    }
  ],
  database: [
    { 
      label: 'Azure SQL', 
      icon: '🗄️', 
      properties: { tier: 'Standard', size: 'S0', region: 'East US' } 
    },
    { 
      label: 'Cosmos DB', 
      icon: '🌌', 
      properties: { api: 'SQL', throughput: '400 RU/s', region: 'East US' } 
    },
    {
      label: 'MySQL',
      icon: '🐬',
      properties: { tier: 'General Purpose', storage: '100 GB', region: 'East US' }
    },
    {
      label: 'PostgreSQL',
      icon: '🐘',
      properties: { tier: 'General Purpose', storage: '100 GB', region: 'East US' }
    },
    {
      label: 'SQL Managed Instance',
      icon: '📀',
      properties: { tier: 'General Purpose', vCores: '4', storage: '100 GB', region: 'East US' }
    }
  ],
  storage: [
    { 
      label: 'Storage Account', 
      icon: '💾', 
      properties: { type: 'Standard_LRS', accessTier: 'Hot', region: 'East US' } 
    },
    {
      label: 'Blob Storage',
      icon: '📁',
      properties: { accessTier: 'Hot', redundancy: 'LRS', region: 'East US' }
    },
    {
      label: 'File Storage',
      icon: '📂',
      properties: { tier: 'Premium', redundancy: 'ZRS', region: 'East US' }
    },
    {
      label: 'Data Lake Storage',
      icon: '🏞️',
      properties: { tier: 'Standard', redundancy: 'LRS', region: 'East US' }
    }
  ],
  networking: [
    { 
      label: 'Virtual Network', 
      icon: '🔌', 
      properties: { addressSpace: '10.0.0.0/16', region: 'East US' } 
    },
    { 
      label: 'Load Balancer', 
      icon: '⚖️', 
      properties: { tier: 'Standard', region: 'East US' } 
    },
    { 
      label: 'Application Gateway', 
      icon: '🚦', 
      properties: { tier: 'Standard_v2', region: 'East US' } 
    },
    {
      label: 'Front Door',
      icon: '🚪',
      properties: { tier: 'Standard', region: 'Global' }
    },
    {
      label: 'CDN',
      icon: '🌐',
      properties: { tier: 'Standard', region: 'Global' }
    }
  ],
  security: [
    { 
      label: 'Azure AD B2C', 
      icon: '🔒', 
      properties: { tier: 'Standard', region: 'Global' } 
    },
    { 
      label: 'Key Vault', 
      icon: '🔑', 
      properties: { tier: 'Standard', region: 'East US' } 
    },
    {
      label: 'DDoS Protection',
      icon: '🛡️',
      properties: { tier: 'Standard', region: 'Global' }
    },
    {
      label: 'Firewall',
      icon: '🧱',
      properties: { tier: 'Standard', region: 'East US' }
    }
  ],
  cache: [
    { 
      label: 'Redis Cache', 
      icon: '🔥', 
      properties: { tier: 'Basic', size: 'C0', region: 'East US' } 
    },
    {
      label: 'CDN Cache',
      icon: '📡',
      properties: { tier: 'Standard', region: 'Global' }
    }
  ],
  api: [
    { 
      label: 'API Management', 
      icon: '⚙️', 
      properties: { tier: 'Consumption', region: 'East US' } 
    },
    {
      label: 'API Gateway',
      icon: '🔗',
      properties: { tier: 'Basic', region: 'East US' }
    }
  ],
  ai: [
    {
      label: 'Azure OpenAI',
      icon: '🧠',
      properties: { model: 'gpt-4', capacity: '1', region: 'East US' }
    },
    {
      label: 'Cognitive Services',
      icon: '👁️',
      properties: { tier: 'Standard', region: 'East US' }
    },
    {
      label: 'Machine Learning',
      icon: '🤖',
      properties: { tier: 'Standard', region: 'East US' }
    },
    {
      label: 'Bot Service',
      icon: '🤖',
      properties: { tier: 'Standard', region: 'East US' }
    },
    {
      label: 'Form Recognizer',
      icon: '📝',
      properties: { tier: 'Standard', region: 'East US' }
    }
  ],
  integration: [
    {
      label: 'Event Hub',
      icon: '📨',
      properties: { tier: 'Standard', throughputUnits: '1', region: 'East US' }
    },
    {
      label: 'Data Factory',
      icon: '🏭',
      properties: { tier: 'Standard', region: 'East US' }
    },
    {
      label: 'Service Bus',
      icon: '🚌',
      properties: { tier: 'Standard', region: 'East US' }
    }
  ],
  devops: [
    {
      label: 'App Configuration',
      icon: '⚙️',
      properties: { tier: 'Standard', region: 'East US' }
    },
    {
      label: 'Container Registry',
      icon: '📦',
      properties: { tier: 'Standard', region: 'East US' }
    }
  ]
};

// Component for the sidebar with Azure components
const AzureComponentSidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    compute: true,
    serverless: true,
    database: true,
    storage: true,
    networking: true,
    security: true,
    cache: true,
    api: true,
    ai: true,
    integration: true,
    devops: true
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Handle drag start for components
  const onDragStart = (event: React.DragEvent, serviceType: string, serviceData: any) => {
    // Set the drag data with the component type and properties
    event.dataTransfer.setData('application/reactflow/type', 'azureService');
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify({
      ...serviceData,
      type: serviceType
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Filter services based on search term
  const filterServices = () => {
    if (!searchTerm) return azureServiceTypes;
    
    const filtered: Record<string, any[]> = {};
    
    Object.entries(azureServiceTypes).forEach(([category, services]) => {
      const matchingServices = services.filter(service => 
        service.label.toLowerCase().includes(searchTerm)
      );
      
      if (matchingServices.length > 0) {
        filtered[category] = matchingServices;
      }
    });
    
    return filtered;
  };

  const filteredServices = filterServices();

  // Get category title with proper capitalization
  const getCategoryTitle = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'compute':
        return 'bg-blue-500';
      case 'serverless':
        return 'bg-orange-500';
      case 'database':
        return 'bg-green-500';
      case 'storage':
        return 'bg-yellow-500';
      case 'networking':
        return 'bg-cyan-500';
      case 'security':
        return 'bg-red-500';
      case 'cache':
        return 'bg-pink-500';
      case 'api':
        return 'bg-gray-500';
      case 'ai':
        return 'bg-purple-500';
      case 'integration':
        return 'bg-indigo-500';
      case 'devops':
        return 'bg-teal-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Azure Components</h2>
      
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search components..."
          className="w-full p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      {/* Component categories */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(filteredServices).length === 0 ? (
          <p className="text-gray-500 text-center py-4">No components match your search</p>
        ) : (
          Object.entries(filteredServices).map(([category, services]) => (
            <div key={category} className="mb-4">
              {/* Category header */}
              <div 
                className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(category)}`}></div>
                  <span className="font-medium">{getCategoryTitle(category)}</span>
                </div>
                <span>{expandedCategories[category] ? '▼' : '▶'}</span>
              </div>
              
              {/* Category services */}
              {expandedCategories[category] && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {services.map((service, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="border border-gray-200 rounded p-2 bg-white cursor-grab hover:shadow-md transition-shadow duration-200 flex flex-col items-center"
                      draggable
                      onDragStart={(event) => onDragStart(event, category, service)}
                    >
                      <div className="text-2xl mb-1">{service.icon}</div>
                      <div className="text-sm text-center">{service.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700 border border-blue-100">
        <p className="font-medium mb-1">How to use:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Drag components to the canvas</li>
          <li>Connect nodes by dragging from handles</li>
          <li>Resize nodes by selecting and dragging corners</li>
          <li>Right-click nodes to edit or delete</li>
        </ul>
      </div>
    </div>
  );
};

export default AzureComponentSidebar;

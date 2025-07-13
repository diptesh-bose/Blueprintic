import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { azureServiceCategories, AzureService } from '../services/AzureIconsService';
import { useDnD } from '../contexts/DnDContext';

interface AzureComponentSidebarProps {
  onDragStart?: (event: React.DragEvent, service: AzureService) => void;
}

const AzureComponentSidebar: React.FC<AzureComponentSidebarProps> = ({ onDragStart }) => {
  const [, setType] = useDnD();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    compute: true,
    database: false,
    storage: false,
    networking: false,
    security: false,
    ai: false,
    integration: false,
    analytics: false
  });
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const handleDragStart = (event: React.DragEvent, service: AzureService) => {
    console.log('🚀 DRAG START - Service:', service.name);
    console.log('🚀 DRAG START - Event:', event);
    console.log('🚀 DRAG START - DataTransfer:', event.dataTransfer);
    
    // Set the type in the DnD context - following exact official pattern
    setType('azureService');
    console.log('📝 Type set to: azureService');
    
    // Following MDN recommendation for data transfer
    event.dataTransfer.effectAllowed = 'move';
    console.log('📝 Effect allowed set to: move');
    
    // Store service data using both text/plain and application/json as recommended by MDN
    const serviceDataString = JSON.stringify({
      id: service.id,
      name: service.name,
      type: service.type,
      category: service.category,
      description: service.description,
      icon: service.icon,
      color: service.color,
      properties: service.properties
    });
    
    event.dataTransfer.setData('text/plain', service.name);
    event.dataTransfer.setData('application/json', serviceDataString);
    event.dataTransfer.setData('application/azure-service', serviceDataString);
    
    console.log('📦 Data set with types:', ['text/plain', 'application/json', 'application/azure-service']);
    console.log('📦 Service data:', serviceDataString);
    
    if (onDragStart) {
      onDragStart(event, service);
    }
  };

  const filteredCategories = Object.entries(azureServiceCategories).map(([key, category]) => ({
    key,
    ...category,
    services: category.services.filter((service: AzureService) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => searchTerm === '' || category.services.length > 0);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Azure Services</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories and Services */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredCategories.map(({ key, name, color, icon: CategoryIcon, services }) => (
            <div key={key} className="mb-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(key)}
                className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: color }}
                >
                  <CategoryIcon size={16} />
                </div>
                <span className="flex-1 text-left font-medium text-gray-700">{name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {services.length}
                </span>
                {expandedCategories[key] ? (
                  <ChevronDown size={16} className="text-gray-400" />
                ) : (
                  <ChevronRight size={16} className="text-gray-400" />
                )}
              </button>

              {/* Services List */}
              {expandedCategories[key] && (
                <div className="ml-4 mt-2 space-y-1">
                  {services.map((service: AzureService) => {
                    const ServiceIcon = service.icon;
                    return (
                      <div
                        key={service.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, service)}
                        className="drag-item group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all bg-white hover:bg-blue-50"
                        style={{ 
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none',
                          userSelect: 'none'
                        }}
                      >
                        {/* Service Icon */}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: service.color }}
                        >
                          <ServiceIcon size={18} />
                        </div>

                        {/* Service Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-800 truncate">
                            {service.name}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-tight">
                            {service.description}
                          </p>
                          
                          {/* Properties Preview */}
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(service.properties).slice(0, 2).map(([key, value]) => (
                              <span
                                key={key}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                              >
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Drag Indicator */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mb-1"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full mb-1"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Drag services to the canvas to build your infrastructure
        </div>
      </div>
    </div>
  );
};

export default AzureComponentSidebar;

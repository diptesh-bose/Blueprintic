import React, { createContext, useContext, useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import GeminiService, { InfrastructureRequirement, InfrastructureCode, ServiceConnection } from '../services/GeminiService';
import { azureServiceCategories, AzureService } from '../services/AzureIconsService';

interface GenAIContextType {
  // Prompt and processing
  prompt: string;
  setPrompt: (prompt: string) => void;
  isProcessing: boolean;
  
  // Generated infrastructure
  generatedNodes: Node[];
  generatedEdges: Edge[];
  generatedCode: InfrastructureCode | null;
  
  // Actions
  processPrompt: (prompt: string) => Promise<void>;
  optimizeInfrastructure: () => Promise<void>;
  generateCodeFromCanvas: (nodes: Node[], edges: Edge[]) => Promise<void>;
  clearGenerated: () => void;
  
  // Error handling
  error: string | null;
  clearError: () => void;
  
  // API configuration
  setApiKey: (apiKey: string) => void;
  isApiConfigured: boolean;
}

const GenAIContext = createContext<GenAIContextType | undefined>(undefined);

export const useGenAI = () => {
  const context = useContext(GenAIContext);
  if (!context) {
    throw new Error('useGenAI must be used within a GenAIProvider');
  }
  return context;
};

interface GenAIProviderProps {
  children: React.ReactNode;
}

export const GenAIProvider: React.FC<GenAIProviderProps> = ({ children }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const [generatedCode, setGeneratedCode] = useState<InfrastructureCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  const [isApiConfigured, setIsApiConfigured] = useState(false);

  const setApiKey = useCallback((apiKey: string) => {
    if (!apiKey || apiKey.trim() === '') {
      setError('Please provide a valid Gemini API key');
      setIsApiConfigured(false);
      return;
    }

    try {
      console.log('🔧 Setting up Gemini API with key:', apiKey.substring(0, 10) + '...');
      console.log('🔧 Key length:', apiKey.length);
      console.log('🔧 Key starts with AIza:', apiKey.startsWith('AIza'));
      const service = new GeminiService(apiKey.trim());
      setGeminiService(service);
      setIsApiConfigured(true);
      setError(null);
      console.log('✅ Gemini API configured successfully');
    } catch (err) {
      console.error('Failed to configure Gemini API:', err);
      setError('Failed to configure Gemini API. Please check your API key and try again.');
      setIsApiConfigured(false);
    }
  }, []);

  const convertInfrastructureToNodes = useCallback((infrastructure: InfrastructureRequirement): { nodes: Node[], edges: Edge[] } => {
    console.log('🔄 Converting infrastructure to nodes:', infrastructure);
    
    const nodes: Node[] = infrastructure.services.map((service) => {
      // Find the service definition from our Azure services
      const serviceDefinition = findServiceDefinition(service.type, service.category);
      
      const node = {
        id: service.id,
        type: 'azureService',
        position: service.position,
        data: {
          ...service,
          label: service.name,
          icon: serviceDefinition?.icon,
          color: serviceDefinition?.color || '#0078d4',
          description: serviceDefinition?.description || service.name
        }
      };
      
      console.log('📦 Created node:', node);
      return node;
    });

    const edges: Edge[] = infrastructure.connections.map((connection) => ({
      id: connection.id,
      source: connection.source,
      target: connection.target,
      type: 'custom',
      animated: true,
      style: { strokeWidth: 2 },
      data: {
        connectionType: connection.connectionType,
        properties: connection.properties
      }
    }));

    console.log('✅ Converted to nodes/edges:', { nodeCount: nodes.length, edgeCount: edges.length, nodeData: nodes, edgeData: edges });
    return { nodes, edges };
  }, []);

  const findServiceDefinition = (type: string, category: string): AzureService | undefined => {
    const categoryServices = azureServiceCategories[category as keyof typeof azureServiceCategories];
    if (!categoryServices) return undefined;
    
    return categoryServices.services.find((service: AzureService) => 
      service.type === type || service.id.includes(type.toLowerCase())
    );
  };

  const processPrompt = useCallback(async (inputPrompt: string) => {
    console.log('🚀 processPrompt called with:', inputPrompt);
    console.log('🔧 GeminiService available:', !!geminiService);
    console.log('🔧 API Configured:', isApiConfigured);
    
    if (!inputPrompt || inputPrompt.trim() === '') {
      setError('Please provide a valid prompt');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (!geminiService) {
        // Demo mode - show mock infrastructure
        console.log('🎭 Running in demo mode (no API key configured)');
        const demoInfrastructure = generateDemoInfrastructure(inputPrompt);
        console.log('🎭 Demo infrastructure generated:', demoInfrastructure);
        const { nodes, edges } = convertInfrastructureToNodes(demoInfrastructure);
        console.log('🎭 Demo nodes and edges converted:', { nodes: nodes.length, edges: edges.length });
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setGeneratedNodes(nodes);
        setGeneratedEdges(edges);
        setGeneratedCode({
          armTemplate: '{\n  "$schema": "Demo mode - configure API key for real generation",\n  "contentVersion": "1.0.0.0"\n}',
          terraformCode: '# Demo mode - configure your Gemini API key for real generation\n# This is a placeholder',
          yamlConfig: '# Demo mode - configure your Gemini API key for real generation\n# This is a placeholder'
        });
        setPrompt(inputPrompt);
        console.log('🎭 Demo infrastructure generated successfully');
        return;
      }

      console.log('🤖 Processing prompt with Gemini API:', inputPrompt);
      
      // Parse natural language to infrastructure
      console.log('📞 Calling Gemini API for infrastructure parsing...');
      const infrastructure = await geminiService.parseNaturalLanguageToInfrastructure(inputPrompt);
      console.log('✅ Infrastructure parsed successfully:', infrastructure);
      
      // Convert to React Flow nodes and edges
      const { nodes, edges } = convertInfrastructureToNodes(infrastructure);
      console.log('🔄 Generated nodes:', nodes.length, 'edges:', edges.length);
      
      // Generate infrastructure code
      console.log('📝 Generating infrastructure code...');
      const code = await geminiService.generateInfrastructureCode(infrastructure);
      console.log('✅ Code generated successfully');
      
      setGeneratedNodes(nodes);
      setGeneratedEdges(edges);
      setGeneratedCode(code);
      setPrompt(inputPrompt);
      
    } catch (err) {
      console.error('❌ Error processing prompt:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process prompt';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [geminiService, convertInfrastructureToNodes]);

  // Demo infrastructure generator for when API is not configured
  const generateDemoInfrastructure = (prompt: string): InfrastructureRequirement => {
    const lowerPrompt = prompt.toLowerCase();
    const services: any[] = [];
    const connections: ServiceConnection[] = [];
    let nodeIndex = 0;

    // Basic web application
    if (lowerPrompt.includes('web') || lowerPrompt.includes('app')) {
      services.push({
        id: `app-service-${nodeIndex}`,
        name: 'App Service',
        type: 'Microsoft.Web/sites',
        category: 'compute',
        properties: { tier: 'Standard', size: 'S1', region: 'East US' },
        position: { x: 100, y: 100 }
      });
      nodeIndex++;
    }

    // Database
    if (lowerPrompt.includes('database') || lowerPrompt.includes('sql') || lowerPrompt.includes('data')) {
      services.push({
        id: `sql-db-${nodeIndex}`,
        name: 'Azure SQL Database',
        type: 'Microsoft.Sql/servers/databases',
        category: 'database',
        properties: { tier: 'Standard', size: 'S2', region: 'East US' },
        position: { x: 100, y: 300 }
      });
      
      if (services.length > 1) {
        connections.push({
          id: 'app-to-db',
          source: services[0].id,
          target: services[services.length - 1].id,
          connectionType: 'database'
        });
      }
      nodeIndex++;
    }

    // Storage
    if (lowerPrompt.includes('storage') || lowerPrompt.includes('upload') || lowerPrompt.includes('file')) {
      services.push({
        id: `storage-${nodeIndex}`,
        name: 'Storage Account',
        type: 'Microsoft.Storage/storageAccounts',
        category: 'storage',
        properties: { type: 'Standard_LRS', accessTier: 'Hot', region: 'East US' },
        position: { x: 400, y: 200 }
      });
      nodeIndex++;
    }

    // Authentication
    if (lowerPrompt.includes('auth') || lowerPrompt.includes('login') || lowerPrompt.includes('user')) {
      services.push({
        id: `auth-${nodeIndex}`,
        name: 'Azure AD B2C',
        type: 'Microsoft.AzureActiveDirectory/b2cDirectories',
        category: 'security',
        properties: { tier: 'Standard', region: 'Global' },
        position: { x: 50, y: 100 }
      });
      nodeIndex++;
    }

    return {
      description: prompt,
      services,
      connections,
      resourceGroup: 'rg-demo-infrastructure',
      region: 'East US'
    };
  };

  const optimizeInfrastructure = useCallback(async () => {
    if (!geminiService || generatedNodes.length === 0) {
      setError('No infrastructure to optimize or Gemini API not configured.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert current nodes back to infrastructure format
      const currentInfrastructure: InfrastructureRequirement = {
        description: prompt,
        services: generatedNodes.map(node => ({
          id: node.id,
          name: node.data.name,
          type: node.data.type,
          category: node.data.category,
          properties: node.data.properties,
          position: node.position,
          dependencies: node.data.dependencies
        })),
        connections: generatedEdges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          connectionType: edge.data?.connectionType || 'http',
          properties: edge.data?.properties
        }))
      };

      // Optimize the infrastructure
      const optimizedInfrastructure = await geminiService.optimizeInfrastructure(currentInfrastructure);
      
      // Convert back to nodes and edges
      const { nodes, edges } = convertInfrastructureToNodes(optimizedInfrastructure);
      
      // Generate updated code
      const code = await geminiService.generateInfrastructureCode(optimizedInfrastructure);
      
      setGeneratedNodes(nodes);
      setGeneratedEdges(edges);
      setGeneratedCode(code);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize infrastructure');
      console.error('Error optimizing infrastructure:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [geminiService, generatedNodes, generatedEdges, prompt, convertInfrastructureToNodes]);

  const clearGenerated = useCallback(() => {
    setGeneratedNodes([]);
    setGeneratedEdges([]);
    setGeneratedCode(null);
    setPrompt('');
    setError(null);
  }, []);

  // Generate infrastructure code from current canvas nodes
  const generateCodeFromCanvas = useCallback(async (nodes: Node[], edges: Edge[]) => {
    if (!geminiService) {
      setError('AI service not configured. Please set your API key.');
      return;
    }

    if (nodes.length === 0) {
      setError('No services on canvas to generate code from.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🔄 Generating infrastructure code from canvas...', { nodes, edges });

      // Convert canvas nodes to infrastructure requirement format
      const services: any[] = nodes.map(node => ({
        id: node.id,
        name: node.data.label || node.data.name || 'Unnamed Service',
        type: node.data.type || 'Microsoft.Resources/deployments',
        category: node.data.category || 'compute',
        properties: node.data.properties || {},
        position: node.position,
        dependencies: []
      }));

      const connections: ServiceConnection[] = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        connectionType: 'http', // Default connection type
        properties: edge.data || {}
      }));

      const infrastructure: InfrastructureRequirement = {
        description: `Infrastructure generated from canvas with ${services.length} services`,
        services,
        connections,
        resourceGroup: 'generated-rg',
        region: 'East US'
      };

      console.log('📋 Infrastructure requirement:', infrastructure);

      // Generate code using Gemini AI
      const code = await geminiService.generateInfrastructureCode(infrastructure);
      setGeneratedCode(code);
      
      console.log('✅ Infrastructure code generated successfully', code);
    } catch (error) {
      console.error('❌ Error generating infrastructure code from canvas:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate infrastructure code');
    } finally {
      setIsProcessing(false);
    }
  }, [geminiService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: GenAIContextType = {
    prompt,
    setPrompt,
    isProcessing,
    generatedNodes,
    generatedEdges,
    generatedCode,
    processPrompt,
    optimizeInfrastructure,
    generateCodeFromCanvas,
    clearGenerated,
    error,
    clearError,
    setApiKey,
    isApiConfigured
  };

  return (
    <GenAIContext.Provider value={contextValue}>
      {children}
    </GenAIContext.Provider>
  );
};

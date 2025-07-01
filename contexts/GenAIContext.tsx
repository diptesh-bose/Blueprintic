import { createContext, useContext, useState, ReactNode } from 'react';
import { Node, Edge } from 'reactflow';

// Define the types for our GenAI context
interface GenAIContextType {
  isProcessing: boolean;
  processPrompt: (prompt: string) => Promise<void>;
  generatedNodes: Node[];
  generatedEdges: Edge[];
  error: string | null;
}

// Create the context with default values
const GenAIContext = createContext<GenAIContextType>({
  isProcessing: false,
  processPrompt: async () => {},
  generatedNodes: [],
  generatedEdges: [],
  error: null,
});

// Define the provider props
interface GenAIProviderProps {
  children: ReactNode;
}

// Sample Azure service mappings for demonstration
const azureServiceMappings: Record<string, any> = {
  'web application': {
    type: 'azureService',
    data: {
      label: 'App Service',
      serviceType: 'compute',
      icon: '🌐',
      properties: {
        tier: 'Standard',
        size: 'S1',
        region: 'East US'
      }
    }
  },
  'sql database': {
    type: 'azureService',
    data: {
      label: 'Azure SQL',
      serviceType: 'database',
      icon: '🗄️',
      properties: {
        tier: 'Standard',
        size: 'S0',
        region: 'East US'
      }
    }
  },
  'storage': {
    type: 'azureService',
    data: {
      label: 'Storage Account',
      serviceType: 'storage',
      icon: '💾',
      properties: {
        type: 'Standard_LRS',
        accessTier: 'Hot',
        region: 'East US'
      }
    }
  },
  'authentication': {
    type: 'azureService',
    data: {
      label: 'Azure AD B2C',
      serviceType: 'security',
      icon: '🔒',
      properties: {
        tier: 'Standard',
        region: 'Global'
      }
    }
  },
  'virtual machine': {
    type: 'azureService',
    data: {
      label: 'Virtual Machine',
      serviceType: 'compute',
      icon: '🖥️',
      properties: {
        size: 'Standard_D2s_v3',
        os: 'Windows Server 2022',
        region: 'East US'
      }
    }
  },
  'kubernetes': {
    type: 'azureService',
    data: {
      label: 'AKS Cluster',
      serviceType: 'compute',
      icon: '🚢',
      properties: {
        nodeSize: 'Standard_D2s_v3',
        nodeCount: '3',
        region: 'East US'
      }
    }
  },
  'network': {
    type: 'azureService',
    data: {
      label: 'Virtual Network',
      serviceType: 'networking',
      icon: '🔌',
      properties: {
        addressSpace: '10.0.0.0/16',
        region: 'East US'
      }
    }
  }
};

// Mock function to process the prompt and generate infrastructure
const mockProcessPrompt = async (prompt: string): Promise<{nodes: Node[], edges: Edge[]}> => {
  // In a real implementation, this would call the backend API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple keyword matching for demo purposes
      const lowerPrompt = prompt.toLowerCase();
      const nodes: Node[] = [];
      const edges: Edge[] = [];
      
      // Check for keywords in the prompt
      Object.entries(azureServiceMappings).forEach(([keyword, service], index) => {
        if (lowerPrompt.includes(keyword)) {
          nodes.push({
            id: `generated_${index}`,
            type: service.type,
            position: { x: 100 + index * 250, y: 100 + (index % 2) * 200 },
            data: service.data
          });
          
          // Create edges between components if there are multiple
          if (index > 0) {
            edges.push({
              id: `e_generated_${index-1}_${index}`,
              source: `generated_${index-1}`,
              target: `generated_${index}`,
              animated: true,
              label: 'connects to'
            });
          }
        }
      });
      
      resolve({ nodes, edges });
    }, 2000); // Simulate API delay
  });
};

// Create the provider component
export const GenAIProvider = ({ children }: GenAIProviderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processPrompt = async (prompt: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the backend API
      const result = await mockProcessPrompt(prompt);
      
      setGeneratedNodes(result.nodes);
      setGeneratedEdges(result.edges);
    } catch (err) {
      setError('Failed to process prompt. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <GenAIContext.Provider
      value={{
        isProcessing,
        processPrompt,
        generatedNodes,
        generatedEdges,
        error
      }}
    >
      {children}
    </GenAIContext.Provider>
  );
};

// Create a hook to use the GenAI context
export const useGenAI = () => useContext(GenAIContext);

// @ts-nocheck
import { 
  Server, 
  Database, 
  HardDrive, 
  Globe, 
  Shield, 
  Brain, 
  Zap,
  BarChart3,
  Cloud,
  Container,
  Network,
  Key,
  Bot,
  Cpu,
  LucideIcon
} from 'lucide-react';

export interface AzureService {
  id: string;
  name: string;
  type: string;
  icon: LucideIcon;
  color: string;
  category: string;
  description: string;
  properties: Record<string, any>;
}

// Azure Service Categories and Icons
export const azureServiceCategories = {
  compute: {
    name: 'Compute',
    color: '#0078d4',
    icon: Server,
    services: [
      {
        id: 'app-service',
        name: 'App Service',
        type: 'Microsoft.Web/sites',
        icon: Server,
        color: '#0078d4',
        category: 'compute',
        description: 'Fully managed platform for building web apps and APIs',
        properties: {
          tier: 'Standard',
          size: 'S1',
          region: 'East US'
        }
      },
      {
        id: 'virtual-machine',
        name: 'Virtual Machine',
        type: 'Microsoft.Compute/virtualMachines',
        icon: Cpu,
        color: '#0078d4',
        category: 'compute',
        description: 'Scalable on-demand computing resources',
        properties: {
          size: 'Standard_B2s',
          os: 'Windows',
          region: 'East US'
        }
      },
      {
        id: 'container-apps',
        name: 'Container Apps',
        type: 'Microsoft.App/containerApps',
        icon: Container,
        color: '#0078d4',
        category: 'compute',
        description: 'Fully managed serverless container service',
        properties: {
          cpu: '0.5',
          memory: '1Gi',
          region: 'East US'
        }
      },
      {
        id: 'aks',
        name: 'AKS',
        type: 'Microsoft.ContainerService/managedClusters',
        icon: Container,
        color: '#0078d4',
        category: 'compute',
        description: 'Managed Kubernetes service',
        properties: {
          nodeCount: 3,
          nodeSize: 'Standard_DS2_v2',
          region: 'East US'
        }
      },
      {
        id: 'functions',
        name: 'Azure Functions',
        type: 'Microsoft.Web/sites',
        icon: Zap,
        color: '#0078d4',
        category: 'compute',
        description: 'Event-driven serverless compute',
        properties: {
          runtime: 'node',
          plan: 'Consumption',
          region: 'East US'
        }
      }
    ]
  },
  database: {
    name: 'Database',
    color: '#e74c3c',
    icon: Database,
    services: [
      {
        id: 'azure-sql',
        name: 'Azure SQL Database',
        type: 'Microsoft.Sql/servers/databases',
        icon: Database,
        color: '#e74c3c',
        category: 'database',
        description: 'Fully managed relational database service',
        properties: {
          tier: 'Standard',
          size: 'S2',
          region: 'East US'
        }
      },
      {
        id: 'cosmos-db',
        name: 'Cosmos DB',
        type: 'Microsoft.DocumentDB/databaseAccounts',
        icon: Database,
        color: '#e74c3c',
        category: 'database',
        description: 'Globally distributed NoSQL database',
        properties: {
          consistency: 'Session',
          multiRegion: true,
          region: 'East US'
        }
      },
      {
        id: 'postgresql',
        name: 'PostgreSQL',
        type: 'Microsoft.DBforPostgreSQL/servers',
        icon: Database,
        color: '#e74c3c',
        category: 'database',
        description: 'Managed PostgreSQL database service',
        properties: {
          tier: 'GeneralPurpose',
          size: 'GP_Gen5_2',
          region: 'East US'
        }
      },
      {
        id: 'redis-cache',
        name: 'Redis Cache',
        type: 'Microsoft.Cache/Redis',
        icon: Database,
        color: '#e74c3c',
        category: 'database',
        description: 'In-memory data structure store',
        properties: {
          tier: 'Standard',
          size: 'C1',
          region: 'East US'
        }
      }
    ]
  },
  storage: {
    name: 'Storage',
    color: '#27ae60',
    icon: HardDrive,
    services: [
      {
        id: 'storage-account',
        name: 'Storage Account',
        type: 'Microsoft.Storage/storageAccounts',
        icon: HardDrive,
        color: '#27ae60',
        category: 'storage',
        description: 'Scalable cloud storage service',
        properties: {
          type: 'Standard_LRS',
          accessTier: 'Hot',
          region: 'East US'
        }
      },
      {
        id: 'blob-storage',
        name: 'Blob Storage',
        type: 'Microsoft.Storage/storageAccounts/blobServices',
        icon: HardDrive,
        color: '#27ae60',
        category: 'storage',
        description: 'Object storage for unstructured data',
        properties: {
          type: 'Standard_LRS',
          accessTier: 'Hot',
          region: 'East US'
        }
      },
      {
        id: 'file-storage',
        name: 'File Storage',
        type: 'Microsoft.Storage/storageAccounts/fileServices',
        icon: HardDrive,
        color: '#27ae60',
        category: 'storage',
        description: 'Managed file shares for cloud and on-premises',
        properties: {
          type: 'Standard_LRS',
          quota: '100GB',
          region: 'East US'
        }
      }
    ]
  },
  networking: {
    name: 'Networking',
    color: '#9b59b6',
    icon: Network,
    services: [
      {
        id: 'virtual-network',
        name: 'Virtual Network',
        type: 'Microsoft.Network/virtualNetworks',
        icon: Network,
        color: '#9b59b6',
        category: 'networking',
        description: 'Isolated network environment in Azure',
        properties: {
          addressSpace: '10.0.0.0/16',
          subnets: ['10.0.1.0/24'],
          region: 'East US'
        }
      },
      {
        id: 'load-balancer',
        name: 'Load Balancer',
        type: 'Microsoft.Network/loadBalancers',
        icon: Network,
        color: '#9b59b6',
        category: 'networking',
        description: 'High availability and network performance',
        properties: {
          sku: 'Standard',
          type: 'Public',
          region: 'East US'
        }
      },
      {
        id: 'application-gateway',
        name: 'Application Gateway',
        type: 'Microsoft.Network/applicationGateways',
        icon: Globe,
        color: '#9b59b6',
        category: 'networking',
        description: 'Web traffic load balancer and application firewall',
        properties: {
          tier: 'Standard_v2',
          capacity: 2,
          region: 'East US'
        }
      }
    ]
  },
  security: {
    name: 'Security',
    color: '#f39c12',
    icon: Shield,
    services: [
      {
        id: 'key-vault',
        name: 'Key Vault',
        type: 'Microsoft.KeyVault/vaults',
        icon: Key,
        color: '#f39c12',
        category: 'security',
        description: 'Secure storage and management of secrets',
        properties: {
          tier: 'Standard',
          accessPolicies: [],
          region: 'East US'
        }
      },
      {
        id: 'azure-ad-b2c',
        name: 'Azure AD B2C',
        type: 'Microsoft.AzureActiveDirectory/b2cDirectories',
        icon: Shield,
        color: '#f39c12',
        category: 'security',
        description: 'Identity management for customer-facing applications',
        properties: {
          tier: 'Standard',
          region: 'Global'
        }
      }
    ]
  },
  ai: {
    name: 'AI & Machine Learning',
    color: '#8e44ad',
    icon: Brain,
    services: [
      {
        id: 'azure-openai',
        name: 'Azure OpenAI',
        type: 'Microsoft.CognitiveServices/accounts',
        icon: Brain,
        color: '#8e44ad',
        category: 'ai',
        description: 'OpenAI models as a service',
        properties: {
          kind: 'OpenAI',
          sku: 'S0',
          model: 'gpt-4',
          region: 'East US'
        }
      },
      {
        id: 'cognitive-services',
        name: 'Cognitive Services',
        type: 'Microsoft.CognitiveServices/accounts',
        icon: Brain,
        color: '#8e44ad',
        category: 'ai',
        description: 'AI services for vision, speech, language, and decision',
        properties: {
          kind: 'CognitiveServices',
          sku: 'S0',
          region: 'East US'
        }
      },
      {
        id: 'bot-service',
        name: 'Bot Service',
        type: 'Microsoft.BotService/botServices',
        icon: Bot,
        color: '#8e44ad',
        category: 'ai',
        description: 'Intelligent bot framework',
        properties: {
          tier: 'Standard',
          region: 'East US'
        }
      }
    ]
  },
  integration: {
    name: 'Integration',
    color: '#34495e',
    icon: Zap,
    services: [
      {
        id: 'event-hub',
        name: 'Event Hub',
        type: 'Microsoft.EventHub/namespaces',
        icon: Zap,
        color: '#34495e',
        category: 'integration',
        description: 'Big data streaming platform and event ingestion',
        properties: {
          tier: 'Standard',
          throughputUnits: 1,
          region: 'East US'
        }
      },
      {
        id: 'logic-apps',
        name: 'Logic Apps',
        type: 'Microsoft.Logic/workflows',
        icon: Zap,
        color: '#34495e',
        category: 'integration',
        description: 'Automate workflows and integrate apps and data',
        properties: {
          definition: {},
          region: 'East US'
        }
      },
      {
        id: 'service-bus',
        name: 'Service Bus',
        type: 'Microsoft.ServiceBus/namespaces',
        icon: Zap,
        color: '#34495e',
        category: 'integration',
        description: 'Reliable cloud messaging between applications',
        properties: {
          tier: 'Standard',
          region: 'East US'
        }
      }
    ]
  },
  analytics: {
    name: 'Analytics',
    color: '#e67e22',
    icon: BarChart3,
    services: [
      {
        id: 'synapse-analytics',
        name: 'Synapse Analytics',
        type: 'Microsoft.Synapse/workspaces',
        icon: BarChart3,
        color: '#e67e22',
        category: 'analytics',
        description: 'Limitless analytics service',
        properties: {
          sqlAdministratorLogin: 'sqladmin',
          region: 'East US'
        }
      },
      {
        id: 'data-factory',
        name: 'Data Factory',
        type: 'Microsoft.DataFactory/factories',
        icon: BarChart3,
        color: '#e67e22',
        category: 'analytics',
        description: 'Data integration service',
        properties: {
          version: 'V2',
          region: 'East US'
        }
      }
    ]
  }
};

export const getAllAzureServices = (): AzureService[] => {
  // @ts-ignore - Complex type mismatch with varying properties
  return Object.values(azureServiceCategories)
    .flatMap(category => category.services) as AzureService[];
};

export const getServiceByType = (type: string): AzureService | undefined => {
  return getAllAzureServices().find(service => service.type === type);
};

export const getServicesByCategory = (category: keyof typeof azureServiceCategories): AzureService[] => {
  return azureServiceCategories[category]?.services || [];
};

export const getServiceIcon = (serviceType: string) => {
  const service = getServiceByType(serviceType);
  return service?.icon || Cloud;
};

export const getServiceColor = (serviceType: string): string => {
  const service = getServiceByType(serviceType);
  return service?.color || '#666666';
};

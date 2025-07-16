import { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  Panel,
  ConnectionLineType,
  MarkerType,
  BackgroundVariant,
  ConnectionMode,
  NodeMouseHandler,
  getConnectedEdges,
  getIncomers,
  getOutgoers
} from 'reactflow';
import 'reactflow/dist/style.css';

import AzureServiceNode from './EnhancedAzureServiceNode';
import AzureGroupNode from './AzureGroupNode';
import CustomEdge from './CustomEdge';
import { useGenAI } from '../contexts/EnhancedGenAIContext';
import ManualUpdateButton from './ManualUpdateButton';
import { useDnD } from '../contexts/DnDContext';

// Define custom node types
const nodeTypes: NodeTypes = {
  azureService: AzureServiceNode,
  azureGroup: AzureGroupNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// Initial nodes and edges
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// ID generator for new nodes
let nodeId = 0;
const getId = () => `azure_node_${nodeId++}`;

interface AzureFlowCanvasProps {
  onNodeSelect?: (node: Node | null) => void;
  onExportGenerated?: (code: string, type: string) => void;
}

const AzureFlowCanvas = ({ onNodeSelect, onExportGenerated }: AzureFlowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [type] = useDnD();

  // Debug current state
  useEffect(() => {
    console.log('📊 Current nodes in state:', nodes.length, nodes);
  }, [nodes]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string | null; edgeId?: string } | null>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  
  // Connection mode state
  const [isManualConnectionMode, setIsManualConnectionMode] = useState(false);
  
  // GenAI context
  const { generatedNodes, generatedEdges } = useGenAI();

  // Update canvas when GenAI generates new nodes and edges
  useEffect(() => {
    console.log('🔄 GenAI update:', { 
      generatedNodesCount: generatedNodes.length, 
      generatedEdgesCount: generatedEdges.length,
      generatedNodes: generatedNodes
    });
    
    if (generatedNodes.length > 0) {
      console.log('📊 Setting nodes:', generatedNodes);
      setNodes(generatedNodes);
      
      // Force fit view after setting nodes
      setTimeout(() => {
        if (reactFlowInstance) {
          console.log('🔍 Fitting view to show nodes');
          reactFlowInstance.fitView({ padding: 0.2 });
        }
      }, 100);
    }
    if (generatedEdges.length > 0) {
      console.log('📊 Setting edges:', generatedEdges);
      setEdges(generatedEdges);
    }
  }, [generatedNodes, generatedEdges, setNodes, setEdges, reactFlowInstance]);

  // Handle node reparenting when dropped on groups
  useEffect(() => {
    const handleNodeDroppedOnGroup = (event: CustomEvent) => {
      const { groupId, dropEvent } = event.detail;
      console.log('🎯 Node dropped on group:', groupId);
      
      // Get the dragged service data
      let serviceDataStr = '';
      if (dropEvent.dataTransfer.types.includes('application/azure-service')) {
        serviceDataStr = dropEvent.dataTransfer.getData('application/azure-service');
      } else if (dropEvent.dataTransfer.types.includes('application/json')) {
        serviceDataStr = dropEvent.dataTransfer.getData('application/json');
      }
      
      if (!serviceDataStr) {
        console.log('❌ No service data in drop event');
        return;
      }
      
      try {
        const serviceData = JSON.parse(serviceDataStr);
        console.log('✅ Parsed service data for grouping:', serviceData);
        
        // Get the group node position
        const groupNode = nodes.find(node => node.id === groupId);
        if (!groupNode) {
          console.log('❌ Group node not found');
          return;
        }
        
        // Calculate position relative to group (with some offset)
        const relativePosition = {
          x: 20 + Math.random() * 200, // Some randomness to avoid overlap
          y: 60 + Math.random() * 100
        };
        
        // Create new child node
        const newChildNode = {
          id: getId(),
          type: 'azureService',
          position: relativePosition,
          parentId: groupId, // This makes it a child of the group
          extent: 'parent' as const, // Keeps it within the parent bounds
          data: {
            label: serviceData.name,
            name: serviceData.name,
            category: serviceData.category,
            description: serviceData.description,
            color: serviceData.color,
            icon: serviceData.icon,
            properties: serviceData.properties,
            type: serviceData.type
          },
          style: {
            width: 160,
            height: 100
          }
        };
        
        console.log('🎯 Creating child node:', newChildNode);
        setNodes((nds) => [...nds, newChildNode]);
        
      } catch (error) {
        console.error('❌ Failed to parse service data:', error);
      }
    };
    
    // Add event listener
    window.addEventListener('nodeDroppedOnGroup', handleNodeDroppedOnGroup as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('nodeDroppedOnGroup', handleNodeDroppedOnGroup as EventListener);
    };
  }, [nodes, setNodes]);

  // Handle node data updates (like name changes)
  useEffect(() => {
    const handleNodeDataUpdate = (event: CustomEvent) => {
      const { nodeId, data } = event.detail;
      console.log('📝 Updating node data:', nodeId, data);
      
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data } : node
        )
      );
    };
    
    // Add event listener
    window.addEventListener('updateNodeData', handleNodeDataUpdate as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('updateNodeData', handleNodeDataUpdate as EventListener);
    };
  }, [setNodes]);

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      // Create a custom edge with animated and styled path
      const edge = {
        ...params,
        type: 'custom',
        animated: true,
        style: { strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();
      setSelectedNode(node);
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    },
    [onNodeSelect]
  );

  // Handle node right-click for context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

  // Handle canvas click to close context menu
  const onPaneClick = useCallback(() => {
    setContextMenu(null);
    setSelectedNode(null);
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  // Handle drag over for new node creation
  const onDragOver = useCallback((event: React.DragEvent) => {
    console.log('🎯 DRAG OVER - Event:', event);
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    console.log('✅ DRAG OVER - preventDefault called, dropEffect set to move');
  }, []);

  // Handle drag enter
  const onDragEnter = useCallback((event: React.DragEvent) => {
    console.log('🔵 DRAG ENTER - Event:', event);
    event.preventDefault();
    setIsDraggedOver(true);
  }, []);

  // Handle drag leave  
  const onDragLeave = useCallback((event: React.DragEvent) => {
    console.log('🔴 DRAG LEAVE - Event:', event);
    // Only set to false if leaving the canvas entirely
    if (!event.currentTarget.contains(event.relatedTarget as Element)) {
      setIsDraggedOver(false);
    }
  }, []);

  // Handle drop for new node creation - using official React Flow pattern
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      console.log('📍 CANVAS DROP EVENT TRIGGERED');
      console.log('📍 CANVAS DROP - Event target:', event.target);
      console.log('📍 CANVAS DROP - Current target:', event.currentTarget);
      console.log('📍 CANVAS DROP - DataTransfer:', event.dataTransfer);
      
      event.preventDefault();
      setIsDraggedOver(false); // Reset drag state
      console.log('✅ CANVAS DROP - preventDefault called');

      // Check if the dropped element is valid using DnD context
      console.log('🔍 CANVAS DROP - Type from context:', type);
      if (!type) {
        console.log('❌ CANVAS DROP - No type set in DnD context');
        return;
      }

      // Try to get data from multiple data types as per MDN
      console.log('📦 CANVAS DROP - Available data types:', event.dataTransfer.types);
      
      let dataStr = '';
      let dataType = '';
      
      // Check for group data first
      if (event.dataTransfer.types.includes('application/azure-group')) {
        dataStr = event.dataTransfer.getData('application/azure-group');
        dataType = 'group';
        console.log('📦 DROP - Got group data:', dataStr);
      } else if (event.dataTransfer.types.includes('application/azure-service')) {
        dataStr = event.dataTransfer.getData('application/azure-service');
        dataType = 'service';
        console.log('📦 DROP - Got service data:', dataStr);
      } else if (event.dataTransfer.types.includes('application/json')) {
        dataStr = event.dataTransfer.getData('application/json');
        dataType = type === 'azureGroup' ? 'group' : 'service';
        console.log('📦 DROP - Got JSON data:', dataStr);
      } else {
        console.log('❌ DROP - No valid data type found in:', event.dataTransfer.types);
        return;
      }

      if (!dataStr) {
        console.log('❌ DROP - No data string');
        return;
      }

      let data;
      try {
        data = JSON.parse(dataStr);
        console.log('✅ DROP - Parsed data:', data);
      } catch (error) {
        console.error('❌ DROP - Failed to parse data:', error);
        return;
      }

      // Get the bounding rectangle of the React Flow canvas
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      console.log('📍 DROP - ReactFlow bounds:', reactFlowBounds);
      console.log('📍 DROP - Client coordinates:', { x: event.clientX, y: event.clientY });
      
      if (!reactFlowBounds) {
        console.log('❌ DROP - Could not get ReactFlow bounds');
        return;
      }

      // Calculate position relative to the React Flow canvas with proper viewport transformation
      let position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      // Use React Flow's project function for proper coordinate transformation if available
      if (reactFlowInstance && reactFlowInstance.project) {
        position = reactFlowInstance.project(position);
      }

      console.log('📍 DROP - Calculated position:', position);

      // Find parent group if dropping on one
      const intersectingNodes = reactFlowInstance?.getIntersectingNodes({
        x: position.x,
        y: position.y,
        width: 1,
        height: 1,
      });
      
      const parentNode = intersectingNodes?.find((node: any) => node.type === 'azureGroup');

      // Create a new node based on type
      const newNode = dataType === 'group' ? {
        id: getId(),
        type: 'azureGroup', // Use our custom AzureGroupNode component
        position,
        data: {
          label: data.name,
          name: data.name,
          groupType: data.groupType || 'resource-group' as const,
          description: data.description,
          color: data.color
        },
        style: {
          width: 400,
          height: 300,
        }
      } : {
        id: getId(),
        type: 'azureService',
        position: parentNode ? {
          x: position.x - parentNode.position.x,
          y: position.y - parentNode.position.y,
        } : position,
        data: { 
          label: data.name,
          name: data.name,
          category: data.category,
          description: data.description,
          color: data.color,
          icon: data.icon,
          properties: data.properties,
          type: data.type
        },
        ...(parentNode && {
          parentId: parentNode.id,
          extent: 'parent' as const,
        }),
      };

      console.log('✅ DROP - Creating new node:', newNode);
      setNodes((nds) => {
        const newNodes = nds.concat(newNode);
        console.log('📊 DROP - Updated nodes array:', newNodes.length, 'total nodes');
        console.log('📊 DROP - All nodes:', newNodes);
        return newNodes;
      });
    },
    [type, setNodes]
  );

  const toggleManualConnectionMode = useCallback(() => {
    setIsManualConnectionMode(!isManualConnectionMode);
  }, [isManualConnectionMode]);

  // Delete node and handle connected edges
  const deleteNode = useCallback(
    (nodeId: string) => {
      // Find the node to delete
      const nodeToDelete = nodes.find(node => node.id === nodeId);
      
      if (!nodeToDelete) return;
      
      // Get connected edges, incomers, and outgoers
      const connectedEdges = getConnectedEdges([nodeToDelete], edges);
      const incomers = getIncomers(nodeToDelete, nodes, edges);
      const outgoers = getOutgoers(nodeToDelete, nodes, edges);
      
      // Remove the node
      setNodes(nodes.filter(node => node.id !== nodeId));
      
      // Remove connected edges
      const remainingEdges = edges.filter(edge => !connectedEdges.includes(edge));
      
      // Create new edges between incomers and outgoers
      const newEdges = incomers.flatMap(({ id: source }) =>
        outgoers.map(({ id: target }) => ({
          id: `edge_${source}_${target}`,
          source,
          target,
          type: 'custom',
          animated: true,
          style: { strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        }))
      );
      
      // Update edges
      setEdges([...remainingEdges, ...newEdges]);
      
      // Close context menu
      setContextMenu(null);
    },
    [nodes, edges, setNodes, setEdges]
  );

  // Delete edge
  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges(edges.filter(edge => edge.id !== edgeId));
    },
    [edges, setEdges]
  );

  // Handle edge right-click for context menu
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: null,
        edgeId: edge.id,
      });
    },
    []
  );

  // Generate infrastructure code based on nodes and edges
  useEffect(() => {
    if (nodes.length > 0 && onExportGenerated) {
      // Generate ARM template
      const armTemplate = generateARMTemplate(nodes);
      onExportGenerated(armTemplate, 'arm');

      // Generate Terraform template
      const terraformTemplate = generateTerraformTemplate(nodes);
      onExportGenerated(terraformTemplate, 'terraform');

      // Generate Bicep template
      const bicepTemplate = generateBicepTemplate(nodes);
      onExportGenerated(bicepTemplate, 'bicep');
    }
  }, [nodes, onExportGenerated]);

  // Generate ARM template
  const generateARMTemplate = (nodes: Node[]) => {
    // Implementation for ARM template generation
    const resources = nodes.map(node => {
      const { data } = node;
      
      // Create resource based on node type
      switch(data.type) {
        case 'compute':
          return {
            type: "Microsoft.Web/sites",
            name: `${data.label.replace(/\s+/g, '')}${node.id.split('_')[1]}`,
            apiVersion: "2021-02-01",
            location: data.properties?.region || "East US",
            properties: {
              siteConfig: {
                appSettings: []
              },
              serverFarmId: `[resourceId('Microsoft.Web/serverfarms', 'appServicePlan${node.id.split('_')[1]}')]`
            }
          };
        case 'database':
          return {
            type: "Microsoft.Sql/servers",
            name: `${data.label.replace(/\s+/g, '')}${node.id.split('_')[1]}`,
            apiVersion: "2021-02-01-preview",
            location: data.properties?.region || "East US",
            properties: {
              administratorLogin: "adminuser",
              administratorLoginPassword: "P@ssw0rd1234"
            }
          };
        case 'storage':
          return {
            type: "Microsoft.Storage/storageAccounts",
            name: `storage${node.id.split('_')[1]}`,
            apiVersion: "2021-04-01",
            location: data.properties?.region || "East US",
            sku: {
              name: data.properties?.type || "Standard_LRS"
            },
            kind: "StorageV2",
            properties: {
              accessTier: data.properties?.accessTier || "Hot",
              supportsHttpsTrafficOnly: true
            }
          };
        case 'ai':
          if (data.label === 'Azure OpenAI') {
            return {
              type: "Microsoft.CognitiveServices/accounts",
              name: `openai${node.id.split('_')[1]}`,
              apiVersion: "2023-05-01",
              location: data.properties?.region || "East US",
              sku: {
                name: "S0"
              },
              kind: "OpenAI",
              properties: {
                customSubDomainName: `openai${node.id.split('_')[1]}`,
                networkAcls: {
                  defaultAction: "Allow"
                }
              }
            };
          }
          return {
            type: "Microsoft.CognitiveServices/accounts",
            name: `${data.label.replace(/\s+/g, '')}${node.id.split('_')[1]}`,
            apiVersion: "2023-05-01",
            location: data.properties?.region || "East US",
            sku: {
              name: "S0"
            },
            kind: "CognitiveServices",
            properties: {}
          };
        default:
          return {
            type: `Microsoft.Resources/deployments`,
            name: `${data.label.replace(/\s+/g, '')}${node.id.split('_')[1]}`,
            apiVersion: "2021-04-01",
            properties: {
              mode: "Incremental",
              template: {
                $schema: "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
                contentVersion: "1.0.0.0",
                resources: []
              }
            }
          };
      }
    });

    const armTemplate = {
      $schema: "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      contentVersion: "1.0.0.0",
      parameters: {},
      variables: {},
      resources: resources,
      outputs: {}
    };

    return JSON.stringify(armTemplate, null, 2);
  };

  // Generate Terraform template
  const generateTerraformTemplate = (nodes: Node[]) => {
    let terraform = `# Terraform configuration for Azure infrastructure
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "example-resources"
  location = "East US"
}

`;

    nodes.forEach(node => {
      const { data } = node;
      
      switch(data.type) {
        case 'compute':
          terraform += `
resource "azurerm_app_service_plan" "plan${node.id.split('_')[1]}" {
  name                = "appserviceplan-${node.id.split('_')[1]}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku {
    tier = "${data.properties?.tier || 'Standard'}"
    size = "${data.properties?.size || 'S1'}"
  }
}

resource "azurerm_app_service" "webapp${node.id.split('_')[1]}" {
  name                = "webapp-${node.id.split('_')[1]}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  app_service_plan_id = azurerm_app_service_plan.plan${node.id.split('_')[1]}.id
}
`;
          break;
        case 'database':
          terraform += `
resource "azurerm_sql_server" "sqlserver${node.id.split('_')[1]}" {
  name                         = "sqlserver-${node.id.split('_')[1]}"
  location                     = azurerm_resource_group.rg.location
  resource_group_name          = azurerm_resource_group.rg.name
  version                      = "12.0"
  administrator_login          = "adminuser"
  administrator_login_password = "P@ssw0rd1234"
}

resource "azurerm_sql_database" "db${node.id.split('_')[1]}" {
  name                = "database-${node.id.split('_')[1]}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  server_name         = azurerm_sql_server.sqlserver${node.id.split('_')[1]}.name
  edition             = "${data.properties?.tier || 'Standard'}"
  requested_service_objective_name = "${data.properties?.size || 'S0'}"
}
`;
          break;
        case 'storage':
          terraform += `
resource "azurerm_storage_account" "storage${node.id.split('_')[1]}" {
  name                     = "storage${node.id.split('_')[1]}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "${(data.properties?.type || 'Standard_LRS').replace('Standard_', '')}"
  access_tier              = "${data.properties?.accessTier || 'Hot'}"
}
`;
          break;
        case 'ai':
          if (data.label === 'Azure OpenAI') {
            terraform += `
resource "azurerm_cognitive_account" "openai${node.id.split('_')[1]}" {
  name                = "openai-${node.id.split('_')[1]}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "OpenAI"
  sku_name            = "S0"
  custom_subdomain_name = "openai-${node.id.split('_')[1]}"
}

resource "azurerm_cognitive_deployment" "deployment${node.id.split('_')[1]}" {
  name                 = "deployment-${node.id.split('_')[1]}"
  cognitive_account_id = azurerm_cognitive_account.openai${node.id.split('_')[1]}.id
  model {
    format  = "OpenAI"
    name    = "${data.properties?.model || 'gpt-4'}"
    version = "1"
  }
  scale {
    type     = "Standard"
    capacity = ${data.properties?.capacity || 1}
  }
}
`;
          } else {
            terraform += `
resource "azurerm_cognitive_account" "cognitive${node.id.split('_')[1]}" {
  name                = "${data.label.toLowerCase().replace(/\\s+/g, '')}-${node.id.split('_')[1]}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "CognitiveServices"
  sku_name            = "S0"
}
`;
          }
          break;
        default:
          terraform += `
# Resource for ${data.label} (${node.id})
# This is a placeholder for the actual Terraform configuration
resource "azurerm_resource_group_template_deployment" "${data.label.toLowerCase().replace(/\s+/g, '')}${node.id.split('_')[1]}" {
  name                = "${data.label.replace(/\s+/g, '')}-${node.id.split('_')[1]}"
  resource_group_name = azurerm_resource_group.rg.name
  deployment_mode     = "Incremental"
  template_content    = <<TEMPLATE
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "resources": []
}
TEMPLATE
}
`;
      }
    });

    return terraform;
  };

  // Generate Bicep template
  const generateBicepTemplate = (nodes: Node[]) => {
    let bicep = `// Bicep template for Azure infrastructure

param location string = 'eastus'

`;

    nodes.forEach(node => {
      const { data } = node;
      
      switch(data.type) {
        case 'compute':
          bicep += `
resource appServicePlan${node.id.split('_')[1]} 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: 'appServicePlan-${node.id.split('_')[1]}'
  location: location
  sku: {
    name: '${data.properties?.size || 'S1'}'
    tier: '${data.properties?.tier || 'Standard'}'
  }
}

resource appService${node.id.split('_')[1]} 'Microsoft.Web/sites@2021-02-01' = {
  name: 'appService-${node.id.split('_')[1]}'
  location: location
  properties: {
    serverFarmId: appServicePlan${node.id.split('_')[1]}.id
    siteConfig: {
      appSettings: []
    }
  }
}
`;
          break;
        case 'database':
          bicep += `
resource sqlServer${node.id.split('_')[1]} 'Microsoft.Sql/servers@2021-02-01-preview' = {
  name: 'sqlserver-${node.id.split('_')[1]}'
  location: location
  properties: {
    administratorLogin: 'adminuser'
    administratorLoginPassword: 'P@ssw0rd1234'
  }
}

resource sqlDatabase${node.id.split('_')[1]} 'Microsoft.Sql/servers/databases@2021-02-01-preview' = {
  parent: sqlServer${node.id.split('_')[1]}
  name: 'database-${node.id.split('_')[1]}'
  location: location
  sku: {
    name: '${data.properties?.size || 'S0'}'
    tier: '${data.properties?.tier || 'Standard'}'
  }
}
`;
          break;
        case 'storage':
          bicep += `
resource storageAccount${node.id.split('_')[1]} 'Microsoft.Storage/storageAccounts@2021-04-01' = {
  name: 'storage${node.id.split('_')[1]}'
  location: location
  sku: {
    name: '${data.properties?.type || 'Standard_LRS'}'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: '${data.properties?.accessTier || 'Hot'}'
    supportsHttpsTrafficOnly: true
  }
}
`;
          break;
        case 'ai':
          if (data.label === 'Azure OpenAI') {
            bicep += `
resource openAI${node.id.split('_')[1]} 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: 'openai-${node.id.split('_')[1]}'
  location: location
  sku: {
    name: 'S0'
  }
  kind: 'OpenAI'
  properties: {
    customSubDomainName: 'openai-${node.id.split('_')[1]}'
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}

resource openAIDeployment${node.id.split('_')[1]} 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAI${node.id.split('_')[1]}
  name: 'deployment-${node.id.split('_')[1]}'
  properties: {
    model: {
      format: 'OpenAI'
      name: '${data.properties?.model || 'gpt-4'}'
      version: '1'
    }
  }
  sku: {
    name: 'Standard'
    capacity: ${data.properties?.capacity || 1}
  }
}
`;
          } else {
            bicep += `
resource cognitive${node.id.split('_')[1]} 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: '${data.label.toLowerCase().replace(/\\s+/g, '')}-${node.id.split('_')[1]}'
  location: location
  sku: {
    name: 'S0'
  }
  kind: 'CognitiveServices'
  properties: {}
}
`;
          }
          break;
        default:
          bicep += `
// Resource for ${data.label} (${node.id})
// This is a placeholder for the actual Bicep configuration
resource ${data.label.toLowerCase().replace(/\s+/g, '')}${node.id.split('_')[1]} 'Microsoft.Resources/deployments@2021-04-01' = {
  name: '${data.label.replace(/\s+/g, '')}-${node.id.split('_')[1]}'
  properties: {
    mode: 'Incremental'
    template: {
      '$schema': 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#'
      contentVersion: '1.0.0.0'
      resources: []
    }
  }
}
`;
      }
    });

    return bicep;
  };

  return (
    <div 
      className={`w-full h-full relative ${isDraggedOver ? 'bg-blue-50' : ''}`}
      ref={reactFlowWrapper}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
      {/* Core functionality buttons only */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        {/* Manual Infrastructure Code Update Button */}
        <ManualUpdateButton nodes={nodes} edges={edges} />
      </div>

      {isDraggedOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-dashed border-blue-300 z-50 flex items-center justify-center">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Drop Azure service here
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: 'custom',
          animated: true,
          style: { strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        }}
        connectionMode={isManualConnectionMode ? ConnectionMode.Loose : ConnectionMode.Strict}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        className="react-flow-container"
      >
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        
        {/* Connection mode toggle panel */}
        <Panel position="top-left">
          <div className="bg-white p-2 rounded shadow-md flex flex-col gap-2">
            <button 
              className={`px-3 py-1 rounded text-sm ${isManualConnectionMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={toggleManualConnectionMode}
            >
              {isManualConnectionMode ? 'Manual Connection: ON' : 'Manual Connection: OFF'}
            </button>
            <button 
              className="px-3 py-1 rounded text-sm bg-green-500 text-white hover:bg-green-600"
              onClick={() => {
                const testNode = {
                  id: 'test-' + Date.now(),
                  type: 'azureService',
                  position: { x: 200, y: 200 },
                  data: {
                    label: 'Test Node',
                    category: 'compute',
                    description: 'Test node for debugging',
                    color: '#0078d4'
                  }
                };
                console.log('🧪 Adding test node:', testNode);
                setNodes(prev => [...prev, testNode]);
              }}
            >
              Add Test Node
            </button>
            <div className="text-xs text-gray-500">
              {isManualConnectionMode 
                ? 'Drag between any points to connect nodes' 
                : 'Drag from handles to connect nodes'}
            </div>
          </div>
        </Panel>
        
        {/* Instructions panel */}
        <Panel position="top-right">
          <div className="bg-white p-2 rounded shadow-md">
            <p className="text-sm text-gray-500">Drag components from sidebar to canvas</p>
            <p className="text-sm text-gray-500">Connect nodes by dragging from handles</p>
            <p className="text-sm text-gray-500">Right-click nodes or edges to edit/delete</p>
          </div>
        </Panel>
      </ReactFlow>
      
      {/* Context menu for nodes and edges */}
      {contextMenu && (
        <div 
          className="absolute bg-white rounded shadow-lg z-50 p-2"
          style={{ 
            left: contextMenu.x, 
            top: contextMenu.y,
            minWidth: '150px'
          }}
        >
          {contextMenu.nodeId && (
            <>
              <button 
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  // Open edit modal or panel
                  // For now, we'll just log
                  console.log('Edit node', contextMenu.nodeId);
                  setContextMenu(null);
                }}
              >
                Edit Node
              </button>
              <button 
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-red-500"
                onClick={() => deleteNode(contextMenu.nodeId!)}
              >
                Delete Node
              </button>
            </>
          )}
          {contextMenu.edgeId && (
            <>
              <button 
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-red-500"
                onClick={() => {
                  deleteEdge(contextMenu.edgeId!);
                  setContextMenu(null);
                }}
              >
                Delete Connection
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AzureFlowCanvas;

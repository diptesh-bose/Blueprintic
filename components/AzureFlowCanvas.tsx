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

import AzureServiceNode from './AzureServiceNode';
import CustomEdge from './CustomEdge';
import { useGenAI } from '../contexts/GenAIContext';

// Define custom node types
const nodeTypes: NodeTypes = {
  azureService: AzureServiceNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// Initial nodes and edges
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface AzureFlowCanvasProps {
  onNodeSelect?: (node: Node | null) => void;
  onExportGenerated?: (code: string, type: string) => void;
}

const AzureFlowCanvas = ({ onNodeSelect, onExportGenerated }: AzureFlowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string | null } | null>(null);
  
  // Connection mode state
  const [isManualConnectionMode, setIsManualConnectionMode] = useState(false);
  
  // GenAI context
  const { generatedNodes, generatedEdges } = useGenAI();

  // Update canvas when GenAI generates new nodes and edges
  useEffect(() => {
    if (generatedNodes.length > 0) {
      setNodes(generatedNodes);
    }
    if (generatedEdges.length > 0) {
      setEdges(generatedEdges);
    }
  }, [generatedNodes, generatedEdges, setNodes, setEdges]);

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
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop for new node creation
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow/type');
      const nodeData = JSON.parse(event.dataTransfer.getData('application/reactflow/data'));

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create a new node
      const newNode = {
        id: `node_${Date.now()}`,
        type: 'azureService',
        position,
        data: { 
          ...nodeData,
          label: nodeData.label || 'New Node',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Toggle manual connection mode
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

  // Edit node properties
  const editNode = useCallback(
    (nodeId: string, newData: any) => {
      setNodes(nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData
            }
          };
        }
        return node;
      }));
    },
    [nodes, setNodes]
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
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
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

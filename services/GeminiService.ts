import { GoogleGenerativeAI } from '@google/generative-ai';

export interface InfrastructureRequirement {
  description: string;
  groups?: AzureGroup[];
  services: AzureService[];
  connections: ServiceConnection[];
  resourceGroup?: string;
  region?: string;
}

export interface AzureGroup {
  id: string;
  name: string;
  type: 'azureGroup';
  groupType: 'resource-group' | 'virtual-network' | 'availability-set' | 'app-service-plan';
  category: 'grouping';
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, any>;
}

export interface AzureService {
  id: string;
  name: string;
  type: string;
  category: 'compute' | 'database' | 'storage' | 'networking' | 'security' | 'ai' | 'integration' | 'analytics';
  parentId?: string;
  extent?: 'parent';
  properties: Record<string, any>;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  dependencies?: string[];
}

export interface ServiceConnection {
  id: string;
  source: string;
  target: string;
  connectionType: 'http' | 'tcp' | 'storage' | 'database' | 'messaging';
  properties?: Record<string, any>;
}

export interface InfrastructureCode {
  armTemplate: string;
  terraformCode: string;
  yamlConfig: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Google Gemini API key is required');
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use the latest stable model with better configuration
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error);
      throw new Error('Failed to initialize Google Gemini API. Please check your API key.');
    }
  }

  async parseNaturalLanguageToInfrastructure(description: string): Promise<InfrastructureRequirement> {
    if (!this.model) {
      throw new Error('Gemini model not initialized');
    }

    const prompt = `
    You are an Azure infrastructure architect AI. Parse the following natural language description and convert it to a structured Azure infrastructure design with intelligent grouping and containerization.

    Description: "${description}"

    IMPORTANT INSTRUCTIONS FOR CONTAINERS AND GROUPING:
    1. When resource groups, containers, or grouping is mentioned, create azureGroup nodes to represent them
    2. Place related services inside appropriate containers by setting parentId and extent properties
    3. Recognize grouping patterns: "resource group with X and Y", "container with services", "group containing", etc.
    4. Default containers: Create logical groupings even if not explicitly mentioned (e.g., web tier, data tier)
    5. Container types: "resource-group", "virtual-network", "availability-set", "app-service-plan"

    Please analyze this and return a JSON response with the following structure:
    {
      "description": "cleaned up description",
      "groups": [
        {
          "id": "unique_group_id",
          "name": "Group Name",
          "type": "azureGroup",
          "groupType": "resource-group|virtual-network|availability-set|app-service-plan",
          "category": "grouping",
          "position": { "x": 100, "y": 100 },
          "size": { "width": 400, "height": 300 },
          "properties": {
            "description": "Container description",
            "region": "East US"
          }
        }
      ],
      "services": [
        {
          "id": "unique_id",
          "name": "Service Name",
          "type": "Azure.Service.Type",
          "category": "compute|database|storage|networking|security|ai|integration|analytics",
          "parentId": "group_id_if_belongs_to_container",
          "extent": "parent",
          "properties": {
            "tier": "Standard|Premium|Basic",
            "size": "S1|M1|L1",
            "region": "East US"
          },
          "position": { "x": 50, "y": 80 },
          "size": { "width": 160, "height": 100 }
        }
      ],
      "connections": [
        {
          "id": "connection_id",
          "source": "source_service_id",
          "target": "target_service_id",
          "connectionType": "http|tcp|storage|database|messaging"
        }
      ],
      "resourceGroup": "rg-project-name",
      "region": "East US"
    }

    GROUPING EXAMPLES:
    - "resource group with 2 VMs and SQL" → Create resource-group container with VMs and SQL inside
    - "web tier and database tier" → Create separate containers for each tier
    - "VNet with subnets" → Create virtual-network container with services inside
    - "availability set with VMs" → Create availability-set container with VMs inside

    POSITIONING RULES:
    - Containers: Position logically with adequate spacing (400px apart)
    - Services in containers: Position relative to container (x: 20-200, y: 60-200)
    - Services outside containers: Position with 250px spacing
    - Ensure no overlapping and logical flow

    Common Azure services to consider:
    - Compute: App Service, Virtual Machines, AKS, Container Apps, Functions
    - Database: Azure SQL, Cosmos DB, PostgreSQL, MySQL, Redis Cache
    - Storage: Storage Account, Blob Storage, File Storage
    - Networking: Virtual Network, Load Balancer, Application Gateway
    - Security: Key Vault, Azure AD B2C
    - AI/ML: Azure OpenAI, Cognitive Services
    - Containers: Resource Groups, Virtual Networks, Availability Sets, App Service Plans

    Return only valid JSON with proper grouping and parent-child relationships.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini API Response:', text);
      
      // Clean up the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No valid JSON found in response:', text);
        throw new Error('Invalid response format from Gemini API');
      }

      const infrastructureData = JSON.parse(jsonMatch[0]);
      console.log('Parsed Infrastructure:', infrastructureData);
      
      return infrastructureData;
    } catch (error) {
      console.error('Error parsing natural language:', error);
      
      // Handle specific API errors
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('API model not found. Please check your Gemini API key and try again.');
        } else if (error.message.includes('403')) {
          throw new Error('API access denied. Please verify your Gemini API key has the correct permissions.');
        } else if (error.message.includes('429')) {
          throw new Error('API rate limit exceeded. Please wait a moment and try again.');
        } else if (error.message.includes('Invalid response format')) {
          throw new Error('Unable to parse AI response. Please try rephrasing your request.');
        }
        throw new Error(`Failed to parse infrastructure requirements: ${error.message}`);
      }
      throw new Error('Failed to parse infrastructure requirements');
    }
  }

  async generateInfrastructureCode(infrastructure: InfrastructureRequirement): Promise<InfrastructureCode> {
    if (!this.model) {
      throw new Error('Gemini model not initialized');
    }

    try {
      // Prepare infrastructure data including groups for code generation
      const infrastructureData = {
        groups: infrastructure.groups || [],
        services: infrastructure.services,
        connections: infrastructure.connections,
        resourceGroup: infrastructure.resourceGroup,
        region: infrastructure.region
      };

      // Generate ARM template
      const armPrompt = `Generate a complete ARM template for Azure infrastructure including resource groups and services. 
      
      Infrastructure: ${JSON.stringify(infrastructureData, null, 2)}
      
      Include:
      - Resource groups as containers
      - Proper dependencies between resources
      - Parameters for environment-specific values
      - Outputs for key resource IDs
      
      Return only the JSON template.`;
      const armResult = await this.model.generateContent(armPrompt);
      const armResponse = await armResult.response;
      
      // Generate Terraform code
      const terraformPrompt = `Generate Terraform HCL code for Azure infrastructure including resource groups and services.
      
      Infrastructure: ${JSON.stringify(infrastructureData, null, 2)}
      
      Include:
      - Resource group definitions
      - Service resources with proper dependencies
      - Variables for configuration
      - Outputs for important resource information
      
      Return only the HCL code.`;
      const terraformResult = await this.model.generateContent(terraformPrompt);
      const terraformResponse = await terraformResult.response;
      
      // Generate YAML pipeline
      const yamlPrompt = `Generate Azure DevOps YAML pipeline for deploying Azure infrastructure with resource groups.
      
      Infrastructure: ${JSON.stringify(infrastructureData, null, 2)}
      
      Include:
      - Resource group creation
      - Service deployment steps
      - Proper stage dependencies
      - Environment variables
      
      Return only the YAML.`;
      const yamlResult = await this.model.generateContent(yamlPrompt);
      const yamlResponse = await yamlResult.response;

      return {
        armTemplate: this.cleanCodeResponse(armResponse.text()),
        terraformCode: this.cleanCodeResponse(terraformResponse.text()),
        yamlConfig: this.cleanCodeResponse(yamlResponse.text())
      };
    } catch (error) {
      console.error('Error generating infrastructure code:', error);
      throw new Error('Failed to generate infrastructure code');
    }
  }

  private cleanCodeResponse(response: string): string {
    // Remove markdown code blocks and clean up the response
    return response
      .replace(/```json\n?/g, '')
      .replace(/```terraform\n?/g, '')
      .replace(/```yaml\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
  }

  async optimizeInfrastructure(infrastructure: InfrastructureRequirement): Promise<InfrastructureRequirement> {
    if (!this.model) {
      throw new Error('Gemini model not initialized');
    }

    const prompt = `
    Optimize this Azure infrastructure for cost, performance, and security:
    ${JSON.stringify(infrastructure, null, 2)}

    Return the optimized infrastructure in the same JSON format with improvements.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid optimization response format');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error optimizing infrastructure:', error);
      throw new Error('Failed to optimize infrastructure');
    }
  }
}

export default GeminiService;

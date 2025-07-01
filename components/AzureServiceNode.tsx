import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface AzureServiceNodeProps {
  label: string;
  serviceType: string;
  icon: string;
  properties: Record<string, string>;
}

const AzureServiceNode = ({ data, isConnectable }: NodeProps<AzureServiceNodeProps>) => {
  const { label, serviceType, icon, properties } = data;
  
  // Define color based on service type
  const getServiceColor = (type: string) => {
    switch (type) {
      case 'compute':
        return '#0078D4'; // Azure blue
      case 'storage':
        return '#FFB900'; // Yellow
      case 'networking':
        return '#00BCF2'; // Light blue
      case 'database':
        return '#7FBA00'; // Green
      case 'security':
        return '#F25022'; // Red
      default:
        return '#5C2D91'; // Purple
    }
  };

  return (
    <div
      style={{
        padding: '10px',
        borderRadius: '5px',
        border: `2px solid ${getServiceColor(serviceType)}`,
        backgroundColor: 'white',
        width: '200px',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '24px', marginRight: '10px' }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 'bold' }}>{label}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{serviceType}</div>
        </div>
      </div>
      
      <div style={{ fontSize: '12px', marginTop: '5px' }}>
        {Object.entries(properties).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ color: '#666' }}>{key}:</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(AzureServiceNode);

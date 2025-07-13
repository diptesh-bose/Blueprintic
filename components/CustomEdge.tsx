import { getBezierPath, EdgeProps, BaseEdge } from 'reactflow';

// Define the CustomEdge component
const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  label
}: EdgeProps) => {
  // Calculate the path for the edge
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine edge type color based on relationship type
  const getEdgeColor = () => {
    if (!data?.type) return '#2563eb'; // Default blue
    
    switch (data.type) {
      case 'connects':
        return '#2563eb'; // Blue
      case 'depends':
        return '#9333ea'; // Purple
      case 'stores':
        return '#16a34a'; // Green
      case 'reads':
        return '#ca8a04'; // Yellow
      case 'sends':
        return '#dc2626'; // Red
      case 'receives':
        return '#0891b2'; // Cyan
      case 'authenticates':
        return '#c026d3'; // Fuchsia
      case 'deployed':
        return '#f97316'; // Orange
      case 'manages':
        return '#4f46e5'; // Indigo
      case 'monitors':
        return '#0d9488'; // Teal
      default:
        return '#2563eb'; // Default blue
    }
  };

  const edgeColor = getEdgeColor();
  
  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: 2,
          strokeDasharray: data?.type ? 'none' : '5,5',
          // animation: style?.animated ? 'flow 30s infinite linear' : 'none',
        }}
      />
      
      {/* Edge label */}
      {label && (
        <foreignObject
          width={100}
          height={40}
          x={labelX - 50}
          y={labelY - 20}
          className="overflow-visible"
        >
          <div className="flex items-center justify-center">
            <div 
              className="bg-white px-2 py-1 rounded-full text-xs shadow-sm border border-gray-200"
              style={{ color: edgeColor }}
            >
              {label}
            </div>
          </div>
        </foreignObject>
      )}
      
      {/* Edge animation styles */}
      <style>{`
        @keyframes flow {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </>
  );
};

export default CustomEdge;


import React from 'react';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '@/store/graphStore';
import BaseNode from './BaseNode';

type OutputNodeProps = NodeProps & {
  data: NodeData;
};

export const OutputNode: React.FC<OutputNodeProps> = (props) => {
  const { data } = props;
  
  // Expanded output rendering with better type handling
  const renderOutput = () => {
    if (!data.content && (!data.outputs || data.outputs.length === 0)) {
      return <div className="text-gray-400 italic">No output yet</div>;
    }
    
    const outputContent = data.outputs && data.outputs.length > 0 
      ? data.outputs[0] 
      : data.content;
    
    if (outputContent === null || outputContent === undefined) {
      return <div className="text-gray-400">undefined</div>;
    }
    
    // Check for error objects
    if (outputContent && typeof outputContent === 'object' && 'error' in outputContent) {
      return (
        <div className="bg-red-50 p-2 rounded overflow-auto font-mono text-sm text-red-600">
          {String(outputContent.error)}
        </div>
      );
    }
    
    // Handle different data types appropriately
    if (typeof outputContent === 'object') {
      try {
        // For objects, arrays, etc. - pretty print
        return (
          <pre className="bg-gray-50 p-2 rounded overflow-auto text-xs">
            {JSON.stringify(outputContent, null, 2)}
          </pre>
        );
      } catch (e) {
        return <div className="bg-gray-50 p-2 rounded overflow-auto">{String(outputContent)}</div>;
      }
    } else if (typeof outputContent === 'number') {
      return <div className="bg-blue-50 p-2 rounded overflow-auto font-mono text-sm">{outputContent}</div>;
    } else if (typeof outputContent === 'boolean') {
      return (
        <div className={`p-2 rounded overflow-auto font-mono text-sm ${outputContent ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {String(outputContent)}
        </div>
      );
    } else {
      // String or other primitive
      return (
        <div className="bg-gray-50 p-2 rounded overflow-auto font-mono text-sm">
          {String(outputContent)}
        </div>
      );
    }
  };
  
  return (
    <BaseNode {...props}>
      <div className="w-full h-full min-h-[100px] overflow-auto p-2">
        {renderOutput()}
      </div>
    </BaseNode>
  );
};

export default OutputNode;

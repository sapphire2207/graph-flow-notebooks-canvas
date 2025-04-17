
import React from 'react';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '@/store/graphStore';
import BaseNode from './BaseNode';

type OutputNodeProps = NodeProps & {
  data: NodeData;
};

export const OutputNode: React.FC<OutputNodeProps> = (props) => {
  const { data } = props;
  
  // Simple output rendering - we would expand this with more visualization types
  const renderOutput = () => {
    if (!data.content) {
      return <div className="text-gray-400 italic">No output yet</div>;
    }
    
    try {
      // If the output is JSON, pretty print it
      const json = JSON.parse(data.content);
      return (
        <pre className="bg-gray-50 p-2 rounded overflow-auto text-xs">
          {JSON.stringify(json, null, 2)}
        </pre>
      );
    } catch (e) {
      // Regular string output
      return (
        <div className="bg-gray-50 p-2 rounded overflow-auto font-mono text-sm">
          {data.content}
        </div>
      );
    }
  };
  
  return (
    <BaseNode {...props}>
      {renderOutput()}
    </BaseNode>
  );
};

export default OutputNode;

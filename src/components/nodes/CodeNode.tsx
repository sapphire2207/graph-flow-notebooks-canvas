
import React, { useCallback } from 'react';
import { NodeProps } from '@xyflow/react';
import { useGraphStore, NodeData } from '@/store/graphStore';
import BaseNode from './BaseNode';
import { Play } from 'lucide-react';

type CodeNodeProps = NodeProps & {
  data: NodeData;
};

export const CodeNode: React.FC<CodeNodeProps> = (props) => {
  const { id, data } = props;
  const updateNodeData = useGraphStore(state => state.updateNodeData);
  const executeNode = useGraphStore(state => state.executeNode);
  
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { content: e.target.value });
  }, [id, updateNodeData]);
  
  const handleExecute = useCallback(() => {
    executeNode(id);
  }, [id, executeNode]);
  
  return (
    <BaseNode {...props}>
      <div className="relative w-full h-full">
        <textarea
          className="w-full h-full min-h-[100px] bg-gray-50 p-2 text-sm font-mono resize-none focus:outline-none rounded"
          value={data.content}
          onChange={handleContentChange}
          placeholder="Write your code here..."
        />
        
        <button 
          onClick={handleExecute}
          className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
          title="Execute code"
        >
          <Play size={16} />
        </button>
        
        {data.inputs && Object.keys(data.inputs).length > 0 && (
          <div className="absolute top-2 right-2 bg-gray-100 px-2 py-1 rounded text-xs">
            Inputs: {Object.keys(data.inputs).length}
          </div>
        )}
        
        {data.outputs && data.outputs.length > 0 && (
          <div className="absolute bottom-2 left-2 bg-gray-100 px-2 py-1 rounded text-xs">
            Output: {typeof data.outputs[0] === 'object' 
              ? (data.outputs[0]?.error ? 'Error' : 'Object') 
              : String(data.outputs[0]).substring(0, 15) + (String(data.outputs[0]).length > 15 ? '...' : '')}
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default CodeNode;

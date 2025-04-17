
import React, { useCallback } from 'react';
import { NodeProps } from '@xyflow/react';
import { useGraphStore, NodeData } from '@/store/graphStore';
import BaseNode from './BaseNode';

type CodeNodeProps = NodeProps & {
  data: NodeData;
};

export const CodeNode: React.FC<CodeNodeProps> = (props) => {
  const { id, data } = props;
  const updateNodeData = useGraphStore(state => state.updateNodeData);
  
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { content: e.target.value });
  }, [id, updateNodeData]);
  
  return (
    <BaseNode {...props}>
      <textarea
        className="w-full h-full min-h-[100px] bg-gray-50 p-2 text-sm font-mono resize-none focus:outline-none rounded"
        value={data.content}
        onChange={handleContentChange}
        placeholder="Write your code here..."
      />
    </BaseNode>
  );
};

export default CodeNode;

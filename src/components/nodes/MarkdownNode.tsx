
import React, { useCallback, useState } from 'react';
import { NodeProps } from '@xyflow/react';
import { useGraphStore, NodeData } from '@/store/graphStore';
import BaseNode from './BaseNode';

type MarkdownNodeProps = NodeProps & {
  data: NodeData;
};

export const MarkdownNode: React.FC<MarkdownNodeProps> = (props) => {
  const { id, data } = props;
  const updateNodeData = useGraphStore(state => state.updateNodeData);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { content: e.target.value });
  }, [id, updateNodeData]);
  
  const toggleEdit = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);
  
  // Simple markdown rendering (could be replaced with a more sophisticated parser)
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-xl font-bold">{line.slice(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-bold">{line.slice(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={i} className="text-md font-bold">{line.slice(4)}</h3>;
        } else if (line.startsWith('- ')) {
          return <li key={i} className="ml-4">{line.slice(2)}</li>;
        } else if (line === '') {
          return <br key={i} />;
        } else {
          return <p key={i}>{line}</p>;
        }
      });
  };
  
  return (
    <BaseNode {...props}>
      {isEditing ? (
        <div className="relative">
          <textarea
            className="w-full h-full min-h-[100px] p-2 text-sm resize-none focus:outline-none rounded border"
            value={data.content}
            onChange={handleContentChange}
            placeholder="Write markdown here..."
          />
          <button
            onClick={toggleEdit}
            className="absolute top-2 right-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            Preview
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="markdown-content text-sm">
            {renderMarkdown(data.content)}
          </div>
          <button
            onClick={toggleEdit}
            className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 rounded"
          >
            Edit
          </button>
        </div>
      )}
    </BaseNode>
  );
};

export default MarkdownNode;

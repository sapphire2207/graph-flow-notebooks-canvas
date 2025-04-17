
import React, { useState, useCallback, ReactNode } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { X, Maximize2, Minimize2, Play, Edit, Save } from 'lucide-react';
import { useGraphStore, NodeData } from '@/store/graphStore';

interface BaseNodeProps extends Omit<NodeProps, 'data'> {
  data: NodeData;
  children?: ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({ 
  id, 
  data, 
  selected,
  children 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });
  
  const updateNodeData = useGraphStore(state => state.updateNodeData);
  const deleteSelectedElements = useGraphStore(state => state.deleteSelectedElements);
  const executeNode = useGraphStore(state => state.executeNode);
  
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { label: e.target.value });
  };
  
  const handleExecute = useCallback(() => {
    executeNode(id);
  }, [executeNode, id]);
  
  const handleDelete = useCallback(() => {
    deleteSelectedElements();
  }, [deleteSelectedElements]);
  
  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setDimensions({ width: 500, height: 400 });
    } else {
      setDimensions({ width: 300, height: 200 });
    }
  }, [isExpanded]);
  
  const toggleEdit = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);
  
  const handleSave = useCallback(() => {
    setIsEditing(false);
  }, []);
  
  return (
    <>
      <div className="node-content" style={{ width: dimensions.width, height: dimensions.height }}>
        <div className="node-header">
          {isEditing ? (
            <input
              value={data.label}
              onChange={handleLabelChange}
              className="w-full bg-transparent outline-none border-b border-dashed"
              autoFocus
            />
          ) : (
            <span className="font-medium text-sm">{data.label}</span>
          )}
          
          <div className="flex gap-1">
            {data.type === 'code' && (
              <button 
                onClick={handleExecute}
                className="p-1 hover:bg-gray-100 rounded"
                title="Execute code"
              >
                <Play size={14} />
              </button>
            )}
            
            {isEditing ? (
              <button 
                onClick={handleSave}
                className="p-1 hover:bg-gray-100 rounded"
                title="Save"
              >
                <Save size={14} />
              </button>
            ) : (
              <button 
                onClick={toggleEdit}
                className="p-1 hover:bg-gray-100 rounded"
                title="Edit label"
              >
                <Edit size={14} />
              </button>
            )}
            
            <button 
              onClick={toggleExpand}
              className="p-1 hover:bg-gray-100 rounded"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            
            <button 
              onClick={handleDelete}
              className="p-1 hover:bg-gray-100 rounded"
              title="Delete node"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        
        <div 
          className="node-body"
          style={{ maxHeight: isExpanded ? '350px' : '150px' }}
        >
          {children}
        </div>
        
        {data.outputs && data.outputs.length > 0 && (
          <div className="node-footer">
            <div className="text-xs text-gray-500">
              {data.outputs[0].error ? (
                <div className="text-red-500">Error: {String(data.outputs[0].error)}</div>
              ) : (
                <div>Executed successfully</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Input/Output handles */}
      {data.type !== 'markdown' && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          style={{ left: -8 }}
        />
      )}
      
      {data.type !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          style={{ right: -8 }}
        />
      )}
    </>
  );
};

export default BaseNode;

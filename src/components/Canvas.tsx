
import React, { useState, useCallback, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  Panel,
  BackgroundVariant, 
  OnSelectionChangeParams,
  NodeResizeControl
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useGraphStore } from '@/store/graphStore';
import { nodeTypes } from '@/components/nodes/NodeTypes';
import { Copy, ClipboardCopy, Save, Upload, ZoomIn } from 'lucide-react';

export const Canvas: React.FC = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    addNode,
    setSelectedNodeId,
    setSelectedEdgeId,
    copySelectedNodes,
    pasteNodes,
    selectedNodeId,
    selectedEdgeId
  } = useGraphStore();
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Handle selection changes
  const onSelectionChange = useCallback(({ nodes, edges }: OnSelectionChangeParams) => {
    if (nodes.length > 0) {
      setSelectedNodeId(nodes[0].id);
    } else if (edges.length > 0) {
      setSelectedEdgeId(edges[0].id);
    } else {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, [setSelectedNodeId, setSelectedEdgeId]);
  
  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId, setSelectedEdgeId]);
  
  const addSuperBlock = useGraphStore(state => state.addSuperBlock);
  
  // Add a new node when dragging from the sidebar
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      
      const type = event.dataTransfer.getData('application/reactflow') as 'code' | 'markdown' | 'output';
      const superBlockId = event.dataTransfer.getData('application/superblock');
      
      if ((!type && !superBlockId) || !reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      
      // Get position relative to the canvas
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      if (type) {
        addNode(type, position);
      } else if (superBlockId) {
        addSuperBlock(superBlockId, position);
      }
    },
    [reactFlowInstance, addNode, addSuperBlock]
  );
  
  // Handle keyboard shortcuts
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'c' && selectedNodeId) {
        copySelectedNodes();
      }
      
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        if (reactFlowInstance) {
          const center = reactFlowInstance.getViewport();
          pasteNodes({ x: center.x, y: center.y });
        }
      }
    },
    [copySelectedNodes, pasteNodes, selectedNodeId, reactFlowInstance]
  );
  
  // Handle custom pasting at a specific position
  const handlePaste = useCallback(() => {
    if (reactFlowInstance) {
      const center = reactFlowInstance.getViewport();
      pasteNodes({ x: center.x, y: center.y });
    }
  }, [pasteNodes, reactFlowInstance]);
  
  const handleSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem('graphblocks-flow', JSON.stringify(flow));
      alert('Flow saved to browser storage');
    }
  }, [reactFlowInstance]);
  
  const handleLoad = useCallback(() => {
    const savedFlow = localStorage.getItem('graphblocks-flow');
    if (savedFlow) {
      try {
        const flow = JSON.parse(savedFlow);
        if (reactFlowInstance) {
          reactFlowInstance.setNodes(flow.nodes);
          reactFlowInstance.setEdges(flow.edges);
          alert('Flow loaded from browser storage');
        }
      } catch (error) {
        console.error('Error loading flow:', error);
        alert('Error loading flow');
      }
    }
  }, [reactFlowInstance]);
  
  // Create quick action menu on space key
  const [quickMenuPosition, setQuickMenuPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Use mouse position for the quick menu
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const onMouseMove = useCallback((event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);
  
  const onKeyUp = useCallback((event: React.KeyboardEvent) => {
    if (event.key === ' ' && reactFlowWrapper.current && reactFlowInstance) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const x = mousePosition.x - rect.left;
      const y = mousePosition.y - rect.top;
      
      setQuickMenuPosition({ x, y });
    }
  }, [reactFlowInstance, mousePosition]);
  
  // Quick menu component
  const QuickMenu: React.FC<{ position: { x: number; y: number } }> = ({ position }) => {
    const menuItems = [
      { type: 'code', label: 'Code Block' },
      { type: 'markdown', label: 'Markdown Block' },
      { type: 'output', label: 'Output Block' },
    ];
    
    const handleItemClick = (type: 'code' | 'markdown' | 'output') => {
      if (reactFlowInstance) {
        const flowPosition = reactFlowInstance.screenToFlowPosition(position);
        addNode(type, flowPosition);
        setQuickMenuPosition(null);
      }
    };
    
    return (
      <div 
        className="quick-menu" 
        style={{ 
          top: position.y, 
          left: position.x 
        }}
      >
        <div className="quick-menu-search">
          <input 
            type="text" 
            placeholder="Search blocks..." 
            className="w-full p-1 text-sm border rounded"
            autoFocus
          />
        </div>
        <div className="quick-menu-items">
          {menuItems.map((item) => (
            <div 
              key={item.type} 
              className="quick-menu-item"
              onClick={() => handleItemClick(item.type as any)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div 
      className="w-full h-full" 
      ref={reactFlowWrapper}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onMouseMove={onMouseMove}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        nodesFocusable
        panOnScroll
        zoomOnScroll
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="#e2e8f0" 
        />
        <Controls showInteractive={false} />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        
        <Panel position="top-right" className="space-x-2">
          <button
            onClick={handleSave}
            className="p-2 bg-white rounded shadow hover:bg-gray-100"
            title="Save Flow"
          >
            <Save size={16} />
          </button>
          <button
            onClick={handleLoad}
            className="p-2 bg-white rounded shadow hover:bg-gray-100"
            title="Load Flow"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={copySelectedNodes}
            className={`p-2 rounded shadow ${
              selectedNodeId ? 'bg-white hover:bg-gray-100' : 'bg-gray-200 cursor-not-allowed'
            }`}
            disabled={!selectedNodeId}
            title="Copy Selected Node"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={handlePaste}
            className="p-2 bg-white rounded shadow hover:bg-gray-100"
            title="Paste Node"
          >
            <ClipboardCopy size={16} />
          </button>
        </Panel>
      </ReactFlow>
      
      {quickMenuPosition && (
        <QuickMenu position={quickMenuPosition} />
      )}
    </div>
  );
};

export default Canvas;

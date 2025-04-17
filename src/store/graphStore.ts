import { create } from 'zustand';
import { 
  Connection, 
  Edge, 
  EdgeChange, 
  Node, 
  NodeChange, 
  addEdge, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect, 
  applyNodeChanges, 
  applyEdgeChanges,
  NodeTypes 
} from '@xyflow/react';

// Generate random IDs
const generateId = () => `${Math.random().toString(36).substring(2, 9)}`;

export type NodeData = {
  label: string;
  content: string;
  type: 'code' | 'markdown' | 'output';
  outputs?: any[];
};

export interface SuperBlock {
  id: string;
  name: string;
  description: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  inputs: string[];
  outputs: string[];
}

export type RFState = {
  nodes: Node<NodeData>[];
  edges: Edge[];
  clipboard: {
    nodes: Node<NodeData>[];
    edges: Edge[];
  };
  superBlocks: SuperBlock[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  addNode: (type: 'code' | 'markdown' | 'output', position: { x: number, y: number }) => void;
  deleteSelectedElements: () => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedEdgeId: (edgeId: string | null) => void;
  copySelectedNodes: () => void;
  pasteNodes: (position: { x: number, y: number }) => void;
  executeNode: (nodeId: string) => Promise<void>;
  createSuperBlock: (name: string, description: string) => void;
  addSuperBlock: (superBlockId: string, position: { x: number, y: number }) => void;
};

// This will be replaced with actual Jupyter execution in the future
const executeCode = async (code: string): Promise<any> => {
  try {
    // Mock execution - in future, this will connect to Jupyter
    const result = { output: `Executed: ${code}`, error: null };
    return result;
  } catch (error) {
    return { output: null, error: String(error) };
  }
};

export const useGraphStore = create<RFState>((set, get) => ({
  nodes: [] as Node<NodeData>[],
  edges: [] as Edge[],
  clipboard: {
    nodes: [] as Node<NodeData>[],
    edges: [] as Edge[],
  },
  superBlocks: [] as SuperBlock[],
  selectedNodeId: null,
  selectedEdgeId: null,
  
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[],
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(
        { ...connection, id: `e-${generateId()}`, animated: true },
        get().edges
      ),
    });
  },

  updateNodeData: (nodeId: string, data: Partial<NodeData>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },
  
  addNode: (type: 'code' | 'markdown' | 'output', position: { x: number, y: number }) => {
    const newNode: Node<NodeData> = {
      id: `node-${generateId()}`,
      type,
      position,
      data: { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`, 
        content: '',
        type,
        outputs: []
      },
    };
    
    set({ 
      nodes: [...get().nodes, newNode],
      selectedNodeId: newNode.id
    });
    
    return newNode.id;
  },
  
  deleteSelectedElements: () => {
    const { selectedNodeId, selectedEdgeId, nodes, edges } = get();
    
    if (selectedNodeId) {
      // Also delete connected edges
      const connectedEdgeIds = edges
        .filter(e => e.source === selectedNodeId || e.target === selectedNodeId)
        .map(e => e.id);
        
      set({
        nodes: nodes.filter(n => n.id !== selectedNodeId),
        edges: edges.filter(e => !connectedEdgeIds.includes(e.id)),
        selectedNodeId: null
      });
    }
    
    if (selectedEdgeId) {
      set({
        edges: edges.filter(e => e.id !== selectedEdgeId),
        selectedEdgeId: null
      });
    }
  },
  
  setSelectedNodeId: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId, selectedEdgeId: null });
  },
  
  setSelectedEdgeId: (edgeId: string | null) => {
    set({ selectedEdgeId: edgeId, selectedNodeId: null });
  },
  
  copySelectedNodes: () => {
    const { selectedNodeId, nodes, edges } = get();
    if (!selectedNodeId) return;
    
    const nodeToCopy = nodes.find(n => n.id === selectedNodeId);
    if (!nodeToCopy) return;
    
    // Find connected edges between copied nodes
    const relatedEdges = edges.filter(
      e => e.source === selectedNodeId || e.target === selectedNodeId
    );
    
    set({
      clipboard: {
        nodes: [nodeToCopy],
        edges: relatedEdges
      }
    });
  },
  
  pasteNodes: (position: { x: number, y: number }) => {
    const { clipboard, nodes, edges } = get();
    if (clipboard.nodes.length === 0) return;
    
    // Create a mapping of old IDs to new IDs
    const idMapping: Record<string, string> = {};
    
    // Create new nodes with new IDs but keep the same data
    const newNodes = clipboard.nodes.map(node => {
      const newId = `node-${generateId()}`;
      idMapping[node.id] = newId;
      
      return {
        ...node,
        id: newId,
        position: {
          x: position.x,
          y: position.y
        }
      };
    });
    
    // Create new edges with the new node IDs
    const newEdges = clipboard.edges
      .filter(edge => {
        const sourceExists = idMapping[edge.source];
        const targetExists = idMapping[edge.target];
        return sourceExists && targetExists;
      })
      .map(edge => ({
        ...edge,
        id: `e-${generateId()}`,
        source: idMapping[edge.source],
        target: idMapping[edge.target]
      }));
    
    set({
      nodes: [...nodes, ...newNodes],
      edges: [...edges, ...newEdges],
      selectedNodeId: newNodes[0].id
    });
  },
  
  executeNode: async (nodeId: string) => {
    const { nodes, edges, updateNodeData } = get();
    const node = nodes.find(n => n.id === nodeId);
    
    if (!node || node.data.type !== 'code') return;
    
    try {
      // Execute the code
      const result = await executeCode(node.data.content);
      
      // Find all connected output nodes
      const connectedOutputNodeIds = edges
        .filter(e => e.source === nodeId)
        .map(e => e.target);
        
      const outputNodes = nodes.filter(n => 
        connectedOutputNodeIds.includes(n.id) && n.data.type === 'output'
      );
      
      // Update the output nodes with the result
      outputNodes.forEach(outputNode => {
        updateNodeData(outputNode.id, { 
          content: result.error ? String(result.error) : String(result.output),
          outputs: [result.output]
        });
      });
      
      // If there's an error, also update the code node to show it
      if (result.error) {
        updateNodeData(nodeId, { outputs: [{ error: result.error }] });
      } else {
        updateNodeData(nodeId, { outputs: [result.output] });
      }
    } catch (error) {
      console.error('Error executing node:', error);
      updateNodeData(nodeId, { outputs: [{ error: String(error) }] });
    }
  },
  
  createSuperBlock: (name: string, description: string) => {
    const { nodes, edges, selectedNodeId } = get();
    
    if (!selectedNodeId) return;
    
    // Find all selected nodes and their connections
    const selectedNodes = nodes.filter(node => {
      // In a real implementation, we'd track multiple selections
      // Here we just work with the single selected node
      return node.id === selectedNodeId;
    });
    
    // Find all edges between the selected nodes
    const selectedEdges = edges.filter(edge => {
      const sourceSelected = selectedNodes.some(node => node.id === edge.source);
      const targetSelected = selectedNodes.some(node => node.id === edge.target);
      return sourceSelected && targetSelected;
    });
    
    // Identify inputs and outputs
    const inputs: string[] = [];
    const outputs: string[] = [];
    
    // Find external connections to these nodes (would be inputs/outputs of the superblock)
    edges.forEach(edge => {
      const sourceSelected = selectedNodes.some(node => node.id === edge.source);
      const targetSelected = selectedNodes.some(node => node.id === edge.target);
      
      if (sourceSelected && !targetSelected) {
        // This is an output of the SuperBlock
        outputs.push(edge.source);
      }
      
      if (!sourceSelected && targetSelected) {
        // This is an input to the SuperBlock
        inputs.push(edge.target);
      }
    });
    
    // Create the SuperBlock
    const superBlock: SuperBlock = {
      id: `superblock-${generateId()}`,
      name,
      description,
      nodes: selectedNodes,
      edges: selectedEdges,
      inputs,
      outputs
    };
    
    set({
      superBlocks: [...get().superBlocks, superBlock]
    });
  },
  
  addSuperBlock: (superBlockId: string, position: { x: number, y: number }) => {
    const { superBlocks } = get();
    const superBlock = superBlocks.find(sb => sb.id === superBlockId);
    
    if (!superBlock) return;
    
    // Create a mapping of old IDs to new IDs
    const idMapping: Record<string, string> = {};
    
    // Create new nodes with new IDs but keep the same data
    const newNodes = superBlock.nodes.map(node => {
      const newId = `node-${generateId()}`;
      idMapping[node.id] = newId;
      
      // Calculate position relative to the superblock position
      const x = position.x + (node.position.x - superBlock.nodes[0].position.x);
      const y = position.y + (node.position.y - superBlock.nodes[0].position.y);
      
      return {
        ...node,
        id: newId,
        position: { x, y }
      };
    });
    
    // Create new edges with the new node IDs
    const newEdges = superBlock.edges.map(edge => ({
      ...edge,
      id: `e-${generateId()}`,
      source: idMapping[edge.source],
      target: idMapping[edge.target]
    }));
    
    set({
      nodes: [...get().nodes, ...newNodes],
      edges: [...get().edges, ...newEdges]
    });
  }
}));

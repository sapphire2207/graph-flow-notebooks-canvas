
import React, { useState } from 'react';
import { Code, FileText, Terminal, Database, Settings, Layers, Hash, BarChart2, Box } from 'lucide-react';
import { useGraphStore } from '@/store/graphStore';
import SuperBlockModal from './SuperBlockModal';

interface BlockCategory {
  title: string;
  icon: React.ReactNode;
  blocks: {
    type: string;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

export const Sidebar: React.FC = () => {
  const [isSuperBlockModalOpen, setIsSuperBlockModalOpen] = useState(false);
  const superBlocks = useGraphStore(state => state.superBlocks);
  const createSuperBlock = useGraphStore(state => state.createSuperBlock);
  const categories: BlockCategory[] = [
    {
      title: 'Basic',
      icon: <Layers size={16} />,
      blocks: [
        {
          type: 'code',
          label: 'Code Block',
          description: 'Python code execution',
          icon: <Code size={16} />,
        },
        {
          type: 'markdown',
          label: 'Markdown',
          description: 'Text documentation',
          icon: <FileText size={16} />,
        },
        {
          type: 'output',
          label: 'Output',
          description: 'Display execution results',
          icon: <Terminal size={16} />,
        },
      ],
    },
    {
      title: 'Data',
      icon: <Database size={16} />,
      blocks: [
        {
          type: 'output',
          label: 'Table',
          description: 'Display tabular data',
          icon: <Hash size={16} />,
        },
        {
          type: 'output',
          label: 'Chart',
          description: 'Visualize data',
          icon: <BarChart2 size={16} />,
        },
      ],
    },
  ];

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSaveSuperBlock = (name: string, description: string) => {
    createSuperBlock(name, description);
  };

  return (
    <div className="w-64 bg-white border-r h-full overflow-auto">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold flex items-center">
          <span className="mr-2">GraphBlocks</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Visual Jupyter Interface</p>
        <button 
          className="mt-2 w-full text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
          onClick={() => setIsSuperBlockModalOpen(true)}
        >
          <Box size={12} className="mr-1" />
          Create SuperBlock
        </button>
      </div>

      {categories.map((category) => (
        <div key={category.title} className="p-2">
          <div className="text-sm font-medium text-gray-500 px-2 py-1 flex items-center">
            <span className="mr-2">{category.icon}</span>
            {category.title}
          </div>
          <div className="mt-1">
            {category.blocks.map((block) => (
              <div
                key={`${category.title}-${block.label}`}
                className="flex items-center p-2 rounded cursor-grab hover:bg-gray-100"
                draggable
                onDragStart={(e) => onDragStart(e, block.type)}
              >
                <div className="mr-3 text-gray-500">{block.icon}</div>
                <div>
                  <div className="text-sm font-medium">{block.label}</div>
                  <div className="text-xs text-gray-500">{block.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {superBlocks.length > 0 && (
        <div className="p-2">
          <div className="text-sm font-medium text-gray-500 px-2 py-1 flex items-center">
            <span className="mr-2"><Box size={16} /></span>
            SuperBlocks
          </div>
          <div className="mt-1">
            {superBlocks.map((superBlock) => (
              <div
                key={superBlock.id}
                className="flex items-center p-2 rounded cursor-grab hover:bg-gray-100"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/superblock', superBlock.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <div className="mr-3 text-gray-500"><Box size={16} /></div>
                <div>
                  <div className="text-sm font-medium">{superBlock.name}</div>
                  <div className="text-xs text-gray-500">{superBlock.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 border-t mt-auto">
        <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
          <Settings size={14} className="mr-2" />
          Settings
        </button>
      </div>
      
      <SuperBlockModal 
        isOpen={isSuperBlockModalOpen}
        onClose={() => setIsSuperBlockModalOpen(false)}
        onSave={handleSaveSuperBlock}
      />
    </div>
  );
};

export default Sidebar;


import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="h-screen w-full flex flex-col">
      <header className="h-12 border-b flex items-center justify-between px-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-gray-100 mr-4"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <h1 className="font-semibold text-lg">GraphBlocks</h1>
        </div>
        <div className="text-sm text-gray-500">
          Visual Jupyter Interface
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {!sidebarCollapsed && (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="border-r">
              <Sidebar />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={80}>
              <Canvas />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
        
        {sidebarCollapsed && (
          <div className="flex-1">
            <Canvas />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;

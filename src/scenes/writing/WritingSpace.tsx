import { useState } from 'react';
import { OutlineSidebar } from './components/OutlineSidebar';
import { Editor } from './components/Editor';
import { StatusBar } from './components/StatusBar';

export function WritingSpace() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="scene-writing" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <OutlineSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <Editor
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      <StatusBar />
    </div>
  );
}

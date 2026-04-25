import { useState } from 'react';
import { SceneTabs, type Scene } from './components/SceneTabs';
import { WritingSpace } from './scenes/writing/WritingSpace';
import { IdeationSpace } from './scenes/ideation/IdeationSpace';
import { PolishingSpace } from './scenes/polishing/PolishingSpace';
import { AnalyticsSpace } from './scenes/analytics/AnalyticsSpace';
import { useProjectStore } from './stores/projectStore';
import './App.css';

function App() {
  const [activeScene, setActiveScene] = useState<Scene>('writing');
  const project = useProjectStore((s) => s.project);

  const renderScene = () => {
    switch (activeScene) {
      case 'ideation': return <IdeationSpace />;
      case 'writing': return <WritingSpace />;
      case 'polishing': return <PolishingSpace />;
      case 'analytics': return <AnalyticsSpace />;
    }
  };

  if (!project) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: 16,
        background: 'var(--color-paper-white)',
      }}>
        <div style={{ fontSize: 36, fontWeight: 600, color: 'var(--color-ink-green)' }}>
          竹林清风
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>
          请先在控制台打开项目（欢迎页即将上线）
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <SceneTabs active={activeScene} onChange={setActiveScene} />
      <div className="scene-content">
        {renderScene()}
      </div>
    </div>
  );
}

export default App;

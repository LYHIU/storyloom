import { useState } from 'react';
import { SceneTabs, type Scene } from './components/SceneTabs';
import { WritingSpace } from './scenes/writing/WritingSpace';
import { IdeationSpace } from './scenes/ideation/IdeationSpace';
import { PolishingSpace } from './scenes/polishing/PolishingSpace';
import { AnalyticsSpace } from './scenes/analytics/AnalyticsSpace';
import { WelcomePage } from './components/WelcomePage';
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
      <WelcomePage onProjectOpened={() => {
        // Force re-render - project is now set in the store
      }} />
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

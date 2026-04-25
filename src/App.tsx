import { useState, useEffect } from 'react';
import { SceneTabs, type Scene } from './components/SceneTabs';
import { WritingSpace } from './scenes/writing/WritingSpace';
import { IdeationSpace } from './scenes/ideation/IdeationSpace';
import { PolishingSpace } from './scenes/polishing/PolishingSpace';
import { AnalyticsSpace } from './scenes/analytics/AnalyticsSpace';
import { VaultSetupPage } from './components/VaultSetupPage';
import { VaultHome } from './components/VaultHome';
import { useProjectStore } from './stores/projectStore';
import './App.css';

function App() {
  const vaultPath = useProjectStore((s) => s.vaultPath);
  const project = useProjectStore((s) => s.project);
  const vaultProjects = useProjectStore((s) => s.vaultProjects);
  const { setVaultPath } = useProjectStore();
  const [activeScene, setActiveScene] = useState<Scene>('writing');

  // On mount, check for saved vault path
  useEffect(() => {
    const saved = localStorage.getItem('storyloom-vault-path');
    if (saved && !vaultPath) {
      setVaultPath(saved);
    }
  }, []);

  const renderScene = () => {
    switch (activeScene) {
      case 'ideation': return <IdeationSpace />;
      case 'writing': return <WritingSpace />;
      case 'polishing': return <PolishingSpace />;
      case 'analytics': return <AnalyticsSpace />;
    }
  };

  // Screen 1: No vault yet → show setup
  if (!vaultPath && vaultProjects.length === 0) {
    return <VaultSetupPage onVaultReady={() => {}} />;
  }

  // Screen 2: Vault set, but no project open → show vault home
  if (!project) {
    return <VaultHome onProjectOpened={() => {}} />;
  }

  // Screen 3: Project open → show workspace
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

import { useState } from 'react';
import Header from './tsx_components/Header';
import ResourcePalette from './tsx_components/ResourcePalette';
import IsometricGrid from './tsx_components/IsometricGrid';
import Inspector from './tsx_components/Inspector';

export interface PlacedResource {
  id: string;
  tileIndex: number;
  type: 'ec2' | 'lambda' | 'rds' | 's3';
  name: string;
}

function App() {
  // 初期リソースのサンプル配置
  const [resources, setResources] = useState<PlacedResource[]>([
    { id: 'res-1', tileIndex: 7, type: 'ec2', name: 'Web-Server-01 (EC2)' },
    { id: 'res-2', tileIndex: 14, type: 'lambda', name: 'Auth-Function (Lambda)' },
    { id: 'res-3', tileIndex: 21, type: 'rds', name: 'Primary-DB (PostgreSQL)' },
  ]);

  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<number | null>(7);

  // タイルクリック時の処理
  const handleTileClick = (tileIndex: number) => {
    setSelectedTile(tileIndex);

    // パレットでツールが選択されていれば配置
    if (selectedTool) {
      const existing = resources.find((r) => r.tileIndex === tileIndex);
      if (!existing) {
        const newResource: PlacedResource = {
          id: `res-${Date.now()}`,
          tileIndex,
          type: selectedTool as 'ec2' | 'lambda' | 'rds' | 's3',
          name: `${selectedTool.toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
        };
        setResources((prev) => [...prev, newResource]);
      }
      setSelectedTool(null); // 配置完了後はツール解除
    }
  };

  // リソース削除
  const handleRemoveResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const selectedResource = resources.find((r) => r.tileIndex === selectedTile) || null;

  return (
    <div className="app-container">
      <Header />
      <div className="workspace">
        <ResourcePalette
          selectedTool={selectedTool}
          onSelectTool={(toolId) => setSelectedTool(selectedTool === toolId ? null : toolId)}
        />
        <IsometricGrid
          resources={resources}
          selectedTile={selectedTile}
          onTileClick={handleTileClick}
        />
        <Inspector
          selectedResource={selectedResource}
          selectedTile={selectedTile}
          onRemoveResource={handleRemoveResource}
        />
      </div>
    </div>
  );
}

export default App;
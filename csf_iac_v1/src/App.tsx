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

  // リソース移動（ドラッグ＆ドロップ）
  const handleMoveResource = (resourceId: string, newTileIndex: number) => {
    const targetOccupied = resources.find((r) => r.tileIndex === newTileIndex);
    const moving = resources.find((r) => r.id === resourceId);
    if (!moving) return;

    if (targetOccupied && targetOccupied.id !== resourceId) {
      // すでに別ラックがある場合は場所をスワップ（入れ替え）
      const oldTile = moving.tileIndex;
      setResources((prev) =>
        prev.map((r) => {
          if (r.id === resourceId) return { ...r, tileIndex: newTileIndex };
          if (r.id === targetOccupied.id) return { ...r, tileIndex: oldTile };
          return r;
        })
      );
    } else {
      // 空いている土地へ移動
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, tileIndex: newTileIndex } : r))
      );
    }
    setSelectedTile(newTileIndex);
  };

  // パレットから土地へのドラッグ＆ドロップ直接配置
  const handlePlaceResource = (
    type: 'ec2' | 'lambda' | 'rds' | 's3',
    newTileIndex: number
  ) => {
    const existing = resources.find((r) => r.tileIndex === newTileIndex);
    if (!existing) {
      const newResource: PlacedResource = {
        id: `res-${Date.now()}`,
        tileIndex: newTileIndex,
        type,
        name: `${type.toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      };
      setResources((prev) => [...prev, newResource]);
      setSelectedTile(newTileIndex);
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
          onMoveResource={handleMoveResource}
          onPlaceResource={handlePlaceResource}
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
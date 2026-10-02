import { useState } from 'react';
import Header from './tsx_components/Header';
import ResourcePalette from './tsx_components/ResourcePalette';
import type { ServerlessResourceType } from './tsx_components/ResourcePalette';
import IsometricGrid from './tsx_components/IsometricGrid';
import type { PlacedResource, ResourceConnection } from './tsx_components/IsometricGrid';
import Inspector from './tsx_components/Inspector';
import JsonModal from './tsx_components/JsonModal';
import type { CustomIaCPayload } from './data/curifoPreset';

function App() {
  // 初期リソースのサンプル配置（王道のサーバーレスSPAアーキテクチャ）
  const [resources, setResources] = useState<PlacedResource[]>([
    { id: 'res-cdn', tileIndex: 7, type: 'cloudfront', name: 'CloudFront-Edge' },
    { id: 'res-s3', tileIndex: 8, type: 's3', name: 'SPA-Static-Bucket' },
    { id: 'res-api', tileIndex: 14, type: 'apigateway', name: 'REST-HttpApi' },
    { id: 'res-fn', tileIndex: 20, type: 'lambda', name: 'Backend-Function' },
    { id: 'res-db', tileIndex: 26, type: 'dynamodb', name: 'App-DataStore' },
  ]);

  // 初期リソース間のライン接続
  const [connections, setConnections] = useState<ResourceConnection[]>([
    { id: 'c-cf-s3', from: 'res-cdn', to: 'res-s3', type: 'origin', label: '静的アセット配信' },
    { id: 'c-cf-api', from: 'res-cdn', to: 'res-api', type: 'api', label: 'APIリバースプロキシ' },
    { id: 'c-api-fn', from: 'res-api', to: 'res-fn', type: 'integration', label: 'HTTP統合' },
    { id: 'c-fn-db', from: 'res-fn', to: 'res-db', type: 'data', label: 'データ永続化' },
  ]);

  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<number | null>(7);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

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
          type: selectedTool as ServerlessResourceType,
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
    type: ServerlessResourceType,
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

  // リソース削除（関連コネクションも同時削除）
  const handleRemoveResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
  };

  // CustomIaC JSON インポートハンドラ
  const handleImportPayload = (payload: CustomIaCPayload) => {
    setResources(payload.resources.map(r => ({
      id: r.id,
      tileIndex: r.tileIndex,
      type: r.type,
      name: r.name,
    })));
    setConnections(payload.connections || []);
    if (payload.resources.length > 0) {
      setSelectedTile(payload.resources[0].tileIndex);
    }
  };

  // 司令塔Lambdaへ送る JSON データの構築（サーバーレスSPA & ライン接続対応）
  const generatePayloadJson = (): CustomIaCPayload => {
    return {
      version: '1.0',
      architectureType: 'serverless-spa',
      projectName: 'Curifo-Custom-IaC-Project',
      targetRegion: 'ap-northeast-1',
      timestamp: new Date().toISOString(),
      resources: resources.map((r) => ({
        id: r.id,
        tileIndex: r.tileIndex,
        type: r.type,
        name: r.name,
        config: {
          ...(r.type === 's3' && {
            bucketName: `curifo-spa-${r.name.toLowerCase()}-${r.id.slice(-6)}`,
            websiteIndexDocument: 'index.html',
          }),
          ...(r.type === 'cloudfront' && {
            priceClass: 'PriceClass_200',
            defaultRootObject: 'index.html',
            enableOAC: true,
          }),
          ...(r.type === 'apigateway' && {
            protocolType: 'HTTP',
            corsConfiguration: { allowOrigins: ['*'], allowMethods: ['GET', 'POST', 'PUT', 'DELETE'] },
          }),
          ...(r.type === 'lambda' && {
            runtime: 'nodejs24.x',
            handler: 'index.handler',
            memorySize: 256,
          }),
          ...(r.type === 'dynamodb' && {
            billingMode: 'PAY_PER_REQUEST',
            partitionKey: 'userID',
            sortKey: 'surveyID',
          }),
          ...(r.type === 'cognito' && {
            userPoolName: `${r.name}-pool`,
            mfaConfiguration: 'OPTIONAL',
          }),
        },
      })),
      connections,
    };
  };

  // 即時デプロイボタン押下時のアクション
  const handleDeploy = () => {
    const payload = generatePayloadJson();
    alert(`🚀 司令塔Lambdaへ ${resources.length} 基のサーバーレスSPA構成JSON（${connections.length} 本の接続ライン含む）を送信しました！\nAWS SDK (v3) による即時プロビジョニングが開始されます。`);
    console.log('Sending Serverless SPA Payload to AWS Lambda:', payload);
  };

  const selectedResource = resources.find((r) => r.tileIndex === selectedTile) || null;

  return (
    <div className="app-container">
      <Header
        resourceCount={resources.length}
        connectionCount={connections.length}
        onViewJson={() => setIsJsonModalOpen(true)}
        onDeploy={handleDeploy}
      />
      <div className="workspace">
        <ResourcePalette
          selectedTool={selectedTool}
          onSelectTool={(toolId) => setSelectedTool(selectedTool === toolId ? null : toolId)}
        />
        <IsometricGrid
          resources={resources}
          connections={connections}
          selectedTile={selectedTile}
          onTileClick={handleTileClick}
          onMoveResource={handleMoveResource}
          onPlaceResource={handlePlaceResource}
        />
        <Inspector
          selectedResource={selectedResource}
          selectedTile={selectedTile}
          connections={connections}
          allResources={resources}
          onRemoveResource={handleRemoveResource}
        />
      </div>

      {/* 司令塔Lambda送信用 / インポート兼用 JSON モーダル */}
      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        jsonData={generatePayloadJson()}
        onImport={handleImportPayload}
      />
    </div>
  );
}

export default App;
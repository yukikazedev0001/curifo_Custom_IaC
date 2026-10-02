import { useState, useEffect } from 'react';
import ServerRack from './ServerRack';
import styles from './IsometricGrid.module.css';
import type { ServerlessResourceType } from './ResourcePalette';

export interface PlacedResource {
  id: string;
  tileIndex: number;
  type: ServerlessResourceType;
  name: string;
}

export interface ResourceConnection {
  id: string;
  from: string; // resource ID
  to: string;   // resource ID
  type?: 'origin' | 'api' | 'integration' | 'data' | 'auth';
  label?: string;
}

interface IsometricGridProps {
  resources: PlacedResource[];
  connections?: ResourceConnection[];
  selectedTile: number | null;
  onTileClick: (index: number) => void;
  onMoveResource: (resourceId: string, newTileIndex: number) => void;
  onPlaceResource?: (type: ServerlessResourceType, newTileIndex: number) => void;
}

function IsometricGrid({
  resources,
  connections = [],
  selectedTile,
  onTileClick,
  onMoveResource,
  onPlaceResource,
}: IsometricGridProps) {
  const tiles = Array.from({ length: 36 }, (_, i) => i);
  const [draggedResourceId, setDraggedResourceId] = useState<string | null>(null);
  const [dragOverTile, setDragOverTile] = useState<number | null>(null);

  // 視点（カメラ）操作ステート
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotateZ, setRotateZ] = useState<number>(-45);
  const [rotateX, setRotateX] = useState<number>(60);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 視点操作アクション
  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 2.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.5));
  const handleRotateLeft = () => setRotateZ((prev) => prev - 45);
  const handleRotateRight = () => setRotateZ((prev) => prev + 45);
  const handleToggleViewMode = () => setRotateX((prev) => (prev === 60 ? 0 : 60));
  const handleResetView = () => {
    setZoom(1.0);
    setRotateZ(-45);
    setRotateX(60);
  };

  // マウスホイールでのズーム拡縮
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 2.0));
    } else {
      setZoom((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.5));
    }
  };

  // 背景余白・右クリックドラッグでの自由回転
  const handleMouseDown = (e: React.MouseEvent) => {
    // 右クリック、または余白背景をクリックした場合に回転モードへ
    if (e.button === 2 || (e.target as HTMLElement).classList.contains(styles.gridViewport)) {
      e.preventDefault();
      setIsRotating(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isRotating) return;
    const dx = e.clientX - dragStartPos.x;
    const dy = e.clientY - dragStartPos.y;
    // 左右ドラッグの回転向きを反転 (prev - dx * 0.4)
    setRotateZ((prev) => prev - dx * 0.4);
    setRotateX((prev) => Math.max(0, Math.min(85, prev - dy * 0.3)));
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsRotating(false);
  };

  // ウィンドウ全体でドラッグ進入・オーバーを許可（タイルの隙間や余白でも禁止アイコンを絶対に防ぐ）
  useEffect(() => {
    const handlePrevent = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    };

    // capture: true でブラウザが禁止判定を出す前に先回りして完全制圧
    window.addEventListener('dragenter', handlePrevent, { capture: true });
    window.addEventListener('dragover', handlePrevent, { capture: true });

    return () => {
      window.removeEventListener('dragenter', handlePrevent, { capture: true });
      window.removeEventListener('dragover', handlePrevent, { capture: true });
    };
  }, []);

  // ドラッグ開始（既存ラックの移動）
  const handleRackDragStart = (e: React.DragEvent, resourceId: string) => {
    e.stopPropagation();
    setDraggedResourceId(resourceId);
    e.dataTransfer.setData('text/plain', resourceId);
    e.dataTransfer.setData('type', 'move-resource');
    e.dataTransfer.effectAllowed = 'all';
  };

  // ドラッグ終了
  const handleRackDragEnd = () => {
    setDraggedResourceId(null);
    setDragOverTile(null);
  };

  // ドラッグオーバー全般（禁止アイコンを出さない）
  const handleGeneralDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // タイル上にドラッグ進入
  const handleTileDragEnter = (e: React.DragEvent, tileIndex: number) => {
    e.preventDefault();
    setDragOverTile(tileIndex);
  };

  // タイルからドラッグ退出
  const handleTileDragLeave = (tileIndex: number) => {
    if (dragOverTile === tileIndex) {
      setDragOverTile(null);
    }
  };

  // タイルへのドロップ
  const handleTileDrop = (e: React.DragEvent, tileIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTile(null);

    const resourceId = draggedResourceId || e.dataTransfer.getData('resourceId');
    const newResourceType = e.dataTransfer.getData('newResourceType') as ServerlessResourceType | '';

    // 1. パレットからの新規ドラッグ配置
    if (newResourceType && onPlaceResource) {
      onPlaceResource(newResourceType, tileIndex);
      return;
    }

    // 2. 既存ラックのドラッグ移動
    if (resourceId) {
      onMoveResource(resourceId, tileIndex);
      setDraggedResourceId(null);
    }
  };

  // タイル中心座標の計算 (padding: 16px, tile: 84px, gap: 4px -> stride: 88px)
  const getTileCenter = (tileIndex: number) => {
    const row = Math.floor(tileIndex / 6);
    const col = tileIndex % 6;
    const cx = 16 + col * 88 + 42;
    const cy = 16 + row * 88 + 42;
    return { cx, cy };
  };

  // コネクションの種別カラー
  const getConnectionColor = (type?: string) => {
    switch (type) {
      case 'origin':
        return '#0284c7'; // スカイブルー (S3 ⇄ CloudFront)
      case 'api':
        return '#6366f1'; // インディゴ (SPA ⇄ API Gateway)
      case 'integration':
        return '#10b981'; // エメラルド (API Gateway ⇄ Lambda)
      case 'data':
        return '#059669'; // グリーン (Lambda ⇄ DynamoDB)
      case 'auth':
        return '#f59e0b'; // アンバー (Cognito 認証)
      default:
        return '#94a3b8';
    }
  };

  // 選択中タイルのリソースID
  const selectedResourceId = selectedTile !== null
    ? resources.find((r) => r.tileIndex === selectedTile)?.id
    : null;

  return (
    <main
      className={styles.gridViewport}
      onDragOver={handleGeneralDragOver}
      onDragEnter={handleGeneralDragOver}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      title="背景を右ドラッグで自由回転、ホイールでズームできます"
    >
      <div className={styles.viewportControls} onClick={(e) => e.stopPropagation()}>
        <button className={styles.controlBtn} onClick={handleZoomIn} title="ズームイン (＋)">＋</button>
        <button className={styles.controlBtn} onClick={handleZoomOut} title="ズームアウト (－)">－</button>
        <div className={styles.divider} />
        <button className={styles.controlBtn} onClick={handleRotateLeft} title="反時計回りに45°回転">⟲</button>
        <button className={styles.controlBtn} onClick={handleRotateRight} title="時計回りに45°回転">⟳</button>
        <div className={styles.divider} />
        <button
          className={`${styles.controlBtn} ${rotateX === 0 ? styles.controlBtnActive : ''}`}
          onClick={handleToggleViewMode}
          title={rotateX === 60 ? "真上からの見取り図(2D)に切替" : "3D立体ビュー(60°)に切替"}
        >
          {rotateX === 60 ? '2D' : '3D'}
        </button>
        <div className={styles.divider} />
        <button className={styles.controlBtn} onClick={handleResetView} title="視点を初期位置にリセット">⌂</button>
      </div>

      <div
        className={styles.isometricStage}
        onDragOver={handleGeneralDragOver}
        onDragEnter={handleGeneralDragOver}
        style={{
          transform: `rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${zoom})`,
        }}
      >
        <div
          className={styles.gridBoard}
          onDragOver={handleGeneralDragOver}
          onDragEnter={handleGeneralDragOver}
          style={{ position: 'relative' }}
        >
          {/* リソース間のライン接続レイヤー */}
          <svg className={styles.connectionLayer} viewBox="0 0 560 560">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {connections.map((conn) => {
              const fromRes = resources.find((r) => r.id === conn.from);
              const toRes = resources.find((r) => r.id === conn.to);
              if (!fromRes || !toRes) return null;

              const start = getTileCenter(fromRes.tileIndex);
              const end = getTileCenter(toRes.tileIndex);

              // 制御点（少しカーブをつけて見やすく）
              const dx = end.cx - start.cx;
              const dy = end.cy - start.cy;
              const ctrlX = (start.cx + end.cx) / 2 - dy * 0.12;
              const ctrlY = (start.cy + end.cy) / 2 + dx * 0.12;

              const pathData = `M ${start.cx} ${start.cy} Q ${ctrlX} ${ctrlY} ${end.cx} ${end.cy}`;
              const isRelevant =
                selectedResourceId === null ||
                conn.from === selectedResourceId ||
                conn.to === selectedResourceId;
              const isDirectlySelected =
                selectedResourceId !== null &&
                (conn.from === selectedResourceId || conn.to === selectedResourceId);

              const color = getConnectionColor(conn.type);

              return (
                <g key={conn.id}>
                  {/* 背景のグロー太線 */}
                  {isDirectlySelected && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke={color}
                      strokeWidth="6"
                      opacity="0.35"
                      filter="url(#glow)"
                    />
                  )}
                  {/* メイン接続ライン */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth={isDirectlySelected ? '3' : '2'}
                    className={`${styles.connectionLine} ${
                      !isRelevant ? styles.connectionLineDimmed : ''
                    } ${isDirectlySelected ? styles.connectionLineActive : ''}`}
                  />
                  {/* 始点・終点ポイント */}
                  <circle cx={start.cx} cy={start.cy} r={isDirectlySelected ? '4' : '3'} fill={color} />
                  <circle cx={end.cx} cy={end.cy} r={isDirectlySelected ? '4' : '3'} fill={color} />
                </g>
              );
            })}
          </svg>

          {tiles.map((tileIndex) => {
            const resource = resources.find((r) => r.tileIndex === tileIndex);
            const isSelected = selectedTile === tileIndex;
            const isDragOver = dragOverTile === tileIndex;
            const isDraggingThis = resource ? draggedResourceId === resource.id : false;

            return (
              <div
                key={tileIndex}
                className={`${styles.gridTile} ${isSelected ? styles.gridTileSelected : ''} ${
                  isDragOver ? styles.gridTileDragOver : ''
                }`}
                onClick={() => onTileClick(tileIndex)}
                onDragOver={handleGeneralDragOver}
                onDragEnter={(e) => handleTileDragEnter(e, tileIndex)}
                onDragLeave={() => handleTileDragLeave(tileIndex)}
                onDrop={(e) => handleTileDrop(e, tileIndex)}
              >
                {resource && (
                  <ServerRack
                    type={resource.type}
                    name={resource.name}
                    draggable={true}
                    onDragStart={(e) => handleRackDragStart(e, resource.id)}
                    onDragEnd={handleRackDragEnd}
                    isDragging={isDraggingThis}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default IsometricGrid;

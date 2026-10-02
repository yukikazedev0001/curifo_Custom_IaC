import { useState } from 'react';
import ServerRack from './ServerRack';
import styles from './IsometricGrid.module.css';

interface PlacedResource {
  id: string;
  tileIndex: number;
  type: 'ec2' | 'lambda' | 'rds' | 's3';
  name: string;
}

interface IsometricGridProps {
  resources: PlacedResource[];
  selectedTile: number | null;
  onTileClick: (index: number) => void;
  onMoveResource: (resourceId: string, newTileIndex: number) => void;
  onPlaceResource?: (type: 'ec2' | 'lambda' | 'rds' | 's3', newTileIndex: number) => void;
}

function IsometricGrid({
  resources,
  selectedTile,
  onTileClick,
  onMoveResource,
  onPlaceResource,
}: IsometricGridProps) {
  const tiles = Array.from({ length: 36 }, (_, i) => i);
  const [draggedResourceId, setDraggedResourceId] = useState<string | null>(null);
  const [dragOverTile, setDragOverTile] = useState<number | null>(null);

  // ドラッグ開始（既存ラックの移動）
  const handleRackDragStart = (e: React.DragEvent, resourceId: string) => {
    e.stopPropagation();
    setDraggedResourceId(resourceId);
    e.dataTransfer.setData('text/plain', resourceId);
    e.dataTransfer.setData('type', 'move-resource');
    e.dataTransfer.effectAllowed = 'move';
  };

  // ドラッグ終了
  const handleRackDragEnd = () => {
    setDraggedResourceId(null);
    setDragOverTile(null);
  };

  // タイル上のドラッグオーバー
  const handleTileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // タイル上にドラッグ進入
  const handleTileDragEnter = (tileIndex: number) => {
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
    const newResourceType = e.dataTransfer.getData('newResourceType') as
      | 'ec2'
      | 'lambda'
      | 'rds'
      | 's3'
      | '';

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

  return (
    <main className={styles.gridViewport}>
      <div className={styles.viewportControls}>
        <button className={styles.controlBtn} title="ズームイン">＋</button>
        <button className={styles.controlBtn} title="ズームアウト">－</button>
        <button className={styles.controlBtn} title="視点リセット">⟲</button>
      </div>

      <div className={styles.isometricStage}>
        <div className={styles.gridBoard}>
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
                onDragOver={handleTileDragOver}
                onDragEnter={() => handleTileDragEnter(tileIndex)}
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

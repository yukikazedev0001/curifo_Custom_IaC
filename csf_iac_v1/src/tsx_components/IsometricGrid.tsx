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
}

function IsometricGrid({ resources, selectedTile, onTileClick }: IsometricGridProps) {
  const tiles = Array.from({ length: 36 }, (_, i) => i);

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

            return (
              <div
                key={tileIndex}
                className={`${styles.gridTile} ${isSelected ? styles.gridTileSelected : ''}`}
                onClick={() => onTileClick(tileIndex)}
              >
                {resource && <ServerRack type={resource.type} name={resource.name} />}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default IsometricGrid;

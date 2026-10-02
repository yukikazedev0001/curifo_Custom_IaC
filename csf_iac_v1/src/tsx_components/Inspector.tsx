import styles from './Inspector.module.css';

interface PlacedResource {
  id: string;
  tileIndex: number;
  type: 'ec2' | 'lambda' | 'rds' | 's3';
  name: string;
}

interface InspectorProps {
  selectedResource: PlacedResource | null;
  selectedTile: number | null;
  onRemoveResource?: (id: string) => void;
}

function Inspector({ selectedResource, selectedTile, onRemoveResource }: InspectorProps) {
  return (
    <aside className={styles.inspector}>
      <div className={styles.panelTitle}>プロパティ・構成情報</div>

      {selectedResource ? (
        <>
          <div className={styles.inspectorSection}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {selectedResource.name}
            </span>
            <div className={styles.inspectorCard}>
              <div className={styles.propRow}>
                <span className={styles.propKey}>リソース種別</span>
                <span className={styles.propValue}>{selectedResource.type.toUpperCase()}</span>
              </div>
              <div className={styles.propRow}>
                <span className={styles.propKey}>グリッド座標</span>
                <span className={styles.propValue}>Tile #{selectedResource.tileIndex}</span>
              </div>
              <div className={styles.propRow}>
                <span className={styles.propKey}>ステータス</span>
                <span className={styles.propValue} style={{ color: 'var(--accent-mint)' }}>● 稼働中 (Running)</span>
              </div>
              <div className={styles.propRow}>
                <span className={styles.propKey}>推定月額コスト</span>
                <span className={styles.propValue}>$12.40 / 月</span>
              </div>
            </div>
          </div>

          <div className={styles.inspectorSection}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              IaC / 設定パラメーター
            </span>
            <div className={styles.inspectorCard}>
              <div className={styles.propRow}>
                <span className={styles.propKey}>インスタンスタイプ</span>
                <span className={styles.propValue}>t4g.micro</span>
              </div>
              <div className={styles.propRow}>
                <span className={styles.propKey}>AZ (配置ゾーン)</span>
                <span className={styles.propValue}>ap-northeast-1a</span>
              </div>
              <div className={styles.propRow}>
                <span className={styles.propKey}>Auto Scaling</span>
                <span className={styles.propValue}>有効 (min:1 max:3)</span>
              </div>
            </div>
          </div>

          {onRemoveResource && (
            <button
              onClick={() => onRemoveResource(selectedResource.id)}
              className={styles.deleteBtn}
            >
              リソースを撤去
            </button>
          )}
        </>
      ) : selectedTile !== null ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
          <strong>未開拓の区画 (Tile #{selectedTile})</strong>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>
            左側のパレットからAWSリソースを選択して、この土地にリソースを配置できます。
          </p>
        </div>
      ) : (
        <div className={styles.emptyState}>
          グリッド上の土地やリソースをクリックすると詳細情報が表示されます。
        </div>
      )}
    </aside>
  );
}

export default Inspector;

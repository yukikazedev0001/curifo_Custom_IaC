import styles from './Inspector.module.css';
import type { PlacedResource } from './IsometricGrid';

interface InspectorProps {
  selectedResource: PlacedResource | null;
  selectedTile: number | null;
  connections?: import('./IsometricGrid').ResourceConnection[];
  allResources?: PlacedResource[];
  onRemoveResource?: (id: string) => void;
}

function Inspector({
  selectedResource,
  selectedTile,
  connections = [],
  allResources = [],
  onRemoveResource,
}: InspectorProps) {
  // サーバーレスSPAリソースごとの詳細パラメータ定義
  const getResourceDetails = (resource: PlacedResource) => {
    switch (resource.type) {
      case 's3':
        return {
          category: 'SPA 静的配信ストレージ',
          cost: '$0.50 / 月',
          props: [
            { key: '静的ウェブサイト', val: '有効 (index.html)' },
            { key: 'パブリックアクセス', val: 'OAC (CloudFront経由限定)' },
            { key: 'バージョニング', val: '有効' },
          ],
        };
      case 'cloudfront':
        return {
          category: 'グローバルCDN・エッジ配信',
          cost: '$1.20 / 月',
          props: [
            { key: 'オリジン', val: 'S3 + API Gateway' },
            { key: 'キャッシュポリシー', val: 'CachingOptimized' },
            { key: 'SSL/TLS', val: 'ACM証明書 (HTTPS)' },
          ],
        };
      case 'apigateway':
        return {
          category: 'API 管理・ルーティング',
          cost: '$1.00 / 月',
          props: [
            { key: 'APIプロトコル', val: 'HTTP API (v2)' },
            { key: '統合バックエンド', val: 'Lambda Proxy' },
            { key: 'CORS設定', val: '許可 (*)' },
          ],
        };
      case 'lambda':
        return {
          category: 'サーバーレス関数 (APIロジック)',
          cost: '$0.20 / 月 (従量課金)',
          props: [
            { key: 'ランタイム', val: 'Node.js 20.x' },
            { key: 'メモリ割当', val: '256 MB' },
            { key: 'タイムアウト', val: '10 秒' },
          ],
        };
      case 'dynamodb':
        return {
          category: 'NoSQL データベース',
          cost: '$0.00 / 月 (無料枠内)',
          props: [
            { key: '課金モード', val: 'オンデマンド (PAY_PER_REQUEST)' },
            { key: '主キー (PK)', val: 'id (String)' },
            { key: 'Point-in-Time Recovery', val: '有効' },
          ],
        };
      case 'cognito':
        return {
          category: 'ユーザー認証・JWT発行',
          cost: '$0.00 / 月 (5万MAU無料)',
          props: [
            { key: 'サインイン形式', val: 'メールアドレス' },
            { key: 'トークン有効期限', val: '60分 (JWT)' },
            { key: 'OAuth 2.0フロー', val: 'PKCE Authorization Code' },
          ],
        };
      default:
        return {
          category: 'クラウドインフラ',
          cost: '$5.00 / 月',
          props: [{ key: 'スペック', val: 'Standard' }],
        };
    }
  };

  const details = selectedResource ? getResourceDetails(selectedResource) : null;

  return (
    <aside className={styles.inspector}>
      <div className={styles.panelTitle}>プロパティ・構成情報</div>

      {selectedResource && details ? (
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
                <span className={styles.propKey}>役割</span>
                <span className={styles.propValue} style={{ fontSize: '10px' }}>{details.category}</span>
              </div>
              <div className={styles.propRow}>
                <span className={styles.propKey}>グリッド座標</span>
                <span className={styles.propValue}>Tile #{selectedResource.tileIndex}</span>
              </div>
              <div className={styles.propRow}>
                <span className={styles.propKey}>ステータス</span>
                <span className={styles.propValue} style={{ color: 'var(--accent-mint)' }}>● 稼働中 (Ready)</span>
              </div>
              <div className={styles.propRow}>
                <span className={styles.propKey}>推定月額コスト</span>
                <span className={styles.propValue}>{details.cost}</span>
              </div>
            </div>
          </div>

          <div className={styles.inspectorSection}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              IaC / 設定パラメーター
            </span>
            <div className={styles.inspectorCard}>
              {details.props.map((p, idx) => (
                <div key={idx} className={styles.propRow}>
                  <span className={styles.propKey}>{p.key}</span>
                  <span className={styles.propValue}>{p.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 接続ライン（コネクション）一覧 */}
          <div className={styles.section}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              接続ライン ({connections.filter(c => c.from === selectedResource.id || c.to === selectedResource.id).length}本)
            </span>
            <div className={styles.inspectorCard}>
              {connections.filter(c => c.from === selectedResource.id || c.to === selectedResource.id).length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  接続されているラインはありません
                </div>
              ) : (
                connections
                  .filter((c) => c.from === selectedResource.id || c.to === selectedResource.id)
                  .map((c) => {
                    const isOutbound = c.from === selectedResource.id;
                    const targetId = isOutbound ? c.to : c.from;
                    const targetRes = allResources.find((r) => r.id === targetId);
                    return (
                      <div key={c.id} className={styles.propRow}>
                        <span className={styles.propKey}>
                          {isOutbound ? '▶ 送出先' : '◀ 呼出元'}
                        </span>
                        <span className={styles.propValue} style={{ color: 'var(--accent-mint)', fontWeight: 600 }}>
                          {targetRes?.name ?? targetId}
                          {c.label && <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginLeft: '4px' }}>({c.label})</span>}
                        </span>
                      </div>
                    );
                  })
              )}
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
            左側のパレットからCloudFront、S3、Lambda、DynamoDBなどのサーバーレスリソースを選択して配置できます。
          </p>
        </div>
      ) : (
        <div className={styles.emptyState}>
          グリッド上の土地やサーバーレスラックをクリックすると詳細情報が表示されます。
        </div>
      )}
    </aside>
  );
}

export default Inspector;

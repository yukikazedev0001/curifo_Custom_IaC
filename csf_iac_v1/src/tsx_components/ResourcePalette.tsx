import styles from './ResourcePalette.module.css';

export type ServerlessResourceType =
  | 's3'
  | 'cloudfront'
  | 'apigateway'
  | 'lambda'
  | 'dynamodb'
  | 'cognito';

interface ResourceItem {
  id: ServerlessResourceType;
  name: string;
  desc: string;
  iconClass: string;
  label: string;
}

const SERVERLESS_SPA_RESOURCES: ResourceItem[] = [
  { id: 's3', name: 'S3 Bucket', desc: 'SPA静的ホスティング', iconClass: styles.iconS3, label: 'S3' },
  { id: 'cloudfront', name: 'CloudFront', desc: 'CDN・エッジ配信', iconClass: styles.iconCloudfront, label: 'CDN' },
  { id: 'apigateway', name: 'API Gateway', desc: 'REST / HTTP API', iconClass: styles.iconApigateway, label: 'API' },
  { id: 'lambda', name: 'Lambda Function', desc: 'APIビジネスロジック', iconClass: styles.iconLambda, label: 'λ' },
  { id: 'dynamodb', name: 'DynamoDB', desc: 'NoSQLデータベース', iconClass: styles.iconDynamodb, label: 'DDB' },
  { id: 'cognito', name: 'Cognito', desc: 'ユーザー認証・JWT', iconClass: styles.iconCognito, label: 'AUTH' },
];

interface ResourcePaletteProps {
  selectedTool: string | null;
  onSelectTool: (id: string) => void;
}

function ResourcePalette({ selectedTool, onSelectTool }: ResourcePaletteProps) {
  return (
    <aside className={styles.palette}>
      <div className={styles.panelTitle}>サーバーレス SPA 建築</div>
      <div className={styles.resourceList}>
        {SERVERLESS_SPA_RESOURCES.map((r) => {
          const isSelected = selectedTool === r.id;
          return (
            <div
              key={r.id}
              className={`${styles.resourceCard} ${isSelected ? styles.resourceCardSelected : ''}`}
              onClick={() => onSelectTool(r.id)}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('newResourceType', r.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              title="クリック、またはグリッドの土地へドラッグ＆ドロップして配置"
            >
              <div className={`${styles.resourceIcon} ${r.iconClass}`}>{r.label}</div>
              <div className={styles.resourceInfo}>
                <span className={styles.resourceName}>{r.name}</span>
                <span className={styles.resourceDesc}>{r.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.guideBox}>
        💡 <strong>サーバーレスSPA構成:</strong><br />
        CloudFront + S3 で画面配信、API Gateway + Lambda + DynamoDB でバックエンドを構築できます。
      </div>
    </aside>
  );
}

export default ResourcePalette;

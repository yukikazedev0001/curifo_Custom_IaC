import styles from './ResourcePalette.module.css';

interface ResourceItem {
  id: string;
  name: string;
  desc: string;
  iconClass: string;
  label: string;
}

const RESOURCES: ResourceItem[] = [
  { id: 'ec2', name: 'EC2 Instance', desc: '仮想サーバー', iconClass: styles.iconEc2, label: 'EC2' },
  { id: 'lambda', name: 'Lambda', desc: 'サーバーレス関数', iconClass: styles.iconLambda, label: 'λ' },
  { id: 'rds', name: 'RDS Database', desc: 'リレーショナルDB', iconClass: styles.iconRds, label: 'DB' },
  { id: 's3', name: 'S3 Bucket', desc: 'オブジェクトストレージ', iconClass: styles.iconS3, label: 'S3' },
];

interface ResourcePaletteProps {
  selectedTool: string | null;
  onSelectTool: (id: string) => void;
}

function ResourcePalette({ selectedTool, onSelectTool }: ResourcePaletteProps) {
  return (
    <aside className={styles.palette}>
      <div className={styles.panelTitle}>AWS リソース建築</div>
      <div className={styles.resourceList}>
        {RESOURCES.map((r) => {
          const isSelected = selectedTool === r.id;
          return (
            <div
              key={r.id}
              className={`${styles.resourceCard} ${isSelected ? styles.resourceCardSelected : ''}`}
              onClick={() => onSelectTool(r.id)}
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
        💡 <strong>操作方法:</strong><br />
        リソースを選択してグリッドの土地をクリックすると配置できます。
      </div>
    </aside>
  );
}

export default ResourcePalette;

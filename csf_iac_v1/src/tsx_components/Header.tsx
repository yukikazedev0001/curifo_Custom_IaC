import styles from './Header.module.css';

interface HeaderProps {
  resourceCount: number;
  connectionCount?: number;
  onViewJson?: () => void;
  onDeploy?: () => void;
}

function Header({ resourceCount, connectionCount = 0, onViewJson, onDeploy }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logoIcon}>
          <img src="/favicon.svg" alt="Curifo Logo" className={styles.logoImg} />
        </div>
        <div className={styles.title}>Curifo Custom IaC</div>
        <span className={styles.subtitle}>サーバーレスSPA 仮想DC v0.2</span>
      </div>

      <div className={styles.actions}>
        <div className={styles.statusBadge}>
          <span className={styles.statusDot}></span>
          <span>リソース: {resourceCount}基 稼働中</span>
          {connectionCount > 0 && (
            <span style={{ marginLeft: '6px', color: 'var(--text-muted)' }}>
              ({connectionCount}ライン接続)
            </span>
          )}
        </div>
        <button className={styles.btnSecondary} onClick={onViewJson} title="CustomIaC JSON の確認・保存・インポート">
          構成JSON (入出力)
        </button>
        <button className={styles.btnPrimary} onClick={onDeploy} title="司令塔LambdaへJSONを送信してAWS SDKで即時デプロイ">
          即時デプロイ (SDK)
        </button>
      </div>
    </header>
  );
}

export default Header;

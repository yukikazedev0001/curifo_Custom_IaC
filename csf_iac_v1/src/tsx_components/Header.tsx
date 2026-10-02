import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logoIcon}>C</div>
        <div className={styles.title}>Curifo Custom IaC</div>
        <span className={styles.subtitle}>クラウド土地マップ v0.1</span>
      </div>

      <div className={styles.actions}>
        <div className={styles.statusBadge}>
          <span className={styles.statusDot}></span>
          <span>リソース: 3基 稼働中</span>
        </div>
        <button className={styles.btnSecondary}>Terraform 出力</button>
        <button className={styles.btnPrimary}>変更を適用</button>
      </div>
    </header>
  );
}

export default Header;

import styles from './ServerRack.module.css';

interface ServerRackProps {
  type: 'ec2' | 'lambda' | 'rds' | 's3';
  name: string;
}

function ServerRack({ type, name }: ServerRackProps) {
  // リソースごとの高さ（タイルから上に伸ばすZ距離）とスロット数
  const config = {
    ec2: {
      height: 64, // 64px 押し出し
      slots: 4,
      label: 'EC2',
    },
    lambda: {
      height: 40, // 40px 押し出し（低め）
      slots: 2,
      label: 'λ',
    },
    rds: {
      height: 80, // 80px 押し出し（高め）
      slots: 5,
      label: 'RDS',
    },
    s3: {
      height: 52, // 52px 押し出し
      slots: 3,
      label: 'S3',
    },
  }[type];

  const h = config.height;

  return (
    <div className={styles.rackContainer} title={name}>
      {/* 1. 天面 (Top Face): タイルの真上 Z={h}px に平行移動 */}
      <div
        className={`${styles.face} ${styles.faceTop}`}
        style={{ transform: `translateZ(${h}px)` }}
      >
        <span className={styles.topBadge}>{config.label}</span>
        <div className={styles.topStatus}>
          <span className={styles.statusDot}></span>
          <span>ONLINE</span>
        </div>
      </div>

      {/* 2. 手前側面 (Front Face): タイル手前辺から高さ h 分立ち上げる */}
      <div
        className={`${styles.face} ${styles.faceFront}`}
        style={{ height: `${h}px` }}
      >
        <div className={styles.slotList}>
          {Array.from({ length: config.slots }).map((_, i) => (
            <div key={i} className={styles.slotItem}>
              <div className={styles.slotVent}></div>
              <div
                className={styles.slotLed}
                style={{ animationDelay: `${i * 0.3}s` }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 右側面 (Right Face): タイル右辺から高さ h 分立ち上げる */}
      <div
        className={`${styles.face} ${styles.faceRight}`}
        style={{ width: `${h}px` }}
      >
        {Array.from({ length: Math.floor(h / 14) }).map((_, i) => (
          <div key={i} className={styles.sideGroove}></div>
        ))}
      </div>

      {/* 4. 左側面 (Left Face) */}
      <div
        className={`${styles.face} ${styles.faceLeft}`}
        style={{ width: `${h}px` }}
      >
        {Array.from({ length: Math.floor(h / 14) }).map((_, i) => (
          <div key={i} className={styles.sideGroove}></div>
        ))}
      </div>

      {/* 5. 奥面 (Back Face) */}
      <div
        className={`${styles.face} ${styles.faceBack}`}
        style={{ height: `${h}px` }}
      ></div>
    </div>
  );
}

export default ServerRack;

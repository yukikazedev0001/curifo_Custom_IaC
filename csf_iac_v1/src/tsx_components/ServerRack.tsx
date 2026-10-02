import styles from './ServerRack.module.css';
import type { ServerlessResourceType } from './ResourcePalette';

interface ServerRackProps {
  type: ServerlessResourceType;
  name: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

function ServerRack({ type, name, draggable, onDragStart, onDragEnd, isDragging }: ServerRackProps) {
  // サーバーレスSPAリソースごとの高さ（Z押し出し距離）、スロット数、ラベル
  const config = {
    s3: {
      height: 52, // 52px 押し出し
      slots: 3,
      label: 'S3',
    },
    cloudfront: {
      height: 76, // 76px 押し出し（エッジ配信タワー）
      slots: 5,
      label: 'CDN',
    },
    apigateway: {
      height: 60, // 60px 押し出し（APIルーター）
      slots: 4,
      label: 'API',
    },
    lambda: {
      height: 42, // 42px 押し出し（軽量ファンクション）
      slots: 2,
      label: 'λ',
    },
    dynamodb: {
      height: 82, // 82px 押し出し（大容量NoSQLタワー）
      slots: 5,
      label: 'DDB',
    },
    cognito: {
      height: 50, // 50px 押し出し（認証ゲート）
      slots: 3,
      label: 'AUTH',
    },
    // フォールバック
    ec2: { height: 64, slots: 4, label: 'EC2' },
    rds: { height: 80, slots: 5, label: 'RDS' },
  }[type] || { height: 50, slots: 3, label: type.toUpperCase() };

  const h = config.height;

  return (
    <div
      className={styles.rackContainer}
      title={`${name} (ドラッグして移動可能)`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        opacity: isDragging ? 0.35 : 1,
      }}
    >
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

      {/* 2. 手前右側面 (Front Face): タイル手前辺 Y=76 から上空 +Z へ直立 */}
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

      {/* 3. 奥右面 (Right Face) */}
      <div
        className={`${styles.face} ${styles.faceRight}`}
        style={{ width: `${h}px` }}
      >
        {Array.from({ length: Math.floor(h / 14) }).map((_, i) => (
          <div key={i} className={styles.sideGroove}></div>
        ))}
      </div>

      {/* 4. 手前左側面 (Left Face): タイル左辺 X=0 から上空 +Z へ直立 */}
      <div
        className={`${styles.face} ${styles.faceLeft}`}
        style={{ width: `${h}px` }}
      >
        {Array.from({ length: Math.floor(h / 14) }).map((_, i) => (
          <div key={i} className={styles.sideGroove}></div>
        ))}
      </div>

      {/* 5. 奥左面 (Back Face) */}
      <div
        className={`${styles.face} ${styles.faceBack}`}
        style={{ height: `${h}px` }}
      ></div>
    </div>
  );
}

export default ServerRack;

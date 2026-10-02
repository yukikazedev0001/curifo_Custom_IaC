import { useState } from 'react';
import styles from './JsonModal.module.css';
import { curifoLivePreset, type CustomIaCPayload } from '../data/curifoPreset';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonData: object;
  onImport?: (payload: CustomIaCPayload) => void;
}

function JsonModal({ isOpen, onClose, jsonData, onImport }: JsonModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importJsonText, setImportJsonText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(jsonData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    alert('構成JSONをクリップボードにコピーしました！');
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curifo-custom-iac-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Curifo実環境プリセットの読み込み
  const handleLoadCurifoPreset = () => {
    setImportJsonText(JSON.stringify(curifoLivePreset, null, 2));
    setErrorMessage(null);
    setSuccessMessage('東京リージョンのCurifo本番構成（SPA・Lambda・DynamoDB等）をセットしました。「グリッドへ反映」を押してください。');
  };

  // ファイルからの読み込み
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      setErrorMessage(null);
      setSuccessMessage(`ファイル「${file.name}」を読み込みました。`);
    };
    reader.readAsText(file);
  };

  // インポート実行
  const handleApplyImport = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!importJsonText.trim()) {
      setErrorMessage('JSONデータを入力するか、ファイルを選択してください。');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);

      // 基本バリデーション
      if (!parsed.resources || !Array.isArray(parsed.resources)) {
        throw new Error('無効なフォーマットです。"resources" 配列が見つかりません。');
      }

      for (const res of parsed.resources) {
        if (typeof res.tileIndex !== 'number' || !res.type || !res.id) {
          throw new Error(`リソース定義が不正です: id=${res.id}`);
        }
      }

      if (onImport) {
        onImport({
          version: parsed.version || '1.0',
          architectureType: parsed.architectureType || 'serverless-spa',
          projectName: parsed.projectName || 'Imported-Project',
          targetRegion: parsed.targetRegion || 'ap-northeast-1',
          timestamp: new Date().toISOString(),
          resources: parsed.resources,
          connections: parsed.connections || [],
        });
      }

      alert('CustomIaC JSONのインポートが完了し、グリッドとライン接続が反映されました！');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'JSONの解析に失敗しました。書式をご確認ください。');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.titleArea}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/favicon.svg" alt="logo" style={{ width: '22px', height: '22px' }} />
              <span className={styles.badge}>Curifo IaC Protocol v1.0</span>
            </div>
            <h3 className={styles.title}>
              {activeTab === 'export' ? 'CustomIaC JSON エクスポート / プレビュー' : 'CustomIaC JSON インポート'}
            </h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* タブナビゲーション */}
        <div className={styles.tabBar}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'export' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('export'); setErrorMessage(null); setSuccessMessage(null); }}
          >
            📋 エクスポート (確認・保存)
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'import' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('import'); setErrorMessage(null); setSuccessMessage(null); }}
          >
            📥 インポート (復元・プリセット)
          </button>
        </div>

        {activeTab === 'export' ? (
          <>
            <p className={styles.description}>
              現在のグリッド配置とリソース間接続ライン（Connections）を含む CustomIaC JSON です。
              司令塔Lambdaへ送信するか、保存して後からインポートできます。
            </p>

            <div className={styles.codeContainer}>
              <pre className={styles.codeBlock}>{jsonString}</pre>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.copyBtn} onClick={handleDownload} title="JSONファイルとしてローカル保存">
                💾 ファイル保存
              </button>
              <button className={styles.copyBtn} onClick={handleCopy}>
                クリップボードにコピー
              </button>
              <button className={styles.doneBtn} onClick={onClose}>
                閉じる
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.importControls}>
              <button className={styles.presetBtn} onClick={handleLoadCurifoPreset} title="先ほど分析した東京リージョンのCurifo全構成を一括セット">
                🏛️ 東京Curifo本番構成をセット
              </button>

              <label className={styles.fileInputLabel}>
                📁 JSONファイルを選択
                <input
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <textarea
              className={styles.importTextarea}
              placeholder="ここに CustomIaC JSON を貼り付けるか、上のボタンからファイル/プリセットを読み込んでください..."
              value={importJsonText}
              onChange={(e) => {
                setImportJsonText(e.target.value);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
            />

            {errorMessage && (
              <div className={styles.errorBanner}>
                ⚠️ {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className={styles.successBanner}>
                ✓ {successMessage}
              </div>
            )}

            <div className={styles.modalFooter}>
              <button className={styles.copyBtn} onClick={onClose}>
                キャンセル
              </button>
              <button className={styles.doneBtn} onClick={handleApplyImport}>
                グリッドへ反映
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default JsonModal;


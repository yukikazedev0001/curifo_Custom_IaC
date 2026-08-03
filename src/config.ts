import * as fs from 'fs';
import * as path from 'path';

export interface AppConfig {
  region: string;
}

const CONFIG_PATH = path.join(__dirname, '../local_storage/config.json');

const DEFAULT_CONFIG: AppConfig = {
  region: process.env.AWS_REGION || 'ap-northeast-1',
};

/**
 * 設定ファイルを読み込みます。
 * 設定ファイルが存在しない場合はデフォルト設定を作成・保存します。
 */
export function loadConfig(): AppConfig {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      saveConfig(DEFAULT_CONFIG);
      return { ...DEFAULT_CONFIG };
    }
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      region: parsed.region || DEFAULT_CONFIG.region,
    };
  } catch (error) {
    console.error("設定ファイルの読み込みに失敗しました。デフォルト設定を使用します:", error);
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * 設定ファイルに書き込みます。
 */
export function saveConfig(config: AppConfig): void {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error("設定ファイルの保存に失敗しました:", error);
  }
}

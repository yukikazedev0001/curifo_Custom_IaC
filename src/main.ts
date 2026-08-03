import * as readline from 'readline';
import { clearScreen, printHeader, printMenu, printStatusBox } from './renderer';
import { getAllS3Buckets } from './get_resource';
import { loadConfig, saveConfig } from './config';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let config = loadConfig();
let statusMessage = `Curifo Custom IaC CLI が起動しました。現在のリージョン: ${config.region}`;

/**
 * 画面全体（ロゴヘッダー ＋ メニュー ＋ ステータス）を描画
 */
function renderApp(): void {
  clearScreen();
  printHeader();
  printStatusBox("現在のアクティビティ", statusMessage);
  printMenu(config.region);
}

/**
 * インタラクティブ入力ループ
 */
function promptUser(): void {
  renderApp();
  rl.question('> コマンドを入力してください: ', async (answer) => {
    const command = answer.trim().toLowerCase();

    switch (command) {
      case '1':
        statusMessage = `S3 バケット一覧を取得中... (指定リージョン: ${config.region})`;
        renderApp();
        try {
          const allBuckets = await getAllS3Buckets({ region: config.region });
          const targetBuckets = allBuckets.filter((b) => b.Location === config.region);

          if (allBuckets.length === 0) {
            statusMessage = `取得完了: AWS アカウント内に S3 バケットは見つかりませんでした。`;
          } else if (targetBuckets.length === 0) {
            statusMessage = `取得完了: アカウント全体で ${allBuckets.length} 件のバケットが見つかりましたが、指定リージョン [${config.region}] のバケットはありませんでした。`;
          } else {
            const bucketList = targetBuckets
              .map(
                (b, i) =>
                  `  [${i + 1}] ${b.Name}\n      ARN: ${b.ARN}\n      リージョン: ${b.Location} | 作成日: ${
                    b.CreationDate ? b.CreationDate.toLocaleDateString() : '不明'
                  }`
              )
              .join('\n');
            statusMessage = `取得完了: 指定リージョン [${config.region}] の S3 バケット (${targetBuckets.length} / 全${allBuckets.length} 件):\n${bucketList}`;
          }
        } catch (error: any) {
          statusMessage = `S3 バケット一覧取得に失敗しました (${config.region}): ${error.message || error}`;
        }
        promptUser();
        break;

      case '2':
        statusMessage = `システム稼働中 | Node.js ${process.version} | プラットフォーム: ${process.platform} | リージョン: ${config.region}`;
        promptUser();
        break;

      case '3':
        renderApp();
        rl.question(`> 新しい AWS リージョンを入力してください (現在: ${config.region}): `, (newRegion) => {
          const trimmedRegion = newRegion.trim();
          if (trimmedRegion) {
            config.region = trimmedRegion;
            saveConfig(config);
            statusMessage = `AWS リージョンを "${trimmedRegion}" に変更し config に保存しました。次回以降の起動でも適用されます。`;
          } else {
            statusMessage = "リージョン変更をキャンセルしました。";
          }
          promptUser();
        });
        return;

      case '4':
        statusMessage = "画面をリフレッシュしました。";
        promptUser();
        break;

      case 'q':
      case 'exit':
      case 'quit':
        clearScreen();
        console.log("Curifo Custom IaC CLI を終了しました。ご利用ありがとうございました！");
        rl.close();
        process.exit(0);
        break;

      default:
        statusMessage = `無効なコマンドです: "${answer}"。1, 2, 3, 4, または q を入力してください。`;
        promptUser();
        break;
    }
  });
}

// アプリの起動
promptUser();
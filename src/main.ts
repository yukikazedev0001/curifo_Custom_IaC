import * as readline from 'readline';
import { clearScreen, printHeader, printMenu, printStatusBox } from './renderer';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let statusMessage = "Curifo Custom IaC CLI が起動しました。操作を選択してください。";

/**
 * 画面全体（ロゴヘッダー ＋ メニュー ＋ ステータス）を描画
 */
function renderApp(): void {
  clearScreen();
  printHeader();
  printStatusBox("現在のアクティビティ", statusMessage);
  printMenu();
}

/**
 * インタラクティブ入力ループ
 */
function promptUser(): void {
  renderApp();
  rl.question('> コマンドを入力してください: ', (answer) => {
    const command = answer.trim().toLowerCase();

    switch (command) {
      case '1':
        statusMessage = "S3 バケット一覧取得のリクエストを実行しました (AWS SDK 連携準備完了)";
        promptUser();
        break;
      case '2':
        statusMessage = `システム稼働中 | Node.js ${process.version} | プラットフォーム: ${process.platform}`;
        promptUser();
        break;
      case '3':
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
        statusMessage = `無効なコマンドです: "${answer}"。1, 2, 3, または q を入力してください。`;
        promptUser();
        break;
    }
  });
}

// アプリの起動
promptUser();
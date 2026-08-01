// ANSI カラーおよび画面制御コード
const cyan = '\x1b[36m';
const brightCyan = '\x1b[96m';
const yellow = '\x1b[33m';
const green = '\x1b[32m';
const red = '\x1b[31m';
const reset = '\x1b[0m';
const bold = '\x1b[1m';

/**
 * 画面をクリアしてカーソルを最上部に移動します
 */
export function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[0;0H');
}

/**
 * Curifo Custom IaC の高解像度 ASCII アートロゴと固定ヘッダーを表示します
 */
export function printHeader(): void {
  const logo = `
${brightCyan}${bold}
  ██████╗██╗   ██╗██████╗ ██╗███████╗██╗██████╗ 
 ██╔════╝██║   ██║██╔══██╗██║██╔════╝██║██╔══██╗
 ██║     ██║   ██║██████╔╝██║█████╗  ██║██║  ██║
 ██║     ██║   ██║██╔══██╗██║██╔══╝  ██║██║  ██║
 ╚██████╗╚██████╔╝██║  ██║██║██║     ██║██████╔╝
  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚═════╝ 

 ██████╗██╗███████╗████████╗██████╗ ███╗   ███╗  ██╗██████╗  ██████╗ 
██╔════╝██║██╔════╝╚══██╔══╝██╔══██╗████╗ ████║  ██║██╔══██╗██╔════╝ 
██║     ██║███████╗   ██║   ██║  ██║██╔████╔██║  ██║██████╔╝██║      
██║     ██║╚════██║   ██║   ██║  ██║██║╚██╔╝██║  ██║██╔══██╗██║      
╚██████╗██║███████║   ██║   ██████╔╝██║ ╚═╝ ██║  ██║██║  ██║╚██████╗ 
 ╚═════╝╚═╝╚══════╝   ╚═╝   ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝${reset}
`;

  const border = `${yellow}=========================================================================================${reset}`;

  console.log(logo);
  console.log(border);
  console.log(`  ${bold}${green}🚀 Curifo Custom IaC CLI Interactive Dashboard v1.0.0${reset}`);
  console.log(border);
  console.log();
}

/**
 * メイン操作メニューを描画します
 */
export function printMenu(): void {
  console.log(`${bold}操作メニューを選択してください:${reset}`);
  console.log(`  ${cyan}[1]${reset} S3 バケット一覧を取得 (AWS SDK)`);
  console.log(`  ${cyan}[2]${reset} システムステータスを確認`);
  console.log(`  ${cyan}[3]${reset} 画面をクリアして再描画`);
  console.log(`  ${red}[q]${reset} アプリを終了`);
  console.log();
}

/**
 * メッセージを枠付きで表示します
 */
export function printStatusBox(title: string, message: string): void {
  const boxBorder = `${cyan}+---------------------------------------------------------------------------------------+${reset}`;
  console.log(boxBorder);
  console.log(`| ${bold}${title}${reset}`);
  console.log(`| ${message}`);
  console.log(boxBorder);
  console.log();
}

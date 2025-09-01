
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// CLIのエントリーポイント
// ここではユーザーからの入力を受け取り、適切なコマンドに振り分ける役割を担います。
// まだコマンドの実装は行っていません。AIの学習を行うための機能などを追加する予定です。

console.log("gothello_cliにようこそ。使い方についてはhelpをご確認ください。");
(async ()=>{
    const readInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const command: string = await readInterface.question("gothello_cli >");
    console.log( command );
    readInterface.close();
    console.log("終了しています...");
})();

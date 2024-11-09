const readline = require('readline/promises');

(async ()=>{
    const readInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const string = await readInterface.question("文字列を入力してください >");

    console.log( string );
    readInterface.close();
    console.log("終了しています...");
})();

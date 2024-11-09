# Gothello_web
### Webアプリを起動するとき  
Dockerの環境を構築した上で以下コマンド実行。  
サーバーが起動します。
```
(cd .docker/gothello-web/ && docker-compose up)
```
http://127.0.0.1:8080/ にアクセスで開きます。
Ctrl+Cで終了します。

### nodeでCLIアプリを起動するとき
Dockerの環境を構築した上で以下コマンド実行。  
3秒ほどあとにCLIツールが起動します。
``` 
(cd .docker/gothello-cli/ && docker-compose up) & sleep 3; docker exec -it gothello_cli node main.js; docker stop gothello_cli
```
CLIツールの操作については以下にヘルプを作成予定です。
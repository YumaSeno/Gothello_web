import { API } from "./apiCall.js"
import { Board } from "./board.js";
import { Player, OnlinePlayer } from "./player.js";
import { AIPlayer } from "./aiPlayer.js";

const OPERATION_ELEMENT = {
    readyElement(){
        document.getElementById("main_outer").style.display = "none";
        document.getElementById("cancel_button").style.display = "block";
        document.getElementById("board").style.display = "flex";
        document.getElementById("player_name").style.display = "flex";
    }, 
    undoElement(){
        document.getElementById("player_name").style.display = "none";
        document.getElementById("board").style.display = "none";
        document.getElementById("cancel_button").style.display = "none";
        document.getElementById("main_outer").style.display = "block";
        document.getElementById("message").innerText = "";
        document.getElementById("message").style.display = "none";
        document.getElementById("cancel_button").removeEventListener("click", OPERATION_ELEMENT.undoElement);
    }, 
    onSettled(message){
        document.getElementById("message").innerText = message;
        document.getElementById("message").style.display = "flex";
        document.getElementById("cancel_button").addEventListener("click", OPERATION_ELEMENT.undoElement);
    },
}

export class _UnplaybleRoom{
    operablePlayers = [null];
    board = null;
    
    _gamestart(player1, player2, operablePlayers, onSettled){
        const _conced = ()=>{
            let currentPlayer = null;
            for (const player of this.operablePlayers) {if (this.board.isPlayerTurn(player)) currentPlayer = player;}

            if (!currentPlayer){
                alert("自分のターンにしか投了はできません");
                return;
            }

            if (! window.confirm("投了しますか？"))return;
    
            if (currentPlayer) currentPlayer.conced();
            removeButtonConcedEvent();
        }
        const removeButtonConcedEvent = ()=>document.getElementById("cancel_button").removeEventListener("click", _conced);
        document.getElementById("cancel_button").addEventListener("click", _conced);
        
        document.getElementById("player_name").innerText = player1.name;
        document.getElementById("player_name").className = "black";

        let isSettled = false;

        this.operablePlayers = operablePlayers;
        const pieceElements = this._boardElementInitialize();
        this.board = new Board(
            player1
            ,player2 
            ,(x, y) => {
                if(!isSettled){
                    document.getElementById("player_name").innerText = this.board.getTurnPlayer().name;
                    if(this.board.getTurnPlayer() == player1){
                        document.getElementById("player_name").className = "black";
                    }else{
                        document.getElementById("player_name").className = "white";
                    }
                }

                const board = this.board.getBoard();

                for(let _x = 0; _x < board.length; _x++){
                    const row = [];
                    for(let _y = 0; _y < board.length; _y++){
                        switch(board[_x][_y]){
                            case 0:
                                pieceElements[_x][_y].className = "piece ";
                            break;
                            case 1:
                                pieceElements[_x][_y].className = "piece black";
                            break;
                            case 2:
                                pieceElements[_x][_y].className = "piece white";
                            break;
                            case 3:
                                pieceElements[_x][_y].className = "piece black sole";
                            break;
                            case 4:
                                pieceElements[_x][_y].className = "piece white sole";
                            break;
                        }
                    }
                }
            }
            ,(player, message) => {
                removeButtonConcedEvent()
                isSettled = true;
                setTimeout(()=>{
                    onSettled(player, message);
                }, 100);
            }
        );
    }

    _boardElementInitialize(player1, player2){
        const pieceElements = [];
        const boardElement = document.getElementById("board");
        while (boardElement.firstChild) boardElement.removeChild(boardElement.firstChild);
        for(let x = 0; x < 9; x++){
            const rowElement = document.createElement("div");
            rowElement.className = "row";
            const rowSeparatorElement = document.createElement("div");
            rowSeparatorElement.className = "row_separator";
            const row = [];
            for(let y = 0; y < 9; y++){
                let separatorElement = document.createElement("div");
                separatorElement.className = "separator";
    
                const pieceElement = document.createElement("div");
                pieceElement.className = "piece";
                pieceElement.dataset.x = x;
                pieceElement.dataset.y = y;
                pieceElement.addEventListener("click", ()=>this._onPieceClicked(pieceElement));
                rowElement.appendChild(pieceElement);
                if (y < 8) rowElement.appendChild(separatorElement);
    
                row.push(pieceElement);
    
                separatorElement = document.createElement("div");
                separatorElement.className = "separator";
                rowSeparatorElement.appendChild(separatorElement);
                if (y < 8) rowSeparatorElement.appendChild(document.createElement("div"));
            }
            boardElement.appendChild(rowElement);
            if (x < 8) {
                boardElement.appendChild(rowSeparatorElement);
            }
            pieceElements.push(row);
        }
    
        return pieceElements;
    }
    
    _onPieceClicked(e){
        let currentPlayer = null;
        for (const player of this.operablePlayers) {if (this.board.isPlayerTurn(player)) currentPlayer = player;}
        if (currentPlayer) currentPlayer.placePiece(Number(e.dataset.x), Number(e.dataset.y));
    }
}

export class OfflineRoom extends _UnplaybleRoom {
    start(){
        OPERATION_ELEMENT.readyElement();
        const player1 = new Player("player1");
        const player2 = new Player("player2");
        this._gamestart(
            player1, 
            player2, 
            [player1, player2], 
            (winner) => OPERATION_ELEMENT.onSettled(`${winner.name} Win!`)
        );
    }
}

export class AIRoom extends _UnplaybleRoom {
    start(){
        OPERATION_ELEMENT.readyElement();
        const players = [new Player("あなた"), new AIPlayer(" AI ")]
        const playerNum = Math.floor(Math.random() * 2);
        const player1 = players[playerNum];
        const player2 = players[(playerNum + 1) % 2];
        this._gamestart(
            player1,
            player2,
            [players[0]],
            (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name == "あなた" ? "Win!" : "Lose..."}`)
        );
    }
}

export class OnlineRoom extends _UnplaybleRoom {
    roomCode = null;
    playerNum = null;
    playerCode = null;
    state = "waiting";
    stopMatching = null;

    startMatching(){
        const stopMatching = ()=>{
            this.state = "settled";
            API.call("stopMatching", {roomCode: this.roomCode, playerCode: this.playerCode, mode: "free"}, (response)=>{
                document.getElementById("main_outer").style.display = "block";
                document.getElementById("message").innerText = "";
                document.getElementById("message").style.display = "none";
            });
            document.getElementById("cancel_button").style.display = "none";
            document.getElementById("cancel_button").removeEventListener("click", stopMatching);
        }
        this.stopMatching = stopMatching;
        document.getElementById("cancel_button").addEventListener("click", stopMatching);
        document.getElementById("cancel_button").style.display = "block";
        document.getElementById("main_outer").style.display = "none";
        document.getElementById("message").innerText = "対戦相手を待っています";
        document.getElementById("message").style.display = "flex";
        API.call("startFreeRoom", {}, (response)=>{
            this.roomCode = response.room;
            this.playerNum = response.playerNum;
            this.playerCode = response.playerCode;
            this.checkRoomState()
        });
    }

    checkRoomState(){
        API.call("getRoomState", {roomCode: this.roomCode, playerCode: this.playerCode, mode: "free"}, (response)=>{
            if (this.state == "settled")return;

            if (response.state == "removed"){
                alert("接続が切れました。");
                location.reload();
            }
            if(this.state == "waiting" && response.state == "playing"){
                document.getElementById("message").style.display = "none";
                this._start();
            }
            this.state = response.state;

            document.getElementById("message").innerText = document.getElementById("message").innerText + ".";

            if (document.getElementById("message").innerText == "対戦相手を待っています....")
                document.getElementById("message").innerText = "対戦相手を待っています";

            setTimeout(()=>{
                this.checkRoomState();
            }, 2000);
        });
    }
    
    _start(){
        document.getElementById("cancel_button").removeEventListener("click", this.stopMatching);
        OPERATION_ELEMENT.readyElement();
        const players = [new Player("あなた"), new OnlinePlayer("相手", "free", this.roomCode, this.playerCode)]
        const player1 = players[this.playerNum - 1];
        const player2 = players[this.playerNum % 2];
        this._gamestart(
            player1, 
            player2, 
            [players[0]], 
            (winner, message) => {
                this.state = "settled";
                OPERATION_ELEMENT.onSettled(`You ${winner.name == "あなた" ? `Win! ${message}` : "Lose..."}`);
            }
        );
    }
}

export class PrivateOnlineRoom extends _UnplaybleRoom {
    roomCode = null;
    playerNum = null;
    playerCode = null;
    state = "waiting";
    stopMatching = null;

    createRoom(){
        const stopMatching = ()=>{
            this.state = "settled";
            API.call("stopMatching", {roomCode: this.roomCode, playerCode: this.playerCode, mode: "private"}, (response)=>{
                document.getElementById("main_outer").style.display = "block";
                document.getElementById("message").innerText = "";
                document.getElementById("message").style.display = "none";
            });
            document.getElementById("cancel_button").style.display = "none";
            document.getElementById("cancel_button").removeEventListener("click", stopMatching);
        }
        this.stopMatching = stopMatching;
        document.getElementById("cancel_button").addEventListener("click", stopMatching);
        document.getElementById("cancel_button").style.display = "block";
        document.getElementById("main_outer").style.display = "none";
        document.getElementById("message").style.display = "flex";
        document.getElementById("message").innerText = "ルーム作成中";
        API.call("createPrivateRoom", {}, (response)=>{
            this.roomCode = response.room;
            this.playerNum = response.playerNum;
            this.playerCode = response.playerCode;
            document.getElementById("message").innerText = `ルームコード：${this.roomCode}`;
            this.checkRoomState();
        });
    }

    joinRoom(roomCode){
        API.call("joinPrivateRoom", {roomCode: roomCode}, (response)=>{
            if(!response.joined){
                alert("ルームが存在しません");
                OPERATION_ELEMENT.undoElement();
            }else{
                this.roomCode = roomCode;
                this.playerNum = response.playerNum;
                this.playerCode = response.playerCode;
                document.getElementById("main_outer").style.display = "none";
                document.getElementById("message").style.display = "flex";
                document.getElementById("message").innerText = "参加中";
                this.checkRoomState();
            }
        });
    }

    checkRoomState(){
        API.call("getRoomState", {roomCode: this.roomCode, playerCode: this.playerCode, mode: "private"}, (response)=>{
            if (this.state == "settled")return;

            if (response.state == "removed"){
                alert("接続が切れました。");
                location.reload();
            }
            if(this.state == "waiting" && response.state == "playing"){
                document.getElementById("message").style.display = "none";
                this._start();
            }
            this.state = response.state;

            setTimeout(()=>{
                this.checkRoomState();
            }, 2000);
        });
    }
    
    _start(){
        if (this.stopMatching) document.getElementById("cancel_button").removeEventListener("click", this.stopMatching);
        OPERATION_ELEMENT.readyElement();
        const players = [new Player("あなた"), new OnlinePlayer("相手", "private", this.roomCode, this.playerCode)]
        const player1 = players[this.playerNum - 1];
        const player2 = players[this.playerNum % 2];
        this._gamestart(
            player1, 
            player2, 
            [players[0]], 
            (winner, message) => {
                this.state = "settled";
                OPERATION_ELEMENT.onSettled(`You ${winner.name == "あなた" ? `Win! ${message}` : "Lose..."}`);
            }
        );
    }
}
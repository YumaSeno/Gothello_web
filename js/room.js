import { API } from "./apiCall.js"
import { Board, PieceColor, PieceState, SettledReason } from "./board.js";
import { DummyPlayer, LocalPlayer, OnlinePlayer } from "./player.js";
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
    changeName(name, color){
        document.getElementById("player_name").innerText = name;
        document.getElementById("player_name").className = color;
    },
    onSettled(message){
        document.getElementById("message").innerText = message;
        document.getElementById("message").style.display = "flex";
        document.getElementById("cancel_button").addEventListener("click", OPERATION_ELEMENT.undoElement);
    },
}

export class _UnplaybleRoom{
    /**プレイヤーのインスタンスがPieceColorをキーにして詰められる */
    _players = [];

    /**ボードクラスのインスタンス */
    _board = null;

    /**ボードのDOM */
    _boardElement = null;

    /**駒のDOMをボードと同様に2次元配列に詰めたもの。上の_boardElementの下に同じDOMが入っているが、便宜上定義している。 */
    _pieceElements = null;

    _onSettled = (winner, settledReason) => OPERATION_ELEMENT.onSettled(`${winner.name()} Win!`)

    /**
     * ボードオブジェクトと盤面を表すDOMの生成が行われる。
     */
    constructor() {
        this._board = this._boardInitialize();
    }

    _startGame(player1, player2){
        this._players[PieceColor.Black] = player1;
        this._players[PieceColor.White] = player2;

        document.body.replaceChild(this._boardElement, document.getElementById("board"));
        OPERATION_ELEMENT.readyElement();
        OPERATION_ELEMENT.changeName(player1.name(), "black");
    }

    _boardInitialize(){
        this._pieceElements = this._boardElementInitialize();
        const board = new Board();
        board.addEventListnerOnPlacesPiece((x, y) => {
            if(!this._board.isSettled()){
                OPERATION_ELEMENT.changeName(this._players[this._board.getCurrentTurnColor()].name(), PieceColor.valueToName(this._board.getCurrentTurnColor()).toLowerCase());
            }

            const board = this._board.getBoardCopy();

            for(let _x = 0; _x < board.length; _x++){
                const row = [];
                for(let _y = 0; _y < board.length; _y++){
                    switch(board[_x][_y]){
                        case PieceState.Empty:
                            this._pieceElements[_x][_y].className = "piece ";
                        break;
                        case PieceState.Black:
                            this._pieceElements[_x][_y].className = "piece black";
                        break;
                        case PieceState.White:
                            this._pieceElements[_x][_y].className = "piece white";
                        break;
                        case PieceState.BlackSole:
                            this._pieceElements[_x][_y].className = "piece black sole";
                        break;
                        case PieceState.WhiteSole:
                            this._pieceElements[_x][_y].className = "piece white sole";
                        break;
                    }
                }
            }
            // TODO PlayerのplacedPieceを呼び出す
        });
        board.addEventListnerOnSettled((winnerPieceColor, message) => {
            this._onSettled(this._players[winnerPieceColor], message);
        });
        return board;
    }

    _boardElementInitialize(){
        const pieceElements = [];
        this._boardElement = document.createElement("div");
        this._boardElement.id = "board";
        while (this._boardElement.firstChild) this._boardElement.removeChild(this._boardElement.firstChild);
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
                rowElement.appendChild(pieceElement);
                if (y < 8) rowElement.appendChild(separatorElement);
    
                row.push(pieceElement);
    
                separatorElement = document.createElement("div");
                separatorElement.className = "separator";
                rowSeparatorElement.appendChild(separatorElement);
                if (y < 8) rowSeparatorElement.appendChild(document.createElement("div"));
            }
            this._boardElement.appendChild(rowElement);
            if (x < 8) {
                this._boardElement.appendChild(rowSeparatorElement);
            }
            pieceElements.push(row);
        }
    
        return pieceElements;
    }
}

export class OfflineRoom extends _UnplaybleRoom {
    start(){
        super._startGame(
            new LocalPlayer("player1", PieceColor.Black, this._board, this._pieceElements, document.getElementById("cancel_button")),
            new LocalPlayer("player2", PieceColor.White, this._board, this._pieceElements, document.getElementById("cancel_button"))
        );
    }
}

export class RundomAIRoom extends _UnplaybleRoom {
    start(){
        const playerNum = Math.floor(Math.random() * 2);
        const players = [
            new LocalPlayer("あなた", playerNum + 1, this._board, this._pieceElements, document.getElementById("cancel_button")),
            new DummyPlayer(" AI ", ((playerNum + 1) % 2) + 1, this._board)
        ];
        const player1 = players[playerNum];
        const player2 = players[(playerNum + 1) % 2];
        this._onSettled = (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name() == "あなた" ? "Win!" : "Lose..."}`);
        super._startGame(
            player1,
            player2,
        );
    }
}

export class AIRoom extends _UnplaybleRoom {
    start(){
        const playerNum = Math.floor(Math.random() * 2);
        const players = [
            new LocalPlayer("あなた", playerNum + 1, this._board, this._pieceElements, document.getElementById("cancel_button")),
            new AIPlayer(" AI ", ((playerNum + 1) % 2) + 1, this._board)
        ];
        const player1 = players[playerNum];
        const player2 = players[(playerNum + 1) % 2];
        this._onSettled = (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name() == "あなた" ? "Win!" : "Lose..."}`);
        super._startGame(
            player1,
            player2,
        );
    }
}

export class AIAIRoom extends _UnplaybleRoom {
    start(){
        super._startGame(
            new AIPlayer(" AI1 ", PieceColor.Black, this._board),
            new AIPlayer(" AI2 ", PieceColor.White, this._board)
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

            if (!this._board.isSettled()) {
                setTimeout(()=>{
                    this.checkRoomState();
                }, 2000);
            }
        });
    }
    
    _start(){
        document.getElementById("cancel_button").removeEventListener("click", this.stopMatching);
        const players = [
            new LocalPlayer("あなた", this.playerNum, this._board, this._pieceElements, document.getElementById("cancel_button")),
            new OnlinePlayer("相手", (this.playerNum % 2) + 1, this._board, "free", this.roomCode, this.playerCode)
        ];
        const player1 = players[this.playerNum - 1];
        const player2 = players[this.playerNum % 2];
        this._onSettled = (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name() == "あなた" ? "Win!" : "Lose..."}`);
        super._startGame(
            player1,
            player2,
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

            if (!this._board.isSettled()) {
                setTimeout(()=>{
                    this.checkRoomState();
                }, 2000);
            }
        });
    }
    
    _start(){
        document.getElementById("cancel_button").removeEventListener("click", this.stopMatching);
        const players = [
            new LocalPlayer("あなた", this.playerNum, this._board, this._pieceElements, document.getElementById("cancel_button")),
            new OnlinePlayer("相手", (this.playerNum % 2) + 1, this._board, "private", this.roomCode, this.playerCode)
        ];
        const player1 = players[this.playerNum - 1];
        const player2 = players[this.playerNum % 2];
        this._onSettled = (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name() == "あなた" ? "Win!" : "Lose..."}`);
        super._startGame(
            player1,
            player2,
        );
    }
}

import { API } from "./common/apiCall"
import { PieceColor, PieceState, SettledReason } from "./common/const";
import { Board } from "./board";
import { _PlayerInterface, DummyPlayer, WebAppControllablePlayer, OnlinePlayer } from "./player";
import { AIPlayer } from "./aiPlayer";
import { AIPlayerDeepQLearning } from "./aiPlayerDeepQLearning/aiPlayerDeepQLearning";

const OPERATION_ELEMENT = {
    readyElement(){
        (document.getElementById("main_outer") as HTMLElement).style.display = "none";
        (document.getElementById("cancel_button") as HTMLElement).style.display = "block";
        (document.getElementById("board") as HTMLElement).style.display = "flex";
        (document.getElementById("player_name") as HTMLElement).style.display = "flex";
    },
    undoElement(){
        (document.getElementById("player_name") as HTMLElement).style.display = "none";
        (document.getElementById("board") as HTMLElement).style.display = "none";
        (document.getElementById("cancel_button") as HTMLElement).style.display = "none";
        (document.getElementById("main_outer") as HTMLElement).style.display = "block";
        (document.getElementById("message") as HTMLElement).innerText = "";
        (document.getElementById("message") as HTMLElement).style.display = "none";
        (document.getElementById("cancel_button") as HTMLElement).removeEventListener("click", OPERATION_ELEMENT.undoElement);
    },
    changeName(name: string, color: string){
        (document.getElementById("player_name") as HTMLElement).innerText = name;
        (document.getElementById("player_name") as HTMLElement).className = color;
    },
    onSettled(message: string){
        (document.getElementById("message") as HTMLElement).innerText = message;
        (document.getElementById("message") as HTMLElement).style.display = "flex";
        (document.getElementById("cancel_button") as HTMLElement).addEventListener("click", OPERATION_ELEMENT.undoElement);
    },
}

export class _AbstractRoom{
    /**プレイヤーのインスタンスがPieceColorをキーにして詰められる */
    _players: _PlayerInterface[] = [];

    /**ボードクラスのインスタンス */
    _board: Board | null = null;

    /**ボードのDOM */
    _boardElement: HTMLElement | null = null;

    /**駒のDOMをボードと同様に2次元配列に詰めたもの。上の_boardElementの下に同じDOMが入っているが、便宜上定義している。 */
    _pieceElements: HTMLElement[][] | null = null;

    _onSettled = (winner: _PlayerInterface, settledReason: SettledReason) => OPERATION_ELEMENT.onSettled(`${winner.name} Win!`)

    /**
     * ボードオブジェクトと盤面を表すDOMの生成が行われる。
     */
    constructor() {
        this._board = this._boardInitialize();
    }

    _startGame(player1: _PlayerInterface, player2: _PlayerInterface){
        this._players[PieceColor.Black] = player1;
        this._players[PieceColor.White] = player2;

        document.body.replaceChild(this._boardElement!, document.getElementById("board")!);
        OPERATION_ELEMENT.readyElement();
        OPERATION_ELEMENT.changeName(player1.name, "black");
    }

    _boardInitialize(): Board{
        this._pieceElements = this._boardElementInitialize();
        const board = new Board();
        board.addEventListnerOnPlacesPiece((x, y) => {
            if(!this._board!.isSettled()){
                OPERATION_ELEMENT.changeName(this._players[this._board!.getCurrentTurnColor()].name, PieceColor[this._board!.getCurrentTurnColor()].toLowerCase());
            }

            const boardData = this._board!.getBoardCopy();

            for(let _x = 0; _x < boardData.length; _x++){
                const row = [];
                for(let _y = 0; _y < boardData.length; _y++){
                    switch(boardData[_x][_y]){
                        case PieceState.Empty:
                            this._pieceElements![_x][_y].className = "piece ";
                        break;
                        case PieceState.Black:
                            this._pieceElements![_x][_y].className = "piece black";
                        break;
                        case PieceState.White:
                            this._pieceElements![_x][_y].className = "piece white";
                        break;
                        case PieceState.BlackSole:
                            this._pieceElements![_x][_y].className = "piece black sole";
                        break;
                        case PieceState.WhiteSole:
                            this._pieceElements![_x][_y].className = "piece white sole";
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

    _boardElementInitialize(): HTMLElement[][]{
        const pieceElements: HTMLElement[][] = [];
        this._boardElement = document.createElement("div");
        this._boardElement.id = "board";
        while (this._boardElement.firstChild) this._boardElement.removeChild(this._boardElement.firstChild);
        for(let x = 0; x < 9; x++){
            const rowElement = document.createElement("div");
            rowElement.className = "row";
            const rowSeparatorElement = document.createElement("div");
            rowSeparatorElement.className = "row_separator";
            const row: HTMLElement[] = [];
            for(let y = 0; y < 9; y++){
                let separatorElement = document.createElement("div");
                separatorElement.className = "separator";
    
                const pieceElement = document.createElement("div");
                pieceElement.className = "piece";
                (pieceElement as HTMLElement).dataset.x = String(x);
                (pieceElement as HTMLElement).dataset.y = String(y);
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

export class OfflineRoom extends _AbstractRoom {
    start(){
        super._startGame(
            new WebAppControllablePlayer("player1", PieceColor.Black, this._board!, this._pieceElements!, document.getElementById("cancel_button")!),
            new WebAppControllablePlayer("player2", PieceColor.White, this._board!, this._pieceElements!, document.getElementById("cancel_button")!)
        );
    }
}

export class RundomAIRoom extends _AbstractRoom {
    start(){
        const playerNum = Math.floor(Math.random() * 2);
        const players = [
            new WebAppControllablePlayer("あなた", playerNum + 1, this._board!, this._pieceElements!, document.getElementById("cancel_button")!),
            new DummyPlayer(" AI ", ((playerNum + 1) % 2) + 1, this._board!)
        ];
        const player1 = players[playerNum];
        const player2 = players[(playerNum + 1) % 2];
        this._onSettled = (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name == "あなた" ? "Win!" : "Lose..."}`);
        super._startGame(
            player1,
            player2,
        );
    }
}

export class AIRoom extends _AbstractRoom {
    start(){
        const playerNum = Math.floor(Math.random() * 2);
        const players = [
            new WebAppControllablePlayer("あなた", playerNum + 1, this._board!, this._pieceElements!, document.getElementById("cancel_button")!),
            new AIPlayer(" AI ", ((playerNum + 1) % 2) + 1, this._board!)
        ];
        const player1 = players[playerNum];
        const player2 = players[(playerNum + 1) % 2];
        this._onSettled = (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name == "あなた" ? "Win!" : "Lose..."}`);
        super._startGame(
            player1,
            player2,
        );
    }
}

export class AIAIRoom extends _AbstractRoom {
    start(){
        super._startGame(
            new AIPlayer(" AI1 ", PieceColor.Black, this._board!),
            new AIPlayer(" AI2 ", PieceColor.White, this._board!)
        );
    }
}

export class DeepQLearningAIRoom extends _AbstractRoom {
    start(){
        const playerNum = Math.floor(Math.random() * 2);
        const aiPlayer = new AIPlayerDeepQLearning(" AI ", ((playerNum + 1) % 2) + 1, this._board!);
        aiPlayer.loadModel("../dqn-model");
        const players = [
            new WebAppControllablePlayer("あなた", playerNum + 1, this._board!, this._pieceElements!, document.getElementById("cancel_button")!),
            aiPlayer
        ];
        const player1 = players[playerNum];
        const player2 = players[(playerNum + 1) % 2];
        this._onSettled = (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name == "あなた" ? "Win!" : "Lose..."}`);
        super._startGame(
            player1,
            player2,
        );
    }
}

export class DeepQLearningAIAIRoom extends _AbstractRoom {
    start(){
        const aiPlayer1 = new AIPlayerDeepQLearning(" AI1 ", PieceColor.Black, this._board!);
        aiPlayer1.loadModel("../dqn-model");
        const aiPlayer2 = new AIPlayerDeepQLearning(" AI2 ", PieceColor.White, this._board!);
        aiPlayer1.loadModel("../dqn-model");
        super._startGame(
            aiPlayer1,
            aiPlayer2,
        );
    }
}

export class OnlineRoom extends _AbstractRoom {
    roomCode: string | null = null;
    playerNum: PieceColor | null = null;
    playerCode: string | null = null;
    state: string = "waiting";
    stopMatching: (() => void) | null = null;

    startMatching(){
        const stopMatching = ()=>{
            this.state = "settled";
            API.call("stopMatching", {roomCode: this.roomCode, playerCode: this.playerCode, mode: "free"}, (response: any)=>{
                (document.getElementById("main_outer") as HTMLElement).style.display = "block";
                (document.getElementById("message") as HTMLElement).innerText = "";
                (document.getElementById("message") as HTMLElement).style.display = "none";
            });
            (document.getElementById("cancel_button") as HTMLElement).style.display = "none";
            (document.getElementById("cancel_button") as HTMLElement).removeEventListener("click", stopMatching);
        }
        this.stopMatching = stopMatching;
        (document.getElementById("cancel_button") as HTMLElement).addEventListener("click", stopMatching);
        (document.getElementById("cancel_button") as HTMLElement).style.display = "block";
        (document.getElementById("main_outer") as HTMLElement).style.display = "none";
        (document.getElementById("message") as HTMLElement).innerText = "対戦相手を待っています";
        (document.getElementById("message") as HTMLElement).style.display = "flex";
        API.call("startFreeRoom", {}, (response: any)=>{
            this.roomCode = response.room;
            this.playerNum = response.playerNum;
            this.playerCode = response.playerCode;
            this.checkRoomState()
        });
    }

    checkRoomState(){
        API.call("getRoomState", {roomCode: this.roomCode, playerCode: this.playerCode, mode: "free"}, (response: any)=>{
            if (this.state == "settled")return;

            if (response.state == "removed"){
                alert("接続が切れました。");
                location.reload();
            }
            if(this.state == "waiting" && response.state == "playing"){
                (document.getElementById("message") as HTMLElement).style.display = "none";
                this._start();
            }
            this.state = response.state;

            (document.getElementById("message") as HTMLElement).innerText = (document.getElementById("message") as HTMLElement).innerText + ".";

            if ((document.getElementById("message") as HTMLElement).innerText == "対戦相手を待っています....")
                (document.getElementById("message") as HTMLElement).innerText = "対戦相手を待っています";

            if (!this._board!.isSettled()) {
                setTimeout(()=>{
                    this.checkRoomState();
                }, 2000);
            }
        });
    }
    
    _start(){
        (document.getElementById("cancel_button") as HTMLElement).removeEventListener("click", this.stopMatching!);
        const players = [
            new WebAppControllablePlayer("あなた", this.playerNum!, this._board!, this._pieceElements!, document.getElementById("cancel_button")!),
            new OnlinePlayer("相手", (this.playerNum! % 2) + 1, this._board!, "free", this.roomCode!, this.playerCode!)
        ];
        const player1 = players[this.playerNum! - 1];
        const player2 = players[this.playerNum! % 2];
        this._onSettled = (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name == "あなた" ? "Win!" : "Lose..."}`);
        super._startGame(
            player1,
            player2,
        );
    }
}

export class PrivateOnlineRoom extends _AbstractRoom {
    roomCode: string | null = null;
    playerNum: PieceColor | null = null;
    playerCode: string | null = null;
    state: string = "waiting";
    stopMatching: (() => void) | null = null;

    createRoom(){
        const stopMatching = ()=>{
            this.state = "settled";
            API.call("stopMatching", {roomCode: this.roomCode, playerCode: this.playerCode, mode: "private"}, (response: any)=>{
                (document.getElementById("main_outer") as HTMLElement).style.display = "block";
                (document.getElementById("message") as HTMLElement).innerText = "";
                (document.getElementById("message") as HTMLElement).style.display = "none";
            });
            (document.getElementById("cancel_button") as HTMLElement).style.display = "none";
            (document.getElementById("cancel_button") as HTMLElement).removeEventListener("click", stopMatching);
        }
        this.stopMatching = stopMatching;
        (document.getElementById("cancel_button") as HTMLElement).addEventListener("click", stopMatching);
        (document.getElementById("cancel_button") as HTMLElement).style.display = "block";
        (document.getElementById("main_outer") as HTMLElement).style.display = "none";
        (document.getElementById("message") as HTMLElement).style.display = "flex";
        (document.getElementById("message") as HTMLElement).innerText = "ルーム作成中";
        API.call("createPrivateRoom", {}, (response: any)=>{
            this.roomCode = response.room;
            this.playerNum = response.playerNum;
            this.playerCode = response.playerCode;
            (document.getElementById("message") as HTMLElement).innerText = `ルームコード：${this.roomCode}`;
            this.checkRoomState();
        });
    }

    joinRoom(roomCode: string){
        API.call("joinPrivateRoom", {roomCode: roomCode}, (response: any)=>{
            if(!response.joined){
                alert("ルームが存在しません");
                OPERATION_ELEMENT.undoElement();
            }else{
                this.roomCode = roomCode;
                this.playerNum = response.playerNum;
                this.playerCode = response.playerCode;
                (document.getElementById("main_outer") as HTMLElement).style.display = "none";
                (document.getElementById("message") as HTMLElement).style.display = "flex";
                (document.getElementById("message") as HTMLElement).innerText = "参加中";
                this.checkRoomState();
            }
        });
    }

    checkRoomState(){
        API.call("getRoomState", {roomCode: this.roomCode, playerCode: this.playerCode, mode: "private"}, (response: any)=>{
            if (this.state == "settled")return;

            if (response.state == "removed"){
                alert("接続が切れました。");
                location.reload();
            }
            if(this.state == "waiting" && response.state == "playing"){
                (document.getElementById("message") as HTMLElement).style.display = "none";
                this._start();
            }
            this.state = response.state;

            if (!this._board!.isSettled()) {
                setTimeout(()=>{
                    this.checkRoomState();
                }, 2000);
            }
        });
    }
    
    _start(){
        (document.getElementById("cancel_button") as HTMLElement).removeEventListener("click", this.stopMatching!);
        const players = [
            new WebAppControllablePlayer("あなた", this.playerNum!, this._board!, this._pieceElements!, document.getElementById("cancel_button")!),
            new OnlinePlayer("相手", (this.playerNum! % 2) + 1, this._board!, "private", this.roomCode!, this.playerCode!)
        ];
        const player1 = players[this.playerNum! - 1];
        const player2 = players[this.playerNum! % 2];
        this._onSettled = (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name == "あなた" ? "Win!" : "Lose..."}`);
        super._startGame(
            player1,
            player2,
        );
    }
}

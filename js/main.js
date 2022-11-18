'use strict';
import { Gothello } from "./gothello.js";
import { Player, DummyPlayer, OnlinePlayer } from "./player.js";
import { DrawablePiece } from "./drawablePiece.js";
import { API } from "./apiCall.js"

class Game{
    operablePlayers = [null];
    gothello = null;
    
    constructor(player1, player2, operablePlayers, onSettled){
        const _conced = ()=>{
            let currentPlayer = null;
            for (const player of this.operablePlayers) {if (this.gothello.isPlayerTurn(player)) currentPlayer = player;}

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

        this.operablePlayers = operablePlayers;
        this.gothello = this.gothelloInitialize(player1, player2);
        this.gothello.onSettled = player => {
            removeButtonConcedEvent()
            setTimeout(onSettled(player), 100);
        }
    }

    gothelloInitialize(player1, player2){
        const board = [];
        const boardElement = document.getElementById("board");
        while (boardElement.firstChild) boardElement.removeChild(boardElement.firstChild);
        for(let y = 0; y < 9; y++){
            const rowElement = document.createElement("div");
            rowElement.className = "row";
            const rowSeparatorElement = document.createElement("div");
            rowSeparatorElement.className = "row_separator";
            const row = [];
            for(let x = 0; x < 9; x++){
                let separatorElement = document.createElement("div");
                separatorElement.className = "separator";
    
                const pieceElement = document.createElement("div");
                pieceElement.className = "piece";
                pieceElement.dataset.x = x;
                pieceElement.dataset.y = y;
                pieceElement.addEventListener("click", ()=>this.onPieceClicked(pieceElement));
                rowElement.appendChild(pieceElement);
                if (x < 8) rowElement.appendChild(separatorElement);
    
                row.push(new DrawablePiece(x, y, pieceElement));
    
                separatorElement = document.createElement("div");
                separatorElement.className = "separator";
                rowSeparatorElement.appendChild(separatorElement);
                if (x < 8) rowSeparatorElement.appendChild(document.createElement("div"));
            }
            boardElement.appendChild(rowElement);
            if (y < 8) {
                boardElement.appendChild(rowSeparatorElement);
            }
            board.push(row);
        }
    
        return new Gothello(player1, player2, (x,y) => board[x][y]);
    }
    
    onPieceClicked(e){
        let currentPlayer = null;
        for (const player of this.operablePlayers) {if (this.gothello.isPlayerTurn(player)) currentPlayer = player;}
        if (currentPlayer) currentPlayer.placePiece(Number(e.dataset.x), Number(e.dataset.y));
    }
}

const OPERATION_ELEMENT = {
    readyElement(){
        document.getElementById("games_outer").style.display = "none";
        document.getElementById("cancel_button").style.display = "block";
        document.getElementById("board").style.display = "flex";
    }, 
    undoElement(){
        document.getElementById("board").style.display = "none";
        document.getElementById("cancel_button").style.display = "none";
        document.getElementById("games_outer").style.display = "block";
        document.getElementById("message").innerText = "";
        document.getElementById("message").style.display = "none";
        document.getElementById("cancel_button").removeEventListener("click", this.undoElement)
        
        location.reload();
    }, 
    onSettled(message){
        document.getElementById("message").innerText = message;
        document.getElementById("message").style.display = "flex";
        document.getElementById("cancel_button").addEventListener("click", this.undoElement);
    },
}

class OfflineRoom{
    start(){
        OPERATION_ELEMENT.readyElement();
        const player1 = new Player("player1");
        const player2 = new Player("player2");
        const game = new Game(
            player1, 
            player2, 
            [player1, player2], 
            (winner) => OPERATION_ELEMENT.onSettled(`${winner.name} Win!`)
        );
    }
}

class MonkeyRoom{
    start(){
        OPERATION_ELEMENT.readyElement();
        const player1 = new Player("You");
        const player2 = new DummyPlayer("Monkey");
        const game = new Game(
            player1,
            player2,
            [player1],
            (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name == "You" ? "Win!" : "Lose..."}`)
        );
    }
}

class OnlineRoom{
    roomCode = null;
    playerNum = null;
    playerCode = null;
    state = "waiting";

    constructor(){
        document.getElementById("games_outer").style.display = "none";
        document.getElementById("message").innerText = "対戦相手を待っています";
        document.getElementById("message").style.display = "flex";
        API.call("getFreeRoomCode", {}, (response)=>{
            this.roomCode = response.room;
            this.playerNum = response.playerNum;
            this.playerCode = response.playerCode;
            this.checkRoomState()
        });
    }

    checkRoomState(){
        API.call("getRoomState", {roomCode: this.roomCode, playerCode: this.playerCode}, (response)=>{
            if (this.state == "settled")return;

            if (response.state == "removed"){
                alert("接続が切れました。");
                location.reload();
            }
            if(this.state == "waiting" && response.state == "playing"){
                document.getElementById("message").style.display = "none";
                this.start();
            }
            this.state = response.state;

            document.getElementById("message").innerText = document.getElementById("message").innerText + ".";

            if (document.getElementById("message").innerText == "対戦相手を待っています....")
                document.getElementById("message").innerText = "対戦相手を待っています";

            setTimeout(()=>{
                this.checkRoomState();
            }, 500);
        });
    }
    
    start(){
        OPERATION_ELEMENT.readyElement();
        const players = [new Player("あなた"), new OnlinePlayer("相手", this.roomCode, this.playerCode)]
        const player1 = players[this.playerNum - 1];
        const player2 = players[this.playerNum % 2];
        const game = new Game(
            player1, 
            player2, 
            [players[0]], 
            (winner) => {
                this.state = "settled";
                OPERATION_ELEMENT.onSettled(`You ${winner.name == "あなた" ? "Win!" : "Lose..."}`);
            }
        );
    }
}

function selectGame(element){
    if(element.className.includes("offline_mode")){
        const room = new OfflineRoom();
        room.start();
    }

    if(element.className.includes("monkey_mode")){
        const room = new MonkeyRoom();
        room.start();
    }
    
    if(element.className.includes("free_online_mode")){
        const room = new OnlineRoom();
    }
}

for (const element of document.getElementsByClassName("game_selector")) {
    element.addEventListener("click", ()=>selectGame(element));
}

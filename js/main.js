'use strict';
import { Gothello } from "./gothello.js";
import { Player, DummyPlayer } from "./player.js";
import { DrawablePiece } from "./drawablePiece.js";



class Game{
    operablePlayers = [null];
    gothello = null;
    onSettled=()=>{};
    
    constructor(){
        const conced = () => {
            if (! window.confirm("投了しますか？"))return;

            let currentPlayer = null;
            for (const player of this.operablePlayers) {if (this.gothello.isPlayerTurn(player)) currentPlayer = player;}
            if (currentPlayer) currentPlayer.conced();
            document.getElementById("cancel_button").removeEventListener("click", conced)
        }
        document.getElementById("cancel_button").addEventListener("click", conced)
    }
    
    selectLocalGame(){
        let player1 = new Player("player1");
        let player2 = new Player("player2");
        this.operablePlayers = [player1, player2];
        this.gothello = this.gothelloInitialize(player1, player2);
        this.gothello.onSettled = player => {
            setTimeout(()=>{
                alert(`${player.name} Win!`);
                this.onSettled();
            }, 200);
        }
    }
    
    selectDummyGame(){
        let player1 = new Player("You");
        let player2 = new DummyPlayer("monkey");
        this.operablePlayers = [player1];
        this.gothello = this.gothelloInitialize(player1, player2);
        this.gothello.onSettled = player => {
            setTimeout(()=>{
                alert(`${player.name} Win!`);
                this.onSettled();
            }, 200);
        }
    }
    
    selectOnlineGame(code){
        let player1 = new Player("You");
        let player2 = new DummyPlayer("monkey");
        this.operablePlayers = [player1];
        this.gothello = this.gothelloInitialize(player1, player2);
        this.gothello.onSettled = player => {
            setTimeout(()=>{
                alert(`${player.name} Win!`);
                this.onSettled();
            }, 200);
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

for (const element of document.getElementsByClassName("game_selector")) {
    element.addEventListener("click", ()=>selectGame(element));
}

function selectGame(element){
    console.log(element.className)

    document.getElementById("games").style.display = "none";
    document.getElementById("cancel_button").style.display = "block";
    document.getElementById("board").style.display = "flex";
    const undoElement = ()=> {
        document.getElementById("board").style.display = "none";
        document.getElementById("cancel_button").style.display = "none";
        document.getElementById("games").style.display = "block";
    }

    if(element.className.includes("offline_mode")){
        const game = new Game();
        game.selectLocalGame();
        game.onSettled = undoElement;
    }
    if(element.className.includes("monkey_mode")){
        const game = new Game();
        game.selectDummyGame();
        game.onSettled = undoElement;
    }
}
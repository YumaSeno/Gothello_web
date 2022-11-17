'use strict';
import { Gothello } from "./gothello.js";
import { Player, DummyPlayer } from "./player.js";
import { DrawablePiece } from "./drawablePiece.js";

let player1 = new Player();
let player2 = new DummyPlayer();
let operablePlayers = [player1];
var gothello = gothelloInitialize(player1, player2);

gothello.onSettled = player => {
    if(player == player1){
        setTimeout(()=>alert("You Win!"), 200)
    }
}

document.getElementById("cancel_button").addEventListener("click", () => {
    gothello = gothelloInitialize(player1, player2);
})

function gothelloInitialize(player1, player2){
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
            pieceElement.addEventListener("click", onPieceClicked);
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

function onPieceClicked(e){
    let currentPlayer = null;
    operablePlayers.forEach(player => {if (gothello.isPlayerTurn(player)) currentPlayer = player;});
    if (currentPlayer) currentPlayer.placePiece(Number(e.currentTarget.dataset.x), Number(e.currentTarget.dataset.y));
}
'use strict';
import {Gothello} from "./gothello.js";
import {Player} from "./player.js";
import {DrawablePiece} from "./drawablePiece.js";


let player1 = new Player();
let player2 = new Player();
let currentPlayer = player1;
var game = gothelloInitialize(player1, player2);

document.getElementById("cancel_button").addEventListener("click", () => {
    game = gothelloInitialize(player1, player2);
})

function onPieceClicked(e){
    const pieceElement = e.currentTarget;
    player1.onClicked(pieceElement.dataset.x, pieceElement.dataset.y)
    player2.onClicked(pieceElement.dataset.x, pieceElement.dataset.y)
}

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
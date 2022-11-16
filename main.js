'use strict';
import {Gothello} from "./gothello.js";
import {DrawablePiece} from "./drawablePiece.js";

let gothello = null;
(()=>{
    let board = [];
    let boardElement = document.getElementById("board");
    for(let y = 0; y < 9; y++){
        let rowElement = document.createElement("div");
        rowElement.className = "row";
        let rowSeparatorElement = document.createElement("div");
        rowSeparatorElement.className = "row_separator";
        let row = [];
        for(let x = 0; x < 9; x++){
            let separatorElement = document.createElement("div");
            separatorElement.className = "separator";

            let pieceElement = document.createElement("div");
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
    gothello = new Gothello((x,y) => board[x][y]);
})();

function onPieceClicked(e){
    let pieceElement = e.currentTarget;
    try {gothello.putPiece(pieceElement.dataset.x, pieceElement.dataset.y);}
    catch (error) {alert(error);}
}
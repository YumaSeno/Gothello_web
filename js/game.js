'use strict';
import { Gothello } from "./gothello.js";
import { DrawablePiece } from "./drawablePiece.js";

export class Game{
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
        
        document.getElementById("player_name").innerText = player1.name;
        document.getElementById("player_name").className = "black";

        let isSettled = false;

        this.operablePlayers = operablePlayers;
        this.gothello = this.gothelloInitialize(player1, player2);
        this.gothello.onPlacesPiece = (x, y) => {
            if(!isSettled)document.getElementById("player_name").innerText = this.gothello.getTurnPlayer().name;
            if(this.gothello.getTurnPlayer() == player1){
                document.getElementById("player_name").className = "black";
            }else{
                document.getElementById("player_name").className = "white";
            }
        }
        this.gothello.onSettled = (player, message) => {
            removeButtonConcedEvent()
            isSettled = true;
            setTimeout(()=>{
                onSettled(player, message);
            }, 100);
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
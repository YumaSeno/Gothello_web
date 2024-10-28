'use strict';

import { Player } from "./player";

/**
 * 駒の状態を表すEnumもどき
 */
const PieceState = Object.freeze({
    Empty: 0,
    Black: 1,
    White: 2,
    BlackSole: 3,
    WhiteSole: 4,

    /** 
     * 値から名前を返す
     * 存在しない値の場合は空文字を返す
     */
    valueToName: (value)=>{
        switch(value){
            case 0: return "Empty";
            case 1: return "Black";
            case 2: return "White";
            case 3: return "BlackSole";
            case 4: return "WhiteSole";
        }
        return "";
    },

    /** 
     * 名前から値を返す
     * 存在しない名前の場合は-1を返す
     */
    nameToValue: (name)=>{
        switch(name){
            case "Empty": return 0;
            case "Black": return 1;
            case "White": return 2;
            case "BlackSole": return 3;
            case "WhiteSole": return 4;
        }
        return -1;
    },
})

export class Board{
    _turn = 1;
    _board = [];
    _onPlacesPiece = (x, y)=>[];
    _onSettled = (player, message)=>{};
    _players = [];
    _turnPlayer = null;
    
    /**
     * 
     * @param {Player} player1 
     * @param {Player} player2 
     * @param {(x: number, y: number) => {}} onPlacesPiece 
     * @param {(player, message) => {}} onSettled 
     */
    constructor(player1, player2, onPlacesPiece = (x,y) => {}, onSettled = (player, message)=>{}){
        player1.gothello = this;
        this._turnPlayer = player1;
        player2.gothello = this;
        this._players = [player1, player2];

        this._onPlacesPiece = onPlacesPiece;
        this._onSettled = onSettled;

        for(let y = 0; y < 9; y++){
            const row = [];
            for(let x = 0; x < 9; x++)
                row.push(PieceState.Empty);
            this._board.push(row);
        }
    }

    conced(player){
        const opponentnum = this.getPlayerNum(player) == 1 ? 2 : 1;
        this._players[opponentnum-1].conceded();
        this._turnPlayer = this._players[opponentnum-1];
        this._settled("投了されました");
    }

    getPlayerNum(player){
        let playernum = 0;
        for(const p of this._players) {
            playernum++;
            if(p == player) break;
        }
        return playernum
    }

    /**
     * ボードの複製を返す
     * @returns ボードのコピー
     */
    getBoard(){
        return this._getBoardCopy();
    }

    getTurnPlayer(){
        return this._turnPlayer;
    }

    isPlayerTurn(player){
        return this._turnPlayer == player;
    }

    placePiece(player, x, y){
        this.isPlayerTurn(player);
        const playernum = this.getPlayerNum(player);

        if (this._board[x] == undefined || this._board[x][y] == undefined)
        throw new Error("入力エラー001 : 開発者に報告してください。");

        const state = this._board[x][y]
        const opponentnum = playernum == 1 ? 2 : 1;
        
        if (state >= 3) return;
        if (state == opponentnum) return;
        
        if (state == playernum) this._board[x][y] = state + 2;
        
        if (state == 0) {
            if (!this._placeNewPiece(playernum,x,y)) {
                this._onPlacesPiece(x,y);
                return;
            }
        }
        
        let canPlace = false;
        for (let x = 0; x < this._board.length; x++) {
            for (let y = 0; y < this._board[x].length; y++) {
                if(this.canPlacePiece(this._players[opponentnum-1], x, y)){
                    canPlace = true;
                }
            }
        }
        if(!canPlace){
            this._settled("置ける場所がありません");
            return;
        }

        this._players[opponentnum-1].placedPiece(x, y);
        this._turnPlayer = this._players[opponentnum-1];
        this._onPlacesPiece(x,y);
        this._turn++;

    }

    _placeNewPiece(playernum, x, y){
        const boardCopy = this._getBoardCopy();
        const opponentnum = playernum == 1 ? 2 : 1;

        boardCopy[x][y] = playernum;
        if(this._turn == 2)boardCopy[x][y] += 2;

        let turnedOver = false;
        try {
            turnedOver = this._turnOver(playernum, x, y, boardCopy);
        } catch {
            return false;
        }

        let victory = this._isVictory(playernum, boardCopy);

        if(turnedOver && victory)return false;
        
        this._board = boardCopy;

        if(victory){
            this._settled("");
            return false;
        }

        return true;
    }
    
    canPlacePiece(player, x, y){
        this.isPlayerTurn(player);
        const board = this._getBoardCopy();
        const playernum = this.getPlayerNum(player);

        if (board[x] == undefined || board[x][y] == undefined)
        throw new Error("入力エラー001 : 開発者に報告してください。");

        const opponentnum = playernum == 1 ? 2 : 1;
        
        if (board[x][y] >= 3) return false;
        if (board[x][y] == opponentnum) return false;
        
        if (board[x][y] == playernum) return true;
        
        if (board[x][y] == 0) return this._canPlaceNewPiece(board, playernum, x, y);

        return true;
    }

    _canPlaceNewPiece(board, playernum, x, y){
        const opponentnum = playernum == 1 ? 2 : 1;

        board[x][y] = playernum;
        if(this._turn == 2)board[x][y] += 2;

        let turnedOver = false;
        try {
            turnedOver = this._turnOver(playernum, x, y, board);
        } catch {
            return false;
        }

        let victory = this._isVictory(playernum, board);

        if(turnedOver && victory)return false;

        return true;
    }

    _turnOver(playernum, x, y, board){
        let turnedOver = false;
        const opponentnum = playernum == 1 ? 2 : 1;
        const directions = [0,1,-1];
        for (const dire_y of directions) {
            for (const dire_x of directions) {
                if(dire_y == 0 && dire_x == 0) continue;
                const stack = [];

                let isTurnOver = false;
                let _x = x + dire_x;
                let _y = y + dire_y;
                let haveSole = false;
                while(_x >= 0 && _y >= 0 && _x < board[0].length && _y < board.length){
                    if (board[_x][_y] == 0){break;}

                    if (board[_x][_y] == opponentnum + 2){haveSole = true;}
                    if ((board[_x][_y] - 1) % 2 + 1 == playernum){
                        if (haveSole) throw new Error("Sole cannot be placed between");
                        isTurnOver = true;
                        break;
                    }
                    stack.push({x: _x, y: _y});

                    _x += dire_x;
                    _y += dire_y;
                }
                if(!isTurnOver)continue;
                while(stack.length > 0){
                    turnedOver = true;
                    let xy = stack.pop();
                    board[xy.x][xy.y] = playernum;
                }
            }
        }

        return turnedOver;
    }

    _isVictory(playernum, board){
        const opponentnum = playernum == 1 ? 2 : 1;
        const directions = [0,1,-1];
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
         
                for (const dire_y of directions) {
                    for (const dire_x of directions) {
                        if(dire_y == 0 && dire_x == 0) continue;
                        let count = 0;
                        let _x = x;
                        let _y = y;
                        while(_x >= 0 && _y >= 0 && _x < board[0].length && _y < board.length){
                            if ((board[_x][_y] != 0) && ((board[_x][_y] - 1) % 2 + 1 != opponentnum)){
                                count++;
    
                                if(count >= 5){
                                    return true;
                                }
                            }else{
                                count = 0;
                            }

                            _x += dire_x;
                            _y += dire_y;
                        }
                    }
                }       
            }
        }
        return false;
    }

    _settled(message){
        this._onSettled(this._turnPlayer, message);
        for (const player of this._players) {player.settled(this._turnPlayer);}
        this._turnPlayer = null;
    }

    _getBoardCopy(){
        const board = []; 
        for(let _x = 0; _x < this._board.length; _x++){
            const row = [];
            for(let _y = 0; _y < this._board.length; _y++)
                row.push(this._board[_x][_y]);
            board.push(row);
        }
        return board;
    }
}
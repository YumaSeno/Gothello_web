'use strict';

export class Piece{
    setState(state){
        this._state = state;
    }
    
    getState(){
        return this._state;
    }

    constructor(x, y){
        this.x = x;
        this.y = y;
        this._state = 0;
    }
}

export class Gothello{
    turn = 0;
    player = 1;
    board = [];
    
    constructor(pieceCreater = (x,y) => new Piece(x,y)){
        for(let y = 0; y < 9; y++){
            let row = [];
            for(let x = 0; x < 9; x++)
                row.push(pieceCreater(x,y));
            this.board.push(row);
        }
    }

    putPiece(x, y){
        if (this.board[x] == undefined || this.board[x][y] == undefined)
        throw new Error("入力エラー001 : 開発者に報告してください。");

        let state = this.board[x][y].getState()
        let Opponent = this.player == 1 ? 2 : 1;
        
        if (state >= 3) return;
        if (state == Opponent) return;
        if (state == this.player) this.board[x][y].setState(state + 2);
        
        if (state == 0){
            this.board[x][y].setState(this.player);
        }

        this.player = (this.player) % 2 + 1
    }
}
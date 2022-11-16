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
    board = [];
    _players = [];
    
    constructor(player1, player2, pieceCreater = (x,y) => new Piece(x,y)){
        player1.gothello = this;
        this._players = [player1, player2];

        for(let y = 0; y < 9; y++){
            const row = [];
            for(let x = 0; x < 9; x++)
                row.push(pieceCreater(x,y));
            this.board.push(row);
        }
    }

    putPiece(player, x, y){
        let playernum = 0;
        for(const p of this._players) {
            playernum++;
            if(p == player) break;
        }

        if (playernum != 1 && playernum != 2)
        throw new Error("入力エラー002 : 開発者に報告してください。");

        if (this.board[x] == undefined || this.board[x][y] == undefined)
        throw new Error("入力エラー001 : 開発者に報告してください。");

        const state = this.board[x][y].getState()
        const opponentnum = playernum == 1 ? 2 : 1;
        
        if (state >= 3) return;
        if (state == opponentnum) return;
        
        if (state == 0) if (!this._putNewPiece(playernum,x,y)) return;

        if (state == playernum) this.board[x][y].setState(state + 2);

        this._turnPlayer(player)
    }

    _turnPlayer(player){
        let playerIndex = this._players.indexOf(player);
        this._players[playerIndex].gothello = null;
        this._players[(playerIndex + 1) % 2].gothello = this;
    }

    _putNewPiece(playernum, x, y){
        const board = this._getBoardInt();
        const opponentnum = playernum == 1 ? 2 : 1;

        this.board[x][y].setState(playernum);

        return true;
    }

    _getBoardInt(){
        const board = []; 
        for(let _x = 0; _x < this.board.length; _x++){
            const row = [];
            for(let _y = 0; _y < this.board.length; _y++)
                row.push(this.board[_x][_y].getState());
            board.push(row);
        }
        return board;
    }
}
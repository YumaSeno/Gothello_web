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
    _turnPlayer = null;
    
    constructor(player1, player2, pieceCreater = (x,y) => new Piece(x,y)){
        player1.gothello = this;
        this._turnPlayer = player1;
        player2.gothello = this;
        this._players = [player1, player2];

        for(let y = 0; y < 9; y++){
            const row = [];
            for(let x = 0; x < 9; x++)
                row.push(pieceCreater(x,y));
            this.board.push(row);
        }
    }

    _getPlayerNum(player){
        let playernum = 0;
        for(const p of this._players) {
            playernum++;
            if(p == player) break;
        }
        return playernum
    }

    isPlayerTurn(player){
        return this._turnPlayer == player;
    }

    placePiece(player, x, y){
        this.isPlayerTurn(player);
        const playernum = this._getPlayerNum(player);

        if (this.board[x] == undefined || this.board[x][y] == undefined)
        throw new Error("入力エラー001 : 開発者に報告してください。");

        const state = this.board[x][y].getState()
        const opponentnum = playernum == 1 ? 2 : 1;
        
        if (state >= 3) return;
        if (state == opponentnum) return;
        
        if (state == 0) if (!this._placeNewPiece(playernum,x,y)) return;

        if (state == playernum) this.board[x][y].setState(state + 2);

        this._players[opponentnum-1].switchTurn(x, y);
        this._turnPlayer = this._players[opponentnum-1];
    }

    _placeNewPiece(playernum, x, y){
        const board = this._getBoardInt();
        const boardBackup = this._getBoardInt();
        const opponentnum = playernum == 1 ? 2 : 1;

        board[x][y] = playernum;
        const directions = [0,1,-1];
        directions.forEach(dire_y => {
            directions.forEach(dire_x => {
                if(dire_y == 0 && dire_x == 0) return;
                
                const stack = [];

                let isTurnOver = false;
                let xx = x + dire_x;
                let yy = y + dire_y;
                while(xx >= 0 && yy >= 0 && xx < board[0].length && yy < board.length){
                    if (board[xx][yy] == opponentnum + 2){break;}
                    if (board[xx][yy] == 0){break;}
                    if ((board[xx][yy] - 1) % 2 + 1 == playernum){
                        isTurnOver = true;
                        break;
                    }
                    stack.push({x: xx, y: yy});

                    xx += dire_x;
                    yy += dire_y;
                }

                console.log(stack)

                if(!isTurnOver)return;

                while(stack.length > 0){
                    let xy = stack.pop();
                    console.log(xy);
                    board[xy.x][xy.y] = playernum;
                }
            });
        });
        console.log(board);
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
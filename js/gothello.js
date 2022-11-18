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
    turn = 1;
    board = [];
    onSettled = (player)=>{};
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

    conced(player){
        const opponentnum = this._getPlayerNum(player) == 1 ? 2 : 1;
        this._players[opponentnum-1].onConceded();
        this._turnPlayer = this._players[opponentnum-1];
        this._settled();
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
        this.turn++;
    }

    _placeNewPiece(playernum, x, y){
        const board = this._getBoardInt();
        const opponentnum = playernum == 1 ? 2 : 1;

        board[x][y] = playernum;
        if(this.turn == 2)board[x][y] += 2;

        let turnedOver = false;
        try {
            turnedOver = this._turnOver(playernum, x, y, board);
        } catch {
            return false;
        }

        let victory = this._isVictory(playernum, board);

        if(turnedOver && victory)return false;
        
        this._reflectBoardInt(board);

        if(victory){
            this._settled();
            return false;
        }

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
                        let _x = x + dire_x;
                        let _y = y + dire_y;
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

    _reflectBoardInt(board){
        const boardBackup = this._getBoardInt();

        for(let _x = 0; _x < this.board.length; _x++){
            for(let _y = 0; _y < this.board.length; _y++){
                if(board[_x][_y] != this.board[_x][_y].getState())
                this.board[_x][_y].setState(board[_x][_y]);
            }
        }
    }

    _settled(){
        this.onSettled(this._turnPlayer);
        this._turnPlayer = null;
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
'use strict';
import { _UnplayblePlayer } from "./player.js"

export class AIPlayer extends _UnplayblePlayer{
    constructor(name){
        super(name);
        setTimeout(()=>this._placePiece(4,4), 300);
    }

    _placePiece(x, y){
        if (this.gothello.isPlayerTurn(this)) this.gothello.placePiece(this, x, y);
    }
    
    _conced(){
        if (this.gothello.isPlayerTurn(this)) this.gothello.conced(this);
    }

    placedPiece(x, y){
        setTimeout(()=>{
            const playerNum = this.gothello.getPlayerNum(this);
            const board = this.gothello._getBoardInt();
            
            let maxEval = -9999;
            const places = [];
            
            for (let x = 0; x < board.length; x++) {
                for (let y = 0; y < board[x].length; y++) {
                    const boardClone = this._getBoardClone(board);
                    if(!this._placeBoardPiece(boardClone, playerNum, x, y)){
                        continue;
                    }
                    
                    if(this._isVictory(playerNum, boardClone)){
                        this._placePiece(x, y);
                        return;
                    }

                    let evalNum = this._getBestNextPlace(boardClone, 2, false);
                    if(evalNum > maxEval){
                        maxEval = evalNum;
                    }
                    places.push({x:x, y:y, eval:evalNum});
                }
            }

            if (maxEval == -9999){
                this._conced();
                return;
            }
            
            const bestPlaces = [];
            for (const place of places) {
                if(place.eval == maxEval) bestPlaces.push(place);
            }
            const bestPlace = bestPlaces[Math.floor(Math.random() * bestPlaces.length)];

            this._placePiece(bestPlace.x, bestPlace.y);
        }, 300);
    }

    _getBestNextPlace(board, depth, isMe){
        const playerNum = isMe ? this.gothello.getPlayerNum(this) : this.gothello.getPlayerNum(this) % 2 + 1;
        const opponentnum = playerNum === 1 ? 2 : 1;

        const evals = [];
        
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                const boardClone = this._getBoardClone(board);
                if(!this._placeBoardPiece(boardClone, playerNum, x, y)){
                    continue;
                }
                if(this._isVictory(playerNum, boardClone)){
                    return isMe ? 1000 : -1000;
                }
                
                if (depth <= 1){
                    evals.push(this._evalNode(boardClone));
                }else{
                    evals.push(this._getBestNextPlace(boardClone, depth - 1, !isMe));
                }
            }
        }

        if(evals.count <= 0){
            return {x:-1, y:-1, eval: isMe ? -1000 : 1000};
        }

        let bestEval = evals[0];
        for (const evalNum of evals) {
            if(isMe === (bestEval < evalNum)){
                bestEval = evalNum;
            }
        }

        return bestEval;
    }

    _evalNode(board){
        const playerNum = this.gothello.getPlayerNum(this);
        const opponentnum = playerNum === 1 ? 2 : 1;

        let evalNum = 0;
        
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                const num = board[x][y] >= 3 ? board[x][y] - 2 : board[x][y];
                if(num === playerNum){
                    evalNum++;
                    if(x == 4 && y == 4) evalNum += 0.5;
                }else if(num === opponentnum){
                    evalNum--;
                    if(x == 4 && y == 4) evalNum -= 0.5;
                }
            }
        }

        return evalNum;
    }
    
    _placeBoardPiece(board, playernum, x, y){
        const opponentnum = playernum === 1 ? 2 : 1;
        
        if (board[x][y] >= 3) return false;
        if (board[x][y] === opponentnum) return false;
        
        if (board[x][y] === playernum) board[x][y] = board[x][y] + 2;
        
        if (board[x][y] === 0) {
            
            const directions = [0,1,-1];
            let isIsolation = true;
            for (const dire_y of directions) {
                for (const dire_x of directions) {
                    let _x = x + dire_x;
                    let _y = y + dire_y;
                    for (let i = 0; i < 2; i++) {
                        if((_x < 0 || _x >= 9 || _y < 0 || _y >= 9) || (_x == 0 && _y == 0)) continue;
                        if(board[x + dire_x][y + dire_y] != 0){
                            isIsolation = false;
                        }
                        _x += dire_x;
                        _y += dire_y;
                    }
                }
            }
            if (isIsolation) return false;

            return this._placeNewPiece(board, playernum, x, y);
        }

        return true;
    }

    _placeNewPiece(board, playernum, x, y){
        const opponentnum = playernum === 1 ? 2 : 1;

        board[x][y] = playernum;
        if(this.turn === 2)board[x][y] += 2;

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
        const opponentnum = playernum === 1 ? 2 : 1;
        const directions = [0,1,-1];
        for (const dire_y of directions) {
            for (const dire_x of directions) {
                if(dire_y === 0 && dire_x === 0) continue;
                const stack = [];

                let isTurnOver = false;
                let _x = x + dire_x;
                let _y = y + dire_y;
                let haveSole = false;
                while(_x >= 0 && _y >= 0 && _x < board[0].length && _y < board.length){
                    if (board[_x][_y] === 0){break;}

                    if (board[_x][_y] === opponentnum + 2){haveSole = true;}
                    if ((board[_x][_y] - 1) % 2 + 1 === playernum){
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
        const opponentnum = playernum === 1 ? 2 : 1;
        const directions = [0,1,-1];
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
         
                for (const dire_y of directions) {
                    for (const dire_x of directions) {
                        if(dire_y === 0 && dire_x === 0) continue;
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

    _getBoardClone(board){
        const boardClone = []; 
        for(let _x = 0; _x < board.length; _x++){
            const row = [];
            for(let _y = 0; _y < board[_x].length; _y++)
                row.push(board[_x][_y]);
            boardClone.push(row);
        }
        return boardClone;
    }
}
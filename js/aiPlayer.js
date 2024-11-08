'use strict';
import { _PlayerInterface } from "./player.js"

export class AIPlayer extends _PlayerInterface{
    constructor(name, myColor, board){
        super(name, myColor, board);
        setTimeout(()=>this._placePiece(4,4), 500);

        board.addEventListnerOnPlacesPiece((x, y) => {
            if (this._board.getCurrentTurnColor() !== this._myColor) return;
            if (this._board.isSettled()) return;
            // ユーザエクスペリエンスのため
            setTimeout(()=>this._placePieceInTheBestPlaces(), 500);
        });
    }

    _placePiece(x, y){
        if (this._board.getCurrentTurnColor() == this._myColor) this._board.placePiece(this._myColor, x, y);
    }
    
    _conced(){
        if (this._board.getCurrentTurnColor() == this._myColor) this._board.conced(this._myColor);
    }

    /**
     * 一番良い手を探して打つ。
     */
    _placePieceInTheBestPlaces(){
        const playerColor = this._myColor;

        const board = this._board.getBoardCopy();
        
        let maxEval = -9999;
        const places = [];
        
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if(this._isIsolate(board, x, y)) continue;

                const boardClone = this._board.getBoardClone(board);
                if(!this._board.placePieceSimulate(boardClone, playerColor, x, y)) continue;
                
                if(this._board.isVictory(boardClone, playerColor) !== null){
                    this._placePiece(x, y);
                    return;
                }

                let evalNum = this._getBestEval(boardClone, 2);
                if(evalNum > maxEval){
                    maxEval = evalNum;
                }
                places.push({x:x, y:y, eval:evalNum});
            }
        }

        /* 詰んだら投了。しないほうがいい気がするのでコメントアウト。
        if (maxEval <= -1000){
            this._conced();
            return;
        }
        */
        
        const bestPlaces = [];
        for (const place of places) {
            if(place.eval == maxEval) bestPlaces.push(place);
        }
        const bestPlace = bestPlaces[Math.floor(Math.random() * bestPlaces.length)];

        this._placePiece(bestPlace.x, bestPlace.y);
    }

    /**
     * 渡された盤面で一番評価の高い手を探す。
     * depthが0になるまで再帰的に呼び出し、最大評価の手を探す。
     * @param {*} board 検討する盤面の2次元配列
     * @param {*} depth 呼び出す深さ。再帰的に呼び出す際にデクリメントする。
     * @param {*} isMe 自分が打つ手か否か。再帰的に呼び出す際に反転する。
     * @returns 一番良い手
     */
    _getBestEval(board, depth, isMe = false){
        const playerColor = isMe ? this._myColor : this._board.getOpponentColor(this._myColor);
        const opponentColor = this._board.getOpponentColor(playerColor);

        const evals = [];
        
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if(this._isIsolate(board, x, y)) continue;

                const boardClone = this._board.getBoardClone(board);
                if(!this._board.placePieceSimulate(boardClone, playerColor, x, y)) continue;

                if(this._board.isPieceFiveLinedUp(boardClone, x, y)){
                    return isMe ? 1000 : -1000 - depth;
                }
                
                if (depth === 0){
                    evals.push(this._evalNode(boardClone, this._myColor));
                }else{
                    evals.push(this._getBestEval(boardClone, depth - 1, !isMe));
                }
            }
        }

        if(evals.count <= 0){
            return isMe ? -1000 : 1000;
        }

        let bestEval = evals[0];
        for (const evalNum of evals) {
            if(isMe === (bestEval < evalNum)){
                bestEval = evalNum;
            }
        }

        return bestEval;
    }

    /**
     * 盤面を評価する
     * @param board ボードの2次元配列
     * @param playerColor 評価基準のプレイヤーの駒の色
     * @returns 
     */
    _evalNode(board, playerColor){
        const opponentColor = this._board.getOpponentColor(playerColor);

        let evalNum = 0;
        
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                const num = ((board[x][y] - 1) % 2) + 1;
                if(num === playerColor){
                    evalNum++;
                    if(x == 4 && y == 4) evalNum += 0.5;
                }else if(num === opponentColor){
                    evalNum--;
                    if(x == 4 && y == 4) evalNum -= 0.5;
                }
            }
        }

        return evalNum;
    }

    /**
     * 座標の周り1マス以内に他の駒が存在しないかどうかを調べる
     * @param board ボードの2次元配列
     * @returns 
     */
    _isIsolate(board, x, y){
        const directions = [0,1,-1];
        for (const dire_y of directions) {
            for (const dire_x of directions) {
                if(dire_x == 0 && dire_y == 0) continue;
                let _x = x + dire_x;
                let _y = y + dire_y;
                for (let i = 0; i < 1; i++) {
                    if(_x < 0 || _x >= 9 || _y < 0 || _y >= 9) continue;
                    if(board[x + dire_x][y + dire_y] != 0){
                        return false;
                    }
                    _x += dire_x;
                    _y += dire_y;
                }
            }
        }
        return true;
    }
}
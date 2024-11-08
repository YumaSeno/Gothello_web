'use strict';

import { PieceColor, PieceState, SettledReason } from "./common/const.js";

/**
 * ルールを制御する盤面を表すクラス
 */
export class Board{
    /**現在のターン数 */
    _turn = 1;

    /**現在のターンで置かれる駒の色 */
    _currentTurnColor = PieceColor.Black;

    /**盤面を表す2次元配列 */
    _board = [];

    /**対局が終了したかどうか */
    _isSettled = false;

    /**駒が置かれた際のイベントハンドラー */
    _onPlacesPiece = [];

    /**対局が終了したときのイベントハンドラー */
    _onSettled = [];

    /**棋譜 */
    _gameRecord = [];
    
    /**コンストラクタ */
    constructor(){
        for(let y = 0; y < 9; y++){
            const row = [];
            for(let x = 0; x < 9; x++)
                row.push(PieceState.Empty);
            this._board.push(row);
        }
    }

    /**
     * 駒が置かれた際のイベントリスナーを追加する
     * @param {(x, y) => {}} lister
     */
    addEventListnerOnPlacesPiece(lister) {
        this._onPlacesPiece.push(lister);
    }

    /**
     * 駒が置かれた際のイベントリスナーを削除する
     * @param {(x, y) => {}} lister
     */
    removeEventListnerOnPlacesPiece(lister) {
        this._onPlacesPiece = this._onPlacesPiece.filter((item) => item === lister);
    }

    /**
     * 対局が終了した際のイベントリスナーを追加する
     * @param {(winnerPieceColor, message) => {}} lister
     */
    addEventListnerOnSettled(lister) {
        this._onSettled.push(lister);
    }

    /**
     * 対局が終了した際のイベントリスナーを削除する
     * @param {(winnerPieceColor, message) => {}} lister
     */
    removeEventListnerOnSettled(lister) {
        this._onSettled = this._onSettled.filter((item) => item === lister);
    }

    /**
     * 対局が完了したかどうかを確認する
     * @returns 対局が完了したかどうか
     */
    isSettled(){
        return this._isSettled;
    }

    /**
     * 現在のターンで置く駒の色を取得
     * @returns 現在のターンで置く駒の色
     */
    getCurrentTurnColor(){
        return this._currentTurnColor;
    }

    /**
     * 引数で渡された色の敵の色を取得
     * @param {number} pieceColor 
     * @returns 引数で渡された駒の色の敵の駒の色
     */
    getOpponentColor(pieceColor){
        return pieceColor == PieceColor.Black ? PieceColor.White : PieceColor.Black;
    }

    /**
     * 現在のボードの複製を返す
     * @returns ボードのコピー
     */
    getBoardCopy(){
        return this.getBoardClone(this._board);
    }

    /**
     * 渡されたボードの複製を返す
     * @returns ボードの複製
     */
    getBoardClone(board){
        const boardClone = []; 
        for(let _x = 0; _x < board.length; _x++){
            const row = [];
            for(let _y = 0; _y < board[_x].length; _y++)
                row.push(board[_x][_y]);
            boardClone.push(row);
        }
        return boardClone;
    }

    /**
     * 投了する
     * @param {number} pieceColor 
     * @returns 投了できたかどうか
     */
    conced(pieceColor){
        if(pieceColor != this._currentTurnColor) return false;
        this._settled(this.getOpponentColor(pieceColor), SettledReason.Conced);
        return true;
    }
    
    /**
     * 駒を置けるマスかどうか判定する
     * @param board ボードの2次元配列
     * @param pieceColor 置く駒の色
     * @param {number} x 駒を置く場所のX位置
     * @param {number} y 駒を置く場所のY位置
     * @returns 
     */
    canPlacePiece(board, pieceColor, x, y){
        const opponentcolor = this.getOpponentColor(pieceColor);
        
        if (board[x][y] >= 3) return false;
        if (board[x][y] == opponentcolor) return false;
        
        if (board[x][y] == pieceColor) return true;
        
        if (board[x][y] == PieceState.Empty) return this.canPlaceNewPiece(board, pieceColor, x, y);

        return true;
    }

    /**
     * 新しく駒を置けるマスかどうか判定する
     * @param board ボードの2次元配列
     * @param pieceColor 置く駒の色
     * @param {number} x 駒を置く場所のX位置
     * @param {number} y 駒を置く場所のY位置
     * @returns 
     */
    canPlaceNewPiece(board, pieceColor, x, y){
        const boardClone = this.getBoardClone(board);
        if (boardClone[x][y] !== PieceState.Empty) return false;

        boardClone[x][y] = pieceColor;

        const turnOverdPieces = this._turnOver(boardClone, pieceColor, x, y);
        if (turnOverdPieces == null) return false;
        const turnedOver = turnOverdPieces.length > 0;

        let fiveLinedUp = this.isPieceFiveLinedUp(boardClone, x, y);
        for (const turnOverdPiece of turnOverdPieces) {
            if (fiveLinedUp) break;
            fiveLinedUp = fiveLinedUp || this.isPieceFiveLinedUp(boardClone, turnOverdPiece.x, turnOverdPiece.y);
        }

        if(turnedOver && fiveLinedUp) return false;

        return true;
    }

    /**
     * 駒を置く
     * @param pieceColor 置く駒の色
     * @param {number} x 駒を置く場所のX位置
     * @param {number} y 駒を置く場所のY位置
     * @returns 駒を置けたかどうか
     */
    placePiece(pieceColor, x, y){
        if (pieceColor !== this._currentTurnColor) return false;
        if (this._isSettled) return false;
        const boardCopy = this.getBoardCopy();
        const opponentcolor = this.getOpponentColor(pieceColor);

        const state = boardCopy[x][y];
        
        if (state == pieceColor){
            boardCopy[x][y] = state + 2;
        } else if(!this.canPlacePiece(boardCopy, pieceColor, x, y)) {
            return false;
        }
        
        if (state == 0) {
            boardCopy[x][y] = pieceColor;
            
            // 盤面に駒が黒一つだけならおいた駒をソルにする
            let sum = 0;
            for(let _x = 0; _x < boardCopy.length; _x++){
                for(let _y = 0; _y < boardCopy[_x].length; _y++){
                    sum += boardCopy[_x][_y];
                }
            }
            if(sum === 3) boardCopy[x][y] += 2;

            this._turnOver(boardCopy, pieceColor, x, y);
        }

        this._board = boardCopy;

        this._turn++;
        this._currentTurnColor = (this._currentTurnColor == PieceColor.Black ? PieceColor.White : PieceColor.Black);

        this._gameRecord.push({x: x, y: y});

        const settledReason = this.isVictory(boardCopy, pieceColor);
        if (settledReason !== null) this._isSettled = true;
        for (const onPlacesPiece of this._onPlacesPiece) {
            onPlacesPiece(x, y);
        }
        if (settledReason !== null) this._settled(pieceColor, settledReason);

        return true;
    }

    /**
     * 特定盤面で駒を置いたときの次の盤面をシミュレートする。
     * board引数の内容を書き換える
     * @param board シミュレートする盤面の2次元配列
     * @param pieceColor 置く駒の色
     * @param {number} x 駒を置く場所のX位置
     * @param {number} y 駒を置く場所のY位置
     * @returns 駒を置けたかどうか
     */
    placePieceSimulate(board, pieceColor, x, y){
        const opponentcolor = this.getOpponentColor(pieceColor);

        const state = board[x][y];
        
        if (state == pieceColor){
            board[x][y] = state + 2;
        } else if(!this.canPlacePiece(board, pieceColor, x, y)) {
            return false;
        }
        
        if (state == 0) {
            board[x][y] = pieceColor;
            
            // 盤面に駒が黒一つだけならおいた駒をソルにする
            let sum = 0;
            for(let _x = 0; _x < board.length; _x++){
                for(let _y = 0; _y < board[_x].length; _y++){
                    sum += board[_x][_y];
                }
            }
            if(sum === 3) board[x][y] += 2;
    
            this._turnOver(board, pieceColor, x, y);
        }

        return true;
    }

    /**
     * 渡された盤面において渡された駒の色が勝利しているか判断する
     * @param board ボードの2次元配列
     * @param pieceColor 判定する駒の色
     * @returns 決着理由のSettledReason。勝利していない場合はnull
     */
    isVictory(board, pieceColor){
        const opponentcolor = this.getOpponentColor(pieceColor);

        let whereToPlaceIsGone = false;
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if(this.canPlacePiece(board, opponentcolor, x, y)){
                    whereToPlaceIsGone = true;
                }
            }
        }
        if(!whereToPlaceIsGone) {
            return SettledReason.WhereToPlaceIsGone;
        }


        const fiveLinedUp = this.isColorFiveLinedUp(board, pieceColor);
        if(fiveLinedUp) {
            return SettledReason.FiveLinedUp;
        }

        return null;
    }

    /**
     * 渡された盤面において渡された色の駒が5つ並んでいる箇所があるか判断する
     * @param board ボードの2次元配列
     * @param pieceColor 判定する駒の色
     * @returns 
     */
    isColorFiveLinedUp(board, pieceColor){
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if (((board[x][y]-1) % 2) + 1 != pieceColor) continue;
                if (this.isPieceFiveLinedUp(board, x, y)) return true;
            }
        }
        return false;
    }

    /**
     * 渡された盤面において指定された駒が5つ並んでいる列に属しているか判断する
     * @param board ボードの2次元配列
     * @param pieceColor 判定する駒の色
     * @returns 
     */
    isPieceFiveLinedUp(board, x, y){
        const pieceColor = board[x][y];
        const directions = [
            [1, 0],  // ー
            [1, 1],  // ＼
            [0, 1],  // ｜
            [-1, 1] // ／
        ];
        for (const direction of directions) {
            const dire_x = direction[0];
            const dire_y = direction[1];
            
            let count = 1;

            // 正方向のカウント
            let _x = x + dire_x;
            let _y = y + dire_y;
            while((_x >= 0 && _y >= 0 && _x < board[0].length && _y < board.length) && (((board[_x][_y]-1) % 2) + 1 == pieceColor)){
                count++;
                if(count >= 5) return true;
                _x += dire_x;
                _y += dire_y;
            }

            // 負方向のカウント
            _x = x - dire_x;
            _y = y - dire_y;
            while((_x >= 0 && _y >= 0 && _x < board[0].length && _y < board.length) && (((board[_x][_y]-1) % 2) + 1 == pieceColor)){
                count++;
                if(count >= 5) return true;
                _x -= dire_x;
                _y -= dire_y;
            }
        }
        return false;
    }

    _turnOver(board, pieceColor, x, y){
        const turnOverdPieces = [];
        const opponentcolor = this.getOpponentColor(pieceColor);
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

                    if (board[_x][_y] == opponentcolor + 2){haveSole = true;}
                    if ((board[_x][_y] - 1) % 2 + 1 == pieceColor){
                        if (haveSole) return null;
                        isTurnOver = true;
                        break;
                    }
                    stack.push({x: _x, y: _y});

                    _x += dire_x;
                    _y += dire_y;
                }
                if(!isTurnOver)continue;
                while(stack.length > 0){
                    let xy = stack.pop();
                    board[xy.x][xy.y] = pieceColor;
                    turnOverdPieces.push(xy);
                }
            }
        }

        return turnOverdPieces;
    }

    _settled(winnerPieceColor, settledReason){
        this._isSettled = true;
        for (const onSettled of this._onSettled) {
            onSettled(winnerPieceColor, settledReason);
        }
        console.log(this._gameRecord);
    }
}
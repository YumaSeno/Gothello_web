'use strict';
import { API } from "./common/apiCall.js"
import { SettledReason } from "./common/const.js";

/**
 * プレイヤーのベースとなるクラス
 */
export class _PlayerInterface{
    _name = "";
    _board = null;
    _myColor = null;
    placedPiece(x, y){}
    conceded(){}
    settled(){}

    get name () {
        return this._name
    };

    constructor(name, myColor, board){
        this._name = name;
        this._myColor = myColor;
        this._board = board;
    }
}

/**ウェブアプリで操作可能なプレイヤー */
export class WebAppControllablePlayer extends _PlayerInterface{
    constructor(name, myColor, board, pieceElements, cancelButtonElement){
        super(name, myColor, board);
        for(let _x = 0; _x < pieceElements.length; _x++){
            const row = [];
            for(let _y = 0; _y < pieceElements[_x].length; _y++){
                pieceElements[_x][_y].addEventListener("click", ()=>this._onPieceClicked(pieceElements[_x][_y]));
            }
        }

        let _removeButtonConcedEvent = () => {};
        const _conced = ()=>{
            if (this._board.getCurrentTurnColor() == this._myColor) this._board.conced(this._myColor);
            _removeButtonConcedEvent();
        }
        _removeButtonConcedEvent = ()=>cancelButtonElement.removeEventListener("click", _conced);
        cancelButtonElement.addEventListener("click", _conced);
        board.addEventListnerOnSettled((winnerPieceColor, message) => _removeButtonConcedEvent());
    }
    
    _onPieceClicked(e){
        this._placePiece(Number(e.dataset.x), Number(e.dataset.y));
    }

    /**
     * 駒を置く
     * @param {number} x 駒を置く場所のX位置
     * @param {number} y 駒を置く場所のY位置
     */
    _placePiece(x, y){
        if (this._board.getCurrentTurnColor() == this._myColor) this._board.placePiece(this._myColor, x, y);
    }
}

export class DummyPlayer extends _PlayerInterface{
    constructor(name, myColor, board){
        super(name, myColor, board);
        setInterval(()=>{this._placePiece(Math.floor(Math.random() * 9), Math.floor(Math.random() * 9));}, 1000);
    }

    /**
     * 駒を置く
     * @param {number} x 駒を置く場所のX位置
     * @param {number} y 駒を置く場所のY位置
     */
    _placePiece(x, y){
        if (this._board.getCurrentTurnColor() == this._myColor) this._board.placePiece(this._myColor, x, y);
    }
}

export class OnlinePlayer extends _PlayerInterface{
    mode = null;
    roomCode = null;
    playerCode = null;
    isSettled = false;

    constructor(name, myColor, board, mode, roomCode, playerCode){
        super(name, myColor, board);
        this.mode = mode;
        this.roomCode = roomCode;
        this.playerCode = playerCode;

        board.addEventListnerOnPlacesPiece((x, y) => {
            if (this._board.getCurrentTurnColor() !== this._myColor) return;
            API.call("setLatestMove", {
                mode: this.mode,
                roomCode: this.roomCode,
                playerCode: this.playerCode,
                moveType: "placePiece",
                x: x,
                y: y
            });
        });

        board.addEventListnerOnSettled((winnerPieceColor, message) => {
            this.isSettled = true;
            if (winnerPieceColor !== this._myColor && message === SettledReason.Conced) {
                API.call("setLatestMove", {
                    mode: this.mode,
                    roomCode: this.roomCode,
                    playerCode: this.playerCode,
                    moveType: "conced",
                });
            }
        });

        const _checkOpponentMove = ()=>{
            API.call("getLatestMove", {
                mode: this.mode,
                roomCode: this.roomCode,
                playerCode: this.playerCode
            },(response)=>{
                if(response.moveType == "placePiece") this._placePiece(response.x, response.y);
                if(response.moveType == "conced") this._conced();
                if(!this.isSettled)setTimeout(_checkOpponentMove, 1500);
            });
        }
        _checkOpponentMove();
    }


    _placePiece(x, y){
        if (this._board.getCurrentTurnColor() == this._myColor) this._board.placePiece(this._myColor, x, y);
    }
    
    _conced(){
        if (this._board.getCurrentTurnColor() == this._myColor) this._board.conced(this._myColor);
    }
}
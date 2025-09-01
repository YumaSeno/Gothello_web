
'use strict';
import { API } from "./common/apiCall"
import { PieceColor, SettledReason } from "./common/const";
import { Board } from "./board";

/**
 * プレイヤーのベースとなるクラス
 */
export class _PlayerInterface{
    _name: string = "";
    _board: Board | null = null;
    _myColor: PieceColor | null = null;
    placedPiece(x: number, y: number){}
    conceded(){}
    settled(){}

    get name () {
        return this._name
    };

    constructor(name: string, myColor: PieceColor, board: Board){
        this._name = name;
        this._myColor = myColor;
        this._board = board;
    }
}

/**ウェブアプリで操作可能なプレイヤー */
export class WebAppControllablePlayer extends _PlayerInterface{
    constructor(name: string, myColor: PieceColor, board: Board, pieceElements: HTMLElement[][], cancelButtonElement: HTMLElement){
        super(name, myColor, board);
        for(let _x = 0; _x < pieceElements.length; _x++){
            const row = [];
            for(let _y = 0; _y < pieceElements[_x].length; _y++){
                pieceElements[_x][_y].addEventListener("click", ()=>this._onPieceClicked(pieceElements[_x][_y]));
            }
        }

        let _removeButtonConcedEvent = () => {};
        const _conced = ()=>{
            if (this._board!.getCurrentTurnColor() == this._myColor) this._board!.conced(this._myColor!);
            _removeButtonConcedEvent();
        }
        _removeButtonConcedEvent = ()=>cancelButtonElement.removeEventListener("click", _conced);
        cancelButtonElement.addEventListener("click", _conced);
        board.addEventListnerOnSettled((winnerPieceColor, message) => _removeButtonConcedEvent());
    }
    
    _onPieceClicked(e: HTMLElement){
        this._placePiece(Number(e.dataset.x), Number(e.dataset.y));
    }

    /**
     * 駒を置く
     * @param {number} x 駒を置く場所のX位置
     * @param {number} y 駒を置く場所のY位置
     */
    _placePiece(x: number, y: number){
        if (this._board!.getCurrentTurnColor() == this._myColor) this._board!.placePiece(this._myColor!, x, y);
    }
}

export class DummyPlayer extends _PlayerInterface{
    constructor(name: string, myColor: PieceColor, board: Board){
        super(name, myColor, board);
        setInterval(()=>{this._placePiece(Math.floor(Math.random() * 9), Math.floor(Math.random() * 9));}, 1000);
    }

    /**
     * 駒を置く
     * @param {number} x 駒を置く場所のX位置
     * @param {number} y 駒を置く場所のY位置
     */
    _placePiece(x: number, y: number){
        if (this._board!.getCurrentTurnColor() == this._myColor) this._board!.placePiece(this._myColor!, x, y);
    }
}

export class OnlinePlayer extends _PlayerInterface{
    mode: string | null = null;
    roomCode: string | null = null;
    playerCode: string | null = null;
    isSettled: boolean = false;

    constructor(name: string, myColor: PieceColor, board: Board, mode: string, roomCode: string, playerCode: string){
        super(name, myColor, board);
        this.mode = mode;
        this.roomCode = roomCode;
        this.playerCode = playerCode;

        board.addEventListnerOnPlacesPiece((x, y) => {
            if (this._board!.getCurrentTurnColor() !== this._myColor) return;
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
            },(response: any)=>{
                if(response.moveType == "placePiece") this._placePiece(response.x, response.y);
                if(response.moveType == "conced") this._conced();
                if(!this.isSettled)setTimeout(_checkOpponentMove, 1500);
            });
        }
        _checkOpponentMove();
    }


    _placePiece(x: number, y: number){
        if (this._board!.getCurrentTurnColor() == this._myColor) this._board!.placePiece(this._myColor!, x, y);
    }
    
    _conced(){
        if (this._board!.getCurrentTurnColor() == this._myColor) this._board!.conced(this._myColor!);
    }
}


'use strict';
import { _PlayerInterface } from "../player"
import { PieceColor } from "../common/const";
import { Board } from "../board";

export class AIPlayerQLearning extends _PlayerInterface{
    constructor(name: string, myColor: PieceColor, board: Board){
        super(name, myColor, board);
        setTimeout(()=>this._placePiece(4,4), 500);

        board.addEventListnerOnPlacesPiece((x, y) => {
            if (this._board!.getCurrentTurnColor() !== this._myColor) return;
            if (this._board!.isSettled()) return;
            // ユーザエクスペリエンスのため
            setTimeout(()=>this._placePieceInTheBestPlaces(), 500);
        });
    }

    _placePiece(x: number, y: number){
        if (this._board!.getCurrentTurnColor() == this._myColor) this._board!.placePiece(this._myColor!, x, y);
    }
    
    _conced(){
        if (this._board!.getCurrentTurnColor() == this._myColor) this._board!.conced(this._myColor!);
    }

    /**
     * 一番良い手を探して打つ。
     */
    _placePieceInTheBestPlaces(){
        // Tensorflowを利用して対戦とそれを通した学習が行えるようにする
    }
}

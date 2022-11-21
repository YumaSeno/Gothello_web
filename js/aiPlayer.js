'use strict';
import { _UnplayblePlayer } from "./player.js"

export class AIPlayer extends _UnplayblePlayer{
    constructor(){
        setTimeout(()=>this.placedPiece(4,4), 300);
    }

    _placePiece(x, y){
        if (this.gothello.isPlayerTurn(this)) this.gothello.placePiece(this, x, y);
    }
    
    placedPiece(x, y){
        const bestPlace = this._getBestNextPlace(5);
        this._placePiece(bestPlace.x, bestPlace.y);
    }

    _getBestNextPlace(depth){

    }
}
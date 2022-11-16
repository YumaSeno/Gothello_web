'use strict';

export class Player{

    gothello = null;

    putPiece(x, y){
        if (this.gothello) this.gothello.putPiece(this, x, y);
    }
}
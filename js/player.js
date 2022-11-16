'use strict';

export class Player{

    gothello = null;

    onClicked(x, y){
        if (this.gothello) this.gothello.putPiece(this, x, y);
    }
}
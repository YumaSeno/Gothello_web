'use strict';

export class DummyPlayer{

    gothello = null;

    constructor(){
        setInterval(()=>{
            console.log("putPiece");
            this._putPiece(Math.floor(Math.random() * 9), Math.floor(Math.random() * 9));
        }, 5000)
    }

    _putPiece(x, y){
        if (this.gothello) this.gothello.putPiece(this, x, y);
    }
}
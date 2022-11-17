'use strict';

class _UnplayblePlayer{
    name = "";
    gothello = null;
    switchTurn(x, y){}

    constructor(name){
        this.name = name;
    }
}

export class Player extends _UnplayblePlayer{
    placePiece(x, y){
        if (this.gothello.isPlayerTurn(this)) this.gothello.placePiece(this, x, y);
    }
}

export class DummyPlayer extends _UnplayblePlayer{
    constructor(name){
        super(name);
        setInterval(()=>{this._placePiece(Math.floor(Math.random() * 9), Math.floor(Math.random() * 9));}, 1000);
    }

    _placePiece(x, y){
        if (this.gothello.isPlayerTurn(this)) this.gothello.placePiece(this, x, y);
    }
    
    switchTurn(x, y){
        if(this.gothello.isPlayerTurn(this)){
            
        }
    }
}
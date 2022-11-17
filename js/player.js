'use strict';

class UnplayblePlayer{

    gothello = null;
    switchTurn(x, y){}
}

export class Player extends UnplayblePlayer{
    placePiece(x, y){
        if (this.gothello.isPlayerTurn(this)) this.gothello.placePiece(this, x, y);
    }
}

export class DummyPlayer extends UnplayblePlayer{
    constructor(){
        super()
        setInterval(()=>{this._placePiece(Math.floor(Math.random() * 9), Math.floor(Math.random() * 9));}, 1000)
    }

    _placePiece(x, y){
        if (this.gothello.isPlayerTurn(this)) this.gothello.placePiece(this, x, y);
    }
    
    switchTurn(x, y){
        if(this.gothello.isPlayerTurn(this)){
            
        }
    }
}
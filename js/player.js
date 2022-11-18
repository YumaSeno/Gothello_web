'use strict';
import { API } from "./apiCall.js"

class _UnplayblePlayer{
    name = "";
    gothello = null;
    placedPiece(x, y){}
    conceded(){}
    settled(player){}

    constructor(name){
        this.name = name;
    }
}

export class Player extends _UnplayblePlayer{
    placePiece(x, y){
        if (this.gothello.isPlayerTurn(this)) this.gothello.placePiece(this, x, y);
    }

    conced(){
        if (this.gothello.isPlayerTurn(this)) this.gothello.conced(this);
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
    
    _conced(){
        if (this.gothello.isPlayerTurn(this)) this.gothello.conced(this);
    }
}

export class OnlinePlayer extends _UnplayblePlayer{
    code = null;
    isSettled = false;

    constructor(name, code){
        super(name);
        this.code = code;
    }

    _placePiece(x, y){
        if (this.gothello.isPlayerTurn(this)) this.gothello.placePiece(this, x, y);
    }
    
    _conced(){
        if (this.gothello.isPlayerTurn(this)) this.gothello.conced(this);
    }
    
    settled(player){
        isSettled = true;
    }
    
    placedPiece(x, y){
        if(this.gothello.isPlayerTurn(this)){
            
        }
    }
}
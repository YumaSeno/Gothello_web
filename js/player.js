'use strict';
import { API } from "./apiCall.js"

export class _UnplayblePlayer{
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
    mode = null;
    roomCode = null;
    playerCode = null;
    isSettled = false;

    constructor(name, mode, roomCode, playerCode){
        super(name);
        this.mode = mode;
        this.roomCode = roomCode;
        this.playerCode = playerCode;

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
        if (this.gothello.isPlayerTurn(this)) this.gothello.placePiece(this, x, y);
    }
    
    _conced(){
        if (this.gothello.isPlayerTurn(this)) this.gothello.conced(this);
    }
    
    settled(player){
        this.isSettled = true;
    }
    
    conceded(){
        API.call("setLatestMove", {
            mode: this.mode,
            roomCode: this.roomCode,
            playerCode: this.playerCode,
            moveType: "conced",
        });
    }
    
    placedPiece(x, y){
        API.call("setLatestMove", {
            mode: this.mode,
            roomCode: this.roomCode,
            playerCode: this.playerCode,
            moveType: "placePiece",
            x: x,
            y: y
        });
    }
}
'use strict';
import { Game } from "./game.js";
import { Player, DummyPlayer, OnlinePlayer } from "./player.js";
import { API } from "./apiCall.js"

//サーバー側に残っているルームを削除
API.call("checkDisconnectedRoom");

const OPERATION_ELEMENT = {
    readyElement(){
        document.getElementById("games_outer").style.display = "none";
        document.getElementById("cancel_button").style.display = "block";
        document.getElementById("board").style.display = "flex";
        document.getElementById("player_name").style.display = "flex";
    }, 
    undoElement(){
        document.getElementById("player_name").style.display = "none";
        document.getElementById("board").style.display = "none";
        document.getElementById("cancel_button").style.display = "none";
        document.getElementById("games_outer").style.display = "block";
        document.getElementById("message").innerText = "";
        document.getElementById("message").style.display = "none";
        document.getElementById("cancel_button").removeEventListener("click", OPERATION_ELEMENT.undoElement);
        
        //location.reload();
    }, 
    onSettled(message){
        document.getElementById("message").innerText = message;
        document.getElementById("message").style.display = "flex";
        document.getElementById("cancel_button").addEventListener("click", OPERATION_ELEMENT.undoElement);
    },
}

class OfflineRoom{
    start(){
        OPERATION_ELEMENT.readyElement();
        const player1 = new Player("player1");
        const player2 = new Player("player2");
        const game = new Game(
            player1, 
            player2, 
            [player1, player2], 
            (winner) => OPERATION_ELEMENT.onSettled(`${winner.name} Win!`)
        );
    }
}

class MonkeyRoom{
    start(){
        OPERATION_ELEMENT.readyElement();
        const player1 = new Player("You");
        const player2 = new DummyPlayer("Monkey");
        const game = new Game(
            player1,
            player2,
            [player1],
            (winner) => OPERATION_ELEMENT.onSettled(`You ${winner.name == "You" ? "Win!" : "Lose..."}`)
        );
    }
}

class OnlineRoom{
    roomCode = null;
    playerNum = null;
    playerCode = null;
    state = "waiting";

    constructor(){
        document.getElementById("games_outer").style.display = "none";
        document.getElementById("message").innerText = "対戦相手を待っています";
        document.getElementById("message").style.display = "flex";
        API.call("getFreeRoomCode", {}, (response)=>{
            console.log(response)
            this.roomCode = response.room;
            this.playerNum = response.playerNum;
            this.playerCode = response.playerCode;
            this.checkRoomState()
        });
    }

    checkRoomState(){
        API.call("getRoomState", {roomCode: this.roomCode, playerCode: this.playerCode}, (response)=>{
            if (this.state == "settled")return;

            if (response.state == "removed"){
                alert("接続が切れました。");
                location.reload();
            }
            if(this.state == "waiting" && response.state == "playing"){
                document.getElementById("message").style.display = "none";
                this.start();
            }
            this.state = response.state;

            document.getElementById("message").innerText = document.getElementById("message").innerText + ".";

            if (document.getElementById("message").innerText == "対戦相手を待っています....")
                document.getElementById("message").innerText = "対戦相手を待っています";

            setTimeout(()=>{
                this.checkRoomState();
            }, 500);
        });
    }
    
    start(){
        OPERATION_ELEMENT.readyElement();
        const players = [new Player("あなた"), new OnlinePlayer("相手", "free", this.roomCode, this.playerCode)]
        const player1 = players[this.playerNum - 1];
        const player2 = players[this.playerNum % 2];
        const game = new Game(
            player1, 
            player2, 
            [players[0]], 
            (winner, message) => {
                this.state = "settled";
                OPERATION_ELEMENT.onSettled(`You ${winner.name == "あなた" ? `Win! ${message}` : "Lose..."}`);
            }
        );
    }
}

function selectGame(element){
    if(element.className.includes("offline_mode")){
        const room = new OfflineRoom();
        room.start();
    }

    if(element.className.includes("monkey_mode")){
        const room = new MonkeyRoom();
        room.start();
    }
    
    if(element.className.includes("free_online_mode")){
        const room = new OnlineRoom();
    }
}

for (const element of document.getElementsByClassName("game_selector")) {
    element.addEventListener("click", ()=>selectGame(element));
}

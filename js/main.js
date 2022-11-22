'use strict';
import { API } from "./apiCall.js"
import { OfflineRoom, AIRoom, OnlineRoom, PrivateOnlineRoom } from "./room.js";

//サーバー側に残っているルームを削除
API.call("checkDisconnectedRoom");

//選択ボタンにイベントを付与
for (const element of document.getElementsByClassName("game_selector")) {
    element.addEventListener("click", ()=>selectMode(element));
}

function selectMode(element){
    if(element.id == "offline_mode"){
        const room = new OfflineRoom();
        room.start();
    }

    if(element.id == "ai_mode"){
        const room = new AIRoom();
        room.start();
    }
    
    if(element.id == "free_online_mode"){
        const room = new OnlineRoom();
        room.startMatching();
    }

    if(element.id == "private_start"){
        const room = new PrivateOnlineRoom();
        room.createRoom();
    }

    if(element.id == "private_join"){
        const roomCode = prompt("ルームコードを入力してください。");
        if(!roomCode.match(/^\d\d\d\d$/)){
            alert("ルームコードは4桁の半角数字で入力してください。");
            return;
        }
        const room = new PrivateOnlineRoom();
        room.joinRoom(roomCode);
    }

    if(element.id == "show_help"){
        document.getElementById("games").style.display = "none"
        document.getElementById("cancel_button").style.display = "flex";
        document.getElementById("help").style.display = "block"

        const hideHelp = ()=>{
            document.getElementById("cancel_button").removeEventListener("click", hideHelp);

            document.getElementById("help").style.display = "none";
            document.getElementById("cancel_button").style.display = "none";
            document.getElementById("games").style.display = "block";
        }

        document.getElementById("cancel_button").addEventListener("click", hideHelp);
    }
}
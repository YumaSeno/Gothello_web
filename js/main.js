'use strict';
import { API } from "./apiCall.js"
import { OfflineRoom, MonkeyRoom, OnlineRoom, PrivateOnlineRoom } from "./room.js";

//サーバー側に残っているルームを削除
API.call("checkDisconnectedRoom");

//選択ボタンにイベントを付与
for (const element of document.getElementsByClassName("game_selector")) {
    element.addEventListener("click", ()=>selectGame(element));
}

function selectGame(element){
    if(element.id == "offline_mode"){
        const room = new OfflineRoom();
        room.start();
    }

    if(element.id == "monkey_mode"){
        const room = new MonkeyRoom();
        room.start();
    }
    
    if(element.id == "free_online_mode"){
        const room = new OnlineRoom();
    }

    if(element.id == "private_start"){
        const room = new PrivateOnlineRoom(true);
    }

    if(element.id == "private_join"){
        try {
            const roomCode = prompt("ルームコードを入力してください。");
            if(roomCode.match(/^\d\d\d\d$/)){
                const room = new PrivateOnlineRoom(false, roomCode);
            }else{
                alert("ルームコードは4桁の半角数字で入力してください。")
            }
        } catch (error) {
            alert(error);
            location.reload();
        }
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
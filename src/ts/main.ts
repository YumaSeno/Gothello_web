
'use strict';
import { API } from "./common/apiCall"
import { OfflineRoom, AIRoom, OnlineRoom, PrivateOnlineRoom, AIAIRoom } from "./room";

//サーバー側に残っているルームを削除
API.call("checkDisconnectedRoom");

//選択ボタンにイベントを付与
for (const element of Array.from(document.getElementsByClassName("game_selector"))) {
    (element as HTMLElement).addEventListener("click", ()=>selectMode(element as HTMLElement));
}

function selectMode(element: HTMLElement){
    if(element.id == "offline_mode"){
        const room = new OfflineRoom();
        room.start();
    }

    if(element.id == "ai_mode"){
        const room = new AIRoom();
        room.start();
    }

    if(element.id == "aiai_mode"){
        const room = new AIAIRoom();
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
        if(!roomCode!.match(/^\d\d\d\d$/)){
            alert("ルームコードは4桁の半角数字で入力してください。");
            return;
        }
        const room = new PrivateOnlineRoom();
        room.joinRoom(roomCode!);
    }

    if(element.id == "show_help"){
        (document.getElementById("games") as HTMLElement).style.display = "none";
        (document.getElementById("cancel_button") as HTMLElement).style.display = "flex";
        (document.getElementById("help") as HTMLElement).style.display = "block";

        const hideHelp = ()=>{
            (document.getElementById("cancel_button") as HTMLElement).removeEventListener("click", hideHelp);

            (document.getElementById("help") as HTMLElement).style.display = "none";
            (document.getElementById("cancel_button") as HTMLElement).style.display = "none";
            (document.getElementById("games") as HTMLElement).style.display = "block";
        }

        (document.getElementById("cancel_button") as HTMLElement).addEventListener("click", hideHelp);
    }
}

<?php
header('Content-Type: application/json');

function getLooms($path){
    $freeLooms = [];
    foreach (glob("$path*") as $folderFullName) {
        $folderName = basename($folderFullName);
        if (preg_match("/^[0-9]{4}$/", $folderName)) 
            $freeLooms[] = $folderName;
    }
    return $freeLooms;
}

function createRoom($path){
    $rooms = getLooms($path);
    $room = rand(1000, 9999);
    while(in_array($room, $rooms, true)){
        $room = rand(1000, 9999);
    }

    $playerNum = rand(1, 2);
    $times = [-1, -1];
    $times[$playerNum - 1] = time();

    $playerCodes = [rand(0,999999999), rand(0,999999999)];
    $playerCode = $playerCodes[$playerNum - 1];

    mkdir($path. (string)$room);
    file_put_contents($path . (string)$room . "/player_1_state.json", json_encode(["time" => $times[0], "playerCode" => $playerCodes[0]]));
    file_put_contents($path . (string)$room . "/player_2_state.json", json_encode(["time" => $times[1], "playerCode" => $playerCodes[1]]));
    file_put_contents($path . (string)$room . "/latestMove.json", json_encode(["moveType" => "create", "playerCode" => 0]));
    return [$room, $playerNum, $playerCode];
}

function removeRoom($path, $room){
    remove_directory($path . (string)$room);
}

function remove_directory($dir) {
    $files = array_diff(scandir($dir), array('.','..'));
    foreach ($files as $file) {
        if (is_dir("$dir/$file")) {
            remove_directory("$dir/$file");
        } else {
            unlink("$dir/$file");
        }
    }
    return rmdir($dir);
}

function main(){
    $canEnterRooms = [];
    $path = "../games/private/";
    if(strlen($path) > 0 && !is_dir($path)) mkdir($path, 0777, true);
    foreach (getLooms($path) as $room) {
        $player_1_state = json_decode(file_get_contents($path . (string)$room . "/player_1_state.json"), true);
        $player_2_state = json_decode(file_get_contents($path . (string)$room . "/player_2_state.json"), true);

        if($player_1_state["time"] >=0 && time() - $player_1_state["time"] > 30) {
            removeRoom($path, $room);
            continue;
        }
        if($player_2_state["time"] >=0 && time() - $player_2_state["time"] > 30) {
            removeRoom($path, $room);
            continue;
        }
    }

    $return = createRoom($path);
    $room = (string)$return[0];
    $playerNum = $return[1];
    $playerCode = $return[2];

    echo json_encode(["room" => $room, "playerNum" => $playerNum, "playerCode" => $playerCode]);
}

main();
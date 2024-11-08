<?php
header('Content-Type: application/json');

function getLooms($path){
    $looms = [];
    foreach (glob("$path*") as $folderFullName) {
        $folderName = basename($folderFullName);
        if (preg_match("/^[0-9]{4}$/", $folderName)) 
            $looms[] = $folderName;
    }
    return $looms;
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
    if(!isset($_POST["roomCode"]) ||
       !isset($_POST["playerCode"]) ||
       !isset($_POST["mode"])){
        echo "error - パラメ-ータが足りません。";
        exit;
    }
    $roomCode = $_POST["roomCode"];
    $playerCode = $_POST["playerCode"];
    $mode = $_POST["mode"];

    $path = "../games/$mode/";
    
    if(!file_exists($path . (string)$roomCode)){
        echo '{"state" : "removed"}';
        exit;
    }

    $player_1_state = json_decode(file_get_contents($path . (string)$roomCode . "/player_1_state.json"), true);
    $player_2_state = json_decode(file_get_contents($path . (string)$roomCode . "/player_2_state.json"), true);

    if ($player_1_state["playerCode"] == $playerCode) {
        $player_1_state["time"] = time();
        file_put_contents($path . (string)$roomCode . "/player_1_state.json", json_encode($player_1_state));
    }
    if ($player_2_state["playerCode"] == $playerCode) {
        $player_2_state["time"] = time();
        file_put_contents($path . (string)$roomCode . "/player_2_state.json", json_encode($player_2_state));
    }

    if($player_1_state["time"] >=0 && time() - $player_1_state["time"] > 30) {
        removeRoom($path, $roomCode);
        echo '{"state" : "removed"}';
        exit;
    }
    if($player_2_state["time"] >=0 && time() - $player_2_state["time"] > 30) {
        removeRoom($path, $roomCode);
        echo '{"state" : "removed"}';
        exit;
    }

    $roomState = "waiting";

    if($player_1_state["time"] >=0 && $player_2_state["time"] >=0) $roomState = "playing";

    echo json_encode(["state" => $roomState]);
}

main();
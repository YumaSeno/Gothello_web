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

function joinRoom($path){
    $player_1_state = json_decode(file_get_contents($path . "/player_1_state.json"), true);
    $player_2_state = json_decode(file_get_contents($path . "/player_2_state.json"), true);

    $playerNum = 1;
    $data = $player_1_state;
    if($player_1_state["time"] >= 0){
        $playerNum = 2;
        $data = $player_2_state;
    }
    $playerCode = rand(0,999999999);

    $data["time"] = time();
    $data["playerCode"] = $playerCode;
    file_put_contents($path . "/player_${playerNum}_state.json", json_encode($data));

    return [$playerNum, $playerCode];
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
    if(!isset($_POST["roomCode"])){
        echo "error - roomCodeが入力されていません";
        exit;
    }
    $roomCode = $_POST["roomCode"];
    
    $path = "../games/free/$roomCode";

    if(!file_exists($path)){
        echo '{"joined" : false}';
        exit;
    }

    $player_1_state = json_decode(file_get_contents($path . "/player_1_state.json"), true);
    $player_2_state = json_decode(file_get_contents($path . "/player_2_state.json"), true);
    if($player_1_state["time"] >=0 && time() - $player_1_state["time"] > 30) {
        remove_directory($path);
        echo '{"joined" : false}';
        exit;
    }
    if($player_2_state["time"] >=0 && time() - $player_2_state["time"] > 30) {
        remove_directory($path);
        echo '{"joined" : false}';
        exit;
    }
    if($player_1_state["time"] >= 0 && $player_2_state["time"] >= 0){
        echo '{"joined" : false}';
        exit;
    }

    $return = joinRoom($path);
    $playerNum = $return[0];
    $playerCode = $return[1];

    echo json_encode(["joined" => true, "playerNum" => $playerNum, "playerCode" => $playerCode]);
} 

main();
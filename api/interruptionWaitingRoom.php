<?php

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

if(!isset($_POST["roomCode"]) || 
   !isset($_POST["playerCode"])|| 
   !isset($_POST["mode"])){
    echo "error - パラメータが足りません。";
    exit;
}
$roomCode = $_POST["roomCode"];
$playerCode = (int)$_POST["playerCode"];
$mode = $_POST["mode"];

if($mode !== "free" && $mode !== "private"){
    echo "error - modeパラメータが想定外の値です。";
    exit;
}

$path = "../games/$mode/$roomCode/";
    
if(!file_exists($path)){
    echo "error - ルームが存在しません。";
    exit;
}

$player_1_code = json_decode(file_get_contents($path . "/player_1_state.json"), true);
$player_2_code = json_decode(file_get_contents($path . "/player_2_state.json"), true);
if($player_1_code["playerCode"] !== $playerCode && $player_2_code["playerCode"] !== $playerCode){
    echo "error - 不正なプレイヤーコードです。";
    exit;
}

if($player_1_code["time"] >= 0 && $player_2_code["time"] >= 0)exit;

remove_directory("../games/$mode/$roomCode");

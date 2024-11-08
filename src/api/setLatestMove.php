<?php

if(!isset($_POST["roomCode"]) || 
   !isset($_POST["playerCode"])|| 
   !isset($_POST["mode"])|| 
   !isset($_POST["moveType"])){
    echo "error - パラメータが足りません。";
    exit;
}
$roomCode = $_POST["roomCode"];
$playerCode = (int)$_POST["playerCode"];
$mode = $_POST["mode"];
$moveType = $_POST["moveType"];

if($mode !== "free" && $mode !== "private"){
    echo "error - modeパラメータが想定外の値です。";
    exit;
}

$path = "../games/$mode/$roomCode/";
    
if(!file_exists($path)){
    echo "error - ルームが存在しません。";
    exit;
}

$player_1_code = json_decode(file_get_contents($path . "/player_1_state.json"), true)["playerCode"];
$player_2_code = json_decode(file_get_contents($path . "/player_2_state.json"), true)["playerCode"];
if($player_1_code !== $playerCode && $player_2_code !== $playerCode){
    echo "error - 不正なプレイヤーコードです。";
    exit;
}

$latestMove = json_decode(file_get_contents($path . "latestMove.json"), true);
if ($latestMove["playerCode"] == $playerCode){
    exit;
}

switch ($moveType) {
    case 'placePiece':
        
        if(!isset($_POST["x"]) || 
           !isset($_POST["y"])){
            echo "error - パラメータが足りません。";
            exit;
        }

        $latestMove["moveType"] = $moveType;
        $latestMove["playerCode"] = $playerCode;
        $latestMove["x"] = (int)$_POST["x"];
        $latestMove["y"] = (int)$_POST["y"];

        file_put_contents($path . "latestMove.json", json_encode($latestMove));

        break;
        
    case 'conced':
        $latestMove["moveType"] = $moveType;
        $latestMove["playerCode"] = $playerCode;
        
        file_put_contents($path . "latestMove.json", json_encode($latestMove));

        break;
    
    default:
        echo "error - 不正なmoveTypeです。";
        exit;
}


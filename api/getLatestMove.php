<?php

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

$player_1_code = json_decode(file_get_contents($path . "/player_1_state.json"), true)["playerCode"];
$player_2_code = json_decode(file_get_contents($path . "/player_2_state.json"), true)["playerCode"];
if($player_1_code !== $playerCode && $player_2_code !== $playerCode){
    echo "error - 不正なプレイヤーコードです。";
    exit;
}

$latestMove = json_decode(file_get_contents($path . "latestMove.json"), true);
if ($latestMove["playerCode"] === $playerCode){
    echo json_encode((object)["moveType"=>"none"]);
    exit;
}

switch ($latestMove["moveType"]) {
    case 'placePiece':
        echo json_encode((object)["moveType" => "placePiece", "x" => $latestMove["x"], "y" => $latestMove["y"]]);
        file_put_contents($path . "latestMove.json", json_encode(["moveType" => "none", "playerCode" => 0]));
        exit;
        
    case 'conced':
        echo json_encode((object)["moveType" => "conced"]);
        file_put_contents($path . "latestMove.json", json_encode(["moveType" => "none", "playerCode" => 0]));
        exit;
    
    default:
        echo json_encode((object)["moveType" => "none"]);
        exit;
}

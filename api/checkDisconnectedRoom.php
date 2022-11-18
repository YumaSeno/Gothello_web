<?php

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

function getLooms($path){
    $freeLooms = [];
    foreach (glob("$path*") as $folderFullName) {
        $folderName = basename($folderFullName);
        if (preg_match("/^[0-9]{4}$/", $folderName)) 
            $freeLooms[] = $folderName;
    }
    return $freeLooms;
}

function check($path){
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
}

check("../games/free/");
check("../games/priavate/");
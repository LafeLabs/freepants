<?php

// list files and or directories in a directory


if(isset($_GET["filename"])){
    $filename = $_GET["filename"];//
    $files = scandir(getcwd()."/".$filename);
}
else{
    $files = scandir(getcwd());
}


if(isset($_GET["type"])){
    if($_GET["type"] == "dir"){
        $dirs = [];
        foreach($files as $value){
            if($value[0] != "." && is_dir($value) && $value != "php" && $value != "jscode" && $value != "data" && $value != "html" && $value != "symbols" && $value != "fonts" && $value != "icons" && $value != "iconsymbols" && $value != "uploadimages" && $value != "symbol" && $value != "symbolfeed" && $value != "maps" && $value != "scrolls"){
                array_push($dirs,$value);
            }
        }
        echo json_encode($dirs);
    }
    else{
        $ending = $_GET["type"];
        $namelist = [];    
        foreach($files as $value){
            if(substr($value,-strlen($ending)) == $ending){
                array_push($namelist,$value);
            }
        }    
        echo json_encode($namelist);
    }
}
else{
    $dirs = [];
    foreach($files as $value){
        if($value[0] != "."){
        array_push($dirs,$value);
        }
    }
    echo json_encode($dirs);
}


?>

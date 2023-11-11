 <!doctype html>
<html>
<head>
 <!-- 
PUBLIC DOMAIN, NO COPYRIGHTS, NO PATENTS.

EVERYTHING IS PHYSICAL
EVERYTHING IS FRACTAL
EVERYTHING IS RECURSIVE
NO MONEY
NO PROPERTY
NO MINING
EGO DEATH:
    LOOK TO THE INSECTS
    LOOK TO THE FUNGI
    LANGUAGE IS HOW THE MIND PARSES REALITY
-->
<!--Stop Google:-->
<META NAME="robots" CONTENT="noindex,nofollow">
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.6/ace.js" type="text/javascript" charset="utf-8"></script>
<title>PHP Editor replicator</title>
</head>
<body>
<div id = "lightdarkbutton" class = "button">DARK MODE</div>

<div id = "linkscroll">

<a href = "index.html">index.html</a>
<a href = "dnagenerator.php">dnagenerator.php</a>
<a href = "text2php.php">text2php.php</a>


<?php
    $topfiles = scandir(getcwd());

    foreach($topfiles as $value){
        if(substr($value,-5) == ".html"){
            echo "\n<a href = \"".$value."\">".$value."</a>\n";
        }

    }

?>
</div>
<div id = "namediv"></div>
<div id="maineditor" contenteditable="true" spellcheck="false"></div>
<div id = "filescroll">


<?php
    $topfiles = scandir(getcwd());

    foreach($topfiles as $value){
        if(substr($value,-5) == ".html" || substr($value,-4) == ".svg"){
            echo "\n<div class = \"html file\">".$value."</div>\n";
        }
        if(substr($value,-3) == ".py"){
            echo "\n<div class = \"python file\">".$value."</div>\n";
        }
        if(substr($value,-3) == ".md"){
            echo "\n<div class = \"markdown file\">".$value."</div>\n";
        }
        if(substr($value,-3) == ".sh"){
            echo "\n<div class = \"sh file\">".$value."</div>\n";
        }
        if(substr($value,-3) == ".js"){
            echo "\n<div class = \"javascript file\">".$value."</div>\n";
        }
        if(substr($value,-4) == ".css"){
            echo "\n<div class = \"css file\">".$value."</div>\n";
        }
        if(substr($value,-4) == ".txt"){
            echo "\n<div class = \"txt file\">".$value."</div>\n";
        }
        
    }


    $phpfiles = scandir(getcwd()."/php");

    foreach($phpfiles as $value){
        if($value[0] != "."){
            echo "<div class = \"php file\">php/";
            echo $value;
            echo "</div>\n";
        }
    }

    $jsfiles = scandir(getcwd()."/jscode");

    foreach($jsfiles as $value){
        if($value[0] != "."){
            echo "<div class = \"javascript file\">jscode/";
            echo $value;
            echo "</div>\n";
        }
    }

    $cssfiles = scandir(getcwd()."/css");

    foreach($cssfiles as $value){
        if($value[0] != "."){
            echo "<div class = \"css file\">css/";
            echo $value;
            echo "</div>\n";
        }
    }


    $datafiles = scandir(getcwd()."/data");

    foreach($datafiles as $value){
        if($value[0] != "."){
            echo "<div class = \"javascript file\">data/";
            echo $value;
            echo "</div>\n";
        }
    }

    if(isset($_GET["newfile"])){
        $newfile = $_GET["newfile"];
        if(substr($newfile,-5) == ".html" || substr($newfile,-4) == ".svg"){
            echo "<div class = \"html file\">";
            echo $newfile;
            echo "</div>\n";
        }
        if(substr($newfile,-3) == ".md"){
            echo "<div class = \"markdown file\">";
            echo $newfile;
            echo "</div>\n";
        }
        if(substr($newfile,-4) == ".css"){
            echo "<div class = \"css file\">";
            echo $newfile;
            echo "</div>\n";
        }
        if(substr($newfile,-4) == ".txt"){
            echo "<div class = \"txt file\">";
            echo $newfile;
            echo "</div>\n";
        }
        if(substr($newfile,-3) == ".py"){
            echo "<div class = \"python file\">";
            echo $newfile;
            echo "</div>\n";
        }
        if(substr($newfile,-3) == ".sh"){
            echo "<div class = \"sh file\">";
            echo $newfile;
            echo "</div>\n";
        }
        if(substr($newfile,0,3) == "php"){
            echo "<div class = \"php file\">";
            echo $newfile;
            echo "</div>\n";
        }
        if(substr($newfile,0,7) == "jscode/"){
            echo "<div class = \"javascript file\">";
            echo $newfile;
            echo "</div>\n";
        }
//        if(substr($newfile,0,5) == "maps/"){
  //          echo "<div class = \"javascript file\">";
    //        echo $newfile;
      //      echo "</div>\n";
    //    }
        if(substr($newfile,0,5) == "data/"){
            echo "<div class = \"javascript file\">";
            echo $newfile;
            echo "</div>\n";
        }

    }


?>

</div>

<script>
currentFile = "index.html";
var httpc = new XMLHttpRequest();
httpc.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        filedata = this.responseText;
        editor.setValue(filedata);
    }
};
httpc.open("GET", "fileloader.php?filename=" + currentFile, true);
httpc.send();
files = document.getElementById("filescroll").getElementsByClassName("file");
for(var index = 0;index < files.length;index++){
    files[index].onclick = function(){
        currentFile = this.innerHTML;
        //use php script to load current file;
        var httpc = new XMLHttpRequest();
        httpc.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                filedata = this.responseText;
                editor.setValue(filedata);
                var fileType = currentFile.split("/")[0]; 
                var fileName = currentFile.split("/")[1];
              
            }
        };
        httpc.open("GET", "fileloader.php?filename=" + currentFile, true);
        httpc.send();
        if(this.classList[0] == "css"){
            editor.getSession().setMode("ace/mode/css");
            document.getElementById("namediv").style.color = "yellow";
            document.getElementById("namediv").style.borderColor = "yellow";
        }
        if(this.classList[0] == "html"){
            editor.getSession().setMode("ace/mode/html");
            document.getElementById("namediv").style.color = "#0000ff";
            document.getElementById("namediv").style.borderColor = "#0000ff";
        }
        if(this.classList[0] == "scrolls"){
            editor.getSession().setMode("ace/mode/html");
            document.getElementById("namediv").style.color = "#87CEEB";
            document.getElementById("namediv").style.borderColor = "#87CEEB";
        }
        if(this.classList[0] == "javascript"){
            editor.getSession().setMode("ace/mode/javascript");
            document.getElementById("namediv").style.color = "#ff0000";
            document.getElementById("namediv").style.borderColor = "#ff0000";
        }
        if(this.classList[0] == "bytecode"){
            editor.getSession().setMode("ace/mode/text");
            document.getElementById("namediv").style.color = "#654321";
            document.getElementById("namediv").style.borderColor = "#654321";
        }
        if(this.classList[0] == "php"){
            editor.getSession().setMode("ace/mode/php");
            document.getElementById("namediv").style.color = "#800080";
            document.getElementById("namediv").style.borderColor = "#800080";
        }
        if(this.classList[0] == "python"){
            editor.getSession().setMode("ace/mode/python");
            document.getElementById("namediv").style.color = "#add8e6";
            document.getElementById("namediv").style.borderColor = "#add8e6";
        }        
        if(this.classList[0] == "json"){
            editor.getSession().setMode("ace/mode/json");
            document.getElementById("namediv").style.color = "orange";
            document.getElementById("namediv").style.borderColor = "orange";
        }
        if(this.classList[0] == "markdown"){
            editor.getSession().setMode("ace/mode/markdown");
            document.getElementById("namediv").style.color = "aqua";
            document.getElementById("namediv").style.borderColor = "aqua";
        }
        if(this.classList[0] == "sh"){
            editor.getSession().setMode("ace/mode/sh");
            document.getElementById("namediv").style.color = "white";
            document.getElementById("namediv").style.borderColor = "aqua";
        }
        document.getElementById("namediv").innerHTML = currentFile;
    }
}
document.getElementById("namediv").innerHTML = currentFile;
document.getElementById("namediv").style.color = "#0000ff";
document.getElementById("namediv").style.borderColor = "#0000ff";

editor = ace.edit("maineditor");
editor.setTheme("ace/theme/github");
//editor.setTheme("ace/theme/vibrant_ink");
editor.getSession().setMode("ace/mode/html");
editor.getSession().setUseWrapMode(true);
editor.$blockScrolling = Infinity;

document.getElementById("maineditor").onkeyup = function(){
    data = encodeURIComponent(editor.getSession().getValue());
    var httpc = new XMLHttpRequest();
    var url = "filesaver.php";        
    httpc.open("POST", url, true);
    httpc.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    httpc.send("data="+data+"&filename="+currentFile);//send text to filesaver.php
    var fileType = currentFile.split("/")[0]; 
    var fileName = currentFile.split("/")[1];
}

lightmode = false;
document.getElementById("lightdarkbutton").onclick = function(){
    lightmode = !lightmode;
    if(lightmode){
        document.getElementById("filescroll").style.backgroundColor = "white";
        document.getElementById("namediv").style.backgroundColor = "#eeeeee";
        document.body.style.backgroundColor = "#b0b0b0";
        document.getElementById("lightdarkbutton").innerHTML = "DARK MODE";
        editor.setTheme("ace/theme/github");
        document.getElementById("linkscroll").style.backgroundColor = "#eeeeee";
        var links = document.getElementById("linkscroll").getElementsByTagName("a");
        for(var index = 0;index < links.length;index++){
            links[index].style.color = "black";
        }
    }
    else{
        document.body.style.backgroundColor = "#404040";
        document.getElementById("filescroll").style.backgroundColor = "#101010";        
        document.getElementById("namediv").style.backgroundColor = "#101010";        
        document.getElementById("lightdarkbutton").innerHTML = "LIGHT MODE";        
        editor.setTheme("ace/theme/vibrant_ink");
        document.getElementById("linkscroll").style.backgroundColor = "#101010";
        var links = document.getElementById("linkscroll").getElementsByTagName("a");
        for(var index = 0;index < links.length;index++){
            links[index].style.color = "white";
        }        
    }
}

document.body.style.backgroundColor = "#404040";
document.getElementById("filescroll").style.backgroundColor = "#101010";        
document.getElementById("namediv").style.backgroundColor = "#101010";        
document.getElementById("lightdarkbutton").innerHTML = "LIGHT MODE";        
editor.setTheme("ace/theme/vibrant_ink");
document.getElementById("linkscroll").style.backgroundColor = "#101010";

var links = document.getElementById("linkscroll").getElementsByTagName("a");
for(var index = 0;index < links.length;index++){
    links[index].style.color = "white";
}   
</script>
<style>
#namediv{
    position:absolute;
    top:5px;
    left:20%;
    font-family:courier;
    padding:0.5em 0.5em 0.5em 0.5em;
    border:solid;
    background-color:#eeeeee;

}
a{
    color:black;
    display:block;
    margin-bottom:0.5em;
    margin-left:0.5em;
}
body{
    background-color:#b0b0b0;
}
.html{
    color:#0000ff;
}
.css{
    color:yellow;
}
.txt{
    background-color:#B0916E;
}
.php{
    color:#800080;
}
.javascript{
    color:#ff0000;
}
.bytecode{
    color:#654321;
}
.json{
    color:orange;
}
.python{
    color:#add8e6;
}
.scrolls{
    color:#87ceeb;
}
.markdown{
    color:aqua;
}
.sh{
    color:white;
}

.file{
    cursor:pointer;
    border-radius:0.25em;
    border:solid;
    padding:0.25em 0.25em 0.25em 0.25em;
}
.files:hover{
    background-color:green;
}
.files:active{
    background-color:yellow;
}
#filescroll{
    position:absolute;
    overflow:scroll;
    top:60%;
    bottom:0%;
    right:0%;
    left:75%;
    border:solid;
    border-radius:5px;
    border-width:3px;
    background-color:white;
    font-family:courier;
    font-size:22px;
    z-index:99999999;
}
#linkscroll{
    position:absolute;
    overflow:scroll;
    top:5em;
    bottom:50%;
    right:0px;
    left:75%;
    border:solid;
    border-radius:5px;
    border-width:3px;
    background-color:#eeeeee;
    font-family:courier;
    font-size:22px;
}
#maineditor{
    position:absolute;
    left:0%;
    top:5em;
    bottom:1em;
    right:30%;
    font-size:22px;
    border:solid;
    border-color:black;
}
#lightdarkbutton{
    position:absolute;
    right:5px;
    top:5px;
    text-align:center;
    border:solid;
    border-radius:3px;
}
.button{
    cursor:pointer;
}
.button:hover{
    background-color:green;
}
.button:active{
    background-color:yellow;
}

</style>

</body>
</html>
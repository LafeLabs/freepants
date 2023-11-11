 <?php
/* javascript this pairs with:

    var httpc = new XMLHttpRequest();
    var url = "deletefile.php";        
    httpc.open("POST", url, true);
    httpc.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    httpc.send("filename=" + currentFile);//send text to filesaver.php

*/

    $filename = $_POST["filename"];
    unlink($filename);
?>
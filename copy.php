<?php

// copy from a url to a local file on server 

if(isset($_GET["from"]) && isset($_GET["to"])){
    $from = $_GET["from"];
    $to = $_GET["to"];
    copy($from,$to);
}


?>
<a href = "index.html">CLICK TO GO HOME</a>

<style>
a{
    font-size:3em;
}
</style>

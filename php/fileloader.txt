<?php
$filename = $_REQUEST["filename"];//get url
$data = file_get_contents($filename);
echo $data;
?>
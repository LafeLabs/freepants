 <?php
/* javascript this pairs with:

document.getElementById("maineditor").onkeyup = function(){
    data = encodeURIComponent(editor.getSession().getValue());
    var httpc = new XMLHttpRequest();
    var url = "/filesaver.php";        
    httpc.open("POST", url, true);
    httpc.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    httpc.send("data="+data+"&filename="+currentFile);//send text to filesaver.php
    console.log(data);//for debugging, always potentially useful
}
*/
    $data = $_POST["data"]; //get data 
    $filename = $_POST["filename"];
    $file = fopen($filename,"w");// create new file with this name
    fwrite($file,$data); //write data to file
    fclose($file);  //close file
?>
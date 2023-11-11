 <?php
/* javascript this pairs with:

*/

    $img = $_POST["data"]; //get data 
    $filename = $_POST["filename"];
    $file = fopen($filename,"w");// create new file with this name

    $img = str_replace('data:image/png;base64,', '', $img);
    $img = str_replace(' ', '+', $img);
    $data = base64_decode($img);

    fwrite($file,$data); //write data to file

    fclose($file);  //close file
?>
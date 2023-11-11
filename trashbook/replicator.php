    <?php

    $dnaurl = "https://raw.githubusercontent.com/LafeLabs/trashbook/main/data/dna.txt";
    
    if(isset($_GET["dna"])){
        $dnaurl = $_GET["dna"];
    }
    
    
    $baseurl = explode("data/",$dnaurl)[0];
    $dnaraw = file_get_contents($dnaurl);
    $dna = json_decode($dnaraw);
    
    mkdir("data");
    mkdir("php");
    mkdir("scrolls");
    mkdir("iconsymbols");
    

    copy("https://raw.githubusercontent.com/LafeLabs/trashbook/main/php/replicator.txt","replicator.php");
    
    
    
    foreach($dna->html as $value){
        
        copy($baseurl.$value,$value);
    
    }
    
    foreach($dna->iconsymbols as $value){
        
        copy($baseurl."iconsymbols/".$value,"iconsymbols/".$value);
    
    }
    
    foreach($dna->data as $value){
        
        if($value != "scrollset.txt"){
            copy($baseurl."data/".$value,"data/".$value);
        }
        else{
            if(!file_exists("data/".$value)){
                copy($baseurl."data/".$value,"data/".$value);
            }
        }
        
    }
    
    foreach($dna->php as $value){
     
        copy($baseurl."php/".$value,"php/".$value);
        copy($baseurl."php/".$value,explode(".",$value)[0].".php");
    
    }
    
    foreach($dna->scrolls as $value){
        
        if($value == "home"){
            copy($baseurl."scrolls/".$value,"scrolls/".$value);
        }
    
        
    }
    
    
    ?>
    <a href = "index.html">CLICK TO GO TO PAGE</a>
    <style>
    body{
        background-color:#9f8767;
        font-family:Comic Sans MS;
    }
    a{
        font-size:3em;
    }
    </style>

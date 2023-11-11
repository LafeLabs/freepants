<!-- 
this program generates the file data/dna.txt
dna.txt is a json formatted file which points to all the files in this system, which is then used by replciator.php to copy the whole thing.  The file names are local, so that the replicator can work when pointed at any address where this system lives, which could be any new instance, so that the system can replicate without any reference to some centralized repository such as one on github. 
-->
<a href = "editor.php">editor.php</a>
<p></p>
<a href = "index.html">index.html</a>

<br/>
<pre>
<?php

    $files = scandir(getcwd());
    $phpfiles = scandir(getcwd()."/php");
    $datafiles = scandir(getcwd()."/data");
    $iconfiles = scandir(getcwd()."/iconsymbols");    

    
    $htmlfiles = [];
    foreach($files as $value){
        if(substr($value,-4) == ".txt" || substr($value,-4) == ".css" || substr($value,-5) == ".html" || substr($value,-3) == ".md" || substr($value,-3) == ".py" || substr($value,-3) == ".sh" || substr($value,-3) == ".js"){
            array_push($htmlfiles,$value);
        }
    }

    $dna = json_decode("{}");
    $dna->html = $htmlfiles;


    $dna->data = [];
    foreach($datafiles as $value){
        if($value[0] != "."){

            if(substr($value,-4) == ".txt"){
                array_push($dna->data,$value);
            }
            
        }
    }

    $dna->php = [];
    foreach($phpfiles as $value){
        if($value[0] != "."){
            array_push($dna->php,$value);
        }
    }


    $dna->iconsymbols = [];
    foreach($iconfiles as $value){
        if($value[0] != "."){
            array_push($dna->iconsymbols,$value);
        }
    }    


    echo json_encode($dna,JSON_PRETTY_PRINT);

    $file = fopen("data/dna.txt","w");// create new file with this name
    fwrite($file,json_encode($dna,JSON_PRETTY_PRINT)); //write data to file
    fclose($file);  //close file

?>
</pre>


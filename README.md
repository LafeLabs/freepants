# [Trash Magic Squares](https://github.com/lafelabs/squares)

![](https://raw.githubusercontent.com/LafeLabs/squares/main/trashmagic/github-qrcode.png)

## Squares: As Above, so below.

 - [index.html](index.html)
 - [http://localhost/](http://localhost/)
 - [https://www.southbroadway.net](https://www.southbroadway.net)
 - [https://www.colfax.site](https://www.colfax.site)
 - [https://www.sloanslake.art](https://www.sloanslake.art)

![screen shot of trash magic app which has handwriting reading "as abov, so below"](https://raw.githubusercontent.com/LafeLabs/squares/main/trashmagic/square-above.png)

![tarot card of the magician](https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg)

![image of cardboard square which reads "as above, so below"](https://raw.githubusercontent.com/LafeLabs/squares/main/trashmagic/square-below.png)


Trash Magic Replicator url:

```
https://raw.githubusercontent.com/LafeLabs/squares/main/php/replicator.txt
```

## 1. Replicate cardboard squares

4 inch cardboard squares.


## 2. Replicate Trash Magic Server

Go find a laptop in the trash and install Ubuntu on it.  

[Ubuntu Desktop install link](https://ubuntu.com/desktop)

Open a terminal and copy/paste the following:

```
sudo apt update
sudo apt install apache2 -y
sudo apt install php libapache2-mod-php -y
cd /var/www/html
sudo rm index.html
sudo apt install curl
sudo curl -o replicator.php https://raw.githubusercontent.com/LafeLabs/squares/main/php/replicator.txt
cd ..
sudo chmod -R 0777 *
cd html
php replicator.php
sudo chmod -R 0777 *
```

To create a folder in the desktop which is linked to the folder with all the html in it, create a symbolic link as follows:

```
ln -s /var/www/html/ /home/username/Desktop
```

Create sub-folder shortcuts as desired in a way similar to this:

```
ln -s /var/www/html/mixtape/ /home/username/Desktop
```


The Trash Magic server is now ready to share media over local networks by sharing links to the IP address of that machine on that network.  Put no personal or private data on the machine ever!  This system represents an unenclosed digital commons of which the network of trash magicians are the caretakers.  

You can use these machines to access servers over local networks, access servers over the Magic Dump, or share media on local networks.  Let us make millions and millions of these free servers!  Let us scale up the digital commons!  Let us use this system to spread a mutual aid network which we can all live on comfortably!



## 3. Replicate Magic Dump 


A TRASH MAGIC DUMP is an Internet connection controlled by a TRASH MAGIC OPERATOR, which can be set up to host multiple TRASH SERVERS and [RECURSIVE WEB](https://github.com/LafeLabs/trashmagic/tree/main/web/recursiveweb) instances.  

If you are an Operator with multiple TRASH MAGIC servers and you want to set up a dump, first choose one of the servers to act as a DUMP DIRECTOR.  To convert it to DUMP DIRECTOR you want to first stop and disable the Apache web server, since we're going to use another server instead.  A DUMP DIRECTOR is an [NGINX SERVER](https://www.nginx.com/) set up using [DOCKER ](https://www.docker.com/) and the GUI tool from [nginxproxymanager](https://nginxproxymanager.com/setup/#running-the-app). 

To stop and disable Apache from the command line type:

```
sudo update-rc.d apache2 disable
sudo service apache2 stop
```

follow the instructions to install Docker on whatever system you're running. 
[Here are some Raspberry Pi instructions](https://pimylifeup.com/raspberry-pi-docker/), which are as follows:

```
sudo apt update
sudo apt upgrade
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker pi
sudo reboot
```
then see that docker is in the list of groups by typing 
```
groups
```
test the installation with 
```
docker run hello-world
```
Now create a file in the home directory called docker-compose.yml, and copy paste the following code into it and save it:

```
version: "3"
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      # These ports are in format <host-port>:<container-port>
      - '80:80' # Public HTTP Port
      - '443:443' # Public HTTPS Port
      - '81:81' # Admin Web Port
      # Add any other Stream port you want to expose
      # - '21:21' # FTP

    # Uncomment the next line if you uncomment anything in the section
    # environment:
      # Uncomment this if you want to change the location of 
      # the SQLite DB file within the container
      # DB_SQLITE_FILE: "/data/database.sqlite"

      # Uncomment this if IPv6 is not enabled on your host
      # DISABLE_IPV6: 'true'

    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
```
Then run docker on this with 

```
docker compose up -d
```

(note there is a critical typo in the tutorial above it says docker-compose instead of "docker compose").

When this is set up, either go to [http://localhost:81] on the DUMP DIRECTOR or point a browser on another machine on the network to [ip address of DUMP DIRECTOR]:81 to get to the control panel.  Create a proxy host for each of the various domains you are pointing to your home network. You need a separate entry for [domain].[tld] than you do for www.[domain].[tld].  You can forward to any TRASH SERVER on the local network by IP address this way.  After they're set up, edit the entries to add ssl "let's encrypt" certificates.  Also be sure to add forwarding of the service "https" on your home router on port 443(you've already got port 80 from the above TRASH MAGIC SERVER setup).

Domains which operators purchase which are linked to physical spaces on the STREET and WATERSHED network are pointed to subdirectories of /var/www/html on one of the trash servers, allowing one server to hold many RECURSIVE WEB instances.  If several domains are forwarding to the same physical trash server in different subdirectories, we can route the incoming traffic correctly using apache virtual hosts. 


To do this, go to /etc/apache2/sites-available and run 

```
sudo cp /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/example.net.conf
```
Then 
```
sudo nano /etc/apache2/sites-available/example.net.conf
```
and edit as follows:

```
    DocumentRoot /var/www/html/web/southplattedotnet
    ServerName southplatte.net
    ServerAlias www.southplatte.net
```
And save with control X

Then use [a2ensite](https://manpages.ubuntu.com/manpages/trusty/man8/a2ensite.8.html) to enable the virtual host and [systemctl](https://man7.org/linux/man-pages/man1/systemctl.1.html) to reload apache:

```
sudo a2ensite southplatte.net
sudo systemctl reload apache2
```

With a dump set up like this, an operator can add any number of physical trash servers as well as any number of trash magic servers of all kinds on many domains all at one DUMP.  The TRASH MAGIC OPERATOR lives or works at a DUMP, which is a place they control the network connection and can set up hosting and can also store stuff for the TRASH MAGIC physical media feed, creating art and products from trash and distributing it along the WATERSHED and STREET networks.

To create a new server with the RECRURSIVE WEB, go to the local web on a TRASH MAGIC server and create a fork with the name of your domain like southbroadwaydotnet/. Use the apache virtual hosts above to forward traffic to that location, and use nginxproxymanager to forward traffic from that domain to whatever trash magic server holds this recursive web page.

THE RECURSIVE WEB IS MADE OF WORLDS AND QUESTS. YOU CONSTRUCT, REPLICATE AND DESTROY WORLDS AND QUESTS TO BUILD TRASH MAGIC.


To run apache on the same DUMP DIRECTOR machine that is running nginxproxymanager, change the port of apache from 80 to 8080, and forward whatever domains you want to host on that machine to that port and to the IP address of the machine(not localhost).  Set up the /var/www/html/web/placenamedotxyz folder as you would for another recursive web trash magic server as described above.  Each .conf file in /etc/apache2/sites-available should have the port set to 8080, including 000default.conf.  ALSO change the port in the file /etc/apache2/ports.conf, changing from "listen 80" to "listen 8080".


### Subdomain

to make a subdomain like [https://art.sloanslake.art](art.sloanslake.art) one repeats the process above.  This subdomain needs its own entry in the DNS A records from whoever manages the domain you own.  

You first add another entry to "@" and "www" which is whatever the first word is, e.g. "art" with art.sloanslake.art which points to your home IP address.

Then go to the NGINX proxy manager at [ip address of dump director]
:81 and add an entry for art.sloanslake.art, forwarding to either port 80 on a trash server other than the Dump Director machine or port 8080 if the page is on the Dump Director.

Fork one of your servers to create a page for the new subdomain.

As with the other pages, copy the conf file from another page

```
cd /etc/apache2/sites-available
sudo cp sloanslake.art.conf art.sloanslake.art.conf
sudo nano art.sloanslake.art.conf

```

Then edit that file so that it has forwarding to the appropriate folder for the fork you made above.  When the forwarding of the DNS is set up, the forwarding in nginx proxy manager is set up, and the .conf file is set up, start it with 

```
sudo a2ensite art.sloanslake.art
sudo systemctl reload apache2
```

Then when it's all set up, enable https with lets encrypt by way of nginx proxy manager.


### Replicate the Github using localhost

 - install PHP on your machine
 - create a new github repository on a CC0 PUBLIC DOMAIN license and clone it on your machine
 - copy the file [php/replicator.txt](php/replicator.txt) into a file called replicator.php in the new repo directory
 - run `php replicator.php` on your machine, wait for all the code to copy
 - push all that code up to your github repo
 - in the same directory, type `sudo php -S localhost:80`
 - go to [http://localhost](http://localhost) and you should get back to this screen, edit all elements of the system
 - use [editor.php](editor.php) to edit the file php/replicator.txt so that the two urls are the global url for *your* repo for both dna and replicator
 - after you've edited the code, click [text2php.php](text2php.php) to convert that to php
 - push your code to your github repo
 - use the new replicator code on your github repo to replicate out that instance to all other servers(linux, windows, mac, android) and forks
 - when you figure this out, make youtube videos showing other people how to copy the whole system, tell someone about those videos so that we can all link to them
 - 

 ### Replicate Phone Stand

![](https://raw.githubusercontent.com/LafeLabs/squares/main/trashmagic/phonestand1.png)

![](https://raw.githubusercontent.com/LafeLabs/squares/main/trashmagic/phonestand2.png)

![](https://raw.githubusercontent.com/LafeLabs/squares/main/trashmagic/phonestand3.png)


![](https://raw.githubusercontent.com/LafeLabs/squares/main/trashmagic/phonestand4.png)

### Relicate Geometron Hypercube


![](https://raw.githubusercontent.com/LafeLabs/network/main/trashmagic/sloanslake.png)
    
LET'S MAKE 1 BILLION CARDBOARD CUBES!
    
BILLIONS OF TONS OF CARDBOARD ARE THROWN OUT PER YEAR!  NOT POUNDS TONS!!! LET'S CAPTURE JUST A TINY SLIVER OF THAT TO MAKE 1 BILLION CUBES!  THIS IS THE CHALLENGE!
    
    
CUT OUT CARDBOARD TRASH INTO THE SIDES, STACK THEM 3 HIGH FOR SINGLE CORRUGATED 2 HIGH FOR DOUBLE CORRUGATED!  4 SIDES PER CUBE! DO THE SAME WITH THE BOTTOM!  USE ELMER'S GLUE TO STACK!  ASSEMBLE WITH GLUE!  GLUE SQUARES TO THE OUTSIDE AND DECORATE WITH INFORMATION ON REPLICATING THE CUBE!  PUT HYPERSIGNS IN THE CUBE!
    
BUILD A CUBE AND GET A PRIZE!  BUILD MORE CUBES AND GET MORE PRIZES!  SHOW OTHERS HOW TO COPY CUBES AND GET EVEN MORE PRIZES! INFINITE PRIZES!

we can give cubes to people who can then sell them.  point the web pages to the cubes point the cubes at the web pages.
    
    
GET DIMENSIONS FROM THIS DIAGRAM, THOSE RULERS HAVE INCH AND HALF INCH MARKINGS ON THEM:

![photograph of cardboard side of a cube](https://raw.githubusercontent.com/LafeLabs/hypercube/main/uploadimages/cardboardside.jpg)
    
THIS IS THE FILE YOU CAN SEND TO A LASER CUTTER:  PRINT IT 4 INCHES WIDE/HIGH:
    
    
![vector graphics file of cube side cutout for laser cutter](https://raw.githubusercontent.com/LafeLabs/hypercube/main/symbolfeed/side.svg)        
    
    
THIS IS THE LAYOUT OF THE BOTTOM, RULERS SHOW THE INCH AND  HALF INCH MARKINGS. COPY THESE TO GET THE BOTTOM PATTERN:

![photograph of box bottom](https://raw.githubusercontent.com/LafeLabs/hypercube/main/uploadimages/cardboardbottom.jpg)
    
VECTOR FILE TO SEND TO THE LASER CUTTER FOR THE BOTTOM:
    
![vector graphics file of bottom cutout](https://raw.githubusercontent.com/LafeLabs/hypercube/main/symbolfeed/bottom.svg)
    
THIS IS HOW THE SIDES AND BOTTOM FIT TOGETHER, LIKE A PUZZLE:
    
![an assembled corner of a cube](https://raw.githubusercontent.com/LafeLabs/hypercube/main/uploadimages/cardboardcorner.jpg)
    
    
TOUCH GRASS:

![a cardboard cube on grass](https://raw.githubusercontent.com/LafeLabs/hypercube/main/uploadimages/touchgrass.jpg)

THE INTERNET OF DIRT:
    
![a cardboard cube with a dandylion in it](https://raw.githubusercontent.com/LafeLabs/hypercube/main/uploadimages/dandylion0.png)
    

A HALF INCH GRID SHOWS HOW THE SIDE IS LAYED OUT:

![side of cube with pattern shown to guide replication](https://raw.githubusercontent.com/LafeLabs/hypercube/main/uploadimages/cube-side-pattern.jpg)
    
AND THE BOTTOM:

![bottom of a cube with pattern shown to guide layout](https://raw.githubusercontent.com/LafeLabs/hypercube/main/uploadimages/cube-bottom-pattern.jpg)


MAKE 3X6 INCH CARDBOARD CARDS AND PUT THEM IN THE CUBE!


![cards in a cube](https://raw.githubusercontent.com/LafeLabs/HYPERSIGN/main/trashmagic/cube-cards.png)


MAKE CARDS FOR THE VARIOUS ELEMENTS OF THE SET.  These cards are the "hypersign", a network of linked documents written on trash which can represent ANYTHING.


![cards in a cube and next to the cube, various things in the set](https://raw.githubusercontent.com/LafeLabs/HYPERSIGN/main/trashmagic/cards-in-cube.png)

![cards in a cube and next to the cube, various things in the set](https://raw.githubusercontent.com/LafeLabs/HYPERSIGN/main/trashmagic/cards-and-cube.png)


### Replicate this scroll via QR code

![](https://raw.githubusercontent.com/LafeLabs/HYPERSIGN/main/trashmagic/github-qrcode.png)

### Replicate SLIMEZISTOR trash synthesizer


The SlimeZistor is a relaxation oscillator which uses an LM358P op amp to charge and discharge a capacitor through some sample which is connected to the two probe wires.  The schematic is as follows, and should be copied and pasted on the bottom of each unit:    



![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-schematic-bottomsquare.png)


These are the kit parts:
    

![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-kit-parts.png)

Here are links to buy the parts from amazon(enough for about 50 units for about 40 dollars):    


 - [$15 bojack capacitor kit](https://www.amazon.com/BOJACK-Ceramic-Capacitor-Assortment-Capacitors/dp/B07P7HRGT9/)
 - [$6.32 10k resistors 100 units](https://www.amazon.com/Projects-100EP51210K0-10k-Resistors-Pack/dp/B0185FIOTA/)   
 - [$10 50 pin 0.1 inch pitch right angle header strips](https://www.amazon.com/Yohii-Single-Right-Header-Connector/dp/B07C89T16T/)
 - [$7 50 units LM358P op amps](https://www.amazon.com/BOJACK-LM358P-Operational-Amplifier-LM358N/dp/B07WQWPLSP/)


[$90 Digikey cart link with part set for 100 units](https://www.digikey.com/short/dr55prcw)

The circuit board is a 1x2 inch rectangle cut out of thin cardboard like a cereal box:    

![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-trashboard-photo.png)

Remove pins 1,2, and 3 of the 8 pin IC:
    
![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-chip-legs-clipped1.png)

![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-chip-legs-clipped2.png)

![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-chip-legs-clipped3.png)


Assemble as follows, with 0.1 uF capacitor to the far left, then 1 uF and then the two to the far right which are horizontal are the 10 uF capacitors: 
![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-trashboard-assembled.png)

This is a 5x blowup of the board, with parts labeled. Replicate this as a tool for replication to carry with you as you replicate the set:    

![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-board-5x.png)

An array can also be cut out using a laser cutter with the following .svg file(cut out a 4 inch square of this, with the blue layer as raster and black layer as cut):    


![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-trashboards-2x4.svg)

Here is an .svg of just one board:
    

![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-circuit-trash.svg)

This is what the bottom looks like after full assembly:
    
![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-board-bottom.png)

The enclosure is made from 4 squares each 4x4 inches in size cut from corrugated cardboard using the tools of Geometron:


![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-box-assembly-parts.png)



Stack and glue with Elmer's glue or wheat paste:

![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-box-assembly-2layers.png)

Second layer:
    

![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-box-assembly-3layers.png)

Add the circuit board to the box before adding the lid:

![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-box-assembly-withboard.png)



Full assembly with lid and rubber bands:

![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-box-assembly-assembled.png)

Fully assembled system with speaker connected to audio output and a solar panel connected to the USB power:

![](https://raw.githubusercontent.com/LafeLabs/trashotron/main/trashmagic/slimezistor-sand.png)

### Free Pants

Cut out squares from scrap cloth of many colors, then cut squares into letters and transmit the meme of free pants by wearing the pants:

![](https://raw.githubusercontent.com/LafeLabs/squares/main/trashmagic/free.pants.png)
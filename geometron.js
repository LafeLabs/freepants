/*

A Geometron is a geometric virtual machine which has two 8x8x8 cubes of operations. Thus each cube has
512 elements, for a total of 1024 addresses
  Operations are divided into:
       - transformations of global geometric variables, e.g. x += side. 
       - creation of geometric elements such as circle in a canvas or sphere in a 3d canvas, 
       where the location, orientation, and size, e.g. createSphere(x,y,z,side) 
       - carry out a sequence of operations, which can be any of these three types
       
  operations are organized by the geometry of the two cubes:  
      One cube is the "symbol" cube which consists entirely of sequences of operations. 
      the other cube, the "action cube", is divided up into different types of action based on "layers", which are 
          8x8 arrays, which stack on top of each other(with exceptions).  The symbol which describes an action is in the same location in the symbol cube
          as the corresponding action in the action cube.  
          
      Each address in each cube is a base 8 number, indicated by a leading 0.  Therefore these addresses are *coordinates* in space, where 
      the action cube is all 3 digit addresses and the symbol cube is all 4 digit addresses starting with 1. 

    
      The Action Cube is divided into layers as follows:
         00-05: held in reserve for creation operations for making new instances of Geometron...or roctal control codons?
         06-037: Root Actions, which manipulate things outside of the basic construct of geometron
         040-0176: keyboard actions, each of which maps to some other action/operation 
         0177: do nothing
         0200-0277: shape table, which is all programs/sequences/glyphs
         0207: cursor, which has special properties which affect editign of glyphs
         0300-0377: 2d geometric actions

         0400-0477: direct control of stepper motor stages
         0500-0577: symbols which refernce 04xx 
         0600-0677: shape table which refernces voxel actions
         0700-0777: voxel construction in 3d format

    The symbol cube has a "font" stored in 01040[space] to 01176[tilde], which corresponds to the printable ASCII

    */


function GVM(canvas2d,width,height) {
    //x0,y0 and unit are scaled to width
    //width and height are in px
    this.address = 0177;
    this.glyph = "";
    this.cleanGlyph = "";
    this.width = width;//width in px
    this.height = height;//width in px
    this.shapes = [];
    canvas2d.width = this.width;//px
    canvas2d.height = this.height;//px
    canvas2d.parentElement.style.width = this.width.toString() + "px";
    canvas2d.parentElement.style.height = this.height.toString() + "px";
    this.canvas2d = canvas2d;
    this.ctx = canvas2d.getContext("2d"); 
    this.x0 = 0.5*width;//convert from fractional to px set default
    this.x = this.x0;
    this.y0 = 0.5*width;//default, fractional
    this.y = this.y0;
    this.unit = 0.12*width;//convert to px from relative set default
    this.side = this.unit;
    this.theta0 = -Math.PI/2;
    this.theta = this.theta0;
    this.scaleFactor = 2;
    this.thetaStep = Math.PI/2;
    this.spellMode = false;
    this.word = "";
    this.font = "Arial";
    this.unicodemode = false;
    this.unicodemap = [
        {
            "ascii":"s",
            "character":"ä¸‹"
        },
        {
            "ascii":"a",
            "character":"ä¸Š"
        }
        ];
    this.cpy1 = this.y0;
    this.cpx2 = this.x0;
    this.cpy2 = this.y0;
    this.x1 = this.x0;
    this.y1 = this.y0;
    this.x2 = this.x0;
    this.y2 = this.y0;
    this.xOne = this.x0;
    this.yOne = this.y0;
    this.thetaOne = this.theta;
    this.sideOne = this.side;
    this.thetaStepOne = this.thetaStep;
    this.scaleFactorOne = this.scaleFactor;
 
    this.style = {
            "color0": "black",
            "fill0": "black",
            "line0": 1,
            "color1": "black",
            "fill1": "black",
            "line1": 5,
            "color2": "red",
            "fill2": "red",
            "line2": 1,
            "color3": "#FF7900",
            "fill3": "#FF7900",
            "line3": 1,
            "color4": "yellow",
            "fill4": "yellow",
            "line4": 1,
            "color5": "green",
            "fill5": "green",
            "line5": 1,
            "color6": "blue",
            "fill6": "blue",
            "line6": 1,
            "color7": "purple",
            "fill7": "purple",
            "line7": 1
        };
    this.strokeStyle = this.style.color0;
    this.fillStyle = this.style.fill0;
    this.lineWidth = this.style.line0;

    this.viewStep = 50;
    this.svgString = "<svg width=\"" + this.width.toString() + "\" height=\"" + this.height.toString() + "\" viewbox = \"0 0 " + this.width.toString() + " " + this.height.toString() + "\"  xmlns=\"http://www.w3.org/2000/svg\">\n";


    this.hypercube = [];
    for(var index = 0;index < 1024;index++){
        this.hypercube.push("");
    }

    
    for(var index = 0;index < this.shapes.length;index++) {
        if(this.shapes[index].length > 1){
            var localaddress = parseInt(this.shapes[index].split(":")[0],8);
            var localglyph = this.shapes[index].split(":")[1];
            this.hypercube[localaddress] = localglyph;
        }
    }    

    this.bytecode = function(start,stop) {
        var jsonarray = [];
        for(var index = start;index < stop;index++) {
            if(this.hypercube[index].length > 1) {
                var bytecodestring = "0" + index.toString(8) + ":" + this.hypercube[index];
                jsonarray.push(bytecodestring); 
            }
        }
        return JSON.stringify(jsonarray,null,"    ");
    }

    this.importbytecode = function(bytecode){
        for(var index =0;index < bytecode.length;index++){
            var localaddress = parseInt(bytecode[index].split(":")[0],8);
            var localglyph = bytecode[index].split(":")[1];
            this.hypercube[localaddress] = localglyph;
        }
    }
    
    this.pngcode = function() {
        return this.canvas2d.toDataURL("image/png");
    }

    this.actionSequence = function(glyph) {
        var glyphArray = glyph.split(",");
        var actionSequence = [];
        for(var index = 0;index < glyphArray.length;index++){
            if(glyphArray[index].length > 1){
                actionSequence.push(parseInt(glyphArray[index],8));
            }
        }
        for(var index = 0;index < actionSequence.length;index++){
            this.action(actionSequence[index]);
        }

    }

    this.drawGlyph = function(glyph) {
        this.spellMode = false;
        this.ctx.clearRect(0,0,this.width,this.height);
        this.ctx.strokeStyle = this.style.color0;
        this.ctx.fillStyle = this.style.fill0;
        this.ctx.lineWidth = this.style.line0;
        this.svgString = "<svg width=\"" + this.width.toString() + "\" height=\"" + this.height.toString() + "\" viewbox = \"0 0 " + this.width.toString() + " " + this.height.toString() + "\"  xmlns=\"http://www.w3.org/2000/svg\">\n";
        this.svgString += "<!--<json></json>-->";
        this.action(0300);
        this.actionSequence(glyph);
        this.svgString += "</svg>";

    }

    this.clean = function(){
        var glyphArray = this.glyph.split(",");
        var cleanGlyph = "";
        for(var index = 0;index < glyphArray.length;index++) {
            if(glyphArray[index] != "0207" && glyphArray[index].length> 1){
                cleanGlyph += glyphArray[index] + ",";
            }
        }
        this.hypercube[this.address] = cleanGlyph;        
        this.cleanGlyph = cleanGlyph;
    }
    
    
    this.spellGlyph = function(glyph) {
        this.spellMode = true;
        var localGlyph = "";
        var glyphArray = glyph.split(",");
        for(var index = 0; index < glyphArray.length; index++){
            if(glyphArray[index].length > 1){
                var localAddress = parseInt(glyphArray[index],8);
                if(localAddress < 01000){
                    localAddress += 01000;
                }
                localGlyph += "0" + localAddress.toString(8) + ",";
            }
        }
        glyph = localGlyph;
        this.side = this.unit;
        this.x0 = this.unit;
        this.y0 = this.unit*1.5;

        this.ctx.clearRect(0,0,this.width,this.height);
        this.ctx.strokeStyle = this.style.color0;
        this.ctx.fillStyle = this.style.fill0;
        this.ctx.lineWidth = this.style.line0;
        this.action(0300);
        this.actionSequence(glyph);
        
    }

    
    this.cursorAction = function(action) {           
        //2d cursor is at address 0207, glyph cursor is therefore at 01207
        var currentGlyph = this.glyph;
        if(action < 040) {
            this.action(action);
        }
        if(action > 037 && action <= 01777 && action != this.address) {
            var glyphSplit = currentGlyph.split(",");
            currentGlyph = "";
            for(var index = 0;index < glyphSplit.length;index++){
                if(glyphSplit[index].length > 0 && glyphSplit[index] != "0207"){
                    currentGlyph += glyphSplit[index] + ",";
                }
                if(glyphSplit[index] == "0207"){
                    currentGlyph += "0" + action.toString(8) + ",0207,";
                }
            }
            var glyphSplit = currentGlyph.split(",");
            currentGlyph = "";
            for(var index = 0;index < glyphSplit.length;index++){
                if(glyphSplit[index].length > 0  && parseInt(glyphSplit[index]) >= 040){
                    currentGlyph += glyphSplit[index] + ",";
                }
            }
            this.glyph = currentGlyph; 
        }
        this.drawGlyph(this.glyph);

    }

    this.action = function(address) {
        if(address == 010) {
            //delete
            var bottomGlyph = this.glyph.split("0207")[0];   
            var topGlyph = this.glyph.split("0207")[1]; 
            var glyphSplit = bottomGlyph.split(",");
            this.glyph = "";
            for(var index = 0;index < glyphSplit.length - 2;index++){
                if(glyphSplit[index].length > 0){
                    this.glyph += glyphSplit[index] + ",";
                }
            }
            this.glyph += "0207,";
            this.glyph += topGlyph;
            glyphSplit = this.glyph.split(",");
            this.glyph = "";
            for(var index = 0;index < glyphSplit.length;index++){
                if(glyphSplit[index].length > 0){
                    this.glyph += glyphSplit[index] + ",";
                }
            }
        }        
        if(address == 011){
            //clear
            this.glyph = "0207,";
            this.cleanGlyph = "";
        }
        if(address == 012){
            //spell
            var glyphSplit = this.glyph.split(",");
            currentGlyph = "";
            for(var index = 0;index < glyphSplit.length;index++){
                if(glyphSplit[index].length > 0){
                    var addressNumber = parseInt(glyphSplit[index],8);
                    if(addressNumber < 01000 && addressNumber != 0207 && addressNumber > 0177){
                        currentGlyph += "0" + (addressNumber + 01000).toString(8) + ",";
                    }
                    else{
                        currentGlyph += "0" + addressNumber.toString(8) + ",";
                    }
            
                }
            }
            this.glyph = currentGlyph;
        }
        if(address == 020) {
            //cursor back
            var currentGlyph = this.glyph;
            var bottomGlyph = currentGlyph.split("0207")[0];   
            var topGlyph = currentGlyph.split("0207")[1]; 
            glyphSplit = bottomGlyph.split(",");
            if(bottomGlyph.length == 0){
                currentGlyph = topGlyph + "0207,";
            }
            else{
                currentGlyph = "";
                for(var index = 0;index < glyphSplit.length - 2;index++){
                    if(glyphSplit[index].length > 0){
                        currentGlyph += glyphSplit[index] + ",";
                    }
                }
                currentGlyph += "0207,";
                currentGlyph += glyphSplit[glyphSplit.length - 2];
                currentGlyph += topGlyph;
            }
            glyphSplit = currentGlyph.split(",");
            currentGlyph = "";
            for(var index = 0;index < glyphSplit.length;index++){
                if(glyphSplit[index].length > 0){
                    currentGlyph += glyphSplit[index] + ",";
                }
            }
            this.glyph = currentGlyph;
        }        
        if(address == 021) {
            //cursor fwd
            var currentGlyph = this.glyph;
            var bottomGlyph = currentGlyph.split("0207")[0];   
            var topGlyph = currentGlyph.split("0207")[1]; 
            if(topGlyph == ","){
                currentGlyph = "0207," + bottomGlyph;
            }
            else{
                glyphSplit = topGlyph.split(",");
                currentGlyph = bottomGlyph + ",";
                currentGlyph += glyphSplit[1] + ",";
                currentGlyph += "0207,";
                for(var index = 2;index < glyphSplit.length - 1;index++){
                    if(glyphSplit[index].length > 0){
                        currentGlyph += glyphSplit[index] + ",";
                    }
                }
            }
            glyphSplit = currentGlyph.split(",");
            currentGlyph = "";
            for(var index = 0;index < glyphSplit.length;index++){
                if(glyphSplit[index].length > 0){
                    currentGlyph += glyphSplit[index] + ",";
                }
            }
            this.glyph = currentGlyph;

        }        
        if(address == 022) {
            //next glyph in table
        }        
        if(address == 023) {
            //previous glyph in table
        }        
        if(address == 024) {
            //spell to draw, draw to spell
        }        
        if(address == 030) {
            this.y0 -= this.viewStep;
        }        
        if(address == 031) {
            this.y0 += this.viewStep;
        }        
        if(address == 032) {
            this.x0 -= this.viewStep;
        }        
        if(address == 033) {
            this.x0 += this.viewStep;
        }        
        if(address == 034) {
            this.theta0 -= Math.PI/10;
        }        
        if(address == 035) {
            this.theta0 += Math.PI/10;
        }        
        if(address == 036) {
            
            this.unit /= 1.1; 
            this.x0 = 0.5*this.width + (this.x0 - 0.5*this.width)/1.1;
            this.y0 = 0.5*this.height + (this.y0 - 0.5*this.height)/1.1;
    
        }        
        if(address == 037) {
            this.unit *= 1.1; 
            this.x0 = 0.5*this.width + (this.x0 - 0.5*this.width)*1.1;
            this.y0 = 0.5*this.height + (this.y0 - 0.5*this.height)*1.1;

        }        

        //040-0176: put ASCII on the word stack, to be dumped out to screen via 0365 command
        if( address >= 040 && address <= 0176){
            this.word += String.fromCharCode(address);
        }

        //02xx,05xx,06xx
        if( (address >= 0200 && address <= 0277) || (address >= 01000 && address <= 01777) || (address >= 0500 && address <= 0677)){
            
            if(address >= 01000 && address <= 01777 && this.spellMode && this.x > this.width - 1.5*this.unit){
                this.y += this.unit*1.2;
                this.x = this.x0;
            }
            
            this.actionSequence(this.hypercube[address]);

        }
        
        //03xx
        if(address == 0300) {
            this.x = this.x0;
            this.y = this.y0;
            this.side = this.unit;
            this.thetaStep = Math.PI/2;
            this.theta = this.theta0;
            this.scaleFactor = 2;      
            this.word = "";
            this.ctx.strokeStyle = this.style.color0;
            this.ctx.fillStyle = this.style.fill0;
            this.ctx.lineWidth = this.style.line0;    
        }
        if(address == 0304) {
            this.thetaStep = Math.PI/2;
        }
        if(address == 0305) {
            this.thetaStep = 2*Math.PI/5;
        }
        if(address == 0306) {
            this.thetaStep = Math.PI/3;
        }

        if(address == 0310) {
            this.scaleFactor = Math.sqrt(2);
        }
        if(address == 0311) {
            this.scaleFactor = (Math.sqrt(5) + 1)/2;
        }
        if(address == 0312) {
            this.scaleFactor = Math.sqrt(3);
        }
        if(address == 0313) {
            this.scaleFactor = 2;
        }
        if(address == 0314) {
            this.scaleFactor = 3;
        }
        if(address == 0315) {
            this.scaleFactor = 1.1755705;
        }
        if(address == 0316) {
            this.scaleFactor = 5;
        }
        if(address == 0320) {
            this.ctx.strokeStyle = this.style.color0;
            this.ctx.fillStyle = this.style.fill0;
            this.ctx.lineWidth = this.style.line0;    
        }
        if(address == 0321) {
            this.ctx.strokeStyle = this.style.color1;
            this.ctx.fillStyle = this.style.fill1;
            this.ctx.lineWidth = this.style.line1;    
        }
        if(address == 0322) {
            this.ctx.strokeStyle = this.style.color2;
            this.ctx.fillStyle = this.style.fill2;
            this.ctx.lineWidth = this.style.line2;    
        }
        if(address == 0323) {
            this.ctx.strokeStyle = this.style.color3;
            this.ctx.fillStyle = this.style.fill3;
            this.ctx.lineWidth = this.style.line3;    
        }
        if(address == 0324) {
            this.ctx.strokeStyle = this.style.color4;
            this.ctx.fillStyle = this.style.fill4;
            this.ctx.lineWidth = this.style.line4;    
        }
        if(address == 0325) {
            this.ctx.strokeStyle = this.style.color5;
            this.ctx.fillStyle = this.style.fill5;
            this.ctx.lineWidth = this.style.line5;    
        }
        if(address == 0326) {
            this.ctx.strokeStyle = this.style.color6;
            this.ctx.fillStyle = this.style.fill6;
            this.ctx.lineWidth = this.style.line6;    
        }
        if(address == 0327) {
            this.ctx.strokeStyle = this.style.color7;
            this.ctx.fillStyle = this.style.fill7;
            this.ctx.lineWidth = this.style.line7;    
        }

        if(address == 0330) {
            this.x += this.side*Math.cos(this.theta);
            this.y += this.side*Math.sin(this.theta);    
        }
        if(address == 0331){
            this.x -= this.side*Math.cos(this.theta);
            this.y -= this.side*Math.sin(this.theta);    
        }
        if(address == 0332) {
            this.x += this.side*Math.cos(this.theta - this.thetaStep);
            this.y += this.side*Math.sin(this.theta - this.thetaStep);    
        }
        if(address == 0333) {
            this.x += this.side*Math.cos(this.theta + this.thetaStep);
            this.y += this.side*Math.sin(this.theta + this.thetaStep);    
        }
        if(address == 0334) {
            this.theta -= this.thetaStep; // CCW
        }
        if(address == 0335) {
            this.theta += this.thetaStep; // CW
        }
        if(address == 0336) {
            this.side /= this.scaleFactor; // -
        }
        if(address == 0337) {
            this.side *= this.scaleFactor; // +
        }
    
        if(address == 0340) {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.ctx.lineWidth, 0, 2 * Math.PI);
            this.ctx.fill();	
            this.ctx.closePath();
            this.svgString += "<circle cx=\"";
            this.svgString += Math.round(this.x).toString();
            this.svgString += "\" cy = \"";
            this.svgString += Math.round(this.y).toString();
            this.svgString += "\" r = \"" + this.ctx.lineWidth.toString() + "\" stroke = \"" + this.ctx.strokeStyle + "\" stroke-width = \"" + (this.ctx.lineWidth).toString() + "\" ";
            this.svgString += "fill = \"" + this.ctx.strokeStyle + "\" />\n";	
        }
        if(address == 0341) {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.side, 0, 2 * Math.PI);
            this.ctx.closePath();
            this.ctx.stroke();   
            this.svgString += "<circle cx=\"";
            this.svgString += Math.round(this.x).toString();
            this.svgString += "\" cy = \"";
            this.svgString += Math.round(this.y).toString();
            this.svgString += "\" r = \"" + this.side.toString() + "\" stroke = \"" + this.ctx.strokeStyle + "\" stroke-width = \"" + (this.ctx.lineWidth).toString() + "\" ";
            this.svgString += "fill = \"none\" />\n";			
        }
        if(address == 0342) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x,this.y);
            this.ctx.lineTo(this.x + this.side*Math.cos(this.theta),this.y + this.side*Math.sin(this.theta));
            this.ctx.stroke();		
            this.ctx.closePath();    
            var x2 = Math.round(this.x + this.side*Math.cos(this.theta));
            var y2 = Math.round(this.y + this.side*Math.sin(this.theta));
            this.svgString += "    <line x1=\""+Math.round(this.x).toString()+"\" y1=\""+Math.round(this.y).toString()+"\" x2=\"" + x2.toString()+"\" y2=\"" + y2.toString()+"\" style=\"stroke:" + this.ctx.strokeStyle + ";stroke-width:" + (this.ctx.lineWidth).toString() + "\" />\n"
    
        }
        if(address == 0343) {
            //arc
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.side, this.theta - this.thetaStep,this.theta + this.thetaStep);
            this.ctx.stroke();
            this.ctx.closePath();
            var localString = "";
            localString += "  <path d=\"";	
            localString += "M";
            var localInt = this.x + this.side*Math.cos(this.theta - this.thetaStep);
            localString += localInt.toString();
            localString += " ";
            localInt = this.y + this.side*Math.sin(this.theta - this.thetaStep);
            localString += localInt.toString();
            this.svgString += localString;
            localString = "           A" + this.side.toString() + " " + this.side.toString() + " 0 0 1 ";
            localInt = this.x + this.side*Math.cos(this.theta + this.thetaStep);
            localString += localInt.toString() + " ";
            localInt = this.y + this.side*Math.sin(this.theta + this.thetaStep);
            localString += localInt.toString() + "\" fill = \"none\" stroke = \"" + this.ctx.strokeStyle + "\" stroke-width = \"" + (this.ctx.lineWidth).toString() + "\" />\n";
            this.svgString += localString;

        }
        if(address == 0344) {
            //line segment as part of path
            this.ctx.lineTo(this.x + this.side*Math.cos(this.theta),this.y + this.side*Math.sin(this.theta));
            this.ctx.stroke();		
            var x2 = Math.round(this.x + this.side*Math.cos(this.theta));
            var y2 = Math.round(this.y + this.side*Math.sin(this.theta));
            this.svgString += "L" + x2 + " " + y2 + " ";
    
        }
        if(address == 0345) {
            //arc as part of path, to the right (CW)
            this.ctx.arc(this.x, this.y, this.side, this.theta - this.thetaStep,this.theta + this.thetaStep);
            this.ctx.stroke();
            var localString = "";
            localString += "M";
            var localInt = this.x + this.side*Math.cos(this.theta - this.thetaStep);
            localString += localInt.toString();
            localString += " ";
            localInt = this.y + this.side*Math.sin(this.theta - this.thetaStep);
            localString += localInt.toString();
            this.svgString += localString;
            localString = "           A" + this.side.toString() + " " + this.side.toString() + " 0 0 1 ";
            localInt = this.x + this.side*Math.cos(this.theta + this.thetaStep);
            localString += localInt.toString() + " ";
            localInt = this.y + this.side*Math.sin(this.theta + this.thetaStep);
            localString += localInt.toString();
            this.svgString += localString;
        }
        if(address == 0346) {
            //arc, reverse direction (CCW)
            this.ctx.arc(this.x, this.y, this.side, this.theta + this.thetaStep,this.theta - this.thetaStep,true);
            this.ctx.stroke();   
            localString = "";
            localString += "M";
            var localInt = this.x + this.side*Math.cos(this.theta - this.thetaStep);
            localString += localInt.toString();
            localString += " ";
            localInt = this.y + this.side*Math.sin(this.theta - this.thetaStep);
            localString += localInt.toString();
            this.svgString += localString;
            localString = "           A" + this.side.toString() + " " + this.side.toString() + " 0 0 1 ";
            localInt = this.x + this.side*Math.cos(this.theta + this.thetaStep);
            localString += localInt.toString() + " ";
            localInt = this.y + this.side*Math.sin(this.theta + this.thetaStep);
            localString += localInt.toString();
            this.svgString += localString;
    
        }
        if(address == 0347) {
            //filled circle
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.side, 0, 2 * Math.PI);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            this.svgString += "    <circle cx=\"";
            this.svgString += Math.round(this.x).toString();
            this.svgString += "\" cy = \"";
            this.svgString += Math.round(this.y).toString();
            this.svgString += "\" r = \"" + this.side.toString() + "\" stroke = \"" + this.ctx.strokeStyle + "\" stroke-width = \"" + (this.ctx.lineWidth).toString() + "\" ";
            this.svgString += "fill = \"" + this.ctx.fillStyle + "\" />\n";
        }
        if(address == 0350) {
            this.thetaStep /= 2;  //angle/2
        }
        if(address == 0351) {
            this.thetaStep *= 2;  //angle/2
        }
        if(address == 0352) {
            this.thetaStep /= 3;  //angle/2
        }
        if(address == 0353) {
            this.thetaStep *= 3;  //angle/2
        }
        if(address == 0354) {
            //end a closed but not filled path
            this.ctx.closePath();
            this.ctx.stroke();		
            this.svgString += "Z\""+ " stroke = \"" + this.ctx.strokeStyle + "\" stroke-width = \"" + (this.ctx.lineWidth).toString() + "\" fill = \"" + "none" + "\" "+"/>";

        }
        if(address == 0356){
            this.pendown = true;
        }
        if(address == 0357){
            this.pendown = false;
        }
        if(address == 0360) {
            //first part of bezier in middle of a path
            this.ctx.moveTo(Math.round(this.x),Math.round(this.y));
            this.cpx1 = Math.round(this.x + this.side*Math.cos(this.theta));
            this.cpy1 = Math.round(this.y + this.side*Math.sin(this.theta));
            this.svgString += " M";
            this.svgString += (Math.round(this.x)).toString() + ",";
            this.svgString += (Math.round(this.y)).toString() + " C";
            this.svgString += this.cpx1.toString() + "," + this.cpy1.toString() + " ";

        }
        if(address == 0361) { 

            //second part of bezier in middle of a path
            this.x2 = Math.round(this.x);
            this.y2 = Math.round(this.y);
            this.cpx2 = Math.round(this.x + this.side*Math.cos(this.theta));
            this.cpy2 = Math.round(this.y + this.side*Math.sin(this.theta));
            this.ctx.bezierCurveTo(this.cpx1,this.cpy1,this.cpx2,this.cpy2,this.x2,this.y2);
            this.ctx.stroke();
            this.svgString += this.cpx2.toString() + "," + this.cpy2.toString() + " ";
            this.svgString += this.x2.toString() + "," + this.y2.toString() + " ";		
    
        }
        if(address == 0362) {
            //start a path
            this.ctx.beginPath();
            this.ctx.moveTo(this.x,this.y);
            this.svgString += "	<path d = \"M";
            this.svgString += Math.round(this.x).toString() + " ";
            this.svgString += Math.round(this.y).toString() + " ";
    
        }
        if(address == 0363) {
            //terminate a closed path with fill
            this.ctx.closePath();
            this.ctx.stroke();		
            this.ctx.fill();		            
            this.svgString += "Z\""+ " stroke = \"" + this.ctx.strokeStyle + "\" stroke-width = \"" + (this.ctx.lineWidth).toString() + "\" fill = \"" + this.ctx.fillStyle + "\" "+"/>";
        }
        if(address == 0364) {
            this.ctx.closePath();
            this.svgString += "\""+ " stroke = \"" + this.ctx.strokeStyle + "\" stroke-width = \"" + (this.ctx.lineWidth).toString() + "\" fill = \"" + "none" + "\" "+"/>";
        }
        if(address == 0365) {
            if(this.unicodemode){
                var tempword = "";
                for(var index = 0;index < this.word.length;index++){
                    var hasreplacement = false;
                    for(var uindex = 0;uindex < this.unicodemap.length;uindex++){
                        if(this.unicodemap[uindex].ascii == this.word[index]){
                            hasreplacement = true;
                            tempword += this.unicodemap[uindex].character;
                        }
                    }
                    if(!hasreplacement){
                        tempword += this.word[index];
                    }
                    console.log(index);
                }
                this.word = tempword;
            }
            this.ctx.translate(this.x, this.y);
            this.ctx.rotate(-this.theta0 + this.theta);
            this.ctx.translate(-this.x, -this.y);
            this.ctx.font = this.side.toString(8) + "px " + this.font;
            this.ctx.fillText(this.word,this.x,this.y);    
            this.ctx.translate(this.x, this.y);
            this.ctx.rotate(+this.theta0 - this.theta);
            this.ctx.translate(-this.x, -this.y);
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            this.svgString += "    <text x=\"";
            this.svgString += Math.round(this.x).toString();
            this.svgString += "\" y = \"";
            this.svgString += Math.round(this.y).toString();
            this.svgString += "\" fill = \"" + this.ctx.strokeStyle + "\""; 
            this.svgString += " font-size = \"";
            this.svgString += this.side + "px\"";
            this.svgString += " font-family = \"" + this.font + "\"";
            this.svgString += ">";
            if(this.word == "&"){
                this.word = "&amp;";
            }
            if(this.word == "<"){
                this.word = "&lt;";
            }
            if(this.word == ">"){
                this.word = "&gt;";
            }
            this.svgString += this.word;
            this.svgString += "</text>\n";	
            this.word = "";
 
        }
        if(address == 0366) {
            // start a self-contained cubic Bezier path        
            this.ctx.beginPath();
            this.ctx.moveTo(Math.round(this.x),Math.round(this.y));
            this.cpx1 = Math.round(this.x + this.side*Math.cos(this.theta));
            this.cpy1 = Math.round(this.y + this.side*Math.sin(this.theta)); 
            this.svgString += "<path    d = \"M";
            this.svgString += (Math.round(this.x)).toString() + ",";
            this.svgString += (Math.round(this.y)).toString() + " C";
            this.svgString += this.cpx1.toString() + "," + this.cpy1.toString() + " ";
    
        }
        if(address == 0367) {
            // finish a self-contained cubic Bezier path
            this.x2 = Math.round(this.x);
            this.y2 = Math.round(this.y);
            this.cpx2 = Math.round(this.x + this.side*Math.cos(this.theta));
            this.cpy2 = Math.round(this.y + this.side*Math.sin(this.theta));
            this.ctx.bezierCurveTo(this.cpx1,this.cpy1,this.cpx2,this.cpy2,this.x2,this.y2);
            this.ctx.stroke();
            this.svgString += this.cpx2.toString() + "," + this.cpy2.toString() + " ";
            this.svgString += this.x2.toString() + "," + this.y2.toString() + "\" fill = \"none\" stroke-width = \"" + (this.ctx.lineWidth).toString() + "\" stroke = \"" + this.ctx.strokeStyle + "\" />";	


        }
        if(address == 0370) {
            this.xOne = this.x;
            this.yOne = this.y;
            this.thetaOne = this.theta;
            this.sideOne = this.side;
            this.thetaStepOne = this.thetaStep;
            this.scaleFactorOne = this.scaleFactor;
        }
        if(address == 0371) {
            this.x = this.xOne;
            this.y = this.yOne;
            this.theta = this.thetaOne;
            this.side = this.sideOne;
            this.thetaStep = this.thetaStepOne;
            this.scaleFactor = this.scaleFactorOne;    
        }
    }
}

hypercube = [
    "041:0321,",
    "042:0236,",
    "043:0323,",
    "044:0324,",
    "045:0325,",
    "046:0327,",
    "047:021,",
    "050:0345,",
    "051:0346,",
    "052:0300,",
    "053:0211,",
    "054:032,",
    "055:0314,",
    "056:033,",
    "057:020,",
    "060:0313,",
    "061:0305,",
    "062:0306,",
    "063:0350,",
    "064:0351,",
    "065:0352,",
    "066:0353,",
    "067:0310,",
    "070:0311,",
    "071:0312,",
    "072:0216,",
    "073:037,",
    "074:0237,",
    "075:0316,",
    "076:0177,",
    "077:0177",
    "0100:0322,",
    "0101:0230",
    "0102:0234,",
    "0103:0506,",
    "0104:0232",
    "0105:0222,",
    "0106:0233",
    "0107:0234",
    "0110:0235",
    "0111:0227,",
    "0112:0236",
    "0113:0237",
    "0114:0177,",
    "0115:0236,",
    "0116:0235,",
    "0117:012",
    "0120:0177,",
    "0121:0220",
    "0122:0223,",
    "0123:0231",
    "0124:0224,",
    "0125:0226,",
    "0126:0507,",
    "0127:0221",
    "0130:0505,",
    "0131:0225,",
    "0132:0504,",
    "0133:0365,",
    "0134:0201,",
    "0135:0204,",
    "0136:0326,",
    "0137:0210,",
    "0140:0304,",
    "0141:0330",
    "0142:0200,",
    "0143:0342,",
    "0144:0332,",
    "0145:0363,",
    "0146:0333,",
    "0147:0334,",
    "0150:0335,",
    "0151:0370,",
    "0152:0336,",
    "0153:0337,",
    "0154:036,",
    "0155:031,",
    "0156:030,",
    "0157:0371,",
    "0160:0347,",
    "0161:0362,",
    "0162:0354,",
    "0163:0331,",
    "0164:0364,",
    "0165:0367,",
    "0166:0343,",
    "0167:0203,",
    "0170:0341,",
    "0171:0366,",
    "0172:0340,",
    "0173:0213,",
    "0174:011,",
    "0175:0214,",
    "0176:0320,",
    "0200:0362,0203,0334,0203,0334,0203,0334,0203,0334,0354,",
    "0201:0342,0330,",
    "0202:0304,0313,0350,0335,0336,0336,0342,0333,0342,0333,0342,0333,0342,0333,0334,0304,0337,0337,",
    "0203:0344,0330,",
    "0204:0362,0203,0334,0203,0334,0203,0334,0203,0334,0363,",
    "0205:0362,0203,0335,0203,0203,0335,0203,0335,0203,0203,0335,0363,0336,0330,0333,0336,0331,0332,0337,0365,0336,0332,0331,0337,0337,",
    "0206:0336,0332,0337,0362,0203,0334,0336,0203,0335,0350,0335,0337,0310,0337,0203,0335,0335,0203,0335,0304,0335,0336,0313,0336,0203,0334,0337,0203,0363,0335,0335,0336,0332,0337,",
    "0207:0342,0334,0342,0335,0335,0342,0334,0336,0330,0340,0331,0337,0337,0330,0340,0331,0336,",
    "0210:0310,0337,0311,0336,0313,",
    "0211:0311,0337,0310,0336,0313,",
    "0212:0336,0336,0333,0331,0333,0331,0332,0330,0336,0332,0334,0337,0362,0203,0335,0203,0334,0336,0203,0335,0350,0335,0310,0337,0203,0203,0335,0335,0203,0203,0335,0335,0335,0336,0203,0334,0334,0337,0337,0203,0304,0335,0313,0354,0335,0330,0336,0332,0337,0337,0337,",
    "0213:0313,0336,0336,0336,0336,0336,0336,0336,0316,0337,0337,0337,0313,",
    "0214:0316,0336,0336,0336,0313,0337,0337,0337,0337,0337,0337,0337,",
    "0215:0304,0313,0342,0330,0335,0335,0336,0336,0306,0350,0335,0362,0203,0334,0334,0334,0334,0203,0334,0334,0334,0334,0203,0363,0335,0337,0337,0331,0304,0313,0360,0313,",
    "0216:0336,0333,0336,0333,0337,0337,0336,0330,0332,0336,0336,0333,0331,0331,0347,0330,0330,0330,0330,0347,0331,0331,0337,0337,0331,0333,0336,0336,0332,0337,0337,0337,",
    "0217:0332,0332,0332,0332,0331,0331,0331,0362,0203,0203,0203,0203,0203,0203,0364,0333,0350,0334,0343,0335,0330,0335,0335,0362,0203,0203,0203,0203,0203,0203,0364,0335,0333,0334,0334,0343,0335,0330,0335,0335,0362,0203,0203,0203,0203,0203,0203,0364,0335,0333,0334,0334,0343,0335,0330,0335,0335,0362,0203,0203,0203,0203,0203,0203,0364,0335,0333,0334,0334,0343,0335,0335,0335,0331,0304,0333,0333,0333,0330,0330,0330,0330,",
    "0220:0201,0336,0336,0334,0331,0337,0306,0362,0203,0335,0335,0203,0335,0335,0203,0363,0335,0335,0304,0336,0335,0332,0337,0337,0331,",
    "0221:0330,0335,0335,0220,0335,0335,0331,",
    "0222:0336,0337,0330,0334,0336,0331,0337,0350,0362,0203,0335,0335,0335,0310,0336,0203,0335,0335,0203,0363,0335,0335,0335,0337,0313,0304,0335,0336,0332,0337,0331,0335,0336,0331,0337,0350,0310,0362,0203,0335,0335,0335,0336,0203,0335,0335,0203,0363,0335,0335,0335,0337,0304,0313,0334,0336,0333,0337,",
    "0223:0336,0330,0337,0350,0335,0310,0336,0362,0203,0334,0334,0334,0337,0203,0334,0334,0334,0336,0203,0363,0362,0203,0335,0335,0335,0337,0203,0335,0335,0335,0336,0203,0363,0334,0337,0304,0313,0336,0331,0337,",
    "0224:0336,0332,0332,0350,0335,0366,0333,0333,0334,0334,0367,0335,0335,0335,0335,0366,0332,0332,0335,0335,0367,0335,0335,0335,0335,0366,0333,0333,0334,0334,0367,0335,0335,0335,0335,0366,0332,0332,0335,0335,0367,0335,0335,0335,0304,0337,0332,0332,",
    "0225:0332,0336,0331,0337,0342,0336,0330,0335,0337,0201,0201,0335,0335,0335,0336,0331,0337,0342,0336,0330,0332,0332,0337,",
    "0240:0220,0336,0331,0333,0336,0321,0335,0342,0335,0335,0342,0335,0330,0330,0332,0332,0337,0337,",
    "0241:0220,0336,0321,0343,0332,0350,0335,0336,0342,0334,0334,0342,0335,0304,0337,0333,0337,",
    "0242:0220,0321,0336,0343,0333,0336,0350,0335,0342,0334,0334,0342,0335,0337,0304,0332,0337,",
    "0243:0220,0336,0331,0332,0336,0321,0343,0332,0350,0334,0336,0342,0335,0335,0342,0337,0334,0334,0335,0304,0332,0330,0330,0337,0337,0333,",
    "0244:0220,0336,0331,0333,0336,0321,0343,0333,0350,0336,0335,0342,0334,0334,0342,0335,0337,0304,0333,0330,0330,0337,0337,0332,",
    "0245:0210,0332,0332,0362,0335,0203,0203,0203,0203,0334,0203,0363,0332,0332,0331,0211,",
    "0246:0210,0332,0332,0335,0306,0336,0330,0335,0335,0335,0321,0362,0203,0335,0335,0203,0364,0331,0350,0335,0337,0366,0333,0333,0333,0333,0334,0334,0334,0334,0367,0335,0336,0342,0334,0334,0342,0330,0330,0330,0330,0335,0335,0335,0304,0337,0211,",
    "0247:0330,0332,0336,0332,0336,0221,0333,0333,0333,0222,0333,0333,0333,0223,0333,0333,0333,0225,0333,0331,0331,0331,0332,0332,0332,0332,0332,0332,0332,0332,0332,0332,0332,0332,0333,0333,0226,0331,0331,0331,0333,0333,0333,0333,0333,0333,0333,0333,0333,0333,0333,0333,0333,0330,0333,0330,0330,0333,0330,0331,0332,0332,0332,0332,0332,0332,0332,0332,0332,0332,0332,0332,0227,0333,0333,0333,0230,0333,0331,0331,0331,0331,0332,0332,0332,0330,0332,0332,0332,0332,0332,0332,0333,0333,0231,0333,0333,0333,0232,0331,0333,0330,0333,0333,0233,0333,0333,0333,0234,0330,0330,0332,0330,0332,0332,0337,0337,",
    "0500:0406,0406,0403,0407,0405,0404,0407,0336,0336,0336,0336,0330,0330,0347,0337,0337,0337,0337,0702,0711,",
    "0501:0406,0406,0402,0407,0405,0404,0407,0336,0336,0336,0336,0331,0331,0347,0337,0337,0337,0337,0703,0711,",
    "0502:0406,0406,0401,0407,0405,0404,0407,0336,0336,0336,0336,0332,0332,0347,0337,0337,0337,0337,0701,0711,",
    "0503:0406,0406,0400,0407,0405,0404,0407,0336,0336,0336,0336,0333,0333,0347,0337,0337,0337,0337,0700,0711,",
    "0504:0406,0406,0403,0407,0407,0336,0336,0336,0336,0330,0330,0337,0337,0337,0337,0702,",
    "0505:0406,0406,0402,0407,0407,0336,0336,0336,0336,0331,0331,0337,0337,0337,0337,0703,",
    "0506:0406,0406,0401,0407,0407,0336,0336,0336,0336,0332,0332,0337,0337,0337,0337,0701,",
    "0507:0406,0406,0400,0407,0407,0336,0336,0336,0336,0333,0333,0337,0337,0337,0337,0700,",
    "0510:0403,0336,0336,0336,0342,0330,0337,0337,0337,",
    "0511:0402,0336,0336,0336,0331,0342,0337,0337,0337,",
    "0512:0400,0336,0336,0336,0334,0342,0330,0335,0337,0337,0337,",
    "0513:0401,0336,0336,0336,0335,0342,0330,0334,0337,0337,0337,",
    "0514:0406,0406,0406,0401,0403,0401,0403,0401,0403,0401,0403,0401,0403,0401,0403,0401,0403,0401,0403,0407,0407,0407,0336,0336,0336,0350,0310,0337,0335,0201,0334,0336,0313,0304,0337,0337,0337,",
    "0515:0406,0406,0406,0401,0402,0401,0402,0401,0402,0401,0402,0401,0402,0401,0402,0401,0402,0401,0402,0407,0407,0407,0336,0336,0336,0350,0310,0337,0335,0335,0335,0201,0334,0336,0313,0304,0334,0337,0337,0337,",
    "0516:0406,0406,0406,0400,0402,0400,0402,0400,0402,0400,0402,0400,0402,0400,0402,0400,0402,0400,0402,0407,0407,0407,0336,0336,0336,0350,0310,0337,0335,0335,0335,0335,0335,0201,0334,0336,0313,0304,0335,0335,0337,0337,0337,",
    "0517:0406,0406,0406,0400,0403,0400,0403,0400,0403,0400,0403,0400,0403,0400,0403,0400,0403,0400,0403,0407,0407,0407,0336,0336,0336,0350,0310,0337,0335,0335,0335,0335,0335,0335,0335,0201,0334,0336,0313,0304,0335,0335,0337,0337,0337,0335,0335,0335,",
    "0520:0331,",
    "0521:0331,0336,0330,0332,0347,0331,0333,0337,",
    "0522:0331,0332,0336,0330,0332,0347,0331,0333,0337,0333,",
    "0523:0331,0336,0330,0332,0347,0332,0332,0347,0333,0333,0333,0331,0337,",
    "0524:0331,0332,0332,0336,0330,0332,0347,0331,0333,0337,0333,0333,",
    "0525:0331,0332,0332,0336,0330,0332,0347,0331,0333,0337,0333,0333,0336,0330,0332,0347,0331,0333,0337,",
    "0526:0331,0332,0332,0336,0330,0332,0347,0333,0333,0347,0331,0333,0337,0333,",
    "0527:0331,0332,0332,0336,0330,0332,0347,0333,0333,0347,0333,0333,0347,0331,0333,0337,",
    "0530:0342,0332,0332,0332,0342,0333,0333,0333,0335,0336,0342,0334,0337,",
    "0531:0332,0332,0332,0334,0336,0342,0335,0335,0337,0201,0201,0201,0334,0332,0336,0336,0331,0337,0342,0332,0332,0342,0333,0333,0333,0333,0336,0330,0337,0337,",
    "0532:0362,0203,0334,0310,0350,0334,0337,0203,0334,0334,0334,0336,0203,0363,0331,0331,0331,0334,0334,0362,0203,0335,0335,0335,0337,0203,0335,0335,0335,0336,0203,0363,0331,0331,0313,0304,0335,0336,0332,0337,0310,0350,0335,0337,0362,0203,0334,0334,0334,0337,0203,0334,0334,0334,0336,0203,0363,0334,0334,0334,0336,0304,0313,0333,0336,0333,0337,",
    "0533:0331,0204,0332,0332,0204,0333,0333,0332,0331,0204,0333,0331,",
    "0534:0334,0201,0201,0201,0335,0201,0335,0201,0201,0201,0334,0331,0342,0332,0204,0332,0332,0335,0336,0314,0337,0350,0335,0321,0343,0335,0330,0336,0313,0337,0304,0320,0335,0310,0335,0335,0331,0350,0335,0310,0337,0362,0203,0334,0334,0334,0337,0203,0334,0334,0334,0336,0203,0363,0334,0334,0334,0336,0330,0334,0334,0313,0304,0336,0314,0337,0330,0336,0313,0337,0310,0350,0362,0203,0334,0334,0334,0337,0203,0334,0334,0334,0336,0203,0363,0334,0334,0330,0313,0304,0332,",
    "0535:0330,0334,0362,0203,0334,0203,0334,0310,0350,0334,0337,0203,0363,0335,0336,0331,0304,0334,0331,0334,0201,0201,0201,0335,0201,0335,0201,0201,0201,0313,0334,0331,0332,0336,0332,0337,0350,0310,0335,0337,0362,0203,0334,0334,0334,0337,0203,0334,0334,0334,0336,0203,0363,0334,0334,0334,0336,0313,0304,0330,0336,0333,0337,0333,0336,0314,0337,0350,0334,0321,0343,0335,0320,0313,0304,0314,0336,0313,0337,0331,",
    "0600:0711,0701,0711,0701,0711,0701,0711,0700,0700,0700,0700,0711,0700,0711,0700,0711,0700,0711,0702,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0702,0711,0700,0711,0700,0711,0700,0711,0700,0711,0700,0711,0700,0711,0700,0711,0702,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0703,0703,0703,0703,0711,0700,0711,0700,0711,0700,0711,0700,0711,0700,0711,0700,0711,0700,0711,0703,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0703,0711,0700,0711,0700,0711,0700,0711,0700,0711,0700,0711,0700,0711,0700,0711,0703,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0701,0711,0702,0702,0702,0702,0700,0700,0700,0700,0706,0701,0703,0706,0704,0704,0724,0706,",
    "0601:0711,0703,0711,0703,0711,0703,0711,0703,0711,0703,0711,0703,0711,0703,0711,0703,0711,0703,0711,0700,0702,0702,0702,0702,0702,0702,0702,0702,0702,",
    "0602:0601,0601,0601,0601,0601,0601,0601,0601,0601,0601,0701,0701,0701,0701,0701,0706,0701,0707,0703,0703,0703,0703,0706,0703,0707,0706,0706,0704,0706,0704,0704,0724,",
    "0603:0602,0703,0701,0701,0701,0701,0701,0701,0701,",
    "01010:0333,0200,0350,0334,0310,0337,0342,0336,0332,0335,0335,0337,0342,0336,0333,0334,0351,0313,",
    "01011:0333,0200,0322,0336,0330,0332,0350,0335,0304,0336,0336,0336,0330,0332,0337,0362,0203,0203,0335,0203,0335,0203,0203,0334,0203,0203,0335,0203,0335,0203,0203,0334,0203,0203,0335,0203,0335,0203,0203,0334,0203,0203,0335,0203,0335,0203,0203,0363,0331,0333,0337,0320,0334,0334,0336,0331,0336,0331,0333,0337,0350,0335,0304,0337,0337,0341,0350,0335,0330,0334,0336,0336,0342,0334,0334,0342,0335,0335,0335,0337,0337,0331,0334,0336,0304,0336,0337,0337,0331,0333,0337,",
    "01012:0333,0200,0336,0330,0332,0336,0332,0332,01331,01332,01333,0336,0330,0333,0336,0341,0337,0333,0337,0331,0331,0336,0331,0337,0337,0337,",
    "01020:0304,0333,0200,0336,0330,0332,0336,0336,0332,0337,0200,0333,0333,0200,0332,0332,0336,0330,0335,0337,0342,0330,0350,0335,0335,0351,0333,0350,0336,0334,0342,0334,0334,0342,0337,0335,0351,0333,0336,0333,0331,0337,0337,0331,0337,0304,0336,0330,0330,0336,0330,0334,0331,0337,0337,",
    "01021:0304,0333,0200,0336,0330,0332,0336,0336,0332,0337,0200,0333,0333,0200,0332,0332,0336,0330,0335,0337,0342,0330,0350,0335,0335,0335,0336,0342,0335,0335,0342,0337,0335,0351,0333,0336,0333,0331,0337,0337,0331,0337,0304,",
    "01022:0333,0200,0336,0336,0330,0330,0332,0332,0332,0336,0336,0333,0337,0337,0336,0330,0336,0333,0337,0337,0200,0333,0200,0333,0200,0331,0331,0332,0332,0200,0333,0200,0333,0200,0336,0333,0331,0337,0337,0332,0330,0336,0336,0331,0337,0342,0330,0335,0350,0335,0336,0342,0335,0335,0342,0337,0335,0335,0335,0351,0331,0331,0331,0333,0333,0336,0330,0337,0337,0337,",
    "01023:0333,0200,0336,0336,0330,0330,0332,0332,0332,0336,0336,0333,0337,0337,0336,0330,0336,0333,0337,0337,0200,0333,0200,0333,0200,0331,0331,0332,0332,0200,0333,0200,0333,0200,0336,0333,0331,0337,0337,0332,0330,0336,0336,0331,0337,0335,0335,0331,0342,0330,0335,0350,0335,0336,0342,0335,0335,0342,0337,0335,0335,0335,0351,0331,0331,0331,0333,0333,0336,0330,0337,0337,0337,0335,0335,0331,0333,",
    "01024:0333,0200,0336,0336,0330,0332,0337,0200,0336,0336,0330,0332,0337,0200,0336,0336,0330,0332,0337,0200,0333,0333,0333,0331,0331,0331,0336,0331,0333,0337,0337,0337,0337,",
    "01025:0333,0200,0336,0330,0332,0336,0330,0332,0331,0336,0337,0123,0126,0107,0365,0335,0321,0330,0335,0336,0330,0337,0201,0335,0335,0350,0334,0336,0330,0335,0335,0335,0335,0362,0203,0334,0334,0203,0364,0331,0334,0304,0337,0337,0333,0336,0336,0331,0337,0337,0337,0320,",
    "01026:0333,0200,0336,0330,0332,0336,0336,0333,0331,0337,0200,0306,0335,0342,0332,0342,0330,0335,0335,0342,0335,0335,0335,0335,0331,0334,0304,0332,0306,0335,0342,0330,0350,0335,0342,0334,0331,0335,0304,0334,0331,0332,0335,0336,0332,0337,0342,0330,0350,0335,0335,0335,0336,0342,0335,0335,0342,0335,0304,0331,0331,0331,0331,0333,0333,0333,0333,0333,0337,0337,0337,",
    "01027:0333,0200,0336,0330,0332,0336,0336,0333,0331,0337,0332,0200,0306,0335,0342,0332,0342,0330,0335,0335,0342,0335,0335,0335,0335,0331,0334,0304,0332,0306,0335,0342,0330,0350,0335,0342,0334,0331,0335,0304,0334,0331,0333,0333,0330,0335,0342,0330,0350,0335,0335,0335,0336,0342,0335,0335,0342,0335,0304,0331,0331,0331,0331,0331,0333,0337,0337,0337,",
    "01030:0333,0200,0336,0330,0332,0336,0334,0362,0203,0335,0350,0335,0310,0337,0203,0335,0335,0203,0335,0335,0335,0336,0203,0364,0304,0335,0313,0337,0333,0331,0337,",
    "01031:0333,0200,0336,0330,0332,0336,0334,0335,0335,0362,0203,0335,0350,0335,0310,0337,0203,0335,0335,0203,0335,0335,0335,0336,0203,0364,0304,0335,0335,0335,0313,0337,0333,0331,0337,",
    "01032:0333,0200,0336,0330,0332,0334,0336,0334,0362,0203,0335,0350,0335,0310,0337,0203,0335,0335,0203,0335,0335,0335,0336,0203,0364,0304,0335,0335,0313,0337,0333,0331,0337,",
    "01033:0333,0200,0336,0330,0332,0335,0336,0334,0362,0203,0335,0350,0335,0310,0337,0203,0335,0335,0203,0335,0335,0335,0336,0203,0364,0304,0313,0337,0333,0331,0337,",
    "01034:0333,",
    "01035:0333,",
    "01036:0333,0200,0336,0332,0330,0336,0332,0362,0203,0335,0350,0335,0310,0337,0203,0335,0335,0203,0335,0335,0335,0336,0203,0364,0335,0335,0330,0334,0337,0362,0203,0335,0335,0335,0336,0203,0203,0335,0335,0335,0337,0203,0364,0331,0335,0336,0304,0313,0333,0331,0337,0337,",
    "01037:0333,0200,0336,0332,0330,0336,0332,0362,0335,0335,0203,0335,0350,0335,0310,0337,0203,0335,0335,0203,0335,0335,0335,0336,0203,0364,0335,0335,0330,0334,0335,0331,0331,0331,0331,0334,0337,0362,0203,0335,0335,0335,0336,0203,0203,0335,0335,0335,0337,0203,0364,0331,0335,0336,0304,0313,0333,0331,0337,0332,0335,0335,0337,0331,",
    "01040:0507,0507,0507,0507,0507,0507,",
    "01041:0507,0507,0503,0503,0500,0502,0504,0500,0503,0500,0502,0500,0503,0500,0502,0500,0503,0507,0507,0505,0505,0505,0505,0505,0505,0505,",
    "01042:0507,0507,0504,0504,0504,0504,0500,0500,0500,0507,0503,0501,0501,0505,0505,0505,0505,0507,0505,0507,",
    "01043:0507,0503,0500,0500,0500,0500,0500,0500,0505,0505,0502,0505,0501,0503,0503,0503,0500,0500,0502,0507,0500,0500,0505,0505,0503,0505,0501,0502,0506,0507,0501,0501,0507,0507,",
    "01044:0507,0500,0503,0503,0503,0506,0500,0500,0500,0500,0500,0505,0502,0505,0502,0501,0503,0507,0504,0504,0503,0503,0506,0505,0501,0503,0501,0505,0505,0506,0502,0507,0507,0507,",
    "01045:0503,0500,0507,0500,0503,0500,0500,0500,0500,0502,0502,0501,0501,0503,0507,0503,0507,0500,0500,0505,0505,0505,0506,0506,0505,0501,0501,0503,0503,0500,0500,0502,0507,0507,0505,0505,",
    "01046:0503,0500,0500,0507,0500,0506,0500,0500,0507,0500,0507,0501,0501,0505,0501,0505,0503,0505,0502,0502,0507,0507,0507,0504,0500,0505,0501,0507,",
    "01047:0507,0507,0507,0504,0504,0504,0500,0500,0500,0505,0505,0505,0505,0505,0505,0507,0507,0507,",
    "01050:0507,0507,0503,0504,0502,0500,0500,0500,0500,0507,0500,0507,0507,0507,0505,0505,0505,0505,0505,0505,",
    "01051:0507,0507,0503,0507,0500,0500,0500,0500,0500,0504,0502,0507,0507,0505,0505,0505,0505,0505,0505,0507,",
    "01052:0507,0500,0507,0500,0500,0502,0507,0500,0504,0502,0507,0503,0500,0505,0501,0501,0501,0501,0501,0507,0504,0500,0500,0500,0507,0500,0505,0501,0505,0501,0505,0507,0505,0504,",
    "01053:0507,0507,0504,0503,0500,0500,0500,0500,0505,0505,0502,0502,0507,0507,0503,0503,0505,0505,0505,0507,",
    "01054:0507,0507,0503,0505,0502,0507,0507,0504,0507,0507,",
    "01055:0504,0504,0503,0503,0503,0503,0503,0505,0505,0507,",
    "01056:0507,0507,0503,0500,0503,0501,0507,0507,",
    "01057:0503,0507,0500,0507,0500,0507,0500,0507,0500,0505,0505,0505,0505,0507,",
    "01060:0507,0500,0500,0500,0500,0500,0507,0500,0503,0503,0507,0501,0501,0501,0501,0501,0505,0502,0502,0502,0507,0507,0500,0506,0500,0500,0506,0500,0500,0507,0507,0507,0507,0505,0505,0505,0505,0505,",
    "01061:0503,0503,0503,0503,0503,0506,0506,0500,0500,0500,0500,0500,0500,0505,0502,0507,0507,0507,0507,0505,0505,0505,0505,0505,",
    "01062:0503,0503,0503,0503,0503,0502,0502,0502,0500,0507,0500,0507,0500,0507,0500,0500,0506,0500,0502,0502,0505,0502,0505,0505,0505,0505,0505,0507,0507,0507,0507,0507,",
    "01063:0507,0500,0505,0503,0503,0503,0507,0500,0500,0504,0502,0502,0507,0507,0500,0500,0504,0502,0502,0502,0505,0502,0505,0505,0505,0505,0505,0507,0507,0507,0507,0507,",
    "01064:0507,0504,0500,0500,0507,0500,0507,0500,0507,0500,0501,0501,0501,0501,0502,0502,0507,0507,0503,0506,0501,0501,0507,0507,",
    "01065:0507,0500,0505,0503,0503,0503,0507,0500,0500,0500,0504,0502,0502,0502,0502,0500,0500,0503,0503,0503,0503,0505,0505,0505,0505,0505,0505,0507,",
    "01066:0507,0500,0500,0500,0500,0500,0507,0500,0503,0503,0505,0503,0506,0506,0506,0505,0505,0506,0503,0503,0503,0507,0501,0501,0505,0502,0502,0502,0507,0507,0507,0507,",
    "01067:0507,0507,0503,0500,0500,0500,0507,0500,0507,0500,0500,0502,0502,0502,0502,0507,0507,0507,0507,0507,0505,0505,0505,0505,0505,0505,",
    "01070:0507,0500,0500,0507,0500,0506,0500,0500,0507,0500,0503,0503,0507,0501,0501,0505,0502,0502,0507,0507,0501,0501,0505,0502,0502,0502,0507,0507,0507,0507,",
    "01071:0507,0500,0505,0503,0503,0503,0507,0500,0500,0500,0500,0500,0504,0502,0502,0502,0506,0501,0501,0505,0503,0503,0503,0507,0507,0505,0505,0505,",
    "01072:0507,0507,0507,0500,0502,0500,0503,0504,0500,0502,0500,0503,0507,0507,0507,0505,0505,0505,0505,0505,",
    "01073:0507,0507,0507,0504,0502,0504,0503,0504,0500,0502,0500,0503,0507,0507,0507,0505,0505,0505,0505,0505,",
    "01074:0507,0507,0507,0503,0504,0502,0504,0502,0507,0500,0507,0500,0505,0505,0505,0505,0507,0507,",
    "01075:0507,0504,0500,0503,0503,0503,0503,0504,0500,0502,0502,0502,0502,0505,0505,0505,0505,0507,0507,0507,0507,0507,",
    "01076:0507,0503,0507,0500,0507,0500,0506,0500,0506,0500,0505,0505,0505,0505,0507,0507,0507,0507,",
    "01077:0507,0507,0503,0504,0500,0500,0503,0507,0500,0500,0504,0502,0502,0502,0506,0501,0501,0505,0505,0505,0505,0507,0507,0507,0507,0507,",
    "01100:0507,0503,0503,0503,0503,0504,0506,0506,0506,0502,0500,0500,0500,0500,0507,0500,0503,0503,0505,0503,0501,0502,0502,0501,0501,0503,0507,0500,0505,0505,0505,0507,",
    "01101:0507,0505,0500,0500,0500,0500,0500,0500,0507,0500,0503,0503,0505,0503,0501,0501,0501,0501,0501,0504,0504,0504,0502,0502,0502,0507,0507,0507,0507,0505,0505,0505,",
    "01102:0507,0505,0500,0500,0500,0500,0500,0500,0500,0503,0503,0503,0507,0501,0501,0505,0502,0502,0502,0507,0507,0507,0501,0501,0505,0502,0502,0502,0507,0507,0507,0507,",
    "01103:0507,0500,0500,0500,0500,0500,0504,0503,0503,0503,0507,0501,0505,0505,0505,0501,0505,0502,0502,0502,0507,0507,0507,0507,",
    "01104:0507,0505,0500,0500,0500,0500,0500,0500,0500,0503,0503,0505,0503,0505,0503,0501,0501,0505,0502,0505,0502,0502,0507,0507,0507,0507,",
    "01105:0507,0505,0500,0500,0500,0500,0500,0500,0500,0503,0503,0503,0503,0505,0505,0505,0506,0502,0502,0505,0505,0505,0506,0503,0503,0503,0503,0507,",
    "01106:0507,0505,0500,0500,0500,0500,0500,0500,0500,0503,0503,0503,0503,0505,0505,0505,0506,0502,0502,0505,0505,0505,0507,0507,0507,0507,",
    "01107:0507,0500,0500,0500,0500,0500,0507,0500,0503,0503,0505,0503,0505,0505,0502,0502,0507,0503,0501,0501,0501,0502,0502,0502,0507,0507,0507,0507,",
    "01110:0507,0505,0500,0500,0500,0500,0500,0500,0500,0505,0505,0505,0503,0503,0503,0503,0500,0500,0500,0505,0505,0505,0501,0501,0501,0507,",
    "01111:0507,0503,0503,0503,0506,0500,0500,0500,0500,0500,0500,0502,0507,0503,0505,0505,0505,0505,0505,0505,0507,0507,",
    "01112:0507,0500,0505,0503,0503,0507,0500,0500,0500,0500,0500,0500,0502,0507,0503,0505,0505,0505,0505,0505,0505,0507,",
    "01113:0507,0505,0500,0500,0500,0500,0500,0500,0500,0505,0505,0505,0503,0507,0500,0507,0500,0507,0500,0505,0505,0505,0506,0506,0501,0507,0501,0507,0501,0507,",
    "01114:0507,0505,0500,0500,0500,0500,0500,0500,0500,0505,0505,0505,0505,0505,0505,0503,0503,0503,0503,0507,",
    "01115:0505,0507,0500,0500,0500,0500,0500,0500,0500,0505,0503,0507,0501,0501,0507,0504,0500,0507,0500,0501,0501,0501,0501,0501,0501,0507,",
    "01116:0507,0505,0500,0500,0500,0500,0500,0500,0500,0507,0505,0501,0507,0501,0507,0501,0507,0501,0501,0504,0500,0500,0500,0500,0500,0507,0505,0505,0505,0505,0505,0505,",
    "01117:0507,0500,0500,0500,0500,0500,0507,0500,0503,0503,0505,0503,0501,0501,0501,0501,0505,0502,0502,0502,0507,0507,0507,0507,",
    "01120:0507,0505,0500,0500,0500,0500,0500,0500,0500,0503,0503,0503,0507,0501,0501,0505,0502,0502,0502,0505,0505,0505,0507,0507,0507,0507,",
    "01121:0507,0500,0500,0500,0500,0500,0507,0500,0503,0503,0505,0503,0501,0501,0501,0505,0502,0504,0502,0505,0505,0502,0503,0507,0503,0507,",
    "01122:0507,0505,0500,0500,0500,0500,0500,0500,0500,0503,0503,0503,0507,0501,0501,0505,0502,0502,0502,0507,0501,0505,0503,0505,0503,0507,",
    "01123:0507,0500,0505,0503,0503,0503,0507,0500,0500,0504,0502,0502,0502,0506,0500,0500,0507,0500,0503,0503,0507,0501,0505,0505,0505,0505,0505,0507,",
    "01124:0507,0504,0504,0504,0504,0504,0500,0503,0503,0503,0503,0506,0506,0501,0501,0501,0501,0501,0501,0507,0507,0507,",
    "01125:0507,0500,0500,0500,0500,0500,0500,0505,0505,0505,0505,0505,0505,0503,0503,0503,0507,0500,0500,0500,0500,0500,0500,0505,0505,0505,0505,0505,0505,0507,",
    "01126:0507,0504,0500,0500,0500,0500,0500,0505,0505,0505,0505,0505,0503,0505,0503,0507,0500,0507,0500,0500,0500,0500,0500,0505,0505,0505,0505,0505,0505,0507,",
    "01127:0507,0500,0500,0500,0500,0500,0500,0505,0505,0505,0505,0505,0505,0503,0507,0500,0500,0500,0505,0505,0505,0503,0507,0500,0500,0500,0500,0500,0500,0505,0505,0505,0505,0505,0505,0507,",
    "01130:0507,0505,0500,0500,0507,0500,0507,0500,0506,0500,0506,0500,0500,0507,0507,0507,0505,0501,0505,0501,0507,0501,0501,0504,0504,0504,0504,0500,0500,0505,0505,0505,0505,0505,0505,0507,",
    "01131:0507,0504,0504,0504,0500,0500,0500,0507,0505,0505,0501,0507,0501,0501,0501,0507,0504,0504,0500,0507,0500,0500,0500,0505,0505,0505,0505,0505,0505,0507,",
    "01132:0507,0505,0500,0500,0507,0500,0507,0500,0507,0500,0507,0500,0500,0502,0502,0502,0502,0505,0505,0505,0505,0505,0505,0503,0503,0503,0503,0507,",
    "01133:0507,0503,0503,0503,0504,0506,0502,0500,0500,0500,0500,0500,0503,0503,0505,0505,0505,0505,0505,0505,0507,0507,",
    "01134:0507,0504,0504,0504,0504,0500,0505,0503,0505,0503,0505,0503,0505,0503,0505,0507,",
    "01135:0507,0507,0503,0503,0503,0500,0500,0500,0500,0500,0500,0502,0502,0507,0507,0507,0505,0505,0505,0505,0505,0505,",
    "01136:0504,0504,0504,0504,0504,0503,0504,0503,0504,0503,0505,0503,0505,0503,0505,0505,0505,0505,0505,0507,",
    "01137:0503,0503,0503,0503,0503,0507,",
    "01140:0507,0504,0504,0504,0504,0504,0500,0505,0503,0505,0503,0505,0505,0505,0505,0507,0507,0507,",
    "01141:0507,0500,0504,0503,0503,0503,0503,0500,0504,0502,0502,0502,0507,0507,0507,0505,0505,0501,0501,0502,0502,0502,0507,0507,0507,0507,",
    "01142:0503,0500,0500,0500,0500,0500,0500,0507,0505,0505,0501,0507,0500,0503,0505,0503,0501,0501,0505,0502,0502,0502,0507,0507,0507,0507,",
    "01143:0507,0500,0500,0500,0507,0500,0503,0503,0505,0505,0505,0501,0502,0502,0507,0507,0507,0507,",
    "01144:0507,0500,0500,0500,0507,0500,0503,0505,0503,0503,0500,0500,0500,0505,0505,0505,0501,0501,0501,0502,0502,0502,0507,0507,0507,0507,",
    "01145:0507,0500,0500,0500,0507,0500,0503,0503,0507,0501,0501,0502,0502,0502,0505,0501,0503,0503,0507,0507,",
    "01146:0507,0507,0503,0500,0500,0500,0500,0500,0507,0500,0503,0505,0505,0505,0502,0506,0502,0507,0507,0507,0507,0505,0505,0505,",
    "01147:0507,0503,0503,0503,0507,0500,0500,0500,0500,0502,0502,0502,0506,0501,0507,0501,0503,0503,0507,0507,0505,0505,",
    "01150:0503,0500,0500,0500,0500,0500,0500,0500,0507,0505,0505,0505,0501,0507,0500,0503,0507,0501,0501,0501,0501,0507,",
    "01151:0507,0503,0503,0503,0506,0500,0500,0500,0500,0502,0507,0504,0500,0507,0507,0505,0505,0505,0505,0505,0505,0507,",
    "01152:0507,0507,0503,0503,0507,0500,0500,0500,0500,0502,0507,0504,0500,0505,0505,0505,0505,0505,0505,0507,",
    "01153:0507,0503,0500,0500,0500,0500,0500,0500,0507,0505,0505,0505,0501,0507,0500,0507,0500,0505,0505,0505,0502,0505,0503,0507,",
    "01154:0507,0503,0503,0503,0506,0500,0500,0500,0500,0500,0500,0502,0507,0507,0507,0507,0505,0505,0505,0505,0505,0505,",
    "01155:0503,0500,0500,0500,0500,0503,0505,0503,0501,0501,0501,0504,0504,0504,0504,0503,0505,0503,0501,0501,0501,0507,",
    "01156:0503,0500,0500,0500,0500,0505,0503,0507,0500,0503,0505,0503,0501,0501,0501,0507,",
    "01157:0507,0500,0500,0500,0507,0500,0503,0503,0505,0503,0501,0501,0505,0502,0502,0502,0507,0507,0507,0507,",
    "01160:0503,0500,0500,0500,0500,0503,0503,0503,0505,0503,0505,0502,0502,0502,0505,0505,0507,0507,0507,0507,",
    "01161:0507,0504,0504,0500,0507,0500,0503,0503,0503,0501,0501,0502,0502,0502,0505,0507,0507,0503,0501,0507,",
    "01162:0503,0500,0500,0500,0500,0507,0501,0507,0500,0503,0505,0503,0505,0505,0505,0507,",
    "01163:0503,0503,0503,0503,0507,0500,0504,0502,0502,0502,0504,0502,0507,0500,0503,0503,0503,0505,0505,0505,0505,0507,",
    "01164:0507,0507,0500,0500,0500,0500,0500,0500,0505,0502,0507,0503,0505,0505,0505,0505,0501,0503,0507,0500,0505,0507,",
    "01165:0507,0500,0500,0500,0500,0507,0505,0505,0505,0501,0503,0507,0500,0503,0500,0500,0500,0505,0505,0505,0501,0507,",
    "01166:0507,0504,0504,0504,0500,0501,0505,0503,0501,0505,0503,0507,0500,0500,0507,0500,0500,0505,0505,0505,0505,0507,",
    "01167:0507,0500,0500,0500,0500,0505,0505,0505,0505,0503,0507,0500,0500,0505,0505,0503,0507,0500,0500,0500,0500,0505,0505,0505,0505,0507,",
    "01170:0503,0507,0500,0503,0500,0500,0504,0502,0502,0507,0507,0505,0503,0507,0500,0505,0505,0505,0505,0502,0503,0507,",
    "01171:0503,0503,0504,0503,0500,0503,0506,0506,0500,0506,0500,0505,0505,0507,0507,0507,0507,0500,0500,0505,0505,0505,0505,0507,",
    "01172:0503,0503,0503,0503,0503,0504,0506,0506,0502,0507,0500,0507,0500,0507,0500,0502,0502,0502,0502,0507,0507,0507,0507,0507,0505,0505,0505,0505,",
    "01173:0507,0507,0503,0504,0502,0500,0504,0502,0507,0500,0500,0504,0503,0505,0505,0505,0505,0505,0505,0507,0507,0507,",
    "01174:0507,0507,0503,0500,0500,0500,0500,0500,0500,0507,0507,0507,0505,0505,0505,0505,0505,0505,",
    "01175:0507,0507,0503,0507,0500,0500,0507,0500,0504,0502,0500,0504,0502,0505,0505,0505,0505,0505,0505,0507,0507,0507,",
    "01176:0507,0507,0504,0504,0504,0504,0500,0507,0500,0505,0503,0507,0500,0505,0505,0505,0505,0505,0507,0505,",
    "01177:0333,",
    "01200:0333,0200,0336,0336,0330,0332,0337,0200,0336,0331,0333,0337,0337,",
    "01201:0304,0313,0333,0200,0336,0336,0330,0330,0332,0332,0332,0335,0336,0337,0337,0342,0330,0335,0350,0335,0336,0336,0342,0335,0335,0342,0335,0304,0337,0331,0331,0333,0337,0337,",
    "01202:0202,0200,",
    "01203:0304,0313,0202,0332,0333,0200,0336,0336,0330,0330,0332,0332,0332,0335,0336,0337,0337,0342,0330,0335,0350,0335,0336,0336,0342,0335,0335,0342,0335,0304,0337,0331,0331,0333,0337,0337,",
    "01204:0202,0200,0336,0336,0330,0332,0337,0200,0336,0331,0333,0337,0337,",
    "01205:0202,0200,0336,0336,0330,0332,0332,0332,0330,0205,0331,0331,0332,0337,0337,0333,",
    "01206:0202,0200,0336,0332,0206,0333,0337,",
    "01207:0333,0336,0330,0332,0336,0336,0341,0337,0333,0333,0331,0331,0337,0337,",
    "01210:0333,0200,0336,0336,0330,0332,0337,0200,0311,0337,0310,0336,0200,0337,0311,0336,0313,0336,0330,0332,0336,0335,0331,0337,0342,0334,0333,0333,0336,0333,0337,0331,0331,0337,0337,",
    "01211:0333,0200,0336,0336,0330,0332,0337,0200,0311,0337,0310,0336,0200,0337,0311,0336,0313,0336,0330,0332,0336,0335,0331,0337,0342,0334,0336,0333,0342,0335,0335,0342,0335,0335,0333,0337,0333,0336,0333,0337,0331,0331,0337,0337,",
    "01212:0336,0330,0333,0337,0212,0336,0336,0333,0331,0337,0200,0336,0333,0331,0337,0337,0200,",
    "01213:0333,0200,0336,0330,0332,0336,0331,0332,0336,0330,0332,0332,0337,055,062,045,0211,0211,0211,0365,0210,0210,0210,0336,0337,0331,0336,0331,0337,0337,0337,0333,",
    "01214:0333,0200,0336,0330,0332,0336,0331,0332,0336,0330,0332,0332,0337,053,062,045,0211,0211,0211,0365,0210,0210,0210,0336,0337,0331,0336,0331,0337,0337,0337,0333,",
    "01215:0333,0200,0336,0330,0332,0336,0331,0337,0215,0333,0336,0331,0337,0337,",
    "01216:0333,0200,0336,0332,0330,0336,0331,0332,0337,0216,0336,0333,0336,0331,0331,0333,0337,0337,0337,",
    "01217:0333,0200,",
    "01220:0333,0200,0336,0330,0332,0336,0331,0333,0337,0220,0336,0331,0333,0337,0337,",
    "01221:0333,0200,0336,0330,0332,0336,0331,0333,0337,0221,0336,0333,0331,0337,0337,",
    "01222:0333,0200,0336,0330,0332,0336,0331,0333,0337,0222,0336,0331,0333,0337,0337,",
    "01223:0333,0200,0336,0330,0332,0336,0331,0333,0337,0223,0336,0331,0333,0337,0337,",
    "01224:0333,0200,0330,0336,0332,0331,0336,0332,0224,0331,0333,0333,0331,0337,0337,",
    "01225:0333,0200,0336,0330,0332,0336,0331,0225,0331,0337,0333,0337,",
    "01226:0333,0200,",
    "01227:0333,0200,",
    "01230:0333,0200,",
    "01231:0333,0200,",
    "01232:0333,0200,",
    "01233:0333,0200,",
    "01234:0333,0200,",
    "01235:0333,0200,",
    "01236:0333,0200,",
    "01237:0333,0200,",
    "01240:0333,0200,0336,0330,0332,0210,0240,0211,0333,0331,0337,",
    "01241:0333,0200,0336,0332,0330,0210,0241,0211,0333,0331,0337,",
    "01242:0333,0200,0336,0330,0332,0210,0242,0211,0333,0331,0337,",
    "01243:0333,0200,0336,0330,0332,0210,0243,0211,0333,0331,0337,",
    "01244:0333,0200,0336,0330,0332,0210,0244,0211,0333,0331,0337,",
    "01245:0333,0200,0336,0330,0332,0336,0245,0337,0333,0331,0337,",
    "01246:0333,0200,0336,0330,0332,0336,0246,",
    "01247:0333,0200,0336,0330,0332,0220,0336,0247,0337,0331,0333,0337,",
    "01250:0333,0200,",
    "01251:0333,0200,",
    "01252:0333,0200,",
    "01253:0333,0200,",
    "01254:0333,0200,",
    "01255:0333,0200,",
    "01256:0333,0200,",
    "01257:0333,0200,",
    "01260:0333,0200,",
    "01261:0333,0200,",
    "01262:0333,0200,",
    "01263:0333,0200,",
    "01264:0333,0200,",
    "01265:0333,0200,",
    "01266:0333,0200,",
    "01267:0333,0200,",
    "01270:0333,0200,",
    "01271:0333,0200,",
    "01272:0333,0200,",
    "01273:0333,0200,",
    "01274:0333,0200,",
    "01275:0333,0200,",
    "01276:0333,0200,",
    "01277:0333,0200,",
    "01300:0333,0200,0336,0330,0332,0340,0350,0335,0336,0330,0342,0331,0331,0331,0342,0330,0330,0335,0335,0331,0331,0342,0330,0330,0330,0342,0331,0334,0334,0334,0351,0331,0331,0333,0333,0337,0337,040,",
    "01301:0333,0200,",
    "01302:0333,0200,",
    "01303:0333,0200,",
    "01304:0333,0200,0336,0330,0332,0341,0342,0335,0342,0335,0342,0335,0342,0350,0335,0351,0336,0336,0330,0330,0341,0331,0331,0335,0330,0330,0341,0331,0331,0335,0330,0330,0341,0331,0331,0335,0330,0330,0341,0331,0331,0350,0334,0351,0337,0337,0330,0335,0335,0333,0337,",
    "01305:0333,0200,0336,0330,0332,0305,0342,0335,0342,0335,0342,0335,0342,0335,0342,0335,0341,0350,0335,0351,0336,0330,0336,0336,0341,0337,0337,0331,0335,0330,0336,0336,0341,0337,0337,0331,0335,0330,0336,0336,0341,0337,0337,0331,0335,0330,0336,0336,0341,0337,0337,0331,0335,0330,0336,0336,0341,0337,0337,0331,0350,0335,0304,0337,0331,0333,0337,",
    "01306:0333,0200,0336,0330,0332,0306,0342,0335,0342,0335,0342,0335,0342,0335,0342,0335,0341,0350,0335,0351,0336,0330,0336,0336,0341,0337,0337,0331,0335,0330,0336,0336,0341,0337,0337,0331,0335,0330,0336,0336,0341,0337,0337,0331,0335,0330,0336,0336,0341,0337,0337,0331,0335,0330,0336,0336,0341,0337,0337,0331,0350,0335,0335,0335,0337,0342,0334,0336,0330,0336,0336,0341,0337,0337,0331,0304,0335,0337,0331,0333,0337,",
    "01307:0333,0200,",
    "01310:0333,0200,0336,0332,0350,0335,0310,0337,0342,0330,0334,0334,0342,0330,0334,0334,0342,0330,0334,0334,0342,0330,0334,0334,0334,0351,0336,0313,0333,0337,",
    "01311:0333,0200,0334,0305,0335,0311,0337,0362,0203,0334,0334,0203,0334,0350,0336,0334,0203,0354,0334,0334,0334,0334,0201,0335,0335,0335,0336,0201,0334,0334,0334,0336,0201,0331,0335,0335,0335,0337,0331,0334,0334,0334,0337,0331,0334,0304,0335,0313,",
    "01312:0304,0313,0333,0200,0334,0306,0335,0362,0203,0334,0334,0203,0364,0335,0335,0335,0350,0335,0312,0336,0330,0334,0334,0342,0335,0335,0335,0335,0342,0335,0335,0335,0335,0342,0335,0335,0331,0335,0335,0337,0304,0313,",
    "01313:0333,0200,0336,0336,0330,0332,0362,0203,0334,0203,0203,0334,0203,0334,0203,0203,0354,0334,0332,0342,0333,0333,0331,0337,0337,",
    "01314:0333,0200,0314,0336,0332,0332,0330,0200,0333,0200,0333,0200,0331,0337,0313,",
    "01315:0333,0200,0336,0330,0332,0336,0331,0334,0331,0337,0305,0362,0203,0335,0203,0335,0203,0335,0203,0335,0203,0354,0335,0350,0335,0350,0335,0335,0335,0304,0336,0331,0333,0337,0337,",
    "01316:0333,0200,0336,0336,0330,0332,0332,0332,0336,0341,0330,0330,0330,0330,0341,0333,0333,0331,0331,0341,0333,0333,0330,0330,0341,0331,0331,0331,0331,0341,0333,0333,0331,0331,0337,0337,0337,",
    "01317:0333,0200,",
    "01320:0320,0333,0200,0320,0336,0330,0332,0336,0333,0331,0337,0204,0336,0331,0336,0330,0334,0337,0337,0342,0335,0320,0330,0336,0332,0332,0330,0336,0330,0332,0335,0335,0335,0335,0332,0337,0337,0337,0331,0333,",
    "01321:0320,0333,0200,0321,0336,0330,0332,0336,0333,0331,0337,0204,0336,0331,0336,0330,0334,0337,0337,0342,0335,0320,0330,0336,0332,0332,0330,0336,0330,0332,0335,0335,0342,0335,0335,0332,0337,0337,0337,0331,0333,",
    "01322:0320,0333,0200,0322,0336,0330,0332,0336,0333,0331,0337,0204,0336,0331,0336,0330,0334,0337,0337,0342,0335,0320,0330,0336,0332,0332,0330,0336,0330,0332,0335,0335,0342,0332,0342,0333,0335,0335,0332,0337,0337,0337,0331,0333,",
    "01323:0320,0333,0200,0323,0336,0330,0332,0336,0333,0331,0337,0204,0336,0331,0336,0330,0334,0337,0337,0342,0335,0320,0330,0336,0332,0332,0330,0336,0330,0332,0335,0335,0342,0332,0342,0332,0342,0333,0333,0335,0335,0332,0337,0337,0337,0331,0333,",
    "01324:0320,0333,0200,0324,0336,0330,0332,0336,0333,0331,0337,0204,0336,0331,0336,0330,0334,0337,0337,0342,0335,0320,0330,0336,0332,0332,0330,0336,0330,0332,0335,0335,0342,0332,0342,0332,0342,0332,0342,0333,0333,0333,0335,0335,0332,0337,0337,0337,0331,0333,",
    "01325:0320,0333,0200,0325,0336,0330,0332,0336,0333,0331,0337,0204,0336,0331,0336,0330,0334,0337,0337,0342,0335,0320,0330,0336,0332,0332,0330,0336,0330,0332,0335,0335,0342,0332,0342,0332,0342,0332,0342,0332,0342,0333,0333,0333,0333,0335,0335,0332,0337,0337,0337,0331,0333,",
    "01326:0320,0333,0200,0326,0336,0330,0332,0336,0333,0331,0337,0204,0336,0331,0336,0330,0334,0337,0337,0342,0335,0320,0330,0336,0332,0332,0330,0336,0330,0332,0335,0335,0342,0332,0342,0332,0342,0332,0342,0332,0342,0332,0342,0333,0333,0333,0333,0333,0335,0335,0332,0337,0337,0337,0331,0333,",
    "01327:0320,0333,0200,0327,0336,0330,0332,0336,0333,0331,0337,0204,0336,0331,0336,0330,0334,0337,0337,0342,0335,0320,0330,0336,0332,0332,0330,0336,0330,0332,0335,0335,0342,0332,0342,0332,0342,0332,0342,0332,0342,0332,0342,0332,0342,0333,0333,0333,0333,0333,0333,0335,0335,0332,0337,0337,0337,0331,0333,",
    "01330:0333,0200,0336,0332,0330,0337,0212,0336,0331,0333,0337,",
    "01331:0333,0200,0336,0332,0330,0337,0335,0335,0212,0335,0335,0336,0331,0333,0337,",
    "01332:0333,0200,0336,0332,0330,0337,0335,0335,0335,0212,0335,0336,0331,0333,0337,",
    "01333:0333,0200,0336,0332,0330,0337,0335,0212,0335,0335,0335,0336,0331,0333,0337,",
    "01334:0333,0200,0336,0330,0332,0336,0350,0343,0334,0334,0343,0334,0334,0343,0334,0330,0350,0335,0351,0335,0330,0335,0335,0335,0335,0362,0203,0334,0334,0203,0364,0331,0350,0335,0330,0335,0335,0304,0337,0333,0331,0337,",
    "01335:0333,0200,0336,0330,0332,0336,0335,0350,0335,0335,0343,0335,0335,0343,0335,0335,0343,0335,0330,0350,0335,0304,0350,0331,0362,0203,0334,0334,0203,0364,0331,0335,0335,0331,0334,0335,0330,0350,0334,0331,0334,0334,0304,0337,0333,0331,0337,",
    "01336:0333,0200,0336,0330,0334,0336,0330,0337,0342,0336,0331,0335,0337,0331,0337,",
    "01337:0333,0200,0336,0330,0332,0336,0342,0334,0342,0334,0342,0334,0342,0330,0330,0334,0337,0331,0337,",
    "01340:0333,0200,0336,0330,0332,0340,0333,0331,0337,",
    "01341:0333,0200,0336,0330,0332,0341,0340,0333,0331,0337,",
    "01342:0333,0200,0336,0330,0332,0334,0336,0342,0330,0340,0331,0335,0335,0342,0330,0340,0333,0333,0330,0334,0337,0337,",
    "01343:0333,0200,0336,0330,0332,0350,0343,0335,0342,0334,0334,0342,0335,0340,0351,0331,0333,0337,",
    "01344:0333,0200,0336,0330,0332,0336,0332,0340,0335,0337,0342,0330,0340,0334,0332,0336,0331,0332,0331,0337,0337,0202,",
    "01345:0202,0200,0350,0334,0343,0335,0304,",
    "01346:0202,0200,0350,0334,0332,0335,0335,0343,0333,0335,0304,0334,",
    "01347:0304,0313,0333,0200,0336,0332,0336,0330,0330,0347,0331,0331,0337,0333,0337,",
    "01350:0333,0200,0336,0330,0332,0350,0335,0330,0335,0335,0335,0335,0362,0203,0334,0334,0203,0364,0331,0334,0336,0336,0201,0330,0201,0331,0331,0331,0334,0334,0304,0337,0337,0333,0331,0337,",
    "01351:0333,0200,0336,0330,0332,0335,0350,0335,0330,0335,0335,0335,0335,0362,0203,0335,0335,0336,0336,0203,0364,0330,0201,0330,0201,0331,0331,0331,0331,0331,0335,0337,0337,0342,0336,0336,0334,0334,0304,0337,0337,0333,0331,0337,",
    "01352:0333,0200,0336,0330,0332,0335,0350,0352,0334,0334,0334,0342,0335,0335,0336,0336,0342,0330,0330,0342,0331,0331,0335,0335,0342,0330,0330,0342,0331,0331,0335,0335,0337,0337,0342,0335,0335,0335,0351,0353,0330,0334,0334,0333,0337,",
    "01353:0333,0200,0336,0330,0332,0335,0350,0352,0334,0342,0335,0335,0342,0335,0335,0336,0336,0342,0330,0330,0342,0331,0331,0334,0334,0334,0334,0334,0334,0342,0330,0330,0342,0331,0331,0335,0335,0335,0351,0353,0337,0337,0333,0330,0334,0337,",
    "01354:0333,0200,0330,0332,0336,0336,0333,0331,0335,0337,0362,0203,0335,0203,0364,0340,0335,0335,0350,0336,0336,0335,0342,0334,0334,0342,0337,0337,0310,0337,0342,0335,0304,0336,0313,0336,0333,0331,0337,0337,",
    "01355:0333,0200,",
    "01356:0333,0200,",
    "01357:0333,0200,",
    "01360:0333,0200,0336,0336,0332,0332,0332,0330,0335,0337,0342,0340,0366,0330,0332,0335,0335,0367,0335,0336,0333,0330,0337,0337,0331,0332,0202,",
    "01361:0333,0200,0336,0336,0332,0332,0332,0330,0335,0337,0366,0330,0332,0335,0335,0367,0335,0336,0340,0334,0337,0342,0336,0333,0330,0337,0337,0331,0335,0331,0336,0332,0337,0332,0202,",
    "01362:0333,0200,0336,0330,0332,0336,0331,0332,0340,0337,0362,0203,0335,0203,0364,0334,0334,0336,0350,0335,0330,0304,0335,0335,0362,0203,0335,0203,0364,0331,0350,0335,0304,0335,0333,0330,0337,0337,0331,",
    "01363:0202,0200,0330,0332,0336,0336,0333,0331,0337,0335,0362,0203,0335,0203,0364,0335,0335,0336,0350,0334,0330,0335,0335,0335,0335,0362,0203,0334,0334,0203,0364,0331,0340,0334,0304,0333,0331,0337,0337,",
    "01364:0333,0200,0330,0332,0336,0336,0333,0331,0337,0335,0362,0203,0335,0203,0364,0335,0335,0336,0350,0334,0330,0335,0335,0335,0335,0362,0203,0334,0334,0203,0364,0331,0340,0334,0304,0333,0331,0337,0337,",
    "01365:0333,0200,0336,0330,0332,0336,0330,0336,0331,0337,0335,0335,0306,0210,0210,0350,0335,0337,0330,0335,0335,0335,0335,0330,0335,0335,0335,0335,0335,0335,0362,0203,0334,0334,0334,0334,0203,0335,0335,0335,0335,0203,0334,0334,0334,0334,0203,0364,0331,0334,0334,0330,0335,0211,0211,0304,0333,0331,0331,0336,0336,0330,0337,0330,0337,0337,",
    "01366:0333,0200,0336,0336,0332,0332,0332,0330,0335,0337,0342,0340,0366,0330,0332,0335,0335,0367,0335,0336,0333,0330,0337,0337,0331,",
    "01367:0333,0200,0336,0336,0332,0332,0332,0330,0335,0337,0366,0330,0332,0335,0335,0367,0335,0336,0340,0334,0337,0342,0336,0333,0330,0337,0337,0331,0335,0331,0336,0332,0337,",
    "01370:0333,0200,0336,0336,0336,0330,0332,0337,0337,0321,0362,0203,0336,0203,0364,0334,0337,0335,0320,0331,0200,0336,0330,0332,0336,0336,0347,0337,0337,0331,0335,0335,0336,0330,0337,0336,0336,0331,0335,0362,0203,0334,0203,0203,0335,0203,0334,0350,0334,0310,0337,0203,0203,0334,0334,0203,0203,0334,0334,0334,0336,0203,0335,0335,0203,0203,0334,0334,0203,0363,0304,0335,0313,0304,0330,0337,0337,0333,0331,0336,0333,0331,0337,0337,0337,",
    "01371:0333,0200,0336,0336,0336,0330,0332,0337,0337,0321,0362,0203,0336,0203,0364,0334,0337,0335,0320,0331,0200,0336,0330,0332,0336,0336,0347,0337,0337,0331,0335,0335,0336,0330,0337,0336,0336,0331,0335,0335,0332,0332,0332,0332,0332,0332,0335,0335,0331,0331,0331,0331,0331,0332,0333,0333,0333,0333,0362,0203,0334,0203,0203,0335,0203,0334,0350,0334,0310,0337,0203,0203,0334,0334,0203,0203,0334,0334,0334,0336,0203,0335,0335,0203,0203,0334,0334,0203,0363,0304,0330,0313,0335,0335,0332,0337,0337,0330,0336,0330,0336,0330,0337,0337,0337,0337,0333,0331,",
    "01372:0333,0200,0336,0336,0336,0330,0332,0337,0337,0321,0362,0203,0336,0203,0364,0334,0337,0335,0320,0331,0200,0336,0330,0332,0336,0336,0332,0337,0341,0333,0341,0332,0337,0331,0335,0335,0336,0330,0337,0336,0336,0331,0335,0362,0203,0334,0203,0203,0335,0203,0334,0350,0334,0310,0337,0203,0203,0334,0334,0203,0203,0334,0334,0334,0336,0203,0335,0335,0203,0203,0334,0334,0203,0363,0304,0330,0313,0335,0335,0332,0337,0337,0330,0336,0330,0336,0330,0337,0337,0337,0337,0333,0331,0334,0333,0330,0336,0336,0331,0336,0331,0336,0333,0337,0337,0337,0337,",
    "01373:0333,0200,0336,0336,0336,0330,0332,0337,0337,0321,0362,0203,0336,0203,0364,0334,0337,0335,0320,0331,0200,0336,0330,0332,0336,0336,0332,0337,0341,0333,0341,0332,0337,0331,0335,0335,0336,0330,0337,0336,0336,0331,0335,0335,0333,0332,0332,0332,0332,0332,0332,0335,0335,0331,0331,0331,0331,0331,0332,0333,0333,0333,0333,0362,0203,0334,0203,0203,0335,0203,0334,0350,0334,0310,0337,0203,0203,0334,0334,0203,0203,0334,0334,0334,0336,0203,0335,0335,0203,0203,0334,0334,0203,0363,0304,0330,0313,0335,0335,0332,0337,0337,0330,0336,0330,0336,0330,0337,0337,0337,0337,0333,0331,",
    "01374:0333,0200,0336,0336,0336,0330,0332,0337,0337,0321,0362,0203,0336,0203,0364,0334,0337,0335,0320,0331,0200,0336,0330,0332,0336,0336,0332,0337,0331,0332,0335,0336,0332,0336,0333,0330,0337,0337,0337,0362,0306,0203,0334,0334,0203,0334,0334,0203,0354,0335,0304,0335,0336,0332,0337,0331,0335,0335,0336,0330,0337,0336,0336,0331,0331,0332,0332,0332,0332,0331,0335,0362,0203,0334,0203,0203,0335,0203,0334,0350,0334,0310,0337,0203,0203,0334,0334,0203,0203,0334,0334,0334,0336,0203,0335,0335,0203,0203,0334,0334,0203,0363,0304,0330,0313,0335,0335,0332,0337,0337,0330,0336,0330,0336,0330,0337,0337,0337,0337,0333,0331,0334,0333,0330,0336,0336,0331,0336,0331,0336,0336,0333,0331,0337,0337,0337,0337,0337,",
    "01375:0333,0200,0336,0336,0336,0330,0332,0337,0337,0321,0362,0203,0336,0203,0364,0334,0337,0335,0320,0331,0200,0336,0330,0332,0336,0336,0332,0337,0331,0332,0335,0336,0332,0336,0333,0330,0337,0337,0337,0362,0306,0203,0334,0334,0203,0334,0334,0203,0354,0335,0304,0335,0336,0332,0337,0331,0335,0335,0336,0330,0337,0336,0336,0331,0331,0332,0332,0332,0332,0331,0335,0335,0335,0335,0331,0331,0331,0331,0332,0333,0333,0333,0333,0333,0333,0333,0333,0333,0362,0203,0334,0203,0203,0335,0203,0334,0350,0334,0310,0337,0203,0203,0334,0334,0203,0203,0334,0334,0334,0336,0203,0335,0335,0203,0203,0334,0334,0203,0363,0304,0330,0313,0335,0335,0332,0337,0337,0330,0336,0330,0336,0330,0337,0337,0337,0337,0333,0331,0334,0333,0330,0336,0336,0331,0336,0331,0336,0336,0333,0331,0337,0337,0337,0337,0337,0335,0336,0333,0331,0331,0336,0336,0336,0333,0337,0337,0337,0337,",
    "01376:0333,0200,0336,0336,0336,0330,0332,0337,0337,0321,0362,0203,0336,0203,0364,0334,0337,0335,0320,0331,0200,0336,0330,0332,0336,0336,0332,0337,0331,0332,0335,0336,0332,0336,0333,0330,0337,0337,0337,0362,0203,0334,0203,0334,0203,0334,0203,0354,0335,0304,0335,0336,0332,0337,0331,0335,0335,0336,0330,0337,0336,0336,0331,0331,0332,0332,0332,0332,0331,0335,0362,0203,0334,0203,0203,0335,0203,0334,0350,0334,0310,0337,0203,0203,0334,0334,0203,0203,0334,0334,0334,0336,0203,0335,0335,0203,0203,0334,0334,0203,0363,0304,0330,0313,0335,0335,0332,0337,0337,0330,0336,0330,0336,0330,0337,0337,0337,0337,0333,0331,0334,0333,0330,0336,0336,0331,0336,0331,0336,0336,0333,0331,0337,0337,0337,0337,0337,",
    "01377:0333,0200,0336,0336,0336,0330,0332,0337,0337,0321,0362,0203,0336,0203,0364,0334,0337,0335,0320,0331,0200,0336,0330,0332,0336,0336,0332,0337,0331,0332,0335,0336,0332,0336,0333,0330,0337,0337,0337,0362,0203,0334,0203,0334,0203,0334,0203,0354,0335,0304,0335,0336,0332,0337,0331,0335,0335,0336,0330,0337,0336,0336,0331,0331,0331,0331,0331,0333,0333,0333,0333,0331,0331,0362,0203,0334,0203,0203,0335,0203,0334,0350,0334,0310,0337,0203,0203,0334,0334,0203,0203,0334,0334,0334,0336,0203,0335,0335,0203,0203,0334,0334,0203,0363,0304,0330,0313,0335,0335,0332,0337,0337,0330,0336,0330,0336,0330,0337,0337,0337,0337,0333,0331,0334,0333,0330,0336,0336,0331,0336,0331,0336,0336,0333,0331,0337,0337,0337,0337,0337,0335,0336,0333,0336,0336,0336,0333,0337,0337,0337,0337,0331,",
    "01400:0333,0200,0336,0330,0332,0322,0335,0215,0620,0334,0320,0333,0331,0337,040,",
    "01401:0333,0200,0336,0330,0332,0334,0322,0620,0215,0335,0331,0333,0337,0320,",
    "01402:0333,0200,0336,0330,0332,0325,0335,0306,0350,0334,0215,0620,0306,0350,0334,0334,0304,0320,0331,0333,0337,",
    "01403:0333,0200,0336,0330,0332,0325,0335,0335,0340,0335,0306,0350,0334,0215,0304,0306,0620,0306,0350,0335,0304,0335,0331,0333,0337,0320,",
    "01404:0333,0200,0336,0330,0332,0326,0215,0333,0331,0337,0320,",
    "01405:0333,0200,0336,0330,0332,0335,0335,0326,0620,0215,0335,0335,0320,0333,0331,0337,",
    "01406:0333,0200,0336,0330,0332,0336,0336,0336,0330,0334,0337,0337,0362,0203,0336,0334,0203,0334,0337,0203,0203,0334,0336,0203,0334,0337,0203,0354,0335,0336,0336,0331,0337,0337,0337,0331,0333,0337,",
    "01407:0333,0200,0336,0330,0332,0336,0336,0336,0330,0334,0330,0335,0337,0337,0362,0203,0335,0336,0203,0335,0337,0203,0334,0203,0335,0336,0203,0335,0337,0203,0334,0203,0335,0336,0203,0335,0337,0203,0334,0203,0335,0336,0203,0335,0337,0203,0354,0334,0336,0336,0331,0333,0337,0337,0337,0331,0333,0337,",
    "01420:0333,0200,0330,0332,0336,0331,0333,0336,0331,0332,0337,01146,0220,0336,0331,0333,0336,0333,0337,0337,0337,",
    "01421:0333,0200,0336,0330,0332,0336,0331,0332,0337,01146,0221,0336,0333,0331,0336,0333,0337,0337,0337,",
    "01422:0333,0200,0336,0336,0332,0330,0332,0332,0337,01146,0222,0336,0333,0336,0331,0331,0333,0337,0337,0337,",
    "01423:0333,0200,0336,0330,0332,0336,0331,0332,0332,0337,01146,0336,0333,0337,0223,0336,0331,0336,0333,0337,0333,0337,0337,",
    "01424:0333,0200,0336,0330,0332,0336,0331,0332,0337,01124,0220,0336,0331,0333,0336,0333,0337,0337,0337,",
    "01425:0333,0200,0336,0330,0332,0336,0331,0332,0337,01124,0221,0336,0333,0336,0331,0331,0333,0337,0337,0337,",
    "01426:0333,0200,0336,0330,0332,0336,0331,0332,0337,01124,0222,0336,0331,0333,0336,0333,0337,0337,0337,",
    "01427:0333,0200,0336,0330,0332,0336,0331,0332,0332,0337,01124,0336,0333,0337,0223,0336,0331,0333,0336,0333,0337,0337,0337,",
    "01430:0333,0200,0336,0330,0332,0336,0331,0332,0337,01141,0220,0336,0331,0333,0336,0333,0337,0337,0337,",
    "01431:0333,0200,0336,0330,0332,0336,0331,0332,0337,01141,0221,0336,0333,0336,0331,0331,0333,0337,0337,0337,",
    "01432:0333,0200,0336,0330,0332,0336,0331,0332,0337,01141,0222,0336,0331,0333,0336,0333,0337,0337,0337,",
    "01433:0333,0200,0336,0330,0332,0336,0331,0332,0332,0337,01141,0336,0333,0337,0223,0336,0333,0331,0336,0333,0337,0337,0337,",
    "01434:0333,0200,0336,0330,0332,0336,0336,0336,0347,0337,0337,0350,0335,0330,0342,0331,0334,0334,0330,0342,0331,0331,0331,0342,0330,0330,0335,0335,0331,0331,0342,0330,0330,0334,0337,0304,0331,0333,0337,",
    "01435:0333,0200,0336,0330,0332,0336,0332,0224,0336,0333,0331,0333,0331,0333,0331,0333,0331,0337,0337,0337,",
    "01436:0333,0200,0336,0330,0332,0336,0225,0331,0331,0333,0333,0337,0337,",
    "01437:0333,0200,0336,0330,0332,0331,0332,0336,0336,0330,0333,0337,0337,0337,01077,0336,0336,0336,0331,0333,0337,0337,0337,",
    "01477:0520,0336,0330,0332,0336,0331,0332,0330,0336,0332,0337,0335,0362,0203,0334,0203,0335,0203,0335,0203,0334,0203,0364,0336,0334,0334,0350,0335,0310,0337,0342,0334,0334,0342,0336,0335,0335,0335,0304,0313,0333,0337,0337,0331,0337,",
    "01500:0333,0200,0336,0330,0332,0336,0336,0336,0347,0330,0330,0330,0347,0331,0331,0331,0337,0337,0337,0331,0333,0337,",
    "01501:0333,0200,0336,0330,0332,0336,0336,0336,0347,0331,0331,0331,0347,0330,0330,0330,0337,0337,0337,0331,0333,0337,",
    "01502:0333,0200,0336,0330,0332,0336,0336,0336,0347,0332,0332,0332,0347,0333,0333,0333,0337,0337,0337,0331,0333,0337,",
    "01503:0333,0200,0336,0330,0332,0336,0336,0336,0347,0333,0333,0333,0347,0332,0332,0332,0337,0337,0337,0331,0333,0337,",
    "01504:0333,0200,0336,0330,0332,0336,0336,0336,0341,0337,0337,0330,0336,0336,0341,0337,0337,0330,0337,0331,0333,0331,0337,",
    "01505:0333,0200,0336,0330,0332,0336,0336,0336,0341,0331,0331,0331,0331,0341,0331,0331,0331,0331,0337,0337,0337,0333,0337,",
    "01506:0333,0200,0336,0330,0332,0336,0336,0336,0341,0332,0332,0332,0332,0341,0332,0332,0332,0332,0337,0337,0337,0331,0337,0333,",
    "01507:0333,0200,0336,0330,0332,0336,0336,0336,0341,0333,0333,0333,0341,0333,0333,0333,0333,0333,0337,0337,0337,0331,0337,",
    "01510:0333,0200,0336,0330,0332,0336,0342,0330,0335,0335,0350,0335,0336,0342,0334,0334,0342,0335,0304,0335,0335,0337,0330,0337,0333,0337,0331,",
    "01511:0333,0200,0336,0330,0332,0335,0335,0336,0342,0330,0335,0335,0350,0334,0336,0342,0335,0335,0342,0334,0337,0304,0331,0337,0333,0337,",
    "01512:0333,0200,0336,0330,0332,0336,0334,0342,0330,0335,0350,0335,0336,0342,0335,0335,0342,0334,0337,0304,0334,0332,0337,0331,0337,0333,",
    "01513:0333,0200,0336,0330,0332,0336,0335,0342,0330,0335,0335,0350,0335,0336,0342,0334,0334,0342,0335,0335,0335,0304,0337,0333,0337,0331,0337,",
    "01514:0333,0200,0336,0330,0332,0336,0350,0310,0335,0337,0201,0335,0335,0335,0336,0336,0342,0335,0335,0342,0335,0335,0304,0337,0333,0330,0313,0337,0337,0331,",
    "01515:0333,0200,0336,0330,0332,0336,0350,0335,0335,0335,0310,0337,0201,0335,0335,0335,0336,0336,0342,0335,0335,0342,0337,0313,0304,0331,0333,0337,0337,",
    "01516:0333,0200,0336,0330,0332,0334,0350,0334,0310,0336,0201,0335,0335,0335,0336,0336,0342,0335,0335,0342,0334,0334,0337,0313,0304,0331,0332,0337,0337,0333,",
    "01517:0333,0200,0336,0330,0332,0336,0310,0350,0334,0337,0201,0335,0335,0335,0336,0336,0342,0335,0335,0342,0335,0335,0335,0335,0337,0313,0304,0330,0332,0337,0337,0331,0333,",
    "01520:0333,0200,0336,0336,0330,0332,0332,0332,0337,060,0365,0333,0336,0331,0333,0337,0337,",
    "01521:0333,0200,0336,0336,0330,0332,0332,0332,0337,061,0365,0333,0336,0331,0333,0337,0337,",
    "01522:0333,0200,0336,0336,0330,0332,0332,0332,0337,062,0365,0333,0336,0331,0333,0337,0337,",
    "01523:0333,0200,0336,0336,0330,0332,0332,0332,0337,063,0365,0333,0336,0331,0333,0337,0337,",
    "01524:0333,0200,0336,0336,0330,0332,0332,0332,0337,064,0365,0333,0336,0331,0333,0337,0337,",
    "01525:0333,0200,0336,0336,0330,0332,0332,0332,0337,065,0365,0333,0336,0331,0333,0337,0337,",
    "01526:0333,0200,0336,0336,0330,0332,0332,0332,0337,066,0365,0333,0336,0331,0333,0337,0337,",
    "01527:0333,0200,0336,0336,0330,0332,0332,0332,0337,067,0365,0333,0336,0331,0333,0337,0337,",
    "01530:0333,0200,0336,0330,0332,0336,0336,0333,0530,0331,0530,0331,0530,0331,0333,0333,0331,0333,0337,0337,0337,",
    "01531:0333,0200,0336,0330,0332,0336,0331,0333,0336,0330,0530,0331,0530,0331,0530,0531,0331,0333,0333,0337,0337,0337,",
    "01532:0333,0200,0336,0336,0330,0330,0336,0331,0332,0337,0532,0336,0333,0337,0331,0336,0331,0337,0337,0337,",
    "01533:0333,0200,0336,0336,0330,0330,0336,0332,0337,0533,0336,0333,0331,0331,0337,0337,0337,",
    "01534:0333,0200,0336,0330,0336,0332,0336,0534,0331,0333,0333,0333,0333,0333,0333,0331,0331,0331,0331,0337,0337,0337,",
    "01535:0333,0200,0336,0336,0330,0336,0330,0332,0332,0535,0331,0333,0333,0333,0331,0331,0337,0337,0337,",
    "01600:0333,0200,0336,0330,0332,0336,0331,0333,0337,0200,0350,0335,0336,0336,0336,0201,0334,0337,0337,0337,0201,0334,0334,0334,0336,0336,0336,0342,0335,0337,0337,0337,0201,0334,0336,0336,0336,0342,0330,0334,0337,0337,0337,0335,0335,0335,0335,0304,0336,0330,0332,0337,0337,0331,0333,",
    "01601:0333,0200,0336,0330,0332,0336,0331,0332,0337,061,0365,0333,0336,0331,0333,0337,0337,",
    "01602:0333,0200,0336,0330,0332,0336,0331,0332,0337,062,0365,0333,0336,0333,0331,0337,0337,",
    "01603:0333,0200,0336,0332,0336,0330,0332,0337,01015,063,0365,0333,0336,0333,0331,0337,0337,",
    "01604:0333,0200,0336,0332,0336,0330,0332,0337,01015,064,0365,0333,0336,0333,0331,0337,0337,",
    "01605:0333,0200,0336,0332,0336,0330,0332,0337,01015,065,0365,0333,0336,0333,0331,0337,0337,",
    "01606:0333,0200,0336,0332,0336,0330,0332,0337,01015,066,0365,0333,0336,0333,0331,0337,0337,",
    "01607:0333,0200,0336,0332,0336,0330,0332,0337,01015,067,0365,0333,0336,0333,0331,0337,0337,",
    "01700:0333,0200,0336,0330,0332,0322,0335,0215,0620,0334,0320,0333,0331,0337,",
    "01701:0333,0200,0336,0330,0332,0334,0322,0620,0335,0334,0215,0331,0333,0335,0331,0331,0337,0320,",
    "01702:0333,0200,0336,0330,0332,0326,0620,0215,0333,0331,0337,0320,",
    "01703:0333,0200,0336,0330,0332,0335,0335,0326,0215,0340,0335,0335,0320,0333,0331,0337,",
    "01704:0333,0200,0336,0330,0332,0325,0335,0335,0335,0306,0350,0334,0304,0306,0215,0620,0306,0350,0335,0304,0335,0331,0333,0337,0320,",
    "01705:0333,0200,0336,0330,0332,0325,0335,0306,0350,0334,0620,0215,0306,0350,0334,0334,0304,0320,0331,0333,0337,",
    "01706:0333,0200,0200,0336,0330,0332,0336,0334,0342,0335,0335,0342,0334,0331,0331,0333,0333,0337,0337,",
    "01707:0333,0200,0336,0330,0332,0336,0342,0335,0342,0335,0342,0335,0342,0335,0337,0331,0333,0337,",
    "01710:0333,0200,0336,0330,0332,0341,0350,0335,0335,0335,0210,0343,0350,0210,0343,0211,0211,0335,0335,0304,0335,0335,0331,0333,0337,",
    "01711:0333,0200,0336,0330,0332,0336,0331,0336,0333,0331,0337,0337,0200,0306,0350,0335,0336,0201,0334,0337,0201,0334,0334,0334,0334,0334,0336,0201,0331,0335,0335,0337,0201,0334,0334,0336,0342,0330,0335,0335,0335,0335,0335,0331,0304,0331,0333,0333,0333,0336,0331,0333,0337,0337,0337,",
    "01720:0333,0200,0336,0330,0332,0336,0331,0333,0337,0322,0204,0336,0331,0333,0337,0337,0320,",
    "01721:0333,0200,0336,0330,0332,0336,0331,0333,0337,0323,0204,0320,0336,0331,0333,0337,0337,",
    "01722:0333,0200,0336,0330,0332,0336,0331,0333,0337,0324,0204,0336,0331,0333,0337,0337,0320,",
    "01723:0333,0200,0336,0330,0332,0336,0331,0333,0337,0325,0204,0320,0336,0331,0333,0337,0337,",
    "01724:0333,0200,0336,0336,0330,0332,0337,0326,0204,0336,0331,0333,0337,0337,0320,",
    "01725:0333,0200,0336,0336,0330,0332,0337,0327,0204,0336,0331,0333,0337,0337,0320,"
];

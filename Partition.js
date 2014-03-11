function Rectangle(x,y,length,breadth)
{
 this.x=x;
 this.y=y;
 this.Rlength=length;
 this.Rbreadth=breadth;
}

function QuadTree(x,y,length,breadth,nodeNumber)
{
 this.rect=new Rectangle(x,y,length,breadth); //use this. syntax to declare public properties and var to declare private properties
 this.isLeaf=true;
 this.nodeNumber=nodeNumber;
 this.children=new Array();
}

QuadTree.prototype.GetNode = function(px,py){
 if(this.isLeaf && this.IsInternalPoint(px,py))
  {
	return this;
  }
 else
  {
	for(var i=0;i<4;i++)
          {
                //only one of the children will have the point internal to it.
		if(this.children[i].IsInternalPoint(px,py))
		  {
                        //alert('Point x: '+px+'y: '+py+' is internal to '+this.children[i].nodeNumber); 
			return this.children[i].GetNode(px,py);
		  }
	  }
  }
 return null;
};

QuadTree.prototype.IsInternalPoint = function(px,py){
  if( (this.rect.x<px && px<(this.rect.x+this.rect.Rlength) ) && (this.rect.y<py && py<(this.rect.y+this.rect.Rbreadth)) )
     return true;
   return false; 
};

QuadTree.prototype.MakeChildren = function(){
  this.isLeaf=false;
  var length1=this.rect.Rlength/2;
  var length2=this.rect.Rlength-length1;
  
  var breadth1=this.rect.Rbreadth/2;
  var breadth2=this.rect.Rbreadth-breadth1;

  this.children[0]=new QuadTree(this.rect.x, this.rect.y, length1, breadth1, 1);
  this.children[1]=new QuadTree(this.rect.x+length1, this.rect.y, length2, breadth1, 2);
  this.children[2]=new QuadTree(this.rect.x, this.rect.y+breadth1, length1, breadth2, 3);
  this.children[3]=new QuadTree(this.rect.x+length1, this.rect.y+breadth1, length2, breadth2, 4); 
};

var boundingRect; 

function RectanglePartitioner(canvas)
{
 this.canvas = canvas;
 this.context = this.canvas.getContext('2d');
 //boundingRect = this.canvas.getBoundingClientRect(); 
 var canvasPos = findPos(canvas);
 boundingRect = new Rectangle(canvasPos[0], canvasPos[1] ,canvas.width-20 , canvas.height-20); 

 this.quadTree = new QuadTree(boundingRect.x, boundingRect.y, boundingRect.Rlength, boundingRect.Rbreadth, 1);
 this.context.strokeRect(boundingRect.x, boundingRect.y, boundingRect.Rlength, boundingRect.Rbreadth);
 
 this.canvas.addEventListener('click', this.InitiateDivide.bind(this), false);
}


RectanglePartitioner.prototype.DrawLine=function(x1,y1,x2,y2)
{
 this.context.beginPath();
 this.context.moveTo(x1,y1);
 this.context.lineTo(x2,y2);
 //set line colour
 this.context.strokeStyle=GenerateColour();
 this.context.stroke();
}

RectanglePartitioner.prototype.DrawChildren=function(px, py) {
  var node = this.quadTree.GetNode(px,py);
  //if a valid node has been found
  if(null != node)
   {
     //modify the data structure
     node.MakeChildren();
     //now divide the node in the UI
     var rect=node.rect;
     var halfBreadth=rect.Rbreadth/2;
     var halfLength=rect.Rlength/2;
     this.DrawLine(rect.x, rect.y+halfBreadth, rect.x+rect.Rlength, rect.y+halfBreadth);
     this.DrawLine(rect.x+halfLength, rect.y, rect.x+halfLength, rect.y+rect.Rbreadth);		
   }
}


RectanglePartitioner.prototype.InitiateDivide = function(evt)
{
 //the click should be within the canvas for the drawings to occur
 var rect = boundingRect;
 if((evt.clientX>=rect.x && evt.clientX<=(rect.x+rect.Rlength) ) && (evt.clientY>=rect.y && evt.clientY<=(rect.y+rect.Rbreadth) ))
  {
    var px=evt.clientX-boundingRect.x;
    var py=evt.clientY-boundingRect.y;
    this.DrawChildren(px,py);
  }
}

//this function generates a random colour
function GenerateColour()
{
  return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
}


function Worker()
{
 var canvas=document.getElementById('myCanvas');
 var partitioner=new RectanglePartitioner(canvas);
}

function findPos(obj)
{
 var curleft=curtop=0;
 if(obj.offsetParent)
  {
    curleft = obj.offsetLeft;
    curtop = obj.offsetTop;
    while(obj = obj.offsetParent)
     {
       curleft += obj.offsetLeft;
       curtop += obj.offsetTop;	
     }
  }
 return [curleft,curtop];
}

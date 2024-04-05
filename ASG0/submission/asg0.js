var ctx
var canvas
// HelloCanvas.js (c) 2012 matsuda
function main() 
{
    // Retrieve <canvas> element
    canvas = document.getElementById('web');
  
    // Get the rendering context for WebGL
    ctx = canvas.getContext('2d');
    if (!canvas) 
    {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
  
    //make canvas black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    
    //creating the line for box
    var v1 = new Vector3([2.25 ,2.25,0]);
    drawVector(v1, 'red');

}
  
  //part 2
function drawVector(v, color)
  {
    ctx.beginPath();
    //making it start in the middle 
    ctx.moveTo(canvas.width/2, canvas.height/2);

    //changing the line to the color red
    ctx.strokeStyle = color;

    //painting the red line
    ctx.lineTo(canvas.width/2 + v.elements[0] * 20 ,canvas.height/2 - v.elements[1] * 20);

    //draw the line
    ctx.stroke();
  }

  // part 3
  function handleDrawEvent()
  {
    //clearing the canvas 
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //read the value of the text box to create v1
    xinput = document.getElementById('xinput').value;
    xinput = parseFloat(xinput);

    yinput = document.getElementById('yinput').value;
    yinput = parseFloat(yinput);

    //checking if it works
    if(isNaN(xinput))
    {
        console.log("the input failed for the xinput.");
        return;
    }
    if(isNaN(yinput))
    {
        console.log("the input failed for the yinput.");
        return;
    }

    //copy and paste, doing for v2
    //read the value of the text box to create v1
    x2input = document.getElementById('x2input').value;
    x2input = parseFloat(x2input);

    y2input = document.getElementById('y2input').value;
    y2input = parseFloat(y2input);

    //checking if it works
    if(isNaN(x2input))
    {
        console.log("the input failed for the x2input.");
        return;
    }
    if(isNaN(y2input))
    {
        console.log("the input failed for the y2input.");
        return;
    }
    
    var vector1 = new Vector3 ([xinput, yinput, 0]);
    var vector2 = new Vector3 ([x2input, y2input, 0]);

    //call drawVector
    drawVector(vector1, 'red');
    drawVector(vector2, 'blue');
  }

  function handleDrawOperationEvent()
  {
    //clearing the canvas 
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    xinput = document.getElementById('xinput').value;
    xinput = parseFloat(xinput);

    yinput = document.getElementById('yinput').value;
    yinput = parseFloat(yinput);

    //checking if it works
    if(isNaN(xinput))
    {
        console.log("the input failed for the xinput.");
        return;
    }
    if(isNaN(yinput))
    {
        console.log("the input failed for the yinput.");
        return;
    }

    x2input = document.getElementById('x2input').value;
    x2input = parseFloat(x2input);

    y2input = document.getElementById('y2input').value;
    y2input = parseFloat(y2input);

    //checking if it works
    if(isNaN(x2input))
    {
        console.log("the input failed for the x2input.");
        return;
    }
    if(isNaN(y2input))
    {
        console.log("the input failed for the y2input.");
        return;
    }

    var vector1 = new Vector3 ([xinput, yinput, 0]);
    var vector2 = new Vector3 ([x2input, y2input, 0]);

    //call drawVector
    drawVector(vector1, 'red');
    drawVector(vector2, 'blue');

    var readhtml = document.getElementById('Operation').value;

    if(readhtml == 'add')
    {
        var vector3 = new Vector3();
        vector3 = vector1.add(vector2);
        drawVector(vector3, 'green');
    }
    else if(readhtml == 'sub')
    {
        var vector3 = new Vector3();
        vector3 = vector1.sub(vector2);
        drawVector(vector3, 'green');
    }
    else if(readhtml == 'mul')
    {
        var vector3 = new Vector3();
        var vector4 = new Vector3();
        var scale = document.getElementById('scalar').value;
        vector3 = vector1.mul(scale);
        vector4 = vector2.mul(scale);
        drawVector(vector3, 'green');
        drawVector(vector4, 'green');
    }
    else if(readhtml == 'div')
    {
        var vector3 = new Vector3();
        var vector4 = new Vector3();
        var scale = document.getElementById('scalar').value;
        vector3 = vector1.div(scale);
        vector4 = vector2.div(scale);
        drawVector(vector3, 'green');
        drawVector(vector4, 'green');
    }
    else if(readhtml == "magnitude")
    {
        console.log('magnitude v1: ' + vector1.magnitude());
        console.log('magnitude v2: ' + vector2.magnitude());
    }
    else if(readhtml == "normalize")
    {
        var normvectorv1 = vector1.normalize();
        var normvectorv2 = vector2.normalize();

        drawVector(normvectorv1, 'green');
        drawVector(normvectorv2, 'green');
    }
    else if(readhtml == 'angle between')
    {
        console.log('Angle: ' + angleBetween(vector1, vector2));
    }
    else if(readhtml == 'area')
    {
        console.log('Area of the triangle: ' + areaTriangle(vector1, vector2));
    }   
  }

  function angleBetween(vector1, vector2)
  {
    var start = Vector3.dot(vector1, vector2);
    var magfunction = vector1.magnitude() * vector2.magnitude();
    var storedot = start / magfunction;

    var angle = Math.acos(storedot);
    var convert = 180 / Math.PI;
    angle = angle * convert;
    return angle;
  }
  function areaTriangle(vector1, vector2)
  {
    var veccross = Vector3.cross(vector1, vector2);
    var result = veccross.magnitude() / 2;
    return result;
  }
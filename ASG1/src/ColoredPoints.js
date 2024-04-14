// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'uniform float u_size;\n' +
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

//constant 
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const DIAMOND = 3;

//global variables 
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_size;
let g_selectedType = POINT;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedSeg = 10;

function setupWebGL()
{
  canvas = document.getElementById('webgl'); 
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) 
  {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL()
{
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) 
  {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) 
  {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) 
  {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_FragColor
  u_size = gl.getUniformLocation(gl.program, 'u_size');
  if (!u_size) 
  {
    console.log('Failed to get the storage location of u_size');
    return;
  }

}

function addActionsForHtmlUI()
{
  // Button color
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0];};
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0];};
  document.getElementById('clearButton').onclick = function(){ g_shapesList = []; renderAllShapes()};

  // Buttons shape
  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT;};
  document.getElementById('triangleButton').onclick = function() { g_selectedType = TRIANGLE};
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE};
  
  // WOW
  document.getElementById('diamondButton').onclick = function() { g_selectedType = DIAMOND};
  
  // Image 
  document.getElementById('imageButton').onclick = function() {Lily()};

  //Slider 
  document.getElementById('redSlide').addEventListener('mouseup', function(){g_selectedColor[0] = this.value/100;});
  document.getElementById('greenSlide').addEventListener('mouseup', function(){g_selectedColor[1] = this.value/100;});
  document.getElementById('blueSlide').addEventListener('mouseup', function(){g_selectedColor[2] = this.value/100;});

  //Slider size
  document.getElementById('sizeSlide').addEventListener('mouseup', function(){g_selectedSize = this.value;});
  document.getElementById('segSlide').addEventListener('mouseup', function(){g_selectedSeg = this.value;});
}

function main() 
{
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev){ if(ev.buttons == 1){click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];

function click(ev) 
{
    let [x,y] = convertCoordinatesEventToGL(ev);
    let point;
    //let point = new Point();
    if(g_selectedType == POINT)
    {
      point = new Point();
    } 
    else if (g_selectedType == TRIANGLE)
    {
      point = new Triangle();
    }
    else if (g_selectedType == DIAMOND)
    {
      point = new Diamond();
    }
    else
    {
      point = new Circle();
      point.segments = g_selectedSeg;
    }

    point.position = [x,y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

    renderAllShapes();
}

function convertCoordinatesEventToGL(ev)
{
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x,y]);
}

function renderAllShapes()
{
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_points.length;
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) 
  {
    g_shapesList[i].render();
  }
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot")
}

function sendTextToHTML(text, htmlID)
{
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm)
  {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function Lily()
{
  //Clearing the canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  g_shapesList = [];

  //[ bottom dot, right dot, left dot ]

  // black nose 
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  var blackVertices = new Float32Array([-0.1,-0.1,  0,-0.2,  0.1,-0.1]);
  drawTriangle(blackVertices, a_Position);

  // pink ears
  gl.uniform4f(u_FragColor, 1.0, 0.41, 0.71, 1.0);
  var pinkVertices = new Float32Array([-0.5,0.3,  -0.5,0.8,  -0.3,0.5]);
  drawTriangle(pinkVertices, a_Position);
  
  gl.uniform4f(u_FragColor, 1.0, 0.41, 0.71, 1.0);
  var pinkVertices = new Float32Array([0.5,0.3,  0.5,0.8,  0.3,0.5]);
  drawTriangle(pinkVertices, a_Position);

  // blue eyes 

  gl.uniform4f(u_FragColor, 0.0, 0.59, 0.53, 1.0);
  var blueVertices = new Float32Array([-0.3,0.1,  -0.1,-0.1,  -0.1,0.3]);
  drawTriangle(blueVertices, a_Position);

  gl.uniform4f(u_FragColor, 0.0, 0.59, 0.53, 1.0);
  var blueVertices = new Float32Array([0.3,0.1,  0.1,-0.1,  0.1,0.3]);
  drawTriangle(blueVertices, a_Position);
  
  // orange base
  gl.uniform4f(u_FragColor, 1.0, 0.69, 0.4, 1.0);
  var orangeVertices = new Float32Array([0.3,0.5,  0,0.35,  0.1,-0.1]);
  drawTriangle(orangeVertices, a_Position);
  
  //between the eyes
  var Cat = [0,0.35,  0.3,0.5,  -0.3,0.5];
  g_shapesList.push(Cat);
  
  var Cat = [-0.3,0.5,  0,0.35,  -0.1,-0.1];
  g_shapesList.push(Cat);

  Cat = [0.3,0.5,  0,0.35,  0.1,-0.1];
  g_shapesList.push(Cat);

  Cat = [-0.1,-0.1,  0,0.35,  0.1,-0.1];
  g_shapesList.push(Cat);


  // the middle 
  // the nose
  // Cat = [-0.1,-0.1,  0,-0.2,  0.1,-0.1];
  // g_shapesList.push(Cat);

  Cat = [0,-0.2,  0.03,-0.5,  0.1,-0.1];
  g_shapesList.push(Cat);

  Cat = [0,-0.2,  -0.03,-0.5,  -0.1,-0.1];
  g_shapesList.push(Cat);

  Cat = [0,-0.2,  -0.03,-0.5,  0.03,-0.5];
  g_shapesList.push(Cat);

  Cat = [0,-0.7,  -0.03,-0.5,  0.03,-0.5];
  g_shapesList.push(Cat);

  
  //left side 
  Cat = [0,-0.7,  -0.05,-0.1,  -0.3,0.5];
  g_shapesList.push(Cat);

  // Cat = [-0.5,0.3,  -0.1,-0.1,  -0.3,0.5];
  // g_shapesList.push(Cat);

  // this is the eyes 
  // Cat = [-0.3,0.1,  -0.1,-0.1,  -0.1,0.3];
  // g_shapesList.push(Cat);

  // the outer eyes
  Cat = [-0.5,0.3,  -0.2,0.2,  -0.3,0.5]
  g_shapesList.push(Cat);
  
  Cat = [-0.5,0.3,  -0.2,0.2,  -0.3,0.1]
  g_shapesList.push(Cat);

  //this is the outer ear
  // Cat = [-0.5,0.3,  -0.5,0.8,  -0.3,0.5];
  // g_shapesList.push(Cat);

  // this is the inner ear 
  Cat = [0.01,0.3,  -0.5,0.8,  -0.3,0.5];
  g_shapesList.push(Cat);

  Cat = [-0.5,0.3,  -0.1,-0.1,  0,-0.7];
  g_shapesList.push(Cat);

  Cat = [0,-0.7,  -0.15,-0.9,  0,-0.8];
  g_shapesList.push(Cat);

  Cat = [0,-0.7,  -0.15,-0.9,  -0.5,0.3];
  g_shapesList.push(Cat);

  Cat = [-0.6,-0.5,  -0.15,-0.9,  -0.5,0.3];
  g_shapesList.push(Cat);
  

  // right side
  Cat = [0,-0.7,  0.05,-0.1,  0.3,0.5];
  g_shapesList.push(Cat);

  // Cat = [0.5,0.3,  0.1,-0.1,  0.3,0.5];
  // g_shapesList.push(Cat);

  // outer eyes 
  Cat = [0.5,0.3,  0.2,0.2,  0.3,0.5]
  g_shapesList.push(Cat);
  
  Cat = [0.5,0.3,  0.2,0.2,  0.3,0.1]
  g_shapesList.push(Cat);
  
  // this is the eyes 
  // Cat = [0.3,0.1,  0.1,-0.1,  0.1,0.3];
  // g_shapesList.push(Cat);

  
  //outer ear
  // Cat = [0.5,0.3,  0.5,0.8,  0.3,0.5];
  // g_shapesList.push(Cat);

  //inner ear 
  Cat = [-0.01,0.3,  0.5,0.8,  0.3,0.5];
  g_shapesList.push(Cat);
  
  Cat = [0.5,0.3,  0.1,-0.1,  0,-0.7];
  g_shapesList.push(Cat);

  Cat = [0,-0.7,  0.15,-0.9,  0,-0.8];
  g_shapesList.push(Cat);

  Cat = [0,-0.7,  0.15,-0.9,  0.5,0.3];
  g_shapesList.push(Cat);

  Cat = [0.6,-0.5,  0.15,-0.9,  0.5,0.3];
  g_shapesList.push(Cat);  
  

  //Drawing 
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) 
  {
    drawTriangle(g_shapesList[i]);
  }
  g_shapesList = [];
}




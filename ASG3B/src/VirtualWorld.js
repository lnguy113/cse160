// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program ==========================================
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
    }`;


// Fragment shader program ==========================================
var FSHADER_SOURCE =`
    precision mediump float;
    uniform vec4 u_FragColor;
    varying vec2 v_UV;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    uniform sampler2D u_Sampler5;
    uniform sampler2D u_Sampler6;
    uniform sampler2D u_Sampler7;
    uniform sampler2D u_Sampler8;
    uniform int u_whichTexture;
    void main() 
    {
      // use color
      if(u_whichTexture == -2)
      {
        gl_FragColor = u_FragColor;
      }

      // use UV debug color
      else if(u_whichTexture == -1)
      {
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
      }

      // use texture 0
      else if(u_whichTexture == 0)
      {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
      }

      // use texture 1
      else if(u_whichTexture == 1)
      { 
        gl_FragColor = texture2D(u_Sampler1, v_UV);
      }

      // use texture 2
      else if(u_whichTexture == 2)
      { 
        gl_FragColor = texture2D(u_Sampler2, v_UV);
      }

      // use texture 3
      else if(u_whichTexture == 3)
      { 
        gl_FragColor = texture2D(u_Sampler3, v_UV);
      }

      // use texture 4
      else if(u_whichTexture == 4)
      { 
        gl_FragColor = texture2D(u_Sampler4, v_UV);
      }

      // use texture 5
      else if(u_whichTexture == 5)
      { 
        gl_FragColor = texture2D(u_Sampler5, v_UV);
      }

      // use texture 6
      else if(u_whichTexture == 6)
      { 
        gl_FragColor = texture2D(u_Sampler6, v_UV);
      }

      // use texture 7
      else if(u_whichTexture == 7)
      { 
        gl_FragColor = texture2D(u_Sampler7, v_UV);
      }

      // use texture 8
      else if(u_whichTexture == 8)
      { 
        gl_FragColor = texture2D(u_Sampler8, v_UV);
      }

      // user default error color 
      else
      { 
        gl_FragColor = vec4(1, .2, .2, 1);
      }
    }`;      

// Constant ==========================================
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables ==========================================
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_size;
var u_ProjectionMatrix;
var u_ModelMatrix;
var u_ViewMatrix;
var u_GlobalRotateMatrix;
var u_whichTexture;
var u_Sampler0; // for hello kitty
var u_Sampler1; // for ground 
var u_Sampler2; // for sky 
var u_Sampler3; // for melody
var u_Sampler4; // for kuromi
var u_Sampler5; // for frog
var u_Sampler6; // for coffee cup
var u_Sampler7; // hello kitty (x2)
var u_Sampler8; // cafe seating walls (wood)
var g_Camera = new Camera();


// HTML UI
let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngle=0;
var g_Animation = false;
var walls = [];
var coffee = [];

// Mouse Orbit
var mouseControl=false;
var endX = 0;
var endY = 0;
var AngleX = 0;
var AngleY = 0;

// Animation 
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Setting up Canvas ==========================================
function setupWebGL()
{
  canvas = document.getElementById('webgl'); 
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) 
  {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  // enable depth
  gl.enable(gl.DEPTH_TEST);
}

// Connecting Js to GLSL ==========================================
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

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) 
  {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_globalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) 
  {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) 
    {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) 
    {
        console.log('Failed to get u_ViewMatrix');
        return;
    }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) 
    {
        console.log('Failed to get u_ProjectionMatrix');
        return;
    }
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if(!u_whichTexture)
    {
      console.log('Failed to get the storage location of u_whichTexture');
      return false;
    }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0)
  {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1)
  {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }
  
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2)
  {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if(!u_Sampler3)
  {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if(!u_Sampler4)
  {
    console.log('Failed to get the storage location of u_Sampler4');
    return false;
  }

  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if(!u_Sampler5)
  {
    console.log('Failed to get the storage location of u_Sampler5');
    return false;
  }

  u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
  if(!u_Sampler6)
  {
    console.log('Failed to get the storage location of u_Sampler6');
    return false;
  }

  u_Sampler7 = gl.getUniformLocation(gl.program, 'u_Sampler7');
  if(!u_Sampler7)
  {
    console.log('Failed to get the storage location of u_Sampler7');
    return false;
  }

  u_Sampler8 = gl.getUniformLocation(gl.program, 'u_Sampler8');
  if(!u_Sampler8)
  {
    console.log('Failed to get the storage location of u_Sampler8');
    return false;
  }
  //set initial value for matrix identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
  
}

// Print Images ==========================================
function initTextures(gl, n) 
{
  // for cat
  var image = new Image();  
  if (!image) 
  {
     console.log('Failed to create the image object');
     return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){sendImageToTexture0(image);}
  // Tell the browser to load an image
  image.src = '../pictures/hellokitty.jpg';

  // for grass
  var image1 = new Image();  
  if (!image1) 
  {
     console.log('Failed to create the image object');
     return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function(){sendImageToTexture1(image1);}
  // Tell the browser to load an image
  image1.src = '../pictures/floor.jpg';

  // for sky
  var image2 = new Image();  
  if (!image2) 
  {
     console.log('Failed to create the image object');
     return false;
  }
  // Register the event handler to be called on loading an image
  image2.onload = function(){sendImageToTexture2(image2);}
  // Tell the browser to load an image
  image2.src = '../pictures/cafewalls2.jpg';

  // for dog
  var image3 = new Image();  
  if (!image3) 
  {
     console.log('Failed to create the image object');
     return false;
  }
  // Register the event handler to be called on loading an image
  image3.onload = function(){sendImageToTexture3(image3);}
  // Tell the browser to load an image
  image3.src = '../pictures/melody.jpg';

  // for kuromi
  var image4 = new Image();
  if (!image4) 
  {
     console.log('Failed to create the image object');
     return false;
  }
  // Register the event handler to be called on loading an image
  image4.onload = function(){sendImageToTexture4(image4);}
  // Tell the browser to load an image
  image4.src = '../pictures/kuromi.jpg';

  var image5 = new Image();
  if (!image5) 
  {
     console.log('Failed to create the image object');
     return false;
  }
  // Register the event handler to be called on loading an image
  image5.onload = function(){sendImageToTexture5(image5);}
  // Tell the browser to load an image
  image5.src = '../pictures/frog.jpg';

  var image6 = new Image();
  if (!image6) 
  {
     console.log('Failed to create the image object');
     return false;
  }
  // Register the event handler to be called on loading an image
  image6.onload = function(){sendImageToTexture6(image6);}
  // Tell the browser to load an image
  image6.src = '../pictures/coffee.jpg';

  var image7 = new Image();
  if (!image7) 
  {
     console.log('Failed to create the image object');
     return false;
  }
  // Register the event handler to be called on loading an image
  image7.onload = function(){sendImageToTexture7(image7);}
  // Tell the browser to load an image
  image7.src = '../pictures/hellokitty2.jpg';

  var image8 = new Image();
  if (!image8) 
  {
     console.log('Failed to create the image object');
     return false;
  }
  // Register the event handler to be called on loading an image
  image8.onload = function(){sendImageToTexture8(image8);}
  // Tell the browser to load an image
  image8.src = '../pictures/wood.jpg';

  // Add more texture loading here // DEBUG:
  return true;

}

// Getting Textured Image ==========================================
// for sampler0
function sendImageToTexture0(image)
{
  var texture = gl.createTexture();
  if(!texture)
  {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flips image y axis
  // Enable texture 0

  gl.activeTexture(gl.TEXTURE0);
  // Bind texture 0

  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set texture parameters

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
  console.log('finished loadTexture');
}

// for sampler1
function sendImageToTexture1(image)
{
  var texture = gl.createTexture();
  if(!texture)
  {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flips image y axis
  // Enable texture 0

  gl.activeTexture(gl.TEXTURE1);
  // Bind texture 0

  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set texture parameters

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);
  console.log('finished loadTexture');
}

// for sampler2
function sendImageToTexture2(image)
{
  var texture = gl.createTexture();
  if(!texture)
  {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flips image y axis
  // Enable texture 0

  gl.activeTexture(gl.TEXTURE2);
  // Bind texture 0

  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set texture parameters

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler2, 2);
  console.log('finished loadTexture');
}

function sendImageToTexture3(image)
{
  var texture = gl.createTexture();
  if(!texture)
  {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flips image y axis
  // Enable texture 0

  gl.activeTexture(gl.TEXTURE3);
  // Bind texture 0

  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set texture parameters

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler3, 3);
  console.log('finished loadTexture');
}

function sendImageToTexture4(image)
{
  var texture = gl.createTexture();
  if(!texture)
  {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flips image y axis
  // Enable texture 0

  gl.activeTexture(gl.TEXTURE4);
  // Bind texture 0

  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set texture parameters

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler4, 4);
  console.log('finished loadTexture');
}

function sendImageToTexture5(image)
{
  var texture = gl.createTexture();
  if(!texture)
  {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flips image y axis
  // Enable texture 0

  gl.activeTexture(gl.TEXTURE5);
  // Bind texture 0

  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set texture parameters

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler5, 5);
  console.log('finished loadTexture');
}

function sendImageToTexture6(image)
{
  var texture = gl.createTexture();
  if(!texture)
  {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flips image y axis
  // Enable texture 0

  gl.activeTexture(gl.TEXTURE6);
  // Bind texture 0

  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set texture parameters

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler6, 6);
  console.log('finished loadTexture');
}

function sendImageToTexture7(image)
{
  var texture = gl.createTexture();
  if(!texture)
  {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flips image y axis
  // Enable texture 0

  gl.activeTexture(gl.TEXTURE7);
  // Bind texture 0

  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set texture parameters

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler7, 7);
  console.log('finished loadTexture');
}

function sendImageToTexture8(image)
{
  var texture = gl.createTexture();
  if(!texture)
  {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flips image y axis
  // Enable texture 0

  gl.activeTexture(gl.TEXTURE8);
  // Bind texture 0

  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set texture parameters

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler8, 8);
  console.log('finished loadTexture');
}
// Buttons Functions ==========================================
function addActionsForHtmlUI()
{
    // document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation = true};
    // document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation = false};

    // document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation = true};
    // document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation = false};

    // //Slider events
    // document.getElementById('magentaSlide').addEventListener('mousemove', function(){g_magentaAngle = this.value; renderAllShapes(); });
    // document.getElementById('yellowSlide').addEventListener('mousemove', function(){g_yellowAngle = this.value; renderAllShapes(); });

    // document.getElementById('legSlider').addEventListener('mousemove', function() { leg_animation = this.value; renderAllShapes();});
    // document.getElementById('tailSlider').addEventListener('mousemove', function() { tail_animation = this.value; renderAllShapes();});
    // document.getElementById('tailmove1').addEventListener('mousemove', function() { tail_animation1 = this.value; renderAllShapes();});
    // document.getElementById('tailmove2').addEventListener('mousemove', function() { tail_animation2 = this.value; renderAllShapes();});
    // document.getElementById('tailmove3').addEventListener('mousemove', function() { tail_animation3 = this.value; renderAllShapes();});

    // document.getElementById('animateOn').onclick = function() {g_Animation = true;};
    // document.getElementById('animateOff').onclick = function() {g_Animation = false;};
    //Size Slider event
    //document.getElementById('angleSlide').addEventListener('mousemove', function(){g_globalAngle = this.value; renderAllShapes(); });
}

// Main ==========================================
function main() 
{
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  mouseOrbit();
  
  initTextures(gl, 0);
  document.onkeydown = keydown;
  // canvas.onmousedown = click;
  // canvas.onmousemove = function(ev){ if(ev.buttons == 1){click(ev)}};

  // Specify the color for clearing <canvas>
  // gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearColor(0.8, 0.89, 1.0, 1.0);
  requestAnimationFrame(tick);
  drawMaps();
}

// Tick ==========================================
function tick()
{
    g_seconds = performance.now()/1000.0-g_startTime;
  
    //updateAnimationAngles();

    // Draw everything 
    renderAllShapes();

    // Tell browser to reanimate
    requestAnimationFrame(tick);
  }

var g_shapesList = [];

// Converting the Coordinates ==========================================
function convertCoordinatesEventToGL(ev)
{
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x,y]);
}


// Rendering all the Shapes ==========================================
function renderAllShapes()
{
    var startTime = performance.now();

    var projMat = new Matrix4();
    projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    var viewMat = g_Camera.viewMat;
    // viewMat.setLookAt(0,0,-2,  0,0,0,  0,1,0);//(eye, at, up)
    viewMat.setLookAt(
      g_Camera.eye.elements[0], g_Camera.eye.elements[1],  g_Camera.eye.elements[2],
      g_Camera.at.elements[0],  g_Camera.at.elements[1],   g_Camera.at.elements[2],
      g_Camera.up.elements[0],  g_Camera.up.elements[1],   g_Camera.up.elements[2]); // (eye, at, up)
      
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4();
  
    // var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    globalRotMat.rotate(AngleY, 1, 0, 0).rotate(-AngleX, 0, 1, 0);
    globalRotMat.rotate(g_globalAngle, 0, 1, 0); // Example: Slider-controlled global angle
    
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Generating Shapes ==========================================
    // MY CHARACTERS 
    // // hello kitty
    // var hellokitty = new Cube();
    // hellokitty.textureNumber = 0;
    // hellokitty.color = [0.0, 0.0, 0.0, 1.0];
    // hellokitty.matrix.translate(-0.72, -0.74, 0.5);
    // hellokitty.matrix.rotate(0, 1, 0, 0);
    // hellokitty.matrix.scale(0.5, 0.5, 0.5);
    // hellokitty.render();

    // // melody
    // var melody = new Cube();
    // melody.textureNumber = 3;
    // melody.color = [0.0, 0.0, 0.0, 1.0];
    // melody.matrix.translate(0.32, -0.74, 0.5);
    // melody.matrix.rotate(0, 1, 0, 0);
    // melody.matrix.scale(0.5, 0.5, 0.5);
    // melody.render();

    // // the kuromi
    // var kuromi = new Cube();
    // kuromi.color = [1.0, 0.0, 0.0, 1.0]; 
    // kuromi.textureNumber = 4;  
    // kuromi.matrix.scale(0.5, 0.5, 0.5);
    // kuromi.matrix.rotate(0, 1, 0, 0);
    // kuromi.matrix.translate(0.32, -0.3, 0.5);
    // kuromi.render();

    // // the frog
    // var frog = new Cube();
    // frog.color = [1.0, 0.0, 0.0, 1.0]; 
    // frog.textureNumber = 5;  
    // frog.matrix.scale(0.5, 0.5, 0.5);
    // frog.matrix.rotate(0, 1, 0, 0);
    // frog.matrix.translate(-0.6, -0.3, 0.5);
    // frog.render();

    // // the coffe cup 
    // var coffee = new Cube();
    // coffee.color = [1.0, 0.0, 0.0, 1.0]; 
    // coffee.textureNumber = 6;  
    // coffee.matrix.scale(0.5, 0.5, 0.5);
    // coffee.matrix.rotate(0, 1, 0, 0);
    // coffee.matrix.translate(-1.5, -0.3, 0.5);
    // coffee.render();

    // // solid color
    // var block = new Cube();
    // block.textureNumber = -2;
    // block.color = [0.76, 0.96, 1.0, 1.0];
    // block.matrix.translate(-0.2, -0.74, 0.5);
    // block.matrix.rotate(0, 1, 0, 0);
    // block.matrix.scale(0.5, 0.5, 0.5);
    // block.render();

    // the ground
    var ground = new Cube();
    ground.color = [1.0, 0.0, 0.0, 1.0]; 
    ground.textureNumber = 1;
    ground.matrix.translate(0, -.75, 0.0);  
    ground.matrix.scale(32, 0, 32); 
    ground.matrix.translate(-.5, 0, -.5);
    ground.render();

    // the sky
    var sky = new Cube();
    sky.color = [1.0, 0.0, 0.0, 1.0]; 
    sky.textureNumber = 2;  
    sky.matrix.scale(50, 50, 50); 
    sky.matrix.translate(-.5, -.5, -.5);
    sky.render();


    // the walls
    walls.forEach(wall =>wall.render());

    // for the coffee blocks 
    coffee.forEach(coffee =>coffee.render());

    // Calculate time taken to render scene and FPS
    var duration = performance.now() - startTime;
    // Prevent division by zero and handle case where duration might be zero
    var fps = (duration > 0) ? 1000 / duration : 0;  
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(fps) , "numdot");
}

// Updating Animations ==========================================
function updateAnimationAngles()
{
  if(g_Animation)
    {
        leg_animation = 10*Math.sin(g_seconds);
        tail_animation = 40*Math.sin(g_seconds);
    } 
 }


// Sending the Text to the HTML ==========================================
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


// Map Creation ==========================================
var g_map = 
[
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,6,6,6,6,6,6,6,0,0,0,0,6,6,6,6,6,6,6,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,0,0,2,0,4,0,0,0,0,0,0,0,0,5,0,3,0,0,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,0,0,3,0,5,0,0,0,0,0,0,0,0,4,0,2,0,0,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,0,0,2,0,4,0,0,0,0,0,0,0,0,3,0,5,0,0,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,0,0,5,0,3,0,0,0,0,0,0,0,0,4,0,2,0,0,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,6,6,6,6,6,6,6,0,0,0,0,6,6,6,6,6,6,6,6,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

// Adding the walls ==========================================
function drawMaps()
{
  for (let x = 0; x < g_map.length; x++) 
  {
    for (let z = 0; z < g_map[x].length; z++) 
    {
      //creating the walls surrounding the cafe
      if (g_map[x][z] == 1) 
        { 
            var wall = new Cube();
            wall.textureNumber = -2; 
            wall.matrix.translate(x - 15.5, -1, z - 15.5);
            walls.push(wall);
        }
          
        //adding the characters into each section
        // kuromi
        if (g_map[x][z] == 2) 
        { 
            var wall = new Cube();
            wall.textureNumber = 4; 
            wall.matrix.translate(x - 15.5, -0.8, z - 15.5);
            walls.push(wall);
        }

        // melody
        if (g_map[x][z] == 3) 
        { 
            var wall = new Cube();
            wall.textureNumber = 3; 
            wall.matrix.translate(x - 15.5, -0.8, z - 15.5);
            walls.push(wall);
        }

        // frog
        if (g_map[x][z] == 4) 
        { 
            var wall = new Cube();
            wall.textureNumber = 5; 
            wall.matrix.translate(x - 15.5, -0.8, z - 15.5);
            walls.push(wall);
        }

        // hello kitty
        if (g_map[x][z] == 5) 
        { 
            var wall = new Cube();
            wall.textureNumber = 7; 
            wall.matrix.translate(x - 15.5, -0.8, z - 15.5);
            walls.push(wall);
        }

        // cafe wall (wood)
        if (g_map[x][z] == 6) 
        { 
            var wall = new Cube();
            wall.textureNumber = 8; 
            wall.matrix.translate(x - 15.5, -0.8, z - 15.5);
            walls.push(wall);
        }
    }
  }
}

//Adding Blocks ==========================================
function DroppingCoffeeBlocks(camera) 
{
  let F = camera.direction();
  let X = camera.eye.elements[0] + F.elements[0];
  let Z = camera.eye.elements[2] + F.elements[2];

  let x = Math.floor(X + 15.5);
  let z = Math.floor(Z + 15.5);
  if (x >= -10 && x < g_map.length && z >= -15 && z < g_map[x].length) 
  { 
    // Check if position is empty
    if (g_map[x][z] === 0) 
      { 
          // set block to 7(coffee block)
          g_map[x][z] = 7; 
          let block = new Cube();

          // Choose the texture number block
          block.textureNumber = 6; 
          block.x = x;
          block.z = z;
          //block.matrix.translate(x - 15.5, 0, z - 15.5);
          block.matrix.scale(0.2, 0.2, 0.2);
          coffee.push(block); 
      }
  }
  renderAllShapes();
}

// Deleting the blocks 
function RemovingCoffeeBlocks(camera) 
{
  let F = camera.direction();
  let X = camera.eye.elements[0] + F.elements[0];
  let Z = camera.eye.elements[2] + F.elements[2];

  let x = Math.floor(X + 15.5);
  let z = Math.floor(Z + 15.5);
  if (x >= -10 && x < g_map.length && z >= -15 && z < g_map[x].length) 
  { 
    // Check if position is empty
    if (g_map[x][z] === 7) 
      { 
          // set block to 7(coffee block)
          g_map[x][z] = 0; 
          for (coffees in coffee)
          {
            if(coffees.x == this.x && coffees.z == this.z)
            {
              coffee = coffee.filter(coffee => !(coffee.x === x && coffee.z === z));
            }
            
          }
      }
  }
  renderAllShapes();
}
// Moving Key functions ==========================================
function keydown(ev)
{
  if(ev.keyCode == 87)
  //W
  { 
    g_Camera.forwards();
    //console.log("forward");
  } 

  //S
  else if(ev.keyCode == 83)
  { 
    g_Camera.backwards();
  } 

  //A
  else if(ev.keyCode == 65)
  { 
    g_Camera.left();
  } 
  
  //D
  else if(ev.keyCode == 68)
  {
    g_Camera.right();
  }

  // Q
  if(ev.keyCode == 81) 
  { 
    g_Camera.panLeft();
  } 

  // E
  else if(ev.keyCode == 69) 
  { 
      g_Camera.panRight();
  }

  // C (dropping coffee blocks)
  else if(ev.keyCode == 67) 
  { 
      DroppingCoffeeBlocks(g_Camera);
  }

  // V (deleting coffee blocks)
  else if(ev.keyCode == 86) 
  { 
      RemovingCoffeeBlocks(g_Camera);
  }


  renderAllShapes();
  console.log(ev.keyCode);
}



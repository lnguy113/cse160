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
var u_Sampler0; 
var u_Sampler1; // for ground 
var u_Sampler2; // for sky 

// HTML UI
let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngle=0;

var leg_animation = 0;
var tail_animation = 0;
var tail_animation1 = 0;
var tail_animation2 = 0;
var tail_animation3 = 0;
var g_paw1 = 0; 
var g_paw2 = 0; 
var g_Animation = false;

// Mouse Orbit
var mouseControl=true;
var AngleX = 0;
var AngleY = 0;
var mouseDown = false;
var MouseX = null;
var MouseY = null;
var ALTanimation = false;  

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
  image.src = 'cat.jpg';

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
  image1.src = 'ground.jpg';

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
  image2.src = 'sky.jpg';

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
    document.getElementById('angleSlide').addEventListener('mousemove', function(){g_globalAngle = this.value; renderAllShapes(); });
}

// Main ==========================================
function main() 
{
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  mouseOrbit();
  initTextures(gl, 0);
  // canvas.onmousedown = click;
  // canvas.onmousemove = function(ev){ if(ev.buttons == 1){click(ev)}};

  // Specify the color for clearing <canvas>
  // gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearColor(0.8, 0.89, 1.0, 1.0);
  requestAnimationFrame(tick);
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

// The Click Function ==========================================
// function click(ev) 
// {
//     let [x,y] = convertCoordinatesEventToGL(ev);
//     let point;
//     //let point = new Point();
//     if(g_selectedType == POINT)
//     {
//       point = new Point();
//     } 
//     else if (g_selectedType == TRIANGLE)
//     {
//       point = new Triangle();
//     }
//     else if (g_selectedType == DIAMOND)
//     {
//       point = new Diamond();
//     }
//     else
//     {
//       point = new Circle();
//       point.segments = g_selectedSeg;
//     }

//     point.position = [x,y];
//     point.color = g_selectedColor.slice();
//     point.size = g_selectedSize;
//     g_shapesList.push(point);

//     renderAllShapes();
// }

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

// Mouse Control ==========================================
function mouseOrbit()
{
    canvas.onmousedown = function(event) 
    {
        if (event.shiftKey) 
        {
          ALTanimation = !ALTanimation;  
          renderAllShapes();  
          return; 
        }
          if (!mouseControl) return;
          mouseDown = true;
          MouseX = event.clientX;
          MouseY = event.clientY;
      };
    
      document.onmouseup = function(event) 
      {
          mouseDown = false;
      };
    
      canvas.onmousemove = function(event) 
      {
          if (!mouseDown) return;
          var X = event.clientX;
          var Y = event.clientY;
    
          var tempX = X - MouseX;
          var tempY = Y - MouseY;
    
          AngleX += tempX / 5; 
          AngleY -= tempY / 5; 
    
          MouseX = X;
          MouseY = Y;
    
          renderAllShapes(); 
      };
}

// Rendering all the Shapes ==========================================
function renderAllShapes()
{
    var startTime = performance.now();

    var projMat = new Matrix4();
    projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    var viewMat = new Matrix4();
    viewMat.setLookAt(0,0,-2,  0,0,0,  0,1,0);//(eye, at, up)

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4();
  
    // var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    globalRotMat.rotate(AngleY, 1, 0, 0).rotate(-AngleX, 0, 1, 0);
    globalRotMat.rotate(g_globalAngle, 0, 1, 0); // Example: Slider-controlled global angle
    
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Generating Shapes ==========================================
    // the cat
    var cat = new Cube();
    cat.textureNumber = 0;
    cat.color = [0.0, 0.0, 0.0, 1.0];
    cat.matrix.translate(-0.2, -0.74, 0.5);
    cat.matrix.rotate(0, 1, 0, 0);
    cat.matrix.scale(0.5, 0.5, 0.5);
    cat.render();

    // solid color
    var block = new Cube();
    block.textureNumber = -2;
    block.color = [0.76, 0.96, 1.0, 1.0];
    block.matrix.translate(0.32, -0.74, 0.5);
    block.matrix.rotate(0, 1, 0, 0);
    block.matrix.scale(0.5, 0.5, 0.5);
    block.render();

    // the ground
    var ground = new Cube();
    ground.color = [1.0, 0.0, 0.0, 1.0]; 
    ground.textureNumber = 1;
    ground.matrix.translate(0, -.75, 0.0);  
    ground.matrix.scale(10, 0, 10); 
    ground.matrix.translate(-.5, 0, -.5);
    ground.render();

    // the sky 
    var sky = new Cube();
    sky.color = [1.0, 0.0, 0.0, 1.0]; 
    sky.textureNumber = 2;  
    sky.matrix.scale(50, 50, 50); 
    sky.matrix.translate(-.5, -.5, -.5);
    sky.render();

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





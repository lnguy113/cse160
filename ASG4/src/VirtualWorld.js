// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program ==========================================
var VSHADER_SOURCE =`
   precision mediump float;
   attribute vec4 a_Position;
   attribute vec2 a_UV;
   attribute vec3 a_Normal;
   varying vec2 v_UV;
   varying vec3 v_Normal;
   varying vec4 v_VertPos;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_NormalMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   uniform mat4 u_ViewMatrix;
   uniform mat4 u_ProjectionMatrix;
   void main() {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
      v_Normal = a_Normal;//normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
      v_VertPos = u_ModelMatrix * a_Position;
   }`


// Fragment shader program ==========================================
var FSHADER_SOURCE =`
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    uniform vec3 u_lightPos;
    uniform vec3 u_Color;
    uniform vec3 u_cameraPos;
    varying vec4 v_VertPos;
    uniform bool u_lightOn;
    uniform bool u_visualize;
    uniform bool u_spotlightOn;
    uniform vec3 u_spotlightDir;

    void main()
    {
      if(u_whichTexture == -3)
      {
         gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); // Use normal
      }
      else if(u_whichTexture == -2)
      {
         gl_FragColor = u_FragColor;                  // Use color
      }
      else if (u_whichTexture == -1)
      {
         gl_FragColor = vec4(v_UV, 1.0, 1.0);         // Use UV debug color
      }
      else if(u_whichTexture == 0)
      {
         gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
      }
      else if(u_whichTexture == 1)
      {
         gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use texture1
      }
      else
      {
         gl_FragColor = vec4(1,.2,.2,1);              // Error, Red
      }

      vec3 lightVector = u_lightPos - vec3(v_VertPos);
      float distance = length(lightVector);

      if(u_visualize)
      {
        // Red/Green Distance Visualization
        if(distance < 1.0)
        {
          gl_FragColor = vec4(1, 0, 0, 1);
        }
        else if (distance < 2.0)
        {
          gl_FragColor = vec4(0, 1, 0, 1);
        }
      }

      // Adjusted Light Falloff
      float attenuation = 1.0 / (0.1 + 0.2 * distance + 0.3 * distance);
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N, L), 0.0);

      // Reflection
      vec3 R = reflect(-L, N);
      vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
      float specular = pow(max(dot(E, R), 0.0), 10.0) * 0.5;

      vec3 baseColor = vec3(gl_FragColor);

      if(u_lightOn)
      {
       
        vec3 diffuse = vec3(baseColor)*u_Color * nDotL * 0.7 * attenuation;
        vec3 ambient = vec3(baseColor)*u_Color * 0.3;
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);

      }
      else if(u_spotlightOn)
      {
        vec3 diffuse = vec3(baseColor)*u_Color * nDotL * 0.7 * attenuation;
        vec3 ambient = vec3(baseColor) * 0.3 * u_Color;
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
        float spotEffect = dot(lightVector, normalize(u_spotlightDir));

        // Adjust the cutoff 
        if (spotEffect > 0.95) 
        { 
          gl_FragColor.rgb *= spotEffect;
        }
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
let a_Normal;
let u_FragColor;
let u_lightPos;
let u_lightOn;
let u_Color;
let u_size;
let u_cameraPos;
var u_ProjectionMatrix;
var u_ModelMatrix;
var u_ViewMatrix;
var u_GlobalRotateMatrix;
var u_whichTexture;
var u_Sampler0; 
var u_Sampler1; // for ground 
var g_Camera = new Camera();
let g_normalOn = false;
let u_visualize;
let g_visualize = false;;
let g_lightPos = [0,1,-2];
let g_lightOn = true;
let g_sliderControl = true;
let u_spotlightDir;
let u_spotlightOn;
let g_spotlightOn = false;
let g_spotlightDir = [0,-1,0];

// HTML UI
let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngle=0;
var g_Animation = false;
var walls = [];
var coffee = [];

// Yellow & Mag
var g_yellowAngle =0;
var g_magentaAngle = 0;
var g_magentaAnimation = false;
var g_yellowAnimation = false;

// Mouse Orbit
var mouseControl=false;
var endX = 0;
var endY = 0;
var AngleX = 0;
var AngleY = 0;

// Animation 
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;
let leg_animation = 0;
let tail_animation = 0;
let tail_animation1 = 0;
let tail_animation2 = 0;
let tail_animation3 = 0;

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

  // // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) 
  {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) 
  {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_spotlightDir
  u_spotlightDir = gl.getUniformLocation(gl.program, 'u_spotlightDir');
  if (!u_spotlightDir) 
  {
    console.log('Failed to get the storage location of u_spotlightDir');
    return;
  }

  // Get the storage location of u_spotlightOn
  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if (!u_spotlightOn) 
  {
    console.log('Failed to get the storage location of u_spotlightOn');
    return;
  }

  // Get the storage location of u_FragColor
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) 
  {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_Color
  u_Color = gl.getUniformLocation(gl.program, 'u_Color');
  if (!u_Color) 
  {
    console.log('Failed to get the storage location of u_Color');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) 
  {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_visualize
  u_visualize = gl.getUniformLocation(gl.program, 'u_visualize');
  if (!u_visualize) 
  {
    console.log('Failed to get the storage location of u_visualize');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) 
  {
    console.log('Failed to get the storage location of u_lightOn');
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

  //set initial value for matrix identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
  
}

function updateLightColor() 
{
  const r = parseFloat(document.getElementById('lightColorR').value);
  const g = parseFloat(document.getElementById('lightColorG').value);
  const b = parseFloat(document.getElementById('lightColorB').value);
  gl.uniform3f(u_Color, r, g, b);
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

// Buttons Functions ==========================================
function addActionsForHtmlUI()
{
    document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation = true};
    document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation = false};

    document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation = true};
    document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation = false};

    document.getElementById('normalOn').onclick = function() { g_normalOn = true};
    document.getElementById('normalOff').onclick = function() { g_normalOn = false};

    document.getElementById('visualizeOn').onclick = function() { g_visualize = true};
    document.getElementById('visualizeOff').onclick = function() { g_visualize = false};

    document.getElementById('lightOn').onclick = function() { g_lightOn = true};
    document.getElementById('lightOff').onclick = function() { g_lightOn = false};

    document.getElementById('spotlightOn').onclick = function() { g_spotlightOn = true};
    document.getElementById('spotlightOff').onclick = function() { g_spotlightOn = false};

    document.getElementById('sliderControlOn').onclick = function() { g_sliderControl = false};
    document.getElementById('sliderControlOff').onclick = function() { g_sliderControl = true};


    document.getElementById('lightSlideX').addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightPos[0] = this.value/100;renderAllShapes();}});
    document.getElementById('lightSlideY').addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightPos[1] = this.value/100;renderAllShapes();}});
    document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightPos[2] = this.value/100;renderAllShapes();}});

    document.getElementById('animateOn').onclick = function() {g_Animation = true;};
    document.getElementById('animateOff').onclick = function() {g_Animation = false;};

    //Size Slider event
    document.getElementById('cameraAngle').addEventListener('mousemove', function(){g_globalAngle = this.value; renderAllShapes(); });
}

// Main ==========================================
function main() 
{
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  //mouseOrbit();
  
  initTextures(gl, 0);
  document.onkeydown = keydown;
  // canvas.onmousedown = click;
  canvas.onmousemove = function(ev){ if(ev.buttons == 1){cancelIdleCallback(ev)}};

  // Specify the color for clearing <canvas>
  // gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearColor(0.8, 0.89, 1.0, 1.0);
  requestAnimationFrame(tick);
}

// Tick ==========================================
function tick()
{
    g_seconds = performance.now()/1000.0-g_startTime;
  
    updateAnimationAngles();

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
    var viewMat = new Matrix4();
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
    
    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_cameraPos, g_Camera.eye.elements[0], g_Camera.eye.elements[1], g_Camera.eye.elements[2]);
    gl.uniform1f(u_visualize,g_visualize);
    gl.uniform1f(u_lightOn,g_lightOn);
    gl.uniform1f(u_spotlightOn,g_spotlightOn);
    gl.uniform3f(u_spotlightDir,g_spotlightDir[0], g_spotlightDir[1], g_spotlightDir[2]);
    updateLightColor();

    // Generating Shapes ==========================================
    // Draw body cube
    var red = new Cube();
    red.color = [1.0, 0.0, 0.0, 1.0];
    if (g_normalOn) red.textureNumber = -3;
    red.matrix.translate(1.25, .25, -1.0);
    red.matrix.rotate(-5, 1, 0, 0);
    red.matrix.scale(0.5, 0.3, .5);
    red.render();

    var yellow = new Cube();
    yellow.color = [1, 1, 0, 1];
    if (g_normalOn) yellow.textureNumber = -3;
    yellow.matrix.setTranslate(1.5, .55, -1.0);
    yellow.matrix.rotate(-5, 1, 0, 0);
    yellow.matrix.rotate(-g_yellowAngle, 0, 0, 1);
    var jointACoordinate = new Matrix4(yellow.matrix);
    yellow.matrix.scale(0.25, .7, .5);
    yellow.matrix.translate(-0.5, 0, 0);
    yellow.render();

    var magenta = new Cube();
    magenta.color = [1, 0, 1, 1];
    if (g_normalOn) magenta.textureNumber = -3;
    magenta.matrix = jointACoordinate;
    magenta.matrix.translate(0, .65, 0);
    magenta.matrix.rotate(g_magentaAngle, 0, 0, 1);
    magenta.matrix.scale(0.3, 0.3, 0.3);
    magenta.matrix.translate(-0.5, 0, -0.001);
    magenta.render();

    // adding the sphere shape
    var sphere = new Sphere();
    sphere.color = [1.0, 1.0, 1.0, 1.0];
    sphere.textureNumber = -2 ;
    if (g_normalOn) sphere.textureNumber = -3;
    sphere.matrix.translate(-2, .6, -2);
    sphere.matrix.scale(1, 1, 1);
    sphere.render();
      
    // the ground
    var ground = new Cube();
    ground.color = [126/255, 126/255, 126/255, 1.0]; 
    ground.textureNumber = 1;
    ground.matrix.translate(0, -0.5, 0.0);  
    ground.matrix.scale(10, 0, 10); 
    ground.matrix.translate(-.5, -.5, -.5);
    ground.render();

    // the sky
    var sky = new Cube();
    sky.color = [126/255, 126/255, 126/255, 1.0]; 
    sky.textureNumber = -2;  
    if (g_normalOn) sky.textureNumber = -3;
    sky.matrix.scale(-10, -10, -10); 
    sky.matrix.translate(-.5, -0.5, -.5);
    sky.render();

    var light = new Cube();
    light.color = [2, 2, 0, 1];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-.1, -.1, -.1);
    light.matrix.translate(-.5, -.5, -.5);
    light.render();

    createCat();

    // Calculate time taken to render scene and FPS
    var duration = performance.now() - startTime;
    // Prevent division by zero and handle case where duration might be zero
    var fps = (duration > 0) ? 1000 / duration : 0;  
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(fps) , "numdot");
}

// Updating Animations ==========================================
function updateAnimationAngles()
{
  if(g_yellowAnimation)
    {
      g_yellowAngle = (45*Math.sin(g_seconds));
    }
  if(g_magentaAnimation)
    {
      g_magentaAngle = (45*Math.sin(g_seconds));
    }
  if(g_Animation)
    {
        leg_animation = 10*Math.sin(g_seconds);
        tail_animation = 40*Math.sin(g_seconds);
    } 
  if(g_sliderControl)
  {
    g_lightPos[0] = Math.cos(g_seconds);
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


  renderAllShapes();
  console.log(ev.keyCode);
}

function createCat()
{
  // Colors ==========================================
  fur = [1.0, 0.6, 0.2, 1.0];
  headfur = [1.0, 0.69, 0.4, 1.0];
  mittins = [1.0, 1.0, 1.0, 1.0];
  snout = [1.0, 0.8, 0.89, 1.0];
  eyeballs = [0, 0, 0, 1.0];

  // Body ==========================================
  var body = new Cube();
  body.color = [1.0, 0.6, 0.2, 1.0];
  body.matrix.setTranslate(-0.3, 0.0, 0.0);
  body.matrix.rotate(0, 1, 0, 0);
  body.matrix.scale(0.5, .3, 0.5);
  body.render();

  // Head ==========================================
  var head = new Cube();
  head.color = headfur;
  head.matrix.setTranslate(-0.5, 0.2, 0.1);
  head.matrix.rotate(0, 1, 0, 0);
  head.matrix.scale(0.3, 0.3, 0.3);
  head.render();

  // the nose 
  var nose = new Cube();
  nose.color = snout;
  nose.matrix.setTranslate(-0.55, 0.3, 0.23);
  nose.matrix.rotate(0, 1, 0, 0);
  nose.matrix.scale(0.05, 0.05, 0.05);
  nose.render();

  // the eyes 
  var lefteye = new Cube();
  lefteye.color = eyeballs;
  lefteye.matrix.setTranslate(-0.52, 0.35, 0.17);
  lefteye.matrix.rotate(0, 1, 0, 0);
  lefteye.matrix.scale(0.03, 0.03, 0.03);
  lefteye.render();

  var righteye = new Cube();
  righteye.color = eyeballs;
  righteye.matrix.setTranslate(-0.52, 0.35, 0.31);
  righteye.matrix.rotate(0, 1, 0, 0);
  righteye.matrix.scale(0.03, 0.03, 0.03);
  righteye.render();


  // // Ears ==========================================
  var leftear = new TriangularPrism();
  leftear.color = headfur;
  leftear.matrix.translate(-0.32, 0.5, 0.4);
  leftear.matrix.rotate(90, 0, 1, 0);
  leftear.matrix.scale(0.15, 0.3, 0.15);
  leftear.render();

  var leftearP = new TriangularPrism();
  leftearP.color = snout;
  leftearP.matrix.translate(-0.33, 0.5, 0.38);
  leftearP.matrix.rotate(90, 0, 1, 0);
  leftearP.matrix.scale(0.1, 0.25, 0.1);
  leftearP.render();

  var rightear = new TriangularPrism();
  rightear.color = headfur;
  rightear.matrix.translate(-0.32, 0.5, 0.25);
  rightear.matrix.rotate(90, 0, 1, 0);
  rightear.matrix.scale(0.15, 0.3, 0.15);
  rightear.render();

  var rightearP = new TriangularPrism();
  rightearP.color = snout;
  rightearP.matrix.translate(-0.33, 0.5, 0.22);
  rightearP.matrix.rotate(90, 0, 1, 0);
  rightearP.matrix.scale(0.1, 0.25, 0.1);
  rightearP.render();


  // Legs ==========================================
  // front right
  var frontright = new Cube();
  frontright.color = fur;
  frontright.matrix.setTranslate(-0.25, -0.15, 0.36);
  //frontright.matrix.rotate(0, 1, 0, 0);
  frontright.matrix.rotate(-leg_animation, 0, 0, 1);
  var frontrightPAW = new Matrix4(frontright.matrix);
  frontright.matrix.scale(0.1, 0.3, 0.1);
  frontright.matrix.translate(-0.3, -0.3, 0.4);
  frontright.render();
  
  // front right paw
  var frontrightpaw = new Cube();
  frontrightpaw.color = mittins;
  frontrightpaw.matrix = frontrightPAW;
  frontrightpaw.matrix.translate(-0.03, -0.1, 0.05);
  frontrightpaw.matrix.rotate(0, 1, 0, 0);
  frontrightpaw.matrix.scale(0.13, 0.1, 0.13);
  frontrightpaw.matrix.translate(-0.18, -0.3, -0.1);
  frontrightpaw.render();

  // back left 
  var backleft = new Cube();
  backleft.color = fur;
  backleft.matrix.setTranslate(0.06, -0.15, 0.0);
  //backleft.matrix.rotate(0, 1, 0, 0);
  backleft.matrix.rotate(-leg_animation,0,0,1);
  var backleftPAW = new Matrix4(backleft.matrix);
  backleft.matrix.scale(0.1, 0.3, 0.1);
  backleft.matrix.translate(0.1, -0.3, 0.0);
  backleft.render();

  // back left paw
  var backleftpaw = new Cube();
  backleftpaw.color = mittins;
  backleftpaw.matrix = backleftPAW;
  backleftpaw.matrix.translate(-0.03, -0.1, 0.03);
  backleftpaw.matrix.rotate(0, 1, 0, 0);
  backleftpaw.matrix.scale(0.13, 0.1, 0.13);
  backleftpaw.matrix.translate(0.1, -0.3, -0.3);
  backleftpaw.render();

  // back right 
  var backright = new Cube();
  backright.color = fur;
  backright.matrix.setTranslate(0.06, -0.15, 0.36);
  //backright.matrix.rotate(0, 1, 0, 0);
  backright.matrix.rotate(leg_animation,0,0,1);
  var backrightPAW = new Matrix4(backright.matrix);
  backright.matrix.scale(0.1, 0.3, 0.1);
  backright.matrix.translate(0.1, -0.3, 0.4);
  backright.render();

  // back right paw
  var backrightpaw = new Cube();
  backrightpaw.color = mittins;
  backrightpaw.matrix = backrightPAW;
  backrightpaw.matrix.translate(-0.03, -0.1, 0.03);
  backrightpaw.matrix.rotate(0, 1, 0, 0);
  backrightpaw.matrix.scale(0.13, 0.1, 0.13);
  backrightpaw.matrix.translate(0.1, -0.3, 0.0);
  backrightpaw.render();

  // front left 
  var frontleft = new Cube();
  frontleft.color = fur;
  frontleft.matrix.setTranslate(-0.25, -0.15, 0.0);
  //frontleft.matrix.rotate(0, 1, 0, 0);
  frontleft.matrix.rotate(leg_animation, 0, 0, 1);
  var frontleftPAW = new Matrix4(frontleft.matrix);
  frontleft.matrix.scale(0.1, 0.3, 0.1);
  frontleft.matrix.translate(-0.3, -0.3, 0.0);
  frontleft.render();

  // front left paw
  var frontleftpaw = new Cube();
  frontleftpaw.color = mittins;
  frontleftpaw.matrix = frontleftPAW;
  frontleftpaw.matrix.translate(-0.03, -0.07, 0.05);
  frontleftpaw.matrix.rotate(180, 1, 0, 0);
  frontleftpaw.matrix.scale(0.13, 0.1, 0.13);
  frontleftpaw.matrix.translate(-0.18, -0.3, -0.4);
  frontleftpaw.render();

  // Tail ==========================================
  var tail = new Cube();
  tail.color = fur;
  tail.matrix.setTranslate(0.16, 0.2, 0.22);
  //tail.matrix.rotate(0, 0, 0, 1);
  tail.matrix.rotate(tail_animation, 0, 0, 1);
  var topTAIL = new Matrix4(tail.matrix);
  tail.matrix.scale(0.05, 0.12, 0.05);
  tail.matrix.translate(0.2, 0.2, 0.25);
  tail.render();

  var toptail = new Cube();
  toptail.color = fur;
  toptail.matrix = new Matrix4(topTAIL);
  toptail.matrix.translate(0, 0.1, 0);
  toptail.matrix.rotate(18, 0, 0, 1);
  toptail.matrix.rotate(tail_animation1, 1, 0, 0);
  toptail.matrix.scale(0.05 ,0.12, 0.05);
  toptail.render();

  var toptail2 = new Cube();
  toptail2.color = fur;
  toptail2.matrix = new Matrix4(toptail.matrix);
  toptail2.matrix.translate(0.15, 0.4, 0.22);
  toptail2.matrix.rotate(30, 0, 0, 1);
  toptail2.matrix.rotate(tail_animation2, 1, 0, 0);
  toptail2.matrix.scale(1 ,1, 1);
  toptail2.render();

  var toptail3 = new Cube();
  toptail3.color = fur;
  toptail3.matrix = new Matrix4(toptail2.matrix);
  toptail3.matrix.translate(0.5, 2, 0.22);
  toptail3.matrix.rotate(210, 0, 0, 1);
  toptail3.matrix.rotate(tail_animation3, 1, 0, 0);
  toptail3.matrix.scale(1 ,1, 1);
  toptail3.render();
}
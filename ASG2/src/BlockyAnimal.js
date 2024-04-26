// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program ==========================================
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'void main() {\n' +
    ' gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    '}\n';


// Fragment shader program ==========================================
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' + 
    '}\n';

// Constant ==========================================
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables ==========================================
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_size;
var u_ModelMatrix;
var u_GlobalRotateMatrix;

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

  //set initial value for matrix identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Buttons Functions ==========================================
function addActionsForHtmlUI()
{
    // document.getElementById('animate_on').onclick = function() {g_Animation = true;};
    // document.getElementById('animate_off').onclick = function() {g_Animation = false;};
    
    // document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation = true};
    // document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation = false};

    // document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation = true};
    // document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation = false};

    // //Slider events
    // document.getElementById('magentaSlide').addEventListener('mousemove', function(){g_magentaAngle = this.value; renderAllShapes(); });
    // document.getElementById('yellowSlide').addEventListener('mousemove', function(){g_yellowAngle = this.value; renderAllShapes(); });

    document.getElementById('legSlider').addEventListener('mousemove', function() { leg_animation = this.value; renderAllShapes();});
    document.getElementById('tailSlider').addEventListener('mousemove', function() { tail_animation = this.value; renderAllShapes();});
    document.getElementById('tailmove1').addEventListener('mousemove', function() { tail_animation1 = this.value; renderAllShapes();});
    document.getElementById('tailmove2').addEventListener('mousemove', function() { tail_animation2 = this.value; renderAllShapes();});
    document.getElementById('tailmove3').addEventListener('mousemove', function() { tail_animation3 = this.value; renderAllShapes();});

    document.getElementById('animateOn').onclick = function() {g_Animation = true;};
    document.getElementById('animateOff').onclick = function() {g_Animation = false;};
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
  
//   canvas.onmousedown = click;
//   canvas.onmousemove = function(ev){ if(ev.buttons == 1){click(ev)}};

  // Specify the color for clearing <canvas>
  //gl.clearColor(0.0, 0.0, 0.0, 1.0);
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

// The Click Function ==========================================
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
          ALTanimation = !ALTanimation;  // Toggle the attachment state of the hat.
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

    var globalRotMat = new Matrix4();
  
    // var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    globalRotMat.rotate(AngleY, 1, 0, 0).rotate(AngleX, 0, 1, 0);
    globalRotMat.rotate(g_globalAngle, 0, 1, 0); // Example: Slider-controlled global angle
    
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Notes:
    // translate is for position
    // rotate is for changing the angles, (angle, x, y, z)
    // scale is size (x, y, z)
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
    if(ALTanimation)
    {
        tail.matrix.rotate(tail_animation, 0, 0, 1);
        var topTAIL = new Matrix4(tail.matrix);
        tail.matrix.scale(0.05, 0.12, 0.05);
        tail.matrix.translate(0.2, 0.2, 0.25);
        tail.render();
    }
    else
    {
        tail.matrix.rotate(tail_animation, 0, 0, 1);
        var topTAIL = new Matrix4(tail.matrix);
        tail.matrix.scale(0.05, 0.12, 0.05);
        tail.matrix.translate(0.2, 0.2, 0.25);
        tail.render();
    }

    var toptail = new Cube();
    toptail.color = fur;
    toptail.matrix = new Matrix4(topTAIL);
    toptail.matrix.translate(0, 0.1, 0);
    if(ALTanimation)
    {
        toptail.matrix.translate(0.01, 0.04, 0.01);
        toptail.matrix.rotate(0, 1, 0, 0);
        toptail.matrix.rotate(tail_animation1, 1, 0, 0);
        toptail.matrix.scale(0.05 ,0.12, 0.05);
        toptail.render();
    }
    else
    {
        toptail.matrix.rotate(18, 0, 0, 1);
        toptail.matrix.rotate(tail_animation1, 1, 0, 0);
        toptail.matrix.scale(0.05 ,0.12, 0.05);
        toptail.render();
    }

    var toptail2 = new Cube();
    toptail2.color = fur;
    toptail2.matrix = new Matrix4(toptail.matrix);
    toptail2.matrix.translate(0.15, 0.4, 0.22);
    if(ALTanimation)
    {
        toptail2.matrix.translate(-0.12, 0.4, -0.2);
        toptail2.matrix.rotate(0, 0, 0, 1);
        toptail2.matrix.rotate(tail_animation2, 1, 0, 0);
        toptail2.matrix.scale(1 ,1, 1);
        toptail2.render();
    }
    else
    {
        toptail2.matrix.rotate(30, 0, 0, 1);
        toptail2.matrix.rotate(tail_animation2, 1, 0, 0);
        toptail2.matrix.scale(1 ,1, 1);
        toptail2.render();
    }

    var toptail3 = new Cube();
    toptail3.color = fur;
    toptail3.matrix = new Matrix4(toptail2.matrix);
    toptail3.matrix.translate(0.5, 2, 0.22);
    if(ALTanimation)
    {
        toptail3.matrix.translate(-0.5, -1.1, -0.2);
        toptail3.matrix.rotate(0, 0, 0, 1);
        toptail3.matrix.rotate(tail_animation3, 1, 0, 0);
        toptail3.matrix.scale(1 ,1, 1);
        toptail3.render();
    }
    else
    {
        toptail3.matrix.rotate(210, 0, 0, 1);
        toptail3.matrix.rotate(tail_animation3, 1, 0, 0);
        toptail3.matrix.scale(1 ,1, 1);
        toptail3.render();
    }
    // Calculate time taken to render scene and FPS
    var duration = performance.now() - startTime;
    // Prevent division by zero and handle case where duration might be zero
    var fps = (duration > 0) ? 1000 / duration : 0;  
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(fps) , "numdot");
}

// Updating Animations ==========================================
function updateAnimationAngles()
{
    // if(g_yellowAnimation)
    //     {
    //         g_yellowAngle = (45*Math.sin(g_seconds));
    //     }
    // if(g_magentaAnimation)
    //     {
    //         g_magentaAngle = (45*Math.sin(3*g_seconds));
    //     }
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





// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
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
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor; // Use solid color
    } else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0); // Use UV color
    } else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV); // Dirt texture
    } else if (u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV); // Stone texture
    } else {
        gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0); // Fallback color
    }
}`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1
let u_Sampler2;
let u_whichTexture;
let g_camera;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);

  g_camera = new Camera();
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
      console.log('Failed to get the storage location of u_GlobalRotateMatrix');
      return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
      return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Global variables for the camera angle
let g_globalAngleX = 0;
let g_globalAngleY = 0

// Global variables for mouse control
let g_mouseDragging = false;
let g_mouseXposition = 0;
let g_mouseYposition = 0;
let g_xRotation = 0;
let g_yRotation = 0;

// Add actions for the HTML UI elements
// function addActionsForHtmlUI(){
// }

function initTextures(){
  var image1 = new Image();  // Create the first texture image
  var image2 = new Image();  // Create the second texture image

  if (!image1 || !image2) {
    console.log('Failed to create the image objects');
    return false;
  }

  // Register event handlers for each image
  image1.onload = function() { sendImageToTEXTURE(image1, 0); };
  image2.onload = function() { sendImageToTEXTURE(image2, 1); };

  // Load different texture images
  image1.src = 'dirt.jpg';   // Example texture 1
  image2.src = 'stone.png';  // Example texture 2

  return true;
}


function sendImageToTEXTURE(image, textureNum){
  var texture = gl.createTexture();   // Create a new texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Activate the correct texture unit (TEXTURE0, TEXTURE1, etc.)
  gl.activeTexture(gl.TEXTURE0 + textureNum);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Flip the image’s y-axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Assign the texture unit to the sampler uniform (u_Sampler0, u_Sampler1, etc.)
  if (textureNum === 0) {
    gl.uniform1i(u_Sampler0, 0);
  } else if (textureNum === 1) {
    gl.uniform1i(u_Sampler1, 1);
  } else if (textureNum === 2) {
    gl.uniform1i(u_Sampler2, 2);
  }

  console.log('Finished loading texture', textureNum);
}


function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  // addActionsForHtmlUI();

  document.onkeydown = keydown;

  initTextures();

  // Specify the color for the canvas
  gl.clearColor(0.5, 0.8, 1.0, 1.0);

  // Mouse interactions when dragging the canvas
  setupMouseControls()

  requestAnimationFrame(tick);

 
}

function setupMouseControls() {
  // Mouse down event to start tracking movement
  canvas.onmousedown = function (event) { mouseDown(event); };
  // Mouse move event for rotation
  canvas.onmousemove = function (event) { onMove(event); };
  // Mouse up event to stop tracking movement
  canvas.onmouseup = function (event) { mouseUp(event); };
  // Prevent dragging from selecting elements
  canvas.onmouseleave = function () { g_mouseDragging = false; };
}

function onMove(event) {
  if (!g_mouseDragging) return;

  let deltaX = event.clientX - g_mouseXposition;
  let deltaY = event.clientY - g_mouseYposition;

  let sensitivity = 0.3; // Adjust sensitivity for smoother movement

  // Rotate left/right (yaw rotation)
  g_camera.panLeft(-deltaX * sensitivity);

  // Rotate up/down (pitch rotation)
  if (deltaY > 0) {
    g_camera.panDown(deltaY * sensitivity);
  } else {
    g_camera.panUp(-deltaY * sensitivity);
  }

  g_mouseXposition = event.clientX;
  g_mouseYposition = event.clientY;

  renderScene();
}

function mouseDown(event) {
  g_mouseDragging = true;
  g_mouseXposition = event.clientX;
  g_mouseYposition = event.clientY;
}

// When the mouse is move on the canvas
function mouseMove(event) {
  if (g_mouseDragging) {
    let deltaX = event.clientX - g_mouseXposition;
    let deltaY = event.clientY - g_mouseYposition;

    g_globalAngleX += deltaX * 0.5;  // Mouse adjusts Y-axis rotation (left/right)
    g_globalAngleY += deltaY * 0.5;  // Mouse adjusts X-axis rotation (up/down)

    g_mouseXposition = event.clientX;
    g_mouseYposition = event.clientY;

    renderScene(); // Ensure changes are applied immediately
  }
}

// When the mouse is let go on the canvas
function mouseUp(event) {
  g_mouseDragging = false;
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick(){
  // Save the current time
  g_seconds = performance.now()/1000.0 - g_startTime;
  console.log(g_seconds);

  // Update Animation Angles
  // updateAnimationAngles();
  
  // Draw everything
  renderScene();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

var g_map = [
  [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1]
];

function drawMaze(){
  for(let x = 0; x < 28; x++){ 
    for(let y = 0; y < 28; y++){ 
      if(g_map[x][y] == 1){ // if 1, draw a wall
        for (let h = 0; h < 4; h++) { // Stack 4 cubes high
          var body = new Cube();
          body.color = [1, 1, 1, 1.0]; 
          body.textureNum = 0;
          // Convert `g_map` grid coordinates to world coordinates
          let worldX = (x - 14) * 0.3;  // Scale and shift maze inside the inner wall
          let worldY = -0.75 + h * 0.3; // Stack walls properly
          let worldZ = (y - 14) * 0.3;  // Scale and shift maze inside the inner wall
          body.matrix.translate(worldX, worldY, worldZ); // Move to the correct position
          body.matrix.scale(0.5, 0.5, 0.5); // Make blocks smaller to fit
          body.renderfaster();
        }
      }
    }
  }
}

function drawWall(){
  for(x = 0; x < 32; x++){
    for(y = 0; y < 32; y++){
      if(x==0 || x == 31 || y == 0 || y == 31){
        for (let h = 0; h < 4; h++) { // Stack 3 more cubes on top of the base cube
          var body = new Cube();
          body.color = [0.8, 1.0, 1.0, 1.0]; // can add texture here for the walls
          body.textureNum = 1;
          body.matrix.translate(0, -0.75, 0);
          body.matrix.scale(0.3, 0.3, 0.3);
          body.matrix.translate(x-16, h, y-16);
          body.renderfaster();
        }
      }
    }
  }
}

function keydown(ev){
  if(ev.keyCode == 87){
    g_camera.moveForward(0.1);
  } else if (ev.keyCode == 83){
      g_camera.moveBackward(0.1);
  } else if(ev.keyCode==68) { // Right arrow
      g_camera.moveRight(0.1);
  } else if (ev.keyCode==65) { // Left arrow
      g_camera.moveLeft(0.1);
  } else if (ev.keyCode==81) { // Q key
      g_camera.panLeft(10);
  } else if (ev.keyCode==69) { // E key
      g_camera.panRight(-10);
  }
  renderScene();
}
// Draw every shape that is supposed to be in the canvas
function renderScene(){

  // Check the time at the start of this function
  var startTime = performance.now();

  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawWall();
  drawMaze();

  // Draw the floor
  var body = new Cube();
  body.color = [0.31, 0.79, 0.28, 1.0];
  body.textureNum = -2;
  body.matrix.translate(0, -0.75, 0.0);
  body.matrix.scale(10, 0, 10);
  body.matrix.translate(-0.5, 0, -0.5);
  body.renderfaster();

  // Draw the sky
  var sky = new Cube();
  sky.color = [0.53, 0.81, 0.92, 1.0]; // Sky blue
  sky.textureNum = -2;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.renderfaster();

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID); // Get the HTML element
  if (!htmlElm) {
    console.log("Failed to get ", htmlID, " from HTML");
    return;
  }
  htmlElm.innerHTML = text; // Set the text of the HTML element
}

// show/hide text for maze answers button
function toggleMazeAnswers() {
  let textElement = document.getElementById("mazeAnswers");
  let button = document.getElementById("mazeButton");

  if (textElement.style.display === "none") {
    textElement.style.display = "block"; // Show answers
    button.innerText = "Hide Maze Answers"; // Change button text
  } else {
    textElement.style.display = "none"; // Hide answers
    button.innerText = "Show Maze Answers"; // Change button text
  }
}

// show/hide text for notes for grader button
function toggleNotes() {
  let textElement = document.getElementById("hiddenText");
  let button = document.getElementById("notesButton");

  if (textElement.style.display === "none") {
    textElement.style.display = "block"; // Show notes
    button.innerText = "Hide Notes for Grader"; // Change button text
  } else {
    textElement.style.display = "none"; // Hide notes
    button.innerText = "Show Notes for Grader"; // Change button text
  }
}


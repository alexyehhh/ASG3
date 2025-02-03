// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
}`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

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

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Global variables for the camera angle
let g_globalAngleX = 0;
let g_globalAngleY = 0

// Global variables for foot 1 joints
let g_leg1Angle = 0;
let g_foot1Angle = 0.1;
let g_toe1Angle = 0;

// Global variables for foot 2 joints
let g_leg2Angle = -20;
let g_foot2Angle = 0.1;
let g_toe2Angle = 0;

// Global variables for foot 3 joints
let g_leg3Angle = -20;
let g_foot3Angle = 0.1;
let g_toe3Angle = 0;

// Global variables for foot 4 joints
let g_leg4Angle = 0;
let g_foot4Angle = 0.1;
let g_toe4Angle = 0;

// Global variables for foot 1 joints animations
let g_legsAnimation = false;

// Global variables for mouse control
let g_mouseDragging = false;
let g_mouseXposition = 0;
let g_mouseYposition = 0;
let g_xRotation = 0;
let g_yRotation = 0;

// Global variable to track tongue visability
let g_tongueVisible = false; // Tongue is initially hidden

// Add actions for the HTML UI elements
function addActionsForHtmlUI(){

  // Button Events (Animation On and Off buttons)
  document.getElementById('animationLegsOffButton').onclick = function() {g_legsAnimation = false}; // Animation Off Button
  document.getElementById('animationLegsOnButton').onclick = function() {g_legsAnimation = true}; // Animation Off Button

  // Slider for leg 1 joints
  document.getElementById('leg1Slider').addEventListener('mousemove', function() {g_leg1Angle = this.value; renderScene()});
  document.getElementById('foot1Slider').addEventListener('mousemove', function() {g_foot1Angle = this.value; renderScene()});
  document.getElementById('toe1Slider').addEventListener('mousemove', function() {g_toe1Angle = this.value; renderScene()});

  // Slider for leg 2 joints
  document.getElementById('leg2Slider').addEventListener('mousemove', function() {g_leg2Angle = this.value; renderScene()});
  document.getElementById('foot2Slider').addEventListener('mousemove', function() {g_foot2Angle = this.value; renderScene()});
  document.getElementById('toe2Slider').addEventListener('mousemove', function() {g_toe2Angle = this.value; renderScene()});

  // Slider for leg 3 joints
  document.getElementById('leg3Slider').addEventListener('mousemove', function() {g_leg3Angle = this.value; renderScene()});
  document.getElementById('foot3Slider').addEventListener('mousemove', function() {g_foot3Angle = this.value; renderScene()});
  document.getElementById('toe3Slider').addEventListener('mousemove', function() {g_toe3Angle = this.value; renderScene()});

  // Slider for leg 4 joints
  document.getElementById('leg4Slider').addEventListener('mousemove', function() {g_leg4Angle = this.value; renderScene()});
  document.getElementById('foot4Slider').addEventListener('mousemove', function() {g_foot4Angle = this.value; renderScene()});
  document.getElementById('toe4Slider').addEventListener('mousemove', function() {g_toe4Angle = this.value; renderScene()});
  
  // Camera angle sliders
  document.getElementById('angleSliderX').addEventListener('input', function() {
    g_globalAngleX = parseFloat(this.value);
    renderScene();
  });
  
  document.getElementById('angleSliderY').addEventListener('input', function() {
    g_globalAngleY = parseFloat(this.value);
    renderScene();
  });

  // Reset the camera
  document.getElementById("resetCameraButton").addEventListener("click", resetCamera);
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Specify the color for the canvas
  gl.clearColor(0.5, 0.8, 1.0, 1.0);

  // Mouse interactions when dragging the canvas
  setupMouseControls()

  requestAnimationFrame(tick);
}

function setupMouseControls() {
  // Event listeners for mouse interactions
  canvas.onmousedown = function (event) { mouseDown(event); };
  canvas.onmousemove = function (event) { mouseMove(event); };
  canvas.onmouseup = function (event) { mouseUp(event); };
}

// When the mouse is pressed down on the canvas
function mouseDown(event) {
  // if shift-click
  if (event.shiftKey) {
    g_tongueVisible = true; // Show the tongue
    setTimeout(() => {
      g_tongueVisible = false; // Hide the tongue after 1 second
      renderScene(); // Redraw the scene
    }, 1000);
    renderScene(); // Ensure scene updates immediately
    return; // Prevent rotation when shift-clicking
  }
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
  updateAnimationAngles();
  
  // Draw everything
  renderScene();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  if (g_legsAnimation) {
    g_leg1Angle = 20*Math.sin(g_seconds);
    g_leg2Angle = 20*Math.sin(g_seconds);
    g_leg3Angle = 20*Math.sin(g_seconds);
    g_leg4Angle = 20*Math.sin(g_seconds);
  }
}

// Draw every shape that is supposed to be in the canvas
function renderScene(){

  // Check the time at the start of this function
  var startTime = performance.now();

  var globalRotMat = new Matrix4()
  .rotate(g_globalAngleX, 0, 1, 0)  // X-axis rotation (horizontal)
  .rotate(g_globalAngleY, 1, 0, 0); // Y-axis rotation (vertical)

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw dog

  // Draw the body
  var body = new Cube();
  body.color = [0.90, 0.75, 0.50, 1.0];
  body.matrix.translate(-0.25, -0.25, 0.0);
  body.matrix.rotate(-90, 0, 1, 0); // Rotate around Y-axis (left/right)
  body.matrix.scale(0.4, 0.25, 0.4);
  body.render();

  // Draw the head on the top of the body
  var head = new Cube();
  head.color = [0.90, 0.75, 0.50, 1.0];
  head.matrix = new Matrix4(body.matrix);
  head.matrix.translate(0, 1.0, 0.0);
  head.matrix.scale(0.15, 1, 1);
  head.render();

  // Draw the snout (front of the head)
  var snout = new Cube();
  snout.color = [0.80, 0.65, 0.45, 1.0];
  snout.matrix = new Matrix4(head.matrix);
  snout.matrix.translate(-1, 0.0, 0.25);
  snout.matrix.scale(1.3, 0.4, 0.5);
  snout.render();

  // Draw the nose on the end of the snout
  var nose = new Cube();
  nose.color = [0.5, 0.2, 0.0, 1.0]; // brown nose
  nose.matrix = new Matrix4(snout.matrix);
  nose.matrix.translate(-0.5, 0.5, 0.35);
  nose.matrix.scale(0.5, 0.5, 0.3);
  nose.render();

  // Draw the first eye on the head above the snout
  var eye1 = new Cube();
  eye1.color = [0.3, 0.1, 0.0, 1.0]; //dark brown eyes
  eye1.matrix = new Matrix4(head.matrix);
  eye1.matrix.translate(-0.3, 0.6, 0.65);
  eye1.matrix.scale(0.3, 0.15, 0.1);
  eye1.render();

  // Draw the second eye on the head above the snout
  var eye2 = new Cube();
  eye2.color = [0.3, 0.1, 0.0, 1.0]; // dark brown eyes
  eye2.matrix = new Matrix4(head.matrix);
  eye2.matrix.translate(-0.3, 0.6, 0.25);
  eye2.matrix.scale(0.3, 0.15, 0.1);
  eye2.render();

  // Draw the first ear on the side of the head
  var ear1 = new Cube();
  ear1.color = [0.5, 0.2, 0.0, 1.0]; // brown ears
  ear1.matrix = new Matrix4(head.matrix);
  ear1.matrix.translate(0.0, 0.4, -0.15);
  ear1.matrix.scale(1, 0.6, 0.15);
  ear1.render();

  // Draw the second ear on the other side of the head
  var ear2 = new Cube();
  ear2.color = [0.5, 0.2, 0.0, 1.0]; // brown ears
  ear2.matrix = new Matrix4(head.matrix);
  ear2.matrix.translate(0.0, 0.4, 1);
  ear2.matrix.scale(1, 0.6, 0.15);
  ear2.render();

  // Draw the tail on the end of the body
  var tail = new Cube();
  tail.color = [0.5, 0.2, 0.0, 1.0]; // brown tail
  tail.matrix = new Matrix4(body.matrix);
  tail.matrix.translate(1, 0.5, 0.45);
  tail.matrix.scale(0.15, 0.15, 0.15);
  tail.render();

  // Draw the first leg below the body in the front
  var leg1 = new Cube();
  leg1.color = [0.90, 0.75, 0.50, 1.0];
  leg1.matrix.translate(-0.65, -0.4, 0);
  leg1.matrix.rotate(-g_leg1Angle, 1, 0, 0);
  var copyofleg1 = new Matrix4(leg1.matrix);
  leg1.matrix.scale(0.1, 0.2, 0.1); 
  leg1.render();
  
  // Draw/attach the first foot below the first leg 
  var foot1 = new Cube();
  foot1.color = [0.5, 0.2, 0.0, 1.0];
  foot1.matrix = new Matrix4(copyofleg1);
  foot1.matrix.translate(0, -0.05, -0.05);
  foot1.matrix.rotate(30, g_foot1Angle, 0, 0);
  var copyoffoot1 = new Matrix4(foot1.matrix);
  foot1.matrix.scale(0.1, 0.1, 0.1);  
  foot1.render();

  // Draw/attach the toes to the front of the first foot
  var toes1 = new Cube();
  toes1.color = [0.90, 0.75, 0.50, 1.0];
  toes1.matrix = new Matrix4(foot1.matrix);
  toes1.matrix.translate(0, 0, -0.53);
  toes1.matrix.rotate(g_toe1Angle, -1, 0, 0); // make the first parameter a variable
  toes1.matrix.scale(1, 0.5, 0.5);
  toes1.render();

  // Draw the second leg below the body in the front, next to the first leg
  var leg2 = new Cube();
  leg2.color = [0.90, 0.75, 0.50, 1.0];
  leg2.matrix.translate(-0.35, -0.4, 0);
  leg2.matrix.rotate(g_leg2Angle, 1, 0, 0);
  var copyofleg2 = new Matrix4(leg2.matrix);
  leg2.matrix.scale(0.1, 0.2, 0.1); 
  leg2.render();

  // Draw/attach the second foot below the second leg 
  var foot2 = new Cube();
  foot2.color = [0.5, 0.2, 0.0, 1.0];
  foot2.matrix = new Matrix4(copyofleg2);
  foot2.matrix.translate(0, -0.05, -0.05);
  foot2.matrix.rotate(30, g_foot2Angle, 0, 0);
  var copyoffoot2 = new Matrix4(foot2.matrix);
  foot2.matrix.scale(0.1, 0.1, 0.1);  
  foot2.render();

  // Draw/attach the toes to the front of the second foot
  var toes2 = new Cube();
  toes2.color = [0.90, 0.75, 0.50, 1.0];
  toes2.matrix = new Matrix4(foot2.matrix);
  toes2.matrix.translate(0, 0, -0.53);
  toes2.matrix.rotate(g_toe2Angle, -1, 0, 0); // make the first parameter a variable
  toes2.matrix.scale(1, 0.5, 0.5);
  toes2.render();

  // Draw the third leg below the body in the back, behind the first leg
  var leg3 = new Cube();
  leg3.color = [0.90, 0.75, 0.50, 1.0];
  leg3.matrix.translate(-0.65, -0.4, 0.3);
  leg3.matrix.rotate(g_leg3Angle, 1, 0, 0);
  var copyofleg3 = new Matrix4(leg3.matrix);
  leg3.matrix.scale(0.1, 0.2, 0.1); 
  leg3.render();

  // Draw/attach the third foot below the third leg 
  var foot3 = new Cube();
  foot3.color = [0.5, 0.2, 0.0, 1.0];
  foot3.matrix = new Matrix4(copyofleg3);
  foot3.matrix.translate(0, -0.05, -0.05);
  foot3.matrix.rotate(30, g_foot3Angle, 0, 0);
  var copyoffoot2 = new Matrix4(foot2.matrix);
  foot3.matrix.scale(0.1, 0.1, 0.1);  
  foot3.render();

  // Draw/attach the toes to the front of the third foot
  var toes3 = new Cube();
  toes3.color = [0.90, 0.75, 0.50, 1.0];
  toes3.matrix = new Matrix4(foot3.matrix);
  toes3.matrix.translate(0, 0, -0.53);
  toes3.matrix.rotate(g_toe3Angle, -1, 0, 0); // make the first parameter a variable
  toes3.matrix.scale(1, 0.5, 0.5);
  toes3.render();

  // Draw the fourth leg below the body in the back, behind the second leg
  var leg4 = new Cube();
  leg4.color = [0.90, 0.75, 0.50, 1.0];
  leg4.matrix.translate(-0.35, -0.4, 0.3);
  leg4.matrix.rotate(-g_leg4Angle, 1, 0, 0);
  var copyofleg3 = new Matrix4(leg4.matrix);
  leg4.matrix.scale(0.1, 0.2, 0.1); 
  leg4.render();

  // Draw/attach the fourth foot below the fourth leg  
  var foot4 = new Cube();
  foot4.color = [0.5, 0.2, 0.0, 1.0];
  foot4.matrix = new Matrix4(copyofleg3);
  foot4.matrix.translate(0, -0.05, -0.05);
  foot4.matrix.rotate(30, g_foot4Angle, 0, 0);
  var copyoffoot4 = new Matrix4(foot4.matrix);
  foot4.matrix.scale(0.1, 0.1, 0.1);  
  foot4.render();

  // Draw/attach the toes to the front of the fourth foot
  var toes4 = new Cube();
  toes4.color = [0.90, 0.75, 0.50, 1.0];
  toes4.matrix = new Matrix4(foot4.matrix);
  toes4.matrix.translate(0, 0, -0.53);
  toes4.matrix.rotate(g_toe4Angle, -1, 0, 0); // make the first parameter a variable
  toes4.matrix.scale(1, 0.5, 0.5);
  toes4.render();

  // if the tongue condition is true, meaning shift-clicked is pressed down on the canvas
  if (g_tongueVisible) {
    var tongue = new Cube();
    tongue.color = [1.0, 0.4, 0.7, 1.0]; // Pink color
    tongue.matrix = new Matrix4(head.matrix); // Attach to the head
    tongue.matrix.translate(-0.5, 0, 0.55); // Position near the snout
    tongue.matrix.rotate(-180, 1, 0, 0); // Rotate downward
    tongue.matrix.scale(0.5, 0.5, 0.12); // Adjust size
    tongue.render();
  }  

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

// Reset the camera angle when the 'reset camera angle' button is clicked
function resetCamera() {
  // Set the global variables to 0
  g_globalAngleX = 0;
  g_globalAngleY = 0;

  // Update the sliders to reflect the reset values
  document.getElementById("angleSliderX").value = 0;
  document.getElementById("angleSliderY").value = 0;

  renderScene(); // Redraw the scene with the reset angles
}

// function to hide text for notes for grader button
function toggleText() {
  let textElement = document.getElementById("hiddenText");
  if (textElement.style.display === "none") {
    textElement.style.display = "block"; // Show text
  } else {
    textElement.style.display = "none"; // Hide text
  }
}
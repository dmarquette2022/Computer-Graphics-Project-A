// Project A by David Marquette and Alejandro Malavet

// Vertex shader program----------------------------------
var VSHADER_SOURCE = 
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE = 
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variables

//------------For WebGL-----------------------------------------------
var gl;           // webGL Rendering Context. Set in main(), used everywhere.
var g_canvas = document.getElementById('webgl');     
                  // our HTML-5 canvas object that uses 'gl' for drawing.
                  
// ----------For tetrahedron & its matrix---------------------------------
var g_vertsMax = 0;                 // number of vertices held in the VBO 
                                    // (global: replaces local 'n' variable)
var g_modelMatrix = new Matrix4();  // Construct 4x4 matrix; contents get sent
                                    // to the GPU/Shaders as a 'uniform' var.
var g_modelMatLoc;                  // that uniform's location in the GPU

//------------For Animation---------------------------------------------
var g_isRun = true;                 // run/stop for animation; used in tick().
var g_lastMS = Date.now();    			// Timestamp for most-recently-drawn image; 

var g_mainRpm = 30.0;          // rotation speed, in degrees/second
var g_mainAngle = 0;

									
var g_tailRpm = 5.0;
var g_tailAngle = 0.0;

var vert = 0;
var hori = 0;

var cw = 0;
var pitch = 0;

var dist = 0;


function main() {

	// Get gl, the rendering context for WebGL, from our 'g_canvas' object
	gl = getWebGLContext(g_canvas);

	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

	// Initialize a Vertex Buffer in the graphics system to hold our vertices
	g_maxVerts = initVertexBuffer(gl);  
	if (g_maxVerts < 0) {
		console.log('Failed to set the vertex information');
		return;
	}

	window.addEventListener("keydown", myKeyDown, false);
	gl.clearColor(0.3, 0.3, 0.3, 1.0);

	gl.depthFunc(gl.LESS);
	gl.enable(gl.DEPTH_TEST); 	  

	// Get handle to graphics system's storage location of u_ModelMatrix
	g_modelMatLoc = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

	if (!g_modelMatLoc) 
	{ 
		console.log('Failed to get the storage location of u_ModelMatrix');
		return;
	}

  var tick = function() {
	animate();
    drawAll();
    requestAnimationFrame(tick, g_canvas);
  };

  tick();
}

function initVertexBuffer() {				 

  var colorShapes = new Float32Array([
	//Proppeler
	0, 0, 0, 1, 	0, 0, 0,
	1, -0.1, 0, 1, 	0, 0, 0,
	1, 0.1, 0, 1,	 0, 0, 0,

	1, -0.1, 0, 1, 	0, 0, 0,
	1, 0.1, 0, 1,	 0, 0, 0,
	1, 0.1, -0.5, 1,	 0, 0, 0,

	1, -0.1, 0, 1,	 0, 0, 0,
	1, -0.1, -0.5, 1,	 0, 0, 0,
	1, 0.1, -0.5, 1,	 0, 0, 0,

	0, 0, 0, 1, 	0, 0, 1,
	1, -0.1, -0.5, 1, 	0, 0, 1,
	1, 0.1, -0.5, 1,	 0, 0, 1,

	0, 0, 0, 1, 	1, 0, 0,
	1, 0.1, 0, 1,	 1, 0, 0,
	1, 0.1, -0.5, 1,	 1, 0, 0,

	0, 0, 0, 1, 	0, 1, 0,
	1, -0.1, 0, 1,	 0, 1, 0,
	1, -0.1, -0.5, 1,	 0, 1, 0,



	/*

	0, 0, 0, 1, 	0, 0, 0,
	0, 1, 0, 1, 	0, 0, 0,
	-0.2, 1, 0, 1,	 0, 0, 0,

	0, 0, 0, 1, 	0, 0, 0,
	0, -1, 0, 1, 	0, 0, 0,
	0.2, -1, 0, 1,	 0, 0, 0,

	0, 0, 0, 1, 	0, 0, 0,
	-1, 0, 0, 1, 	0, 0, 0,
	-1, -0.2, 0, 1,	 0, 0, 0,
	*/


//Body

//front1,0,0,
	0.0, 0.0, 0.0, 1.0, 	1,0,0,
	0.0,  1.0, 0.0, 1.0,  	1,0,0,
	1.0,  1.0, 0.0, 1.0, 	1,0,0,

	0.0, 0.0,  0.0, 1.0, 	1,0,0, 
	1.0,  0.0,  0.0, 1.0,   1,0,0,
	1.0,  1.0,  0.0, 1.0, 	1,0,0,

	0.0, 0.0,  1.0, 1.0, 	0,1,0,
	0.0,  1.0,  1.0, 1.0,  	0,1,0,
	1.0,  1.0,  1.0, 1.0, 	0,1,0,

	0.0, 0.0,  1.0, 1.0, 	0,1,0, 
	1.0,  0.0,  1.0, 1.0,   0,1,0,
	1.0,  1.0,  1.0, 1.0, 	0,1,0,

	1.0, 0.0,  0.0, 1.0, 	0,0,1, 
	1.0,  1.0,  0.0, 1.0,   0,0,1,
	1.0,  1.0,  1.0, 1.0, 	0,0,1, 

	1.0, 0.0,  0.0, 1.0, 	0,0,1, 
	1.0,  0.0,  1.0, 1.0,   0,0,1,
	1.0,  1.0,  1.0, 1.0, 	0,0,1,

	0.0, 0.0,  0.0, 1.0, 	1,0,1, 
	0.0,  1.0,  0.0, 1.0,   1,0,1,
	0.0,  1.0,  1.0, 1.0, 	1,0,1,

	0.0, 0.0,  0.0, 1.0, 	1,0,1, 
	0.0,  0.0,  1.0, 1.0,   1,0,1,
	0.0,  1.0,  1.0, 1.0, 	1,0,1, 

	0.0, 1.0,  0.0, 1.0, 	1,1,0, 
	0.0,  1.0,  1.0, 1.0,   1,1,0,
	1.0,  1.0,  1.0, 1.0, 	1,1,0, 

	0.0, 1.0,  0.0, 1.0, 	1,1,0, 
	1.0,  1.0,  0.0, 1.0,   1,1,0,
	1.0,  1.0,  1.0, 1.0, 	1,1,0,

	0.0, 0.0,  0.0, 1.0, 	1,1,0.5, 
	0.0,  0.0,  1.0, 1.0,   1,1,0.5,
	1.0,  0.0,  1.0, 1.0, 	1,1,0.5, 

	0.0, 0.0,  0.0, 1.0, 	1,1,0.5, 
	1.0,  0.0,  0.0, 1.0,   1,1,0.5,
	1.0,  0.0,  1.0, 1.0, 	1,1,0.5,

	//back
	0.0, 0.0, 0.0, 1.0, 	0.0, 0, 1, 
	0.0,  1.0, 0.0, 1.0,  	0.0, 0, 1,
	1.0,  1,  -0.2, 1.0,    0.0, 0, 1.0,

	0.0, 0.0, -1.0, 1.0, 	0.0, 1.0, 0, 
	0.0,  1.0, -1.0, 1.0,  	0.0, 1.0, 0,
	1.0,  1,  -0.2, 1.0,    0.0,1.0,0,

	0.0, 0.0, 0.0, 1.0, 	0.3, 1, 0.5, 
	0.0, 0.0, -1.0, 1.0, 	0.3, 1, 0.5,
	1.0,  1,  -0.2, 1.0,    0.3, 1, 0.5,

	0.0,  1.0, 0.0, 1.0,  1, 0, 0,
	0.0,  1.0, -1.0, 1.0,  1, 0, 0,
	1.0,  1,  -0.2, 1.0,   1, 0, 0,

  ]);

  g_vertsMax = 60;

  var shapeBufferHandle = gl.createBuffer();  
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; 

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE * 7, 0);						
  									
  gl.enableVertexAttribArray(a_Position);  
  									// Enable assignment of vertex buffer object's position data

  // Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  
  // Use handle to specify how to retrieve color data from our VBO:
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 7, FSIZE * 4);
  									
  gl.enableVertexAttribArray(a_Color);  

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

}


function drawAll() 
{
  	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	clrColr = new Float32Array(4);
	clrColr = gl.getParameter(gl.COLOR_CLEAR_VALUE);
	

	g_modelMatrix.setTranslate(-0.5,-0.5,0,0);
	g_modelMatrix.translate(hori,vert,dist,0);
	g_modelMatrix.scale(1,1,-1);
	g_modelMatrix.scale(0.5,0.5,0.5);
	//REMOVE THIS TO SEE REGULAR POSITIONING
	g_modelMatrix.rotate(cw,0,1,0);
	g_modelMatrix.rotate(pitch,0,0,1);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawBody();
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0.5,1.1,0.5,0);
	g_modelMatrix.rotate(g_mainAngle,0,1,0);
	g_modelMatrix.scale(0.7,0.7,0.7);
	//g_modelMatrix.rotate(90, 1, 0, 0);

	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawPropeller();
	g_modelMatrix.rotate(90, 0,1,0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawPropeller();
	g_modelMatrix.rotate(90, 0,1,0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawPropeller();
	g_modelMatrix.rotate(90, 0,1,0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawPropeller();
	g_modelMatrix = popMatrix();

	pushMatrix(g_modelMatrix);

	g_modelMatrix.translate(-0.1,0.5,0.5,0);
	g_modelMatrix.rotate(g_tailAngle,1,0,0);
	g_modelMatrix.rotate(90,0,0,1);
	g_modelMatrix.scale(0.4,0.4,0.4);
	

	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawPropeller();
	g_modelMatrix.rotate(90,0,1,0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawPropeller();
	g_modelMatrix.rotate(90,0,1,0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawPropeller();
	g_modelMatrix.rotate(90,0,1,0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawPropeller();
	g_modelMatrix = popMatrix();
	
	
	g_modelMatrix.translate(1,0,1,0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);

	drawBack();

}

function drawBody()
{
	gl.drawArrays(gl.TRIANGLES, 18,36);
}

function drawPropeller()
{
	gl.drawArrays(gl.TRIANGLES, 0,18);
}

function drawBack()
{
	gl.drawArrays(gl.TRIANGLES, 54,12);
}

var g_last = Date.now();

function animate() 
{
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	g_mainAngle = g_mainAngle + (g_mainRpm * elapsed) / 1000;
	g_tailAngle = g_tailAngle + (g_tailRpm * elapsed) / 1000; 
}

function slowMain(){
	if (g_mainRpm == 0)
	{
		return;
	}
	g_mainRpm -= 10;
}

function speedMain(){
	g_mainRpm += 10;
}

function slowTail(){
	if (g_tailRpm == 0)
	{
		return;
	}
	g_tailRpm -= 5;
}

function speedTail(){
	g_tailRpm += 5;
}
//==================HTML Button Callbacks======================

function myKeyDown(kev) {
	switch(kev.code) {
		//------------------WASD navigation-----------------
		case "KeyA":
			document.getElementById('KeyDownResult').innerHTML =  
			hori-=0.01;
			break;
    	case "KeyD":
			document.getElementById('KeyDownResult').innerHTML =  
			hori+=0.01;
			break;
		case "KeyS":
			document.getElementById('KeyDownResult').innerHTML =  
			vert-=0.01;
			break;
		case "KeyW":
			document.getElementById('KeyDownResult').innerHTML =  
			vert+=0.01;
			break;
		case "KeyE":
			document.getElementById('KeyDownResult').innerHTML =  
			cw-=0.5;
			break;
		case "KeyQ":
			document.getElementById('KeyDownResult').innerHTML =  
			cw+=0.5;
			break;
		case "KeyX":
			document.getElementById('KeyDownResult').innerHTML =  
			pitch-=0.5;
			break;
		case "KeyZ":
			document.getElementById('KeyDownResult').innerHTML =  
			pitch+=0.5;
			break;
		case "ArrowUp":		
			document.getElementById('KeyDownResult').innerHTML =  
			dist-=0.1;
			break;
		case "ArrowDown":
			document.getElementById('KeyDownResult').innerHTML =  
			dist+=0.1;
			break;	
    default:
  		document.getElementById('KeyDownResult').innerHTML =
  		'Not Used';
     	break;
	}
}

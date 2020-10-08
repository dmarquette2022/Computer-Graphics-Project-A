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

var main_rpm = 5.0;          // rotation speed, in degrees/second
									
var tail_rpm = 5.0;


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
																						window.addEventListener("keyup", myKeyUp, false);

																						gl.clearColor(0.3, 0.3, 0.3, 1.0);
																						gl.depthFunc(gl.LESS);
																						gl.enable(gl.DEPTH_TEST); 	  
																						
																					// Get handle to graphics system's storage location of u_ModelMatrix
																					g_modelMatLoc = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
																					if (!g_modelMatLoc) { 
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
	 0, 0, 0, 1, 	0, 0, 0,
	 1, 0, 0, 1, 	0, 0, 0,
	 1, 0.2, 0, 1,	 0, 0, 0,

	 0, 0, 0, 1, 	0, 0, 0,
	 0, 1, 0, 1, 	0, 0, 0,
	 -0.2, 1, 0, 1,	 0, 0, 0,

	 0, 0, 0, 1, 	0, 0, 0,
	 0, -1, 0, 1, 	0, 0, 0,
	 0.2, -1, 0, 1,	 0, 0, 0,

	 0, 0, 0, 1, 	0, 0, 0,
	 -1, 0, 0, 1, 	0, 0, 0,
	 -1, -0.2, 0, 1,	 0, 0, 0
	 
  ]);

  g_vertsMax = 12;
  
	
															// Create a buffer object
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
															// Use handle to specify how to retrieve position data from our VBO:
															gl.vertexAttribPointer(a_Position,4,gl.FLOAT, false,FSIZE * 7,0);

															gl.enableVertexAttribArray(a_Position);  

															// Get graphics system's handle for our Vertex Shader's color-input variable;
															var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
															if(a_Color < 0) {
																console.log('Failed to get the storage location of a_Color');
																return -1;
															}
															// Use handle to specify how to retrieve color data from our VBO:
															gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,FSIZE * 7,FSIZE * 4);
																								
															gl.enableVertexAttribArray(a_Color);  

															gl.bindBuffer(gl.ARRAY_BUFFER, null);

}


function drawAll() {

  	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	clrColr = new Float32Array(4);
	clrColr = gl.getParameter(gl.COLOR_CLEAR_VALUE);

	g_modelMatrix.rotate(-main_rpm, 0, 0, 1);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	  
	drawPropeller();
}

function drawPropeller(){
	gl.drawArrays(gl.TRIANGLES, 0,12);
}

var g_last = Date.now();

function animate() {

	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;

}

function slowMain(){
	if (main_rpm == 0) return
	main_rpm --
}

function speedMain(){
	main_rpm ++
}

function slowTail(){
	if (tail_rpm == 0) return
	tail_rpm --
}

function speedTail(){
	tail_rpm ++
}
//==================HTML Button Callbacks======================

function myKeyDown(kev) {
	switch(kev.code) {
		//------------------WASD navigation-----------------
		case "KeyA":
			document.getElementById('KeyDownResult').innerHTML =  
			'Strafe LEFT!';
			break;
    	case "KeyD":
			document.getElementById('KeyDownResult').innerHTML =  
			'Strafe RIGHT!';
			break;
		case "KeyS":
			document.getElementById('KeyDownResult').innerHTML =  
			'Move DOWN!';
			break;
		case "KeyW":
			document.getElementById('KeyDownResult').innerHTML =  
			'Move UP!';
			break;
		//----------------Arrow keys------------------------
		case "ArrowLeft": 	
			document.getElementById('KeyDownResult').innerHTML =  
			'Strafe LEFT!';
			break;
		case "ArrowRight":
			document.getElementById('KeyDownResult').innerHTML =  
			'Strafe RIGHT!';
			break;
		case "ArrowUp":		
			document.getElementById('KeyDownResult').innerHTML =  
			'Move UP!';
			break;
		case "ArrowDown":
			document.getElementById('KeyDownResult').innerHTML =  
			'Move DOWN!';
			break;
    default:
  		document.getElementById('KeyDownResult').innerHTML =
  		'Not Used';
     	break;
	}
}

function myKeyUp(kev) {
	switch(kev.code) {
		//------------------WASD navigation-----------------
		case "KeyA":
			document.getElementById('KeyDownResult').innerHTML =  
			'Strafe LEFT Stop!';
			break;
    	case "KeyD":
			document.getElementById('KeyDownResult').innerHTML =  
			'Strafe RIGHT Stop!';
			break;
		case "KeyS":
			document.getElementById('KeyDownResult').innerHTML =  
			'Move DOWN Stop!';
			break;
		case "KeyW":
			document.getElementById('KeyDownResult').innerHTML =  
			'Move UP Stop!';
			break;
		//----------------Arrow keys------------------------
		case "ArrowLeft": 	
			document.getElementById('KeyDownResult').innerHTML =  
			'Strafe LEFT Stop!';
			break;
		case "ArrowRight":
			document.getElementById('KeyDownResult').innerHTML =  
			'Strafe RIGHT Stop!';
			break;
		case "ArrowUp":		
			document.getElementById('KeyDownResult').innerHTML =  
			'Move UP Stop!';w
			break;
		case "ArrowDown":
			document.getElementById('KeyDownResult').innerHTML =  
			'Move DOWN Stop!';
			break;
    default:
  		document.getElementById('KeyDownResult').innerHTML =
  		'Not Used';
     	break;
	}
}

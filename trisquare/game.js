"use strict";
var gl;

function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}


function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}


var shaderProgram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}


var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
	var copy = mat4.create();
	mat4.copy(copy, mvMatrix);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}


function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

var cameraPos = [-5, 7, 4];
var cameraLook = [-5, 7, 5]; 
var cameraPan = [0,0,0]; //Z will always be zero
var cameraUp = [0,1,0]; //Static

var pitch = degToRad(-27);
var yaw = degToRad(-20);

var movementSpeed = 0.1;
var cameraPanSpeed = 0.2;
var crouchingDelta = 0;

function handleMotion(){
	/**	
	Some of the math code taken from the HTML5 Rocks PointerLock tutorial
	under the Apache 2.0 Licence
	http://www.html5rocks.com/en/tutorials/pointerlock/intro/
	http://www.apache.org/licenses/LICENSE-2.0	
	**/
	
	yaw -= degToRad(cameraPan[0] * 100);
	pitch -= degToRad(cameraPan[1] * 100);
	
	crouchingDelta = motion.crouching ? -3 : 0;
	
	var forwardDirection = vec3.create(cameraLook);
	vec3.subtract(forwardDirection, cameraLook, cameraPos);

	//vec3.subtract(this.lookAtPoint, this.eyePoint, frontDirection);
	vec3.normalize(forwardDirection, forwardDirection);
	var q = quat.create();
	// Construct quaternion 
	quat.setAxisAngle(q, cameraUp, yaw);
	// Rotate camera look vector
	//quat.multiplyVec3(q, forwardDirection);
	vec3.transformQuat(forwardDirection, forwardDirection, q);
	// Update camera look vector
	//this.lookAtPoint = vec3.create(this.eyePoint);
	//vec3.add(this.lookAtPoint, frontDirection);
	
	var strafeScale = 0.0;
	strafeScale += motion.strafeLeft ? 1.0 : 0.0;
	strafeScale -= motion.strafeRight ? 1.0 : 0.0;
	var strafeMovement = vec3.create();
	if (strafeScale !== 0.0){
		vec3.cross(strafeMovement, forwardDirection, cameraUp);
		vec3.scale(strafeMovement, strafeMovement, strafeScale * movementSpeed);
	}
	
	var forwardScale = 0.0;
	forwardScale += motion.backward ? 1.0 : 0.0;
	forwardScale -= motion.forward ? 1.0 : 0.0;
	
	vec3.scale(forwardDirection, forwardDirection, forwardScale * movementSpeed);
	var allMovement = vec3.create();
	vec3.add(allMovement, strafeMovement, forwardDirection);
	
	vec3.add(cameraPos, cameraPos, allMovement);
	vec3.add(cameraLook, cameraLook, allMovement);
}

function drawScene() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(pMatrix, degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	
	mat4.identity(mvMatrix);
	mat4.rotateX(mvMatrix, mvMatrix, -pitch);
	mat4.rotateY(mvMatrix, mvMatrix, -yaw);
	//TODO: Move crouchingDelta to handleMotion()
	mat4.translate(mvMatrix, mvMatrix, [-cameraPos[0], -(cameraPos[1] + crouchingDelta), -cameraPos[2]]);
	setMatrixUniforms();
	
	for (var i = 0; i < drawList.length; i++){
		var worldObject = drawList[i];
		
		if (worldObject.textureName){
			gl.bindBuffer(gl.ARRAY_BUFFER, worldObject.vertexTextureCoordBuffer);
			gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, worldObject.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, textures[worldObject.textureName].glTexture); 
			gl.uniform1i(shaderProgram.samplerUniform, 0);
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, worldObject.vertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, worldObject.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.TRIANGLES, 0, worldObject.vertexPositionBuffer.numItems);
	}
}

function tick() {
	requestAnimFrame(tick);
	handleMotion();
	drawScene();
}

var textures;
var drawList = [];
function webGLStart(){
	function pointerLockChange(){
		if (document.webkitPointerLockElement == canvas){
			//We're toggling into pointer lock
			document.addEventListener("mousemove", onMouseMove, false);
		}
		else {
			//We're toggling out of pointer lock
			document.removeEventListener("mousemove", onMouseMove, false);
		}
	}
	
	var canvas = document.getElementById("gameviewbox");
	initGL(canvas);
	initShaders();
	
	//Load map data
	loadObject('glMap.obj', function(mapdata){
		drawList = objjs.handleLoadedObject(mapdata, gl);
	
		//Load map texture data
		loadObject('glMap.mtl', function(textureData){
			objjs.initTexture(textureData,gl,function(maptextures){
				textures = maptextures;
				tick(); //Don't start the game until everything is loaded
			});
		});
	});

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	
	var requestPointerLock = canvas.webkitRequestPointerLock;
	if (requestPointerLock) {
		canvas.addEventListener('click', requestPointerLock, false);
		document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
	}

	var exitPointerLock = document.webkitExitPointerLock;
	//exitPointerLock();
}
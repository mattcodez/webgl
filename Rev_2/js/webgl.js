//Global Vars
var gl;
var shaderProgram;
var texture = [];

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

var currentlyPressedKeys = {};

var pitch = 0; //del
var pitchRate = 0; //del

var yaw = 0; //del
var yawRate = 0; //del
var xPos = 0; //del
var yPos = 0.4; //del
var zPos = 0; //del
var xPosBall = 0; //del
var yPosBall = 0.4; //del
var zPosBall = 0; //del
var speed = 0; //del

var movementSpeed = 0.1;
var cameraPanSpeed = 0.2;
var crouchingDelta = 0;

var objVertexPositionBuffer = []; //del
var objVertexTextureCoordBuffer = []; //del
var allTex = [];
var allTexCount = -1;
var allTexLength = [];
var uniqueTextures = [];

var lastTime = 0;
// Used to make us "jog" up and down as we move forward.
var joggingAngle = 0;

var objects = [
	{
		name:							'', //ect: ball, map, player
		type: 							0, 	//0=fixed, 1=moves
		minX:							null, 	//For collision detection
		maxX:							null,	//For collision detection
		minY:							null,	//For collision detection
		maxY:							null,	//For collision detection
		minZ:							null,	//For collision detection
		maxZ:							null,	//For collision detection
		cameraPos:						[],	
		cameraLook:						[],
		cameraPan:						[],
		pitch:							0,
		pitchRate:						0,
		yaw:							0,
		yawRate:						0,
		speed:							0,
		lives:							0, 	//For player
		score:							0, 	//For player
		timeInAir:						0, 	//For Physics
		vertexPositions:				[],		
		vertexTextureCoords:			[],
		vertexCount:					[],
		objVertexPositionBuffer:		[],
		objVertexTextureCoordBuffer:	[],
		textures: 						[],
		objTexture:						[]
	}
];

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
    mat4.set(mvMatrix, copy);
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

function initBalls(){
	var balls = [];
	
	for (var i = 0; i < objects.length; i++){
		var obj = objects[i];
		if (obj.name.match(/dodgeball/i)){
			//Not sure if we need everything in objects but we'll pass it all in for now
			balls.push(new Ball(obj)); 
		}
	}
	
	return balls;
}

function initPlayers(){
	var players = [];
	
	for (var i = 0; i < 1; i++){
		players.push(new Player()); 
	}
	
	return players;
}

function handleMotion(world){
	/**	
	Some of the math code taken from the HTML5 Rocks PointerLock tutorial
	under the Apache 2.0 Licence
	http://www.html5rocks.com/en/tutorials/pointerlock/intro/
	http://www.apache.org/licenses/LICENSE-2.0	
	**/
	
	var floor = 1;

	//Add positions the our objects position stack
	for(var i=1; i<objects.length; i++){ 
		var obj = objects[i];
		
		if(obj.name.substr(0, 9).toLowerCase() == 'dodgeball'){
			obj.cameraPos.push([cameraPos[0], (cameraPos[1]+ crouchingDelta), cameraPos[2]]);
		}else if(obj.name.substr(0, 3).toLowerCase() == 'map'){
			obj.cameraPos.push([cameraPos[0], (cameraPos[1]+ crouchingDelta), cameraPos[2]]);
		}else if(obj.name.substr(0, 6).toLowerCase() == 'player'){
			obj.cameraPos.push([cameraPos[0], (cameraPos[1]+ crouchingDelta), cameraPos[2]]);
			//Adding positions to actual object
			world.players[0].cameraPos.push([cameraPos[0], (cameraPos[1]+ crouchingDelta), cameraPos[2]]);
		}
		
		if(obj.cameraPos.length > 100){ //Will keep a stack of 100 for now
			obj.cameraPos.shift();
		}
	}
	
	var gravity = [0, -0.1, 0];

	yaw -= degToRad(cameraPan[0] * 100);
	pitch -= degToRad(cameraPan[1] * 100);

	crouchingDelta = world.players[0].crouch();

	var forwardDirection = vec3.create(cameraLook);
	vec3.subtract(forwardDirection, cameraLook, cameraPos);

	//Changing direction based on camera pos change
	vec3.normalize(forwardDirection, forwardDirection);
	var q = quat.create();
	quat.setAxisAngle(q, cameraUp, yaw);
	vec3.transformQuat(forwardDirection, forwardDirection, q);
	//NOTE: I think the above works by luck, cameraLook appears to be wrong
	
	for (var i = 0; i < world.balls.length; i++){
		var ball = world.balls[i];
		if (motion.fire){
			ball.fireFromTo(cameraPos, forwardDirection);
			motion.fire = false;
		}
		else {
			ball.applyGravity(gravity);
			ball.move();
		}
	}

	var strafeScale = 0.0;
	strafeScale += motion.strafeLeft ? world.players[0].speed : 0.0;
	strafeScale -= motion.strafeRight ? world.players[0].speed : 0.0;
	var strafeMovement = vec3.create();
	if (strafeScale !== 0.0){
		vec3.cross(strafeMovement, forwardDirection, cameraUp);
		vec3.scale(strafeMovement, strafeMovement, strafeScale * movementSpeed);
	}

	var forwardScale = 0.0;
	forwardScale += motion.backward ? world.players[0].speed : 0.0;
	forwardScale -= motion.forward ? world.players[0].speed : 0.0;

	vec3.scale(forwardDirection, forwardDirection, forwardScale * movementSpeed);
	var allMovement = vec3.create();
	vec3.add(allMovement, strafeMovement, forwardDirection);
	
	//Really simple gravity, eventually want collision detection with floor
	//And an accelerated fall
	if (cameraPos[1] > floor){
		vec3.add(allMovement, allMovement, gravity);
	}
	
	//Enviornment attributes
	var env = {
		floor: floor,
		allMovement: allMovement,
		gravity: gravity
	}
	
	world.players[0].jump(env);

	vec3.add(cameraPos, cameraPos, allMovement);
	vec3.add(cameraLook, cameraLook, allMovement);
}

function drawScene(world) {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /*if (objVertexTextureCoordBuffer[0] == null || objVertexPositionBuffer[0] == null || objVertexTextureCoordBuffer[1] == null || objVertexPositionBuffer[1] == null) {
        return;
    }*/

    mat4.perspective(pMatrix, degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);    
	
	var a=0;
	//Set all buffers and invoke all draws
	for(var i=1; i<objects.length; i++){
		for(var ii=0; ii<objects[i].textures.length; ii++){
			mat4.identity(mvMatrix);
			
			mat4.rotateX(mvMatrix, mvMatrix, -pitch);
     		mat4.rotateY(mvMatrix, mvMatrix, -yaw);
			
		    if(objects[i].name.substr(0, 9).toLowerCase() == 'dodgeball'){
			    mat4.translate(mvMatrix, mvMatrix, world.balls[0] ? world.balls[0].getPosition() : [0,0,0]);
		    }else if(objects[i].name.substr(0, 6) == 'player'){
		    	//Don't want to move players
		    }else if(objects[i].name.substr(0, 3).toLowerCase() == 'map'){
			    mat4.translate(mvMatrix, mvMatrix, [-cameraPos[0], -(cameraPos[1]+ crouchingDelta), -cameraPos[2]]);
		    }
		    
	        gl.bindBuffer(gl.ARRAY_BUFFER, objects[i].objVertexTextureCoordBuffer[ii]);
			gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, objects[i].objVertexTextureCoordBuffer[ii].itemSize, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, objects[i].objVertexPositionBuffer[ii]);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, objects[i].objVertexPositionBuffer[ii].itemSize, gl.FLOAT, false, 0, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture[a]); 
			gl.uniform1i(shaderProgram.samplerUniform, 0);
			
			setMatrixUniforms();
			
			gl.drawArrays(gl.TRIANGLES, 0, objects[i].objVertexPositionBuffer[ii].numItems);
			
			a++;
		}
	}
}

function tick(world) {
	//xPosBall -= .001;
    //zPosBall -= 0;
    requestAnimFrame(tick.bind(null, world));
    handleMotion(world);
    drawScene(world);
}

function webGLStart() {
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
	
	var balls;
	var players;
		
	var canvas = document.getElementById("webGL");
    initGL(canvas);
    initShaders();
    objjs.loadObject('glMap', function(){
		balls = initBalls();
		players = initPlayers();
		var world = {
			balls: balls,
			players: players
		};
		tick(world);
	});
    objjs.initTexture('glMap', gl);

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
	
    //tick(world);
}
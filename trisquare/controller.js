"use strict";
function onMouseMove(e){
	//Movement event often gets stuck on a 1 or -1 so camera just keeps rotating, ignore for now
	var moveX = e.webkitMovementX;
	var moveY = e.webkitMovementY;
	moveX = (Math.abs(moveX) == 1 ? 0 : moveX);
	moveY = (Math.abs(moveY) == 1 ? 0 : moveY);
	
	//For now, cameraPan values represent the percentage of the viewport that has been transversed by input (i.e. mouse)
	cameraPan[0] = moveX / gl.viewportWidth;
	cameraPan[1] = moveY / gl.viewportHeight;
}

var currentlyPressedKeys = {};
var motion = {};
function handleKeyDown(event){
	currentlyPressedKeys[event.which] = true;
	
	switch(event.which){
		case 87: // "W"
			motion.forward = true;
			break;
		
		case 83: // "S"
			motion.backward = true;
			break;
			
		case 65: // "A"
			motion.strafeLeft = true;
			break;
			
		case 68: // "D"
			motion.strafeRight = true;
			break;
			
		case 17: // Ctrl
			motion.crouching = true;
			break;
	}
}

function handleKeyUp(event){
	delete currentlyPressedKeys[event.which];
	
	switch(event.which){
		case 87: // "W"
			motion.forward = false;
			break;
		
		case 83: // "S"
			motion.backward = false;
			break;
			
		case 65: // "A"
			motion.strafeLeft = false;
			break;
			
		case 68: // "D"
			motion.strafeRight = false;
			break;
			
		case 17: // Ctrl
			motion.crouching = false;
			break;
	}
}

function loadObject(path, callback) {
	var request = new XMLHttpRequest();
	request.open("GET", path);
	request.onreadystatechange = function () {
		if (request.readyState == 4) {
			callback(request.responseText);
		}
	}
	request.send();
}
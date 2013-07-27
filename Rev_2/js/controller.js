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
		case 38: // "forward arrow"
			motion.forward = true;
			break;

		case 83: // "S"
		case 40: // "backward arrow"
			motion.backward = true;
			break;

		case 65: // "A"
		case 37: // "left arrow"
			motion.strafeLeft = true;
			break;

		case 68: // "D"
		case 39: // "right arrow"
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
		case 38: // "forward arrow"
			motion.forward = true;
			break;

		case 83: // "S"
		case 40: // "backward arrow"
			motion.backward = true;
			break;

		case 65: // "A"
		case 37: // "left arrow"
			motion.strafeLeft = true;
			break;

		case 68: // "D"
		case 39: // "right arrow"
			motion.strafeRight = true;
			break;

		case 17: // Ctrl
			motion.crouching = true;
			break;
	}
}
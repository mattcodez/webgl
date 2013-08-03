"use strict";
var Ball = function(origProps){
	this.origProps = origProps;
	
	this.velocity = [0, 0, 0];
	this.position = [];
	
	this.fireMagnitude = [0.08, 0.08, 0.08];
};

Ball.prototype = {};

Ball.prototype.fireFromTo = function (start, towards){
	//start -> location ball spawns at
	//towards -> direction the ball moves in
	
	if (this.isMoving()){
		return; //Can't fire if we're already moving
	}
	
	this.position = start.slice(0);
	
	var direction = vec3.create();
	vec3.subtract(direction, start, towards);
	vec3.normalize(direction, direction);
	var velocity = vec3.create();
	vec3.multiply(velocity, direction, this.fireMagnitude);
};

//Move based on current velocity, to be fired with engine tick
Ball.prototype.move = function (){
	if (!this.isMoving()){
		return; //Not moving so don't bother with math
	}
	else {
		vec3.add(this.position, this.position, this.velocity);
	}
};

Ball.prototype.applyGravity = function (g){
	//g -> gravity vector
	if (this.isMoving()){
		vec3.add(this.velocity, this.velocity, g);
	}
};

//I'm intending for the game to use this for collision detection
Ball.prototype.getPosition = function (){
	return this.position.slice(0); //Send a copy of the array
};

Ball.prototype.isMoving = function (){
	var v = this.velocity;
	return !(v[0] == v[1] == v[2] == 0);
};
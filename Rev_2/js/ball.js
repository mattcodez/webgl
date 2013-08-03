"use strict";
Ball = function(){
	this.velocity = [0, 0, 0];
	this.position = [];
	
	this.fireMagnitude = [1.4, 1.4, 1.4];
};

Ball.prototype = {};

Ball.prototype.fireFromTo = function (start, towards){
	//start -> location ball spawns at
	//towards -> direction the ball moves in
	
	this.position = start.slice(0);
	
	var direction;
	vec3.subtract(direction, start, towards);
	vec3.normalize(direction, direction);
	var velocity;
	vec3.multiply(velocity, direction, this.fireMagnitude);
};

//Move based on current velocity, to be fired with engine tick
Ball.prototype.move = function (){
	vec3.add(this.position, this.position, this.velocity);
};

Ball.prototype.applyGravity = function (g){
	//g -> gravity vector
	vec3.add(this.velocity, this.velocity, g);
};

//I'm intending for the game to use this for collision detection
Ball.prototype.getPosition = function (){
	return this.position.slice(0); //Send a copy of the array
};
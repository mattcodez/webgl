"use strict";
var Player = function(){	
	this.height = null;
	this.speed = 1;
	this.cameraPos = [];
	this.lives = null;
	this.name = 'player1';
	this.height = null;
	this.score = null;
};

Player.prototype = {};

Player.prototype.jump = function(env){
	//Really simple jumping
	var jumpHeight = 3;
	if (motion.jumpUp || motion.hitGround == false){
		//console.log(objects[1].cameraPos[0][1] - objects[1].cameraPos[50][1]);
		if ((cameraPos[1] <= env.floor || cameraPos[1] < jumpHeight) && motion.jumpUp){
			vec3.add(env.allMovement, env.allMovement, [0, 0.2, 0]);
		}
		else{
			motion.jumpUp = false;
		}
		if(cameraPos[1] <= env.floor){
			motion.hitGround = true;
		}
	}
}

Player.prototype.fireBall = function(){
	//Mattcodez is currently working on functionality
}

Player.prototype.crouch = function(){
	return motion.crouching ? -0.5 : 0;
}
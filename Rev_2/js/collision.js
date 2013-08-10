"use strict";
var Collision = function(obj){
	this.obj = obj;
	
	this.container = null;
};

Collision.prototype = {};

Collision.prototype.init = function(){
	this.setContainer();
	
	
}

Collision.prototype.checkCollision = function(o1, o2){
	if(o1.position[0] == 0
}

Collision.prototype.setContainer = function(){
	for(var i=0; i<this.obj.length; i++){
		if(this.obj[i].name.substr(0, 3).toLowerCase() == 'map'){
			this.container = obj[i];
		}
	}
}
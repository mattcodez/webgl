"use strict";
var objjs = {};
objjs.loadOBJ = function loadOBJ(data){
	var lines = data.split("\n");
	var vertexCount1 = 0;
	var vertexCount2 = 0;
	var vertexPositions1 = [];
	var vertexPositions2 = [];
	var vertexTextureCoords1 = [];
	var vertexTextureCoords2 = [];
	var vX = [];
	var vY = [];
	var vZ = [];
	var vtX = [];
	var vtY = [];
	var vCount = 0;
	var vtCount = 0;
	
	for(var i=0; i<lines.length; i++){
		var vals = lines[i].split(" ");
		
		if(vals[0] == 'usemtl' && vals[1] != 'FrontColor'){
			allTex.push(vals[1]);
		}
		if(vals[0] == 'v'){
			vX[vCount] = vals[1];
			vY[vCount] = vals[2];
			vZ[vCount] = vals[3];
			
			vCount++;
		}
		if(vals[0] == 'vt'){
			vtX[vtCount] = vals[1];
			vtY[vtCount] = vals[2];
			
			vtCount++;
		}
	}
	
	for(var i=0; i<lines.length; i++){
		var vals = lines[i].split(" ");
		if(vals[0] == 'usemtl' && vals[1] != 'FrontColor'){
			allTexCount++;
			allTexLength.push(0);
		}
		if(vals[0] == 'f'){
			for(var ii=1; ii<vals.length; ii++){
				var val = vals[ii].split("/");
				console.log(vertexCount1+vertexCount2
					 +' - '+parseFloat(vX[(val[0]-1)])
					 +' - '+parseFloat(vY[(val[0]-1)])
					 +' - '+parseFloat(vZ[(val[0]-1)])
					 +' - '+parseFloat(vtX[(val[1]-1)])
					 +' - '+parseFloat(vtY[(val[1]-1)]));
				if(allTex[allTexCount] == 'Metal_Brass_Ceiling'){
					vertexPositions1.push(parseFloat(vX[(val[0]-1)]));
					vertexPositions1.push(parseFloat(vY[(val[0]-1)]));
					vertexPositions1.push(parseFloat(vZ[(val[0]-1)]));
				
					vertexTextureCoords1.push(parseFloat(vtX[(val[1]-1)]));
					vertexTextureCoords1.push(parseFloat(vtY[(val[1]-1)]));
					
					vertexCount1 += 1;

					vertexTextureCount1++;
				}
				if(allTex[allTexCount] == 'Metal_Steel_Textured_White'){
					vertexPositions2.push(parseFloat(vX[(val[0]-1)]));
					vertexPositions2.push(parseFloat(vY[(val[0]-1)]));
					vertexPositions2.push(parseFloat(vZ[(val[0]-1)]));
					
					vertexTextureCoords2.push(parseFloat(vtX[(val[1]-1)]));
					vertexTextureCoords2.push(parseFloat(vtY[(val[1]-1)]));
					
					vertexCount2 += 1;
					
					vertexTextureCount2++;
				}
				
				allTexLength[(allTexLength.length-1)]++;
			}
		}
	}
	
	return [
		{
			verticies: 		vertexPositions1,
			vertexCount:	vertexCount1,
			textureCoords: 	vertexTextureCoords1,
			texture:		'Metal_Brass_Ceiling'
		},
		{
			verticies: 		vertexPositions2,
			vertexCount:	vertextCount2,
			textureCoords: 	vertexTextureCoords2,
			texture:		'Metal_Steel_Textured_White'
		}
	];
};

//Get material names and paths
objjs.loadMatl = function loadMatl(data){
	var materialData = data.match(/^newmtl .*|^map_Kd .*/g);
	var materials = {};
	
	for (var i = 0; i < materialData.length; i++){
		var line = materialData[i].split(' ');
		if (line[0] == 'newmtl'){
			var lastName = line[1];
		}
		else { //assume map_Kd for our path
			materials[lastName] = line[1];
		}
	}
	
	return materials;
};
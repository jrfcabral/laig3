/**
 * circle
 * @constructor
 */
 function circle(scene, slices) {
 	CGFobject.call(this,scene);
	
	this.slices=slices;

 	this.initBuffers();
 };

 circle.prototype = Object.create(CGFobject.prototype);
 circle.prototype.constructor = circle;

 circle.prototype.initBuffers = function() {
 	

 	this.vertices = [];
 	this.indices = [];
 	this.normals = [];
 	this.texCoords = [];
 	var ang = 2*Math.PI/this.slices;
	

 	for(var i = 0; i < this.slices; i++){
 		var x = Math.cos(ang*i);
 		var y = Math.sin(ang*i);
 		this.vertices.push(x, y, 0);
	
 		this.normals.push(0, 0, 1);
 		this.texCoords.push(0.5*x+0.5, -0.5*y+0.5);
 	}
 
	this.vertices.push(0, 0, 0);
	this.normals.push(0, 0, 1);
	this.texCoords.push(0.5, 0.5);

	//clock face
	for(var i = 0; i < this.slices; i++){
		if(i == this.slices-1){
			this.indices.push(this.slices, i, 0);
			continue;
		}
		this.indices.push(this.slices, i, i+1);
	}

	
	

 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };

circle.prototype.updateTexCoords = function(texture){
	
}
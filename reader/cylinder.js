/**
 * cylinder
 * @constructor
 */
 /*
 * I have assumed the origin of the cylinder to be the center and it will grow up (y+)
 */
 function cylinder(scene, height, br, tr, stacks, slices) {
 	CGFobject.call(this,scene);
	
	this.height = height;
	this.br = br;
	this.tr = tr;
	this.slices=slices;
	this.stacks=stacks;//+1;
	
 	this.initBuffers();
 };

 cylinder.prototype = Object.create(CGFobject.prototype);
 cylinder.prototype.constructor = cylinder;

 cylinder.prototype.updateTexCoords = function(texture){
	
}

 cylinder.prototype.initBuffers = function() {
 	

 	this.vertices = [];
 	this.indices = [];
 	this.normals = [];
 	this.texCoords = [];
 	var ang = 2*Math.PI/this.slices;


	for(var i = 0; i <= this.stacks; i++){
		var radius = this.br + ((this.tr - this.br)/this.stacks)*i;
		for(var j = 0; j <= this.slices; j++){
			var x = Math.cos(ang*j)*radius; 
			var z = i * this.height/this.stacks;
			var y = Math.sin(ang*j)*radius; 

			this.vertices.push(x, y, z);
			this.normals.push(x, 0, z);
			this.texCoords.push(j/this.slices, i/this.stacks);
		}
		
	}

	
	for(var i = 0; i < this.stacks; i++){
		for(var j = 0; j < this.slices; j++){
			this.indices.push( (i*(this.slices+1))+j, i*(this.slices+1)+j+1,  (i+1)*(this.slices+1)  +j);
			this.indices.push(i*(this.slices+1)+j+1,(i+1)*(this.slices+1)  +j+1 , (i+1)*(this.slices+1)  +j )
			this.indices.push((i+1)*(this.slices+1)  +j , i*(this.slices+1)+j+1,  (i*(this.slices+1))+j);
			this.indices.push((i+1)*(this.slices+1)  +j,(i+1)*(this.slices+1)  +j+1 ,  i*(this.slices+1)+j+1)
		}
	}



	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();

 };
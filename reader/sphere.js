function sphere(scene, radius, stacks, slices){
    CGFobject.call(this,scene);

    this.radius = radius;
    this.stacks = stacks;
    this.slices = slices;
    this.initBuffers();
}

sphere.prototype = Object.create(CGFobject.prototype);
sphere.prototype.constructor = sphere;


sphere.prototype.updateTexCoords = function(texture){
	
}

sphere.prototype.initBuffers = function() { 	
    
 	this.vertices = [];
 	this.indices = [];
 	this.normals = [];
 	this.texCoords = [];

    var ang = 2*Math.PI/this.slices;
 	var ang2 = Math.PI/this.stacks;

 	for(var i = 0; i <= this.stacks; i++){
 	  for(var j = 0; j <= this.slices; j++){
 	    var x = Math.cos(ang*j)*this.radius*Math.sin(ang2*i);
 	    var y = Math.sin(ang*j)*this.radius*Math.sin(ang2*i);
 	    var z = Math.cos(ang2*i)*this.radius;

 	    this.vertices.push(x, y, z);
 	  
			this.normals.push(x, 0, z);
			this.texCoords.push(j/this.slices, i/this.stacks);
		}
		
	}

	
	for(var i = 0; i < this.stacks; i++){
		for(var j = 0; j < this.slices; j++){
			this.indices.push( (i+1)*(this.slices+1)  +j, i*(this.slices+1)+j+1,   (i*(this.slices+1))+j);
			this.indices.push((i+1)*(this.slices+1)  +j,(i+1)*(this.slices+1)  +j+1 ,  i*(this.slices+1)+j+1 )
		}
	}



	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();

 };
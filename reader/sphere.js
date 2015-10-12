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

 //	console.log(this.stacks);
 	var stackDivs = Math.PI /this.stacks;
 	var sliceDivs = (2 * Math.PI) /this.slices;

    for(var stack = 0; stack <= this.stacks; stack++){
        var stackAngle = stack * stackDivs;//phi

        for(var slice = 0; slice <= this.slices; slice++){
            var sliceAngle = slice*sliceDivs;//theta
            var x = Math.cos(stackAngle)*Math.sin(sliceAngle);
            var y = Math.cos(sliceAngle);
            var z = Math.sin(stackAngle)*Math.sin(sliceAngle);

            this.vertices.push(this.radius*x, this.radius*y, this.radius*z);
            this.normals.push(x,y,z);            
        }
    }

    for(var stack = 0; stack < this.stacks; stack++){
        for(var slice = 0; slice < this.slices; slice++){
            var ref = (stack * (this.slices +1 )) + slice;   
            this.indices.push( ref, ref + this.slices + 1, ref+1);
            this.indices.push( ref+this.slices+1, ref+this.slices+2, ref+1);

           this.indices.push(  ref + this.slices + 1,ref, ref+1);
           this.indices.push(  ref+this.slices+2,ref+this.slices+1, ref+1);


        }
    }
      
	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();

 };
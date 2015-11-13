
/** Represents a plane with nrDivs divisions along both axis, with center at (0,0) */
function Plane(scene, nrDivs,  minS, maxS, minT, maxT) {
	CGFobject.call(this,scene);

	
	this.minS = minS || 0;
	this.minT = minT || 0;
	this.maxT = maxT || 1;
	this.maxS = maxS || 1;
	
	nrDivs = typeof nrDivs !== 'undefined' ? nrDivs : 1;

	this.nrDivs = nrDivs;
	this.patchLength = 1.0 / nrDivs;

	this.initBuffers();
};

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor = Plane;

 Plane.prototype.updateTexCoords = function(texture){
	
}

Plane.prototype.initBuffers = function() {
	/* example for nrDivs = 3 :
	(numbers represent index of point in vertices array)

	        y
        	^
	        |
	0    1  |  2    3
	        |
	4	 5	|  6    7
	--------|--------------> x
	8    9  |  10  11
	        |
	12  13  |  14  15    

	*/

	// Generate vertices and normals 
	this.vertices = [];
	this.normals = [];
	
	// Uncomment below to init texCoords
	this.texCoords = [];

	var yCoord = 0.5;
	var yTex = this.minT;
	for (var j = 0; j <= this.nrDivs; j++) 
	{
		var xCoord = -0.5;
		var xTex = this.minS;
		for (var i = 0; i <= this.nrDivs; i++) 
		{
			this.vertices.push(xCoord, 0, yCoord);
			
			// As this plane is being drawn on the xy plane, the normal to the plane will be along the positive z axis.
			// So all the vertices will have the same normal, (0, 0, 1).
			
			this.normals.push(0,1,0);

			// texCoords should be computed here; uncomment and fill the blanks
			this.texCoords.push(xTex,yTex);

			xCoord += this.patchLength;
			xTex += (this.maxS-this.minS)/this.nrDivs;
		}
		yCoord -= this.patchLength;
		yTex += (this.maxT-this.minT)/this.nrDivs;
	}
	
	// Generating indices
	/* for nrDivs = 3 output will be 
		[
			 0,  4, 1,  5,  2,  6,  3,  7, 
			    7,  4,
			 4,  8, 5,  9,  6, 10,  7, 11,
			   11,  8,
			 8, 12, 9, 13, 10, 14, 11, 15,
		]
	Interpreting this index list as a TRIANGLE_STRIP will draw rows of the plane (with degenerate triangles in between. */

	this.indices = [];
	var ind=0;

	for (var j = 0; j < this.nrDivs; j++) 
	{
		for (var i = 0; i < this.nrDivs; i++) 
		{
			this.indices.push(ind, ind+this.nrDivs+1, ind+1);
			this.indices.push(ind+1, ind+this.nrDivs+1, ind+this.nrDivs+2 );

			ind++;
		}
		ind++;
	}
	
	this.primitiveType = this.scene.gl.TRIANGLES;

/* Alternative with TRIANGLES instead of TRIANGLE_STRIP. More indices, but no degenerate triangles */
/*
	for (var j = 0; j < this.nrDivs; j++) 
	{
		for (var i = 0; i < this.nrDivs; i++) 
		{
			this.indices.push(ind, ind+this.nrDivs+1, ind+1);
			this.indices.push(ind+1, ind+this.nrDivs+1, ind+this.nrDivs+2 );

			ind++;
		}
		ind++;
	}

	this.primitiveType = this.scene.gl.TRIANGLES;
*/

	this.initGLBuffers();
};


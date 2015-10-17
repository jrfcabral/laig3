/**
 * triangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

function triangle(scene, p1, p2, p3) {
	CGFobject.call(this,scene);

	this.p1 = p1;
	this.p2 = p2;
	this.p3 = p3;

	//precompute some distances
	this.a = Math.sqrt( Math.pow(p2[0]-p3[0], 2) +  Math.pow(p2[1]-p3[1], 2) + Math.pow(p2[2]-p3[2], 2) );
	this.b = Math.sqrt( Math.pow(p3[0]-p2[0], 2) +  Math.pow(p3[1]-p2[1], 2) + Math.pow(p3[2]-p2[2], 2) );
	this.c = Math.sqrt( Math.pow(p1[0]-p2[0], 2) +  Math.pow(p1[1]-p2[1], 2) + Math.pow(p1[2]-p2[2], 2) );

	//precompute some angles
	this.cosalpha = (-Math.pow(this.a,2) + Math.pow(this.b,2) - Math.pow(this.c, 2))/(2*this.b*this.c);
	this.cosbeta = (Math.pow(this.a,2) - Math.pow(this.b,2) + Math.pow(this.c, 2))/(2*this.a*this.c);
	this.cosgamma = (-Math.pow(this.a,2) + Math.pow(this.b,2) - Math.pow(this.c, 2))/(2*this.b*this.a);
	this.sinbeta = Math.sqrt(1 - Math.pow(this.cosbeta, 2));

	//precompute some texture coordinates before scale factors are applied
	//these do not need to be recalculated for each texture
	this.topX = (this.c - this.a*this.cosbeta);
	this.topY = (this.a*this.sinbeta);
	

	this.initBuffers();
};

triangle.prototype = Object.create(CGFobject.prototype);
triangle.prototype.constructor=triangle;

triangle.prototype.updateTexCoords = function(texture){
	scale_s = texture.ampFactor[0];
	scale_t = texture.ampFactor[1];
	
	this.texCoords = [
	0,0,
	this.c/scale_s, 0,
	this.topX/scale_s, this.topY/scale_t
	];
		
	this.updateTexCoordsGLBuffers();

}

triangle.prototype.initBuffers = function () {
this.vertices = [
        this.p1[0], this.p1[1], this.p1[2],
       this.p2[0], this.p2[1], this.p2[2],
       this.p3[0], this.p3[1], this.p3[2]
			];
			
	this.indices = [
            0, 1, 2, 		
        ];

    this.normals = [
    0,0,1,
    0,0,1,
    0,0,1
    ];
	
	this.primitiveType=this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};
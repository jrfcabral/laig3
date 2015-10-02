/**
 * triangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

function triangle(scene, p1, p2, p3, minS, maxS, minT, maxT) {
	CGFobject.call(this,scene);
	
	this.minS = minS || 0;
	this.minT = minT || 0;
	this.maxT = maxT || 1;
	this.maxS = maxS || 1;

	this.p1 = p1;
	this.p2 = p2;
	this.p3 = p3;
	this.initBuffers();
};

triangle.prototype = Object.create(CGFobject.prototype);
triangle.prototype.constructor=triangle;

triangle.prototype.initBuffers = function () {
this.vertices = [
        this.p1[0], this.p1[1], this.p1[2],
       this.p2[0], this.p2[1], this.p2[2],
       this.p3[0], this.p3[1], this.p3[2]
			];
			
	this.indices = [
            0, 1, 2, 
			2, 1, 0
        ];

    this.normals = [
    0,0,1,
    0,0,1,
    0,0,1
    ];

    this.texCoords = [
    this.minS,this.maxT,
    this.maxS,this.maxT,
    this.minS, this.minT,
    this.maxS,this.minT
    ];
	
	this.primitiveType=this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};
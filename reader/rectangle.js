/**
 * rectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

 /*
 * It might be pertinent to have the parser check if the coordinates are legal 
 * (if the bottom right is not higher than the top left), for example.
 */
function rectangle(scene, lt, br, minS, maxS, minT, maxT) {
	CGFobject.call(this,scene);
	
	this.minS = minS || 0;
	this.minT = minT || 0;
	this.maxT = maxT || 1;
	this.maxS = maxS || 1;

	this.lt = lt;
	this.br = br;
	this.initBuffers();
};

rectangle.prototype = Object.create(CGFobject.prototype);
rectangle.prototype.constructor=rectangle;

rectangle.prototype.initBuffers = function () {
this.vertices = [
          this.lt[0], this.br[1], 0,
            this.br[0], this.br[1], 0,
            this.lt[0], this.lt[1], 0,
            this.br[0], this.lt[1], 0,
			];
			
	this.indices = [
            0, 1, 2, 
			3, 2, 1,

        ];

    this.normals = [
    0,0,1,
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
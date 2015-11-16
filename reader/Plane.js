
/** Represents a plane with nrDivs divisions along both axii, with center at (0,0) */
function Plane(scene, nrDivs) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.nrDivs = nrDivs;
    var controlpoints = [[[-0.5,0,-0.5,1],[-0.5,0,0.5,1]],
                         [[0.5,0,-0.5,1],[0.5,0,0.5,1]]                         
                         ];
    var nurbSurface = new CGFnurbsSurface(1,1,[0, 0, 1, 1],[0, 0, 1, 1],controlpoints);

    this.getSurfacePoint = function(u,v){
        return nurbSurface.getPoint(u,v);
    }

    this.object = new CGFnurbsObject(this.scene, this.getSurfacePoint, nrDivs, nrDivs);
}
;

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor = Plane;



Plane.prototype.display = function(){
    this.object.display();
}

Plane.prototype.updateTexCoords = function(texture) {

}
;
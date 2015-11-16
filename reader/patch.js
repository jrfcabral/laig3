/**
Represents a Bezier patch with order order, partsV divisions along the V coordinate, partsU divisions
along the U coordinate and following control points controlvector
*/
function patch(scene, order, partsU, partsV, controlvector){
    CGFobject.call(this,scene);
    this.scene = scene;
    this.order = order;
    this.partsV = partsV;
    this.partsU = partsU;
    this.controlvector = controlvector;

    //create standard knot vector with (degree+1) * 2 nodes
    var knots = [];
    for(i = 0; i <= order; i++)
        knots.push(0);
    for(i = 0; i <= order; i++)
        knots.push(1);

     
    //create surface and point evaluator function
    var nurbSurface = new CGFnurbsSurface(order, order, knots, knots, controlvector);

    this.getSurfacePoint = function(u,v){
       return nurbSurface.getPoint(u,v);
    }

    //create nurb object
    this.nurbObject = new CGFnurbsObject(this.scene, this.getSurfacePoint, this.partsU, this.partsV);
}

patch.prototype = Object.create(CGFobject.prototype);
patch.prototype.constructor = patch;

patch.prototype.display = function(){
    this.nurbObject.display();
};

patch.prototype.updateTexCoords = function(){};
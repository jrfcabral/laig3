function CircularAnimation(span, center, radius, start, rot){
    this.span = span*1000;
    this.center = center;
    this.radius = radius;
    this.start = start;
    this.rot = rot;
    this.dist = 0;
    this.compute();
}

CircularAnimation.prototype.compute = function(){
    this.dist = 2*Math.PI*this.radius * ((this.rot*(Math.PI/180))/2*Math.Pi);


}

CircularAnimation.prototype.update = function(startDate, node){
    var elapsed = Date.now() - startDate;
    Date;
    

    var percentageComplete = elapsed/this.span;

    var currentAngle = this.start + this.rot*percentageComplete;

    var matrix = mat4.create();
    mat4.identity(matrix);
    mat4.translate(matrix, matrix, this.center);


    if(elapsed >= this.span){
        mat4.translate(matrix, matrix, [this.radius*Math.cos((this.start+this.rot)*(Math.PI/180)), 0, -(this.radius*Math.sin((this.start+this.rot)*(Math.PI/180)))]);
        /*var vect = [this.radius*Math.cos((this.start+this.rot)*(Math.PI/180))-this.center[0], 0-this.center[1], -(this.radius*Math.sin((this.start+this.rot)*(Math.PI/180)))-this.center[2]];
        var rotAng = Math.sin(vect[0]/Math.sqrt(vect[0]*vect[0] + vect[2]*vect[2]))+90;
        var vector = vec3.create();
        vec3.set(vector, 0, 1, 0);
        mat4.rotate(matrix, matrix, rotAng, vector);*/
        return ["done", matrix];
    }

    mat4.translate(matrix, matrix, [this.radius*Math.cos(currentAngle*(Math.PI/180)), 0, -(this.radius*Math.sin(currentAngle*(Math.PI/180)))]);

    /*var vect = [this.radius*Math.cos(currentAngle*(Math.PI/180))-this.center[0], 0-this.center[1], -(this.radius*Math.sin(currentAngle*(Math.PI/180)))-this.center[2]];
    var rotAng = Math.sin(vect[0]/Math.sqrt(vect[0]*vect[0] + vect[2]*vect[2]))+90;
    var vector = vec3.create();
    vec3.set(vector, 0, 1, 0);
    mat4.rotate(matrix, matrix, rotAng, vector);*/

    return [0, matrix];
}
CircularAnimation.prototype = new Animation();
CircularAnimation.prototype.constructor = CircularAnimation;
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
    
    

    var percentageComplete = elapsed/this.span;

    var currentAngle = this.start + this.rot*percentageComplete;

    var matrix = mat4.create();
    mat4.identity(matrix);
    mat4.translate(matrix, matrix, this.center);


    if(elapsed >= this.span){
        mat4.translate(matrix, matrix, [this.radius*Math.cos((this.start+this.rot)*(Math.PI/180)), 0, -(this.radius*Math.sin((this.start+this.rot)*(Math.PI/180)))]);
        var vect = [this.radius*Math.cos(currentAngle*(Math.PI/180))-this.center[0], 0-this.center[1], -(this.radius*Math.sin(currentAngle*(Math.PI/180)))-this.center[2]];
        var rotAng = (Math.acos(vect[0]/this.radius)*180)/Math.PI+90;
        //console.log(rotAng);
        var vector = vec3.create();
        vec3.set(vector, 0, 1, 0);
        if(this.rot > 0)
            mat4.rotate(matrix, matrix, rotAng*(Math.PI/180), vector);
        else{
            mat4.rotate(matrix, matrix, -rotAng*(Math.PI/180), vector);
        }
        return ["done", matrix];
    }

    mat4.translate(matrix, matrix, [this.radius*Math.cos(currentAngle*(Math.PI/180)), 0, -(this.radius*Math.sin(currentAngle*(Math.PI/180)))]);

    var vect = [this.radius*Math.cos(currentAngle*(Math.PI/180))-this.center[0], 0-this.center[1], -(this.radius*Math.sin(currentAngle*(Math.PI/180)))-this.center[2]];
    
    var rotAng = (Math.acos(vect[0]/this.radius)*180)/Math.PI+90;
    //console.log(rotAng);
    var vector = vec3.create();
    vec3.set(vector, 0, 1, 0);
    
    if(this.rot > 0)
        mat4.rotate(matrix, matrix, rotAng*(Math.PI/180), vector);
    else{
        mat4.rotate(matrix, matrix, -rotAng*(Math.PI/180), vector);
    }

    return [0, matrix];
}
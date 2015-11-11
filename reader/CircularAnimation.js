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
    if(elapsed >= this.span){
        return "done";
    }

    var percentageComplete = elapsed/this.span;

    var currentAngle = this.start + this.rot*percentageComplete;

    var matrix = mat4.create();
    mat4.identity(matrix);
    console.log(this.radius*Math.cos(currentAngle*(Math.PI/180)));
    console.log(this.radius*Math.sin(currentAngle*(Math.PI/180)));
    console.log(this.start);
    mat4.translate(matrix, matrix, [this.radius*Math.cos(currentAngle*(Math.PI/180))+this.center[0], 0+this.center[1], -this.radius*Math.sin(currentAngle*(Math.PI/180))+this.center[2]]);

    return matrix;
}
function LinearAnimation(node, span, points){
    this.span = span;
    this.points = points;
    this.node = node;
    this.speeds = this.computeSpeeds();
    this.currentTrajectory = 0;
}

LinearAnimation.prototype.computeSpeeds = function(){
    var speeds = [];
    for(var i = 0; i < this.points.length-1; i++){
        //calc distance between points
        this.dist = Math.sqrt((this.points[i+1][0])*(this.points[i][0]) + (this.points[i+1][1])*(this.points[i][1]) + (this.points[i+1][2])*(this.points[i][2]));
        
        //define update speed
        //ta male isto pq tem q se ter em conta a distancia de cada trajeto
        var speed = dist/(span/this.points.length-1);   
    }

    return speeds;

}

LinearAnimation.prototype.update(){
    mat4.translate(this.node.matrix, this.node.matrix, this.dist);
}
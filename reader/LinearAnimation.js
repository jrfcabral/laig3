function LinearAnimation(node, span, points){
    this.span = span;
    this.points = points;
    this.node = node;
    this.speed = this.computeSpeeds();
    this.currentTrajectory = 0;
    this.dists = [];
    this.vectors = [];
    this.totalDist = 0;
    this.progress = 0;
}

LinearAnimation.prototype.computeSpeeds = function(){
    for(var i = 0; i < this.points.length-1; i++){
        //calc distance between points
        var dist = Math.sqrt((this.points[i+1][0] - this.points[i][0])*(this.points[i+1][0] - this.points[i][0]) + 
                            (this.points[i+1][1] - this.points[i][1])*(this.points[i+1][1] - this.points[i][1]) +
                            (this.points[i+1][2]-this.points[i][2])*(this.points[i+1][2]-this.points[i][2]));
        this.totalDist += this.dist;
        this.dists.push(dist);
        this.vectors.push([(this.points[i+1][0] - this.points[i][0]), (this.points[i+1][1] - this.points[i][1]), (this.points[i+1][2]-this.points[i][2])]);
        
    }
     var speed = this.totalDist/this.span;  
    return speed;

}

LinearAnimation.prototype.update(){
    if(this.dists[this.currentTrajectory] == this.progress){
        this.currentTrajectory++;
        //virar o soce na direçao certa
    }
    if(this.dists[this.currentTrajectory] >= this.progress + this.speed){
         mat4.translate(this.node.matrix, this.node.matrix, [this.vectors[this.currentTrajectory][0]/this.speed, 
                                                                          this.vectors[this.currentTrajectory][1]/this.speed, 
                                                                          this.vectors[this.currentTrajectory][2]/this.speed]);
    }
    else{
        mat4.translate(this.node.matrix, this.node.matrix, [this.vectors[this.currentTrajectory][0]/(this.speed - (this.dists[this.currentTrajectory] - this.progress)), 
                                                            this.vectors[this.currentTrajectory][1]/(this.speed - (this.dists[this.currentTrajectory] - this.progress)), 
                                                            this.vectors[this.currentTrajectory][2]/(this.speed - (this.dists[this.currentTrajectory] - this.progress))]);
    }
}
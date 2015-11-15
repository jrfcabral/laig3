LinearAnimation.prototype = new Animation();
LinearAnimation.prototype.constructor = LinearAnimation;
function LinearAnimation(span, points){
    Animation.call(this, span);
    this.points = points;
    this.dists = [];
    this.vectors = [];
    this.totalDist = 0;
    this.computeSpeeds();
}

LinearAnimation.prototype.computeSpeeds = function(){
    for(var i = 0; i < this.points.length-1; i++){
        //calc distance between points
        var dist = Math.sqrt((this.points[i+1][0] - this.points[i][0])*(this.points[i+1][0] - this.points[i][0]) + 
                            (this.points[i+1][1] - this.points[i][1])*(this.points[i+1][1] - this.points[i][1]) +
                            (this.points[i+1][2]-this.points[i][2])*(this.points[i+1][2]-this.points[i][2]));
        this.totalDist += dist;
        this.dists.push(dist);
        this.vectors.push([(this.points[i+1][0] - this.points[i][0]), (this.points[i+1][1] - this.points[i][1]), (this.points[i+1][2]-this.points[i][2])]);
    }
     var speed = this.totalDist/this.span;
    return speed;

}

/*
Returns a matrix with the necessary translation based on the current time
*/
LinearAnimation.prototype.update = function(startDate,node){
    
    var elapsed = Date.now() - startDate;
    if(elapsed >= this.span){
        var matrix = mat4.create();
        mat4.identity(matrix);
        mat4.translate(matrix, matrix, [this.points[this.points.length-1][0], this.points[this.points.length-1][1], this.points[this.points.length-1][2]]);
        var hipothenuse = Math.sqrt(this.vectors[this.vectors.length-1][0]*this.vectors[this.vectors.length-1][0] + this.vectors[this.vectors.length-1][2]*this.vectors[this.vectors.length-1][2]); 
        var rotAng = (Math.acos(this.vectors[this.vectors.length-1][0]/hipothenuse)*180)/Math.PI;
       
        var vector = vec3.create();
        vec3.set(vector, 0, 1, 0);
        if(this.vectors[this.vectors.length-1][0] > 0 && this.vectors[this.vectors.length-1][2] > 0){ 
            mat4.rotate(matrix, matrix, -rotAng*(Math.PI/180), vector);
        
        } 
        else if(this.vectors[this.vectors.length-1][0] <= 0 && this.vectors[this.vectors.length-1][2] >= 0){ 
            mat4.rotate(matrix, matrix, -rotAng*(Math.PI/180), vector);
        
        }
        else if(this.vectors[this.vectors.length-1][0] > 0 && this.vectors[this.vectors.length-1][2] < 0){ 
            mat4.rotate(matrix, matrix, rotAng*(Math.PI/180), vector);
        
        }
        else if(this.vectors[this.vectors.length-1][0] <= 0 && this.vectors[this.vectors.length-1][2] <= 0){ 
            mat4.rotate(matrix, matrix, rotAng*(Math.PI/180), vector);
         
        }
        
        return ["done", matrix];
     }
    var percentageComplete = elapsed/this.span;

    var distanceTraveled = this.totalDist*percentageComplete;
    var acum = 0;
    var currentTrajectory;
    for(var i = 0; i < this.dists.length; i++){
        acum += this.dists[i];
        if(acum >= distanceTraveled){
            currentTrajectory = i;
            break;
        }
    }
    var distanceTraveledInTrajectory = acum-distanceTraveled;
    var percentageOfTrajectory = distanceTraveledInTrajectory/this.dists[currentTrajectory];

    var matrix = mat4.create();
    mat4.identity(matrix);

    mat4.translate(matrix, matrix, [this.points[currentTrajectory][0], this.points[currentTrajectory][1], this.points[currentTrajectory][2]]);
    
    mat4.translate(matrix, matrix, [this.vectors[currentTrajectory][0]*(1-percentageOfTrajectory),
                                       this.vectors[currentTrajectory][1]*(1-percentageOfTrajectory),
                                       this.vectors[currentTrajectory][2]*(1-percentageOfTrajectory)]);

    

    var hipothenuse = Math.sqrt(this.vectors[currentTrajectory][0]*this.vectors[currentTrajectory][0] + this.vectors[currentTrajectory][2]*this.vectors[currentTrajectory][2]); 
    var rotAng = (Math.acos(this.vectors[currentTrajectory][0]/hipothenuse)*180)/Math.PI;
    
    var vector = vec3.create();
    vec3.set(vector, 0, 1, 0);
    if(this.vectors[currentTrajectory][0] > 0 && this.vectors[currentTrajectory][2] > 0){ 
        mat4.rotate(matrix, matrix, -rotAng*(Math.PI/180), vector);
        
    } 
    else if(this.vectors[currentTrajectory][0] <= 0 && this.vectors[currentTrajectory][2] >= 0){ 
        mat4.rotate(matrix, matrix, -rotAng*(Math.PI/180), vector);
    }
    else if(this.vectors[currentTrajectory][0] > 0 && this.vectors[currentTrajectory][2] < 0){ 
        mat4.rotate(matrix, matrix, rotAng*(Math.PI/180), vector);
    }
    else if(this.vectors[currentTrajectory][0] <= 0 && this.vectors[currentTrajectory][2] <= 0){ 
        mat4.rotate(matrix, matrix, rotAng*(Math.PI/180), vector);
    }
    

    return [0, matrix];
}
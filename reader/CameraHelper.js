function CameraHelper(scene, camera){
    this.scene = scene;
    this.camera = camera;
    this.positions = {
        NORTH: [0 ,1, 2], //[id, ponto a direita, ponto a esquerda]
        EAST: [1, 0, 2],
        SOUTH: [2, 1, 3],
        WEST: [3, 2, 0]   
    };
    this.animating = false;
    this.animInfo = [];
    this.currentPosition = this.positions.EAST;
}

/*CameraHelper.prototype.changePosition = function(newPos){ //can only animate when current animation is done
    if(newPos > this.positions.WEST[0] || newPos < this.positions.NORTH[0] || this.animating || newPos == this.currentPosition){
        return
    }

    if(newPos == this.currentPosition[1]){
        this.animatePointTransition(-Math.PI/2, 1000);
    }
    else if(newPos == this.currentPosition[2]){
        this.animatePointTransition(Math.PI/2, 1000);
    }
    else{
        this.animatePointTransition(Math.PI, 1000);   
    }
}*/ //pode vir a ser usado

CameraHelper.prototype.animatePointTransition = function(angle, time){ //angle in radians, time
    if(!this.animating){
        this.animating = true;
        this.animInfo = [Date.now(), time, angle, 0];
    }

    if(Date.now() - this.animInfo[0] >= this.animInfo[1]){
        this.animating = false;
        this.animInfo = 0;
        return;
    }
    console.log('tou aqui');

    var percentage = (Date.now() - this.animInfo[0])/this.animInfo[1];

    var expectedAngle = this.animInfo[2]*percentage;

    var angleToOrbit = expectedAngle - this.animInfo[3];
    console.log();

    this.camera.orbit(CGFcameraAxisID.Y, angleToOrbit);
    this.animInfo[3] = expectedAngle;
    return;

}
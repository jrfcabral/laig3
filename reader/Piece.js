function Piece(scene){
    this.scene = scene;
    this.toDisplay = true;
    this.obj = new cylinder(scene, 2, 0.5, 0.5, 40, 40);

    this.goldenMat = new CGFappearance(this.scene);
    this.goldenMat.setAmbient(1, 215/255, 0);
    this.goldenMat.setDiffuse(1, 215/255, 0);
    this.goldenMat.setSpecular(1, 215/255, 0);

    this.silverMat = new CGFappearance(this.scene);
    this.silverMat.setAmbient(192/255, 192/255, 192/255);
    this.silverMat.setDiffuse(192/255, 192/255, 192/255);
    this.silverMat.setSpecular(192/255, 192/255, 192/255);
}

Piece.prototype.display = function(mat){
    if(!this.toDisplay){
        return;
    }
    var mat = mat || 0;
    this.scene.pushMatrix();
    
    switch(mat){
        case 0: break;
        case 1: this.goldenMat.apply(); break;
        case 2: this.silverMat.apply(); break;
        default: break;
    }
    this.obj.display();
    
    this.scene.popMatrix();
}
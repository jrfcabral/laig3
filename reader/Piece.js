function Piece(scene){
    this.scene = scene;
    this.toDisplay = true;
    this.head = new sphere(this.scene, 0.5, 40, 40);

    this.goldenMat = new CGFappearance(this.scene);
    this.goldenMat.setAmbient(0, 0, 0);
    this.goldenMat.setDiffuse(1, 215/255, 0);
    this.goldenMat.setSpecular(1, 215/255, 0);

    this.silverMat = new CGFappearance(this.scene);
    this.silverMat.setAmbient(0, 0, 0);
    this.silverMat.setDiffuse(192/255, 192/255, 192/255);
    this.silverMat.setSpecular(192/255, 192/255, 192/255);

    this.flagMat = new CGFappearance(this.scene);
    this.flagMat.setAmbient(254/255*0.1, 153/255*0.1, 0/255*0.1);
    this.flagMat.setDiffuse(254/255, 100/255, 0/255);
    this.flagMat.setSpecular(204/255, 153/255, 0/255);

    this.selectedMat = new CGFappearance(this.scene);
    this.selectedMat.setAmbient(1, 0, 0);
    this.selectedMat.setDiffuse(1, 0, 0);
    this.selectedMat.setSpecular(1, 0, 0);
}

Piece.prototype.display = function(mat){
    if(!this.toDisplay){
        return;
    }
    var mat = mat || 0;
    this.scene.pushMatrix();
    
    this.scene.rotate(Math.PI/2, 1, 0, 0);
    this.scene.scale(0.4, 0.4, 0.4);
    switch(mat){
        case 0: break;
        case 1: this.goldenMat.apply(); break;
        case 2: this.silverMat.apply(); break;
        case 3: this.flagMat.apply(); break;
        case 4: this.selectedMat.apply(); break;
        default: break;
    }

    this.scene.pushMatrix();
    this.scene.translate(1.5, -0, 0.65);
    this.scene.graph.leaves["patch1"].object.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-1.5, 0, -0.55); 
    this.scene.rotate(Math.PI, 0, 1, 0);
    this.scene.graph.leaves["patch1"].object.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0, 3, 0);
    this.scene.scale(1.2, 1.2, 1.2);
    this.head.display();
    this.scene.popMatrix();

    this.scene.popMatrix();
}
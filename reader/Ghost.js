function Ghost(scene, id){
    this.scene = scene;
    this.rect = new rectangle(scene, [-0.5, 0.5],[0.5, -0.5]);
    this.cyl = new cylinder(scene, 2, 0.5, 0.5, 40, 40);
    this.id = id;
}

Ghost.prototype.display = function(){
    if(this.scene.pickMode == true){
        this.scene.pushMatrix();
        this.scene.registerForPick(this.id, this.rect);
        this.scene.registerForPick(this.id, this.cyl);
        this.rect.display();
        this.cyl.display();
        this.scene.clearPickRegistration();
        this.scene.popMatrix();
    }
}
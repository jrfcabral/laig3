function Ghost(scene, id){
    this.scene = scene;
    this.x = Math.floor(id/1000);
    this.y = Math.floor(id % 1000)-1;
    this.rect = new rectangle(scene, [-0.5, 0.5],[0.5, -0.5]);
    this.cyl = new cylinder(scene, 1.1, 0.45, 0.25, 40, 40);
    this.sph = new sphere(scene, 0.25, 40, 40);
    this.id = id;
}

Ghost.prototype.display = function(){
   if(this.scene.pickMode == true){ //comment if to make visible
        this.scene.pushMatrix();
        this.scene.registerForPick(this.id, this.rect);
        this.scene.registerForPick(this.id, this.cyl);
        this.scene.registerForPick(this.id, this.sph);
        this.rect.display();
        //console.log(this.scene.board.board[this.x][this.y]);
        if (this.scene.board.boardTxt[this.y][this.x] != 0){
            this.cyl.display();
            this.scene.pushMatrix();
            this.scene.translate(0, 0, 1.2);
            this.sph.display();
            this.scene.popMatrix();
        }
        this.scene.clearPickRegistration();
        this.scene.popMatrix();
   }
}
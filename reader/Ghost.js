function Ghost(scene, id){
    this.scene = scene;
    this.x = Math.floor(id/1000);
    this.y = Math.floor(id % 1000)-1;
    this.rect = new rectangle(scene, [-0.5, 0.5],[0.5, -0.5]);
    this.cyl = new cylinder(scene, 2, 0.5, 0.5, 40, 40);
    this.id = id;
}

Ghost.prototype.display = function(){
   if(this.scene.pickMode == true){ //comment if to make visible
        this.scene.pushMatrix();
        this.scene.registerForPick(this.id, this.rect);
        this.scene.registerForPick(this.id, this.cyl);
        this.rect.display();
        //console.log(this.scene.board.board[this.x][this.y]);
        if (this.scene.board.boardTxt[this.y][this.x] != 0)
            this.cyl.display();
        this.scene.clearPickRegistration();
        this.scene.popMatrix();
    }
}
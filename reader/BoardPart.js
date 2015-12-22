function BoardPart(scene, id){
    this.id = id;
    this.selected = false;
    this.obj = new Ghost(scene, this.id);//rectangle(scene, [-0.5, 0.5],[0.5, -0.5]);
}
function BoardPart(scene, id){
    this.id = id;
    this.obj = new rectangle(scene, [-0.5, 0.5],[0.5, -0.5]);
    //scene.registerForPick(id, this.obj);
}
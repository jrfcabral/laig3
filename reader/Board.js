function Board(scene, graph){
       this.graph = graph;
       this.scene = scene;
       this.board = this.makeBoard(11, 11);
}

Board.prototype.makeBoard = function(width, height){
       var board = [];
       for(var i = 0; i < height; i++){
           var boardLine = [];
           for(var j = 0; j < width; j++){
                var boardPart = new BoardPart(this.scene, (j*10)+i);
                boardLine.push(boardPart);
           }
           board.push(boardLine);
       }

       return board;
}

Board.prototype.display = function(){
    var degToRad = Math.PI / 180.0;
    
    this.scene.pushMatrix();
    this.scene.translate(0, 20, 0);
    this.scene.rotate(-90*degToRad, 1, 0, 0);
    this.scene.pushMatrix();

    for(var i = 0; i < 11; i++){
        this.scene.pushMatrix();
        this.scene.translate(0, 1.5*i, 0);
        for(var j = 0; j < 11; j++){
            this.scene.pushMatrix();
            this.scene.translate(1.5*j, 0, 0);
            this.board[i][j].obj.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }


    this.scene.popMatrix();
    this.scene.popMatrix();
}
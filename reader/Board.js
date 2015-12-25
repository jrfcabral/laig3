function Board(scene, graph){
       this.graph = graph;
       this.scene = scene;
       this.board = this.makeBoard(11, 11);
       this.boardTxt = this.getCleanBoard();
       this.boardHistory = []; //pilha das jogadas
       this.undoCounter = 0;
       this.piece = new Piece(scene);
       this.whiteMat = new CGFappearance(this.scene);
       this.whiteMat.setAmbient(1, 1, 1, 1);
       this.whiteMat.setDiffuse(1, 1, 1, 1);
       this.whiteMat.setSpecular(1, 1, 1, 1);
}
Board.prototype.makeBoard = function(width, height){
       var board = [];
       for(var i = 0; i < height; i++){
           var boardLine = [];
           for(var j = 0; j < width; j++){
                console.log((j*1000)+i+1);
                var boardPart = new BoardPart(this.scene, (j*1000)+i+1);
                boardLine.push(boardPart);
           }
           board.push(boardLine);
       }

       return board;
}

Board.prototype.getCleanBoard = function(){
    return [[0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0]];
}
Board.prototype.updateBoard = function(newBoard){
    console.log(JSON.parse(newBoard.target.response));
    this.boardTxt = JSON.parse(newBoard.target.response);
}

Board.prototype.undo = function(){
    if(this.boardHistory.length == 0){
        return;
    }
    this.undoCounter++;
    //Manda o tabuleiro pro prolog, tem q haver um predicado q traduza
    //Isto pode ou nao ser usado conforme, oq vamos fazer em termos d protocolo
    //this.boardTxt = this.boardHistory[this.boardHistory.length -1 -this.undoCounter];

}
Board.prototype.redo = function(){
    if(this.boardHistory.length == 0 || this.undoCounter == 0){
        return;
    }
    this.undoCounter--;
}

Board.prototype.resyncHistory = function(){
    for(var i = 0; i < this.undoCounter; i++){
        this.boardHistory.pop();
    }
}

Board.prototype.display = function(){
    var degToRad = Math.PI / 180.0;

    this.scene.pushMatrix();
    this.scene.translate(-5, 15.05, 5);
    this.scene.rotate(-90*degToRad, 1, 0, 0);
    this.scene.pushMatrix();


    for(var i = 0; i < 11; i++){
        this.scene.pushMatrix();
        this.scene.translate(0, i, 0);
        for(var j = 0; j < 11; j++){
            //console.log(this.scene.connection.curr)
            if (this.scene.stateMachine.currentState == 2 && this.scene.stateMachine.currentAnimation.xi == j 
                && this.scene.stateMachine.currentAnimation.yi == i){
                    var delta = Date.now() - this.scene.stateMachine.animationStart;
                    var progress = (100*delta)/1500;
                    var animation = this.scene.stateMachine.currentAnimation;
                    this.scene.pushMatrix();
                    this.scene.translate(animation.xi+(animation.xf-animation.xi)*(progress/100),
                        animation.yi+(animation.yf-animation.yi)*(progress/100)-i,
                        3*Math.sin((progress/100)*Math.PI));
                    this.piece.display(this.scene.stateMachine.color);
                    this.scene.popMatrix();

                    if(progress >= 100)
                        this.scene.stateMachine.currentState = this.scene.stateMachine.oldState;
                    continue;                    
            }

             if (this.scene.stateMachine.currentState == 2 && this.scene.stateMachine.currentAnimation.xf == j 
                && this.scene.stateMachine.currentAnimation.yf == i)
                continue;


            this.scene.pushMatrix();
            this.scene.translate(j, 0, 0);

            if(this.boardTxt[i][j] != 0){
                if (this.scene.pickMode == false)
                    this.piece.display(this.board[i][j].selected? 4:this.boardTxt[i][j]);
                this.whiteMat.apply();
            }    
            this.board[i][j].obj.display();

            this.scene.popMatrix();
        }
        this.scene.popMatrix();

    }
    this.scene.popMatrix();
    this.scene.popMatrix();
}

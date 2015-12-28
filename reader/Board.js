function Board(scene, graph){
       this.graph = graph;
       this.scene = scene;
       this.board = this.makeBoard(11, 11);
       this.boardTxt = this.getCleanBoard();
       this.boardHistory = []; //pilha das jogadas
       this.pieceCount = [0, 0];
       this.gamesWon = [0, 0]; //n sei se isto devia tar aqui...
       this.undoCounter = 0;
       this.piece = new Piece(scene);
       this.whiteMat = new CGFappearance(this.scene);
       this.whiteMat.setAmbient(1, 1, 1, 1);
       this.whiteMat.setDiffuse(1, 1, 1, 1);
       this.whiteMat.setSpecular(1, 1, 1, 1);
       this.boardStack = [];
       this.playStack = [];
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

Board.prototype.savePlay = function(Xi, Yi, Xf,Yf){
    this.playStack.push([Xi,Yi,Xf,Yf]);
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

Board.prototype.countPieces = function(){
    this.pieceCount[0] = 0;
    this.pieceCount[1] = 0;
    for(var i = 0; i < 11; i++){
        for(var j = 0; j < 11; j++){
            switch(this.boardTxt[i][j]){
                case 3:
                case 1: this.pieceCount[0]++; break;
                case 2: this.pieceCount[1]++; break;
                case 0:
                default: break;
            }
        }
    }   
}

Board.prototype.saveBoard = function(player){
    this.boardStack.push([this.boardTxt, player]);
    console.log(this.boardStack);
}

Board.prototype.getPieceNumber = function(number){
    var value = 0;
    for(var i = 0; i < 11; i++)
        for(var j = 0; j < 11; j++)
            if (this.boardTxt[i][j] == number)
                value++;
    return value;
}   

Board.prototype.display = function(){
    var degToRad = Math.PI / 180.0;

    this.scene.pushMatrix();
    this.scene.translate(-5, 15.05, 5);
    this.scene.rotate(-90*degToRad, 1, 0, 0);
    this.scene.pushMatrix();

    var goldsOut = 12 - this.getPieceNumber(1);
    var silversOut = 20 - this.getPieceNumber(2);

    for(var i = 0; i < goldsOut;i++){
            this.scene.pushMatrix();
            this.scene.translate(-1,i,0);
            this.piece.display(1);
            this.scene.popMatrix();
    }
    
       for(var i = 0; i < silversOut;i++){
            this.scene.pushMatrix();
            this.scene.translate(+13,i-6,0);
            this.piece.display(2);
            this.scene.popMatrix();
    }

    //pieces entering the field
      if ( this.scene.stateMachine.currentState == 2 &&
            this.scene.stateMachine.enteringAnimationEnabled){
                console.log("entrei");
                    var delta = Date.now() - this.scene.stateMachine.animationStart;
                    var progress = delta/20;
                    var animation = this.scene.stateMachine.enteringAnimation;
                    console.log(progress);
                    if(this.scene.stateMachine.enteringAnimation.player == 0){
                        this.scene.pushMatrix();
                        this.scene.translate(
                            -1+((animation.x+1)*progress),
                            (goldsOut-1)+((animation.y-(goldsOut-1))*progress),
                             10*Math.sin((progress)*Math.PI)
                        );
                        this.piece.display(animation.player+1);
                        this.scene.popMatrix();
                       
                    }
                    else{
                         this.scene.pushMatrix();
                        this.scene.translate(
                            +13+((animation.x-13)*progress),
                            (silversOut-7)+((animation.y-(silversOut-7))*progress),
                             10*Math.sin((progress)*Math.PI)
                        );
                        this.piece.display(animation.player+1);
                        this.scene.popMatrix();
                    }

                     if (progress > 1){
                            this.scene.stateMachine.synchronize();
                            this.scene.stateMachine.currentState = this.scene.stateMachine.oldState;
                            this.scene.stateMachine.enteringAnimationEnabled=false;
                     }
            }


    for(var i = 0; i < 11; i++){
        this.scene.pushMatrix();
        this.scene.translate(0, i, 0);
        for(var j = 0; j < 11; j++){
            if (this.scene.stateMachine.currentState == 2  && this.scene.stateMachine.currentAnimation.xi == j 
                && this.scene.stateMachine.currentAnimation.yi == i && this.scene.stateMachine.moveAnimationEnabled){
                    var delta = Date.now() - this.scene.stateMachine.animationStart;
                    var progress = (100*delta)/2000;
                    var animation = this.scene.stateMachine.currentAnimation;
                    this.scene.pushMatrix();
                    this.scene.translate(animation.xi+(animation.xf-animation.xi)*(progress/100),
                        animation.yi+(animation.yf-animation.yi)*(progress/100)-i,
                        3*Math.sin((progress/100)*Math.PI));
                    this.piece.display(this.scene.stateMachine.color);
                    this.scene.popMatrix();

                    if(progress >= 100){
                        this.scene.stateMachine.currentState = this.scene.stateMachine.oldState;
                        this.scene.stateMachine.moveAnimationEnabled = false;
                        this.scene.stateMachine.nextAnimationerino();
                    }
                    continue;                    
            }

             if ( (this.scene.stateMachine.currentState == 2 && this.scene.stateMachine.currentAnimation.xf == j 
                && this.scene.stateMachine.currentAnimation.yf == i))
                continue;

            if(this.scene.stateMachine.currentState == 2 && this.scene.stateMachine.nextAnimation.xf == j && this.scene.stateMachine.nextAnimation.yf ==i)
                continue;
                          
            if(this.scene.stateMachine.currentState == 2 && this.scene.stateMachine.enteringAnimationEnabled && this.scene.stateMachine.enteringAnimation.x ==j&&
            this.scene.stateMachine.enteringAnimation.y == i){
                    
                continue;
            }
                

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

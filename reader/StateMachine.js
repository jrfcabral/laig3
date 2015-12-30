function StateMachine(connection, scene){
    this.states = {
        PLACING: 0,
        PLAYING: 1,
        ANIMATING: 2,
        OVER: 3,
        REPLAYING: 4,
        REPLAYING_ANIMATING: 5
    };
    this.players = {
        GOLDEN: 0,
        SILVER: 1
    };

    this.playersName =  {
        0: "goldenPlayer",
        1: "silverPlayer"
    };

    this.connection = connection;
    this.currentState = this.states.PLACING;
    this.connection.makeRequest("getnextaction", this.updateState.bind(this));
    this.scene = scene;
    this.picking = 0;
    this.lastpicked = {x: -1, y: -1};
    this.currentAnimation = {xi: 0, yi: 0, xf:0, yf:0};
    this.nextAnimation = {xi: -1, yi: -1, xf:-1,yf:-1};
    this.timeForTurn = 30;
    this.enteringAnimation = {x: -1, y:-1, player:-1};
    this.currentlyReplaying = -1;
}

StateMachine.prototype.handlePick = function(picked){
   console.log(picked);
   var x = Math.floor(picked/1000);
   var y = Math.floor(picked % 1000)-1;
   this.playerName = this.playersName[this.currentPlayer];
   console.log("State is " + this.currentState);
    switch(this.currentState)
    {
        case this.states.PLACING:
            this.connection.makeRequest("setpiece("+x+","+y+","+this.playerName+")", this.placePiece.bind(this));
            break;
        case this.states.PLAYING:
            if(((this.scene.GoldenPlayer == "random" || this.scene.GoldenPlayer == "greedy") && this.currentPlayer == 0) ||
            ((this.scene.SilverPlayer == "random" || this.scene.SilverPlayer == "greedy") && this.currentPlayer == 1)){
               // return;
            }
            if (this.picking === 0){
                this.lastpicked.x = x;
                this.lastpicked.y = y;
                this.scene.board.board[y][x].selected = true;
                this.picking = 1;
                console.log(this.lastpicked);2
            }
            else if (this.picking === 1){
                this.picking = 0;
                if(this.lastpicked.x == x && this.lastpicked.y == y){
                    this.lastpicked.x = -1;
                    this.lastpicked.y = -1;
                    this.scene.board.board[y][x].selected = false;
                   
                    return;
                }
                else{
                     this.currentAnimation.xi = this.lastpicked.x;
                    this.currentAnimation.yi = this.lastpicked.y;
                    this.currentAnimation.xf = x;
                    this.currentAnimation.yf = y;
                    this.moveAnimationEnabled = true;
                    this.connection.makeRequest("domove("+this.lastpicked.x+","+this.lastpicked.y+","+x+","+y+","+this.playerName+")", this.doPlay.bind(this));
                }
                this.scene.board.board[this.lastpicked.y][this.lastpicked.x].selected = false;    
                this.scene.board.board[y][x].selected = false;
            }
            break;
        case this.states.OVER: break;
    }
}

StateMachine.prototype.undoPlay = function(){
    this.connection.makeRequest("undo", this.synchronize.bind(this));

}

StateMachine.prototype.nextAnimationerino = function(){
    console.log(this.nextAnimation);
    if(this.nextAnimation.xi !== -1){
        console.log("setting the next thing");
        this.startMoveAnimation(this.nextAnimation.xi, this.nextAnimation.yi, this.nextAnimation.xf, this.nextAnimation.yf, this.color);
        this.nextAnimation = {xi:-1,yi:-1,xf:-1,yf:-1};
    }
    else
        this.synchronize();
}

StateMachine.prototype.replay = function(){
    this.currentlyReplaying = 1;
    this.moveAnimationEnabled = false;
    this.oldState = this.states.REPLAYING;
    this.doReplay(this.currentlyReplaying);
}

StateMachine.prototype.animateReplay = function(data){
    if (data.target.response == "nack"){
        this.currentState = this.states.PLAYING;
        return;
    }
    console.log(data.target.response);
    this.currentState = this.states.ANIMATING;
    var play = JSON.parse(data.target.response);
    if (play[2] !== -1)
        this.startMoveAnimation(play[0], play[1], play[2], play[3], play[4]);
    else
        this.startEnteringAnimation(play[0],play[1],play[4]);
    window.setTimeout(this.doReplay.bind(this),1000);
}

StateMachine.prototype.doReplay = function(n){
    this.connection.makeRequest("replay("+this.currentlyReplaying+")", this.animateReplay.bind(this));
    this.synchronize();
    this.currentlyReplaying++;
}

StateMachine.prototype.synchronize = function(){
      this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board));
      this.connection.makeRequest("getnextaction", this.updateState.bind(this));
}

StateMachine.prototype.doPlay = function(data){
    if (data.target.response == "ack"){
        this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board));
        this.currentState = this.states.ANIMATING;
        this.oldState = this.states.PLAYING;
        this.animationStart = Date.now();
        this.color = this.scene.board.boardTxt[this.currentAnimation.yi][this.currentAnimation.xi];                   
    }
    else{
        this.scene.displayInvalidMessage[0] = true;
        this.scene.displayInvalidMessage[1] = Date.now();

        
    }
        
    this.connection.makeRequest("whoWon", this.checkFinished.bind(this));
    this.connection.makeRequest("getnextaction", this.updateState.bind(this));

}

StateMachine.prototype.startEnteringAnimation=function(x, y, player){
     this.animationStart = Date.now();
    this.enteringAnimationEnabled = true;
    this.oldState = this.currentState;

    this.currentState = this.states.ANIMATING;
    this.enteringAnimation.x = x;
    this.enteringAnimation.y = y;
    this.enteringAnimation.player = player;
}

StateMachine.prototype.clearEntering = function(data){
    this.enteringAnimationEnabled = false;
}

StateMachine.prototype.placePieceBot = function(data){
    var placed = JSON.parse(data.target.response);
    this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board));
    this.startEnteringAnimation(placed[0],placed[1], placed[2]);

}

StateMachine.prototype.startMoveAnimation = function(x,y,xf,yf,color){
        this.currentState = this.states.ANIMATING;
        this.currentAnimation.xi = x;
        this.currentAnimation.yi = y;
        this.currentAnimation.xf = xf;
        this.currentAnimation.yf = yf;
        this.color = color+1;
        this.moveAnimationEnabled = true;
        this.animationStart = Date.now();
}

StateMachine.prototype.movePieceBot = function(data){
    if (data.target.response !== "ack"){
        var placed = JSON.parse(data.target.response);
        console.log("chamado");
        this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board));   
        this.oldState = this.states.PLAYING;
        this.startMoveAnimation(placed[0][0],placed[0][1],placed[0][2],placed[0][3],placed[0][4]);
        this.nextAnimation.xi = placed[1][0];
        this.nextAnimation.yi = placed[1][1];
        this.nextAnimation.xf = placed[1][2];
        this.nextAnimation.yf = placed[1][3];
       // window.setTimeout(500, this.startMoveAnimation(placed[1][0],placed[1][1],placed[1][2],placed[1][3],placed[1][4]));
    }
    else
        console.log("falheu");
    
    this.connection.makeRequest("getnextaction", this.updateState.bind(this));
}

StateMachine.prototype.placePiece = function(data){
    if (data.target.response !== "nack"){
        var placed = JSON.parse(data.target.response);
        this.startEnteringAnimation(placed[0],placed[1],placed[2]);
        this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board));   
    }
    else{
         this.scene.displayInvalidMessage[0] = true;
        this.scene.displayInvalidMessage[1] = Date.now();
    }
    
    this.connection.makeRequest("getnextaction", this.updateState.bind(this));
}

StateMachine.prototype.updateState = function(data){
    if(this.currentState == this.states.OVER){
        return;
    }
    var response = JSON.parse(data.target.response);
    this.currentPlayer = response[0];

    this.updateInfo();
    
    console.log("State is " + this.currentState);

    if (this.currentState != this.states.ANIMATING)
    this.currentState = response[1]; 
    else
        console.log("no");

    console.log("State is now " + this.currentState);

    if (this.currentState == this.states.PLACING){
         if ((this.scene.GoldenPlayer == "random" || this.scene.GoldenPlayer == "greedy") && this.currentPlayer == 0){
            this.connection.makeRequest("setpiecebot("+this.currentPlayer+")", this.placePieceBot.bind(this));
        }

        if ((this.scene.SilverPlayer == "random" || this.scene.SilverPlayer == "greedy") && this.currentPlayer == 1){
            this.connection.makeRequest("setpiecebot("+this.currentPlayer+")", this.placePieceBot.bind(this));
        }
    }

    console.log(this.currentState);
    console.log(this.oldState);
    if (this.currentState == this.states.PLAYING ){
        console.log("PASSEI AQUI");
        if ((this.scene.GoldenPlayer == "random" || this.scene.GoldenPlayer == "greedy") && this.currentPlayer == 0){
            this.connection.makeRequest("dobotmove("+this.currentPlayer+","+this.scene.GoldenPlayer+")", this.movePieceBot.bind(this));
            this.connection.makeRequest("whoWon", this.checkFinished.bind(this));
        }

        if ((this.scene.SilverPlayer == "random" || this.scene.SilverPlayer == "greedy") && this.currentPlayer == 1){
            this.connection.makeRequest("dobotmove("+this.currentPlayer+","+this.scene.SilverPlayer+")", this.movePieceBot.bind(this));
            this.connection.makeRequest("whoWon", this.checkFinished.bind(this));
        }
    }

    this.timeForTurn = 30;
   
}

StateMachine.prototype.checkFinished = function(data){
    console.log("entrei");
    var winner = JSON.parse(data.target.response);
    if(winner != 2){
        this.currentState = this.states.OVER;
        this.scene.winnerHUD.writeOnHUD(this.playersName[winner], 0, 0);
        this.scene.winnerHUD.writeOnHUD("has won!", 2, 1);
        this.scene.shouldDisplayWin = true;
        this.scene.board.gamesWon[winner]++;
        this.updateInfo();
    }
}

StateMachine.prototype.resetGame = function(){
    this.connection.makeRequest("reset", this.resetStateMachine.bind(this)); 
    this.scene.shouldDisplayWin = false;
}

StateMachine.prototype.resetStateMachine = function(data){
    var response = data.target.response;
    if(response != "ack"){
        return;
    }
    else{
            this.moveAnimationEnabled=false;
        this.currentState = this.states.PLACING;
        this.connection.makeRequest("getnextaction", this.updateState.bind(this));
        this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board));   
    }
}


StateMachine.prototype.updateInfo = function(){
    this.scene.board.countPieces();
    this.scene.hud.writeOnHUD(this.scene.board.gamesWon[0].toString(), 7, 1);
    this.scene.hud.writeOnHUD(this.scene.board.gamesWon[1].toString(), 7, 2);
    if(this.scene.board.pieceCount[0] < 10){
        this.scene.hud.writeOnHUD(" " + this.scene.board.pieceCount[0].toString(), 7, 5);
    }
    else{
         this.scene.hud.writeOnHUD(this.scene.board.pieceCount[0].toString(), 7, 5);
    }

    if(this.scene.board.pieceCount[1] < 10){
        this.scene.hud.writeOnHUD(" " + this.scene.board.pieceCount[1].toString(), 7, 6);   
    }
    else{
        this.scene.hud.writeOnHUD(this.scene.board.pieceCount[1].toString(), 7, 6);
    }
    this.scene.hud.writeOnHUD(this.playersName[this.currentPlayer], 0, 9);
}

StateMachine.prototype.updateTurnTime = function(){
    if(this.timeForTurn > 9){
        this.scene.hud.writeOnHUD(this.timeForTurn.toString(), 13, 9);
    }
    else{
        this.scene.hud.writeOnHUD(this.timeForTurn.toString()+ " ", 13, 9);
    }
    if(this.currentState != this.states.OVER && this.timeForTurn-- == 0){
        if (this.currentState == this.states.PLACING|| (this.currentState == this.states.ANIMATING && this.oldState == this.states.PLACING)){
            if(this.currentPlayer == 0){
                this.connection.makeRequest("setpiecebot("+this.currentPlayer+")", this.placePiece.bind(this));
            }
            else if(this.currentPlayer == 1){
                this.connection.makeRequest("setpiecebot("+this.currentPlayer+")", this.placePiece.bind(this));
            }
        }
        else if (this.currentState == this.states.PLAYING){
            
            if(this.currentPlayer == 0){
                this.connection.makeRequest("dobotmove("+this.currentPlayer+","+"greedy"+")", this.movePieceBot.bind(this));

            }
            else if(this.currentPlayer == 1){
                this.connection.makeRequest("dobotmove("+this.currentPlayer+","+ "greedy" +")", this.movePieceBot.bind(this));
            }

            this.connection.makeRequest("whoWon", this.checkFinished.bind(this));
        }

        this.connection.makeRequest("getnextaction", this.updateState.bind(this));
    }
}
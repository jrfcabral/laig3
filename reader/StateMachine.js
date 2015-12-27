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
    this.timeForTurn = 0;
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
                return;
            }
            if (this.picking === 0){
                this.lastpicked.x = x;
                this.lastpicked.y = y;
                this.scene.board.board[y][x].selected = true;
                this.picking = 1;
                console.log(this.lastpicked);
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

StateMachine.prototype.replay = function(){
    this.currentlyReplaying = 1;
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
    this.currentAnimation.xi = play[0];
    this.currentAnimation.yi = play[1];
    this.currentAnimation.xf = play[2];
    this.currentAnimation.yf = play[3];
    this.color = play[4];
    this.animationStart = Date.now();
    window.setTimeout(this.doReplay.bind(this),3000);
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
        this.scene.board.saveBoard(this.currentPlayer);
        this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board));
        this.currentState = this.states.ANIMATING;
        this.oldState = this.states.PLAYING;
        this.animationStart = Date.now();
        this.color = this.scene.board.boardTxt[this.currentAnimation.yi][this.currentAnimation.xi];                   
    }
    else
        console.log("falheu");
    this.connection.makeRequest("whoWon", this.checkFinished.bind(this));
    this.connection.makeRequest("getnextaction", this.updateState.bind(this));

}

StateMachine.prototype.placePiece = function(data){
    if (data.target.response == "ack"){
        this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board));   
    }
    else
        console.log("falheu");
    
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

    if (this.currentState == this.states.PLAYING || (this.states.ANIMATING && this.oldState == this.states.PLAYING)){
        console.log("tou aqui");
        if ((this.scene.GoldenPlayer == "random" || this.scene.GoldenPlayer == "greedy") && this.currentPlayer == 0){
            this.connection.makeRequest("dobotmove("+this.currentPlayer+","+this.scene.GoldenPlayer+")", this.placePiece.bind(this));
        }

        if ((this.scene.SilverPlayer == "random" || this.scene.SilverPlayer == "greedy") && this.currentPlayer == 1){
            this.connection.makeRequest("dobotmove("+this.currentPlayer+","+this.scene.SilverPlayer+")", this.placePiece.bind(this));
        }
    }
   
}

StateMachine.prototype.checkFinished = function(data){
    console.log("entrei");
    var winner = JSON.parse(data.target.response);
    if(winner != 2){
        this.currentState = this.states.OVER;
        console.log(winner + " has won");
        this.scene.board.gamesWon[winner]++;
        this.updateInfo();
    }
}

StateMachine.prototype.resetGame = function(){
    this.connection.makeRequest("reset", this.resetStateMachine.bind(this));    
}

StateMachine.prototype.resetStateMachine = function(data){
    var response = data.target.response;
    if(response != "ack"){
        return;
    }
    else{
        this.currentState = this.states.PLACING;
        this.connection.makeRequest("getnextaction", this.updateState.bind(this));
        this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board));   
    }
}

StateMachine.prototype.stepBack = function(){
    //this.scene.board.undo();
    //this.connection.makeRequest(); mandar o board o pra la
    //this.connection.makeRequest("getnextaction", this.updateState.bind(this));
    //this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board));   
}

StateMachine.prototype.stepForward = function(){
    //this.scene.board.redo();
    //this.connection.makeRequest(); mandar o board o pra la
    //this.connection.makeRequest("getnextaction", this.updateState.bind(this));
    //this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board)); 
}

StateMachine.prototype.updateInfo = function(){
    this.scene.board.countPieces();
    this.scene.hud.writeOnHUD(this.scene.board.gamesWon[0].toString(), 7, 1);
    this.scene.hud.writeOnHUD(this.scene.board.gamesWon[1].toString(), 7, 2);
    this.scene.hud.writeOnHUD(this.scene.board.pieceCount[0].toString(), 7, 5);
    this.scene.hud.writeOnHUD(this.scene.board.pieceCount[1].toString(), 7, 6);
    this.scene.hud.writeOnHUD(this.playersName[this.currentPlayer], 0, 9);
}

StateMachine.prototype.updateTurnTime = function(){
    if(this.currentState != this.state.OVER && this.timeForTurn-- == 0){
        //por um bot a fazer a jogada pelo jogador?
    }
}
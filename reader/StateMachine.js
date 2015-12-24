function StateMachine(connection, scene){
    this.states = {
        PLACING: 0,
        PLAYING: 1,
        ANIMATING: 2,
        OVER: 3
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

StateMachine.prototype.doPlay = function(data){
    if (data.target.response == "ack"){
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
    if (this.currentState != this.states.ANIMATING)
    this.currentState = response[1]; 
    else
        console.log("no");

    if (this.currentState == this.states.PLAYING){
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
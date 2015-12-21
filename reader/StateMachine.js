function StateMachine(connection, scene){
    this.states = {
        PLACING: 0,
        PLAYING: 1,
        ANIMATING: 2
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
    this.connection.makeRequest("getnextaction", this.updateState.bind(this));
    this.scene = scene;
    this.picking = 0;
    this.lastpicked = {x: -1, y: -1};

}

StateMachine.prototype.handlePick = function(picked){
   console.log(picked);
   var x = Math.floor(picked/1000);
   var y = Math.floor(picked % 1000)-1;
   this.playerName = this.playersName[this.currentPlayer];
    switch(this.currentState)
    {
        case this.states.PLACING:
            this.connection.makeRequest("setpiece("+x+","+y+","+this.playerName+")", this.placePiece.bind(this));
            break;
        case this.states.PLAYING:
            if (this.picking === 0){
                this.lastpicked.x = x;
                this.lastpicked.y = y;
                this.picking = 1;
                console.log(this.lastpicked);
            }
            else if (this.picking === 1){
                this.picking = 0;
                this.connection.makeRequest("domove("+this.lastpicked.x+","+this.lastpicked.y+","+x+","+y+","+this.playerName+")", this.doPlay.bind(this));
            }
    }
}

StateMachine.prototype.doPlay = function(data){
    if (data.target.response == "ack"){
        this.connection.makeRequest("boardstate", this.scene.board.updateBoard.bind(this.scene.board));   
    }
    else
        console.log("falheu");

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
    var response = JSON.parse(data.target.response);
    this.currentPlayer = response[0];
    this.currentState = response[1]; 

    if (this.currentState == this.states.PLAYING){
        if ((this.scene.GoldenPlayer == "random" || this.scene.GoldenPlayer == "greedy") && this.currentPlayer == 0){
            this.connection.makeRequest("dobotmove("+this.currentPlayer+")", this.placePiece.bind(this));
        }

        if ((this.scene.SilverPlayer == "random" || this.scene.SilverPlayer == "greedy") && this.currentPlayer == 1){
            this.connection.makeRequest("dobotmove("+this.currentPlayer+","+this.scene.SilverPlayer+")", this.placePiece.bind(this));
        }
    }
   
}
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

}

StateMachine.prototype.handlePick = function(picked){
   var x = Math.floor(picked/1000);
   var y = Math.floor(picked % 1000)-1;
   this.playerName = this.playersName[this.currentPlayer];
    switch(this.currentState)
    {
        case this.states.PLACING:
            this.connection.makeRequest("setpiece("+x+","+y+","+this.playerName+")", this.placePiece.bind(this));
            
    }
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
   
}
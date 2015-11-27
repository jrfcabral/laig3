class SicstusConnection{
    constructor(port){
        this.port = port;
        this.port |= 8081;
    }

    makeRequest(request){
        var request = new XMLHttpRequest();
    	request.open('GET', 'http://localhost:'+this.port+'/'+request, true);

    }
}
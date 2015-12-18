function SicstusConnection(port, scene){    
        this.port = port;
        this.port |= 8082;
        
        this.scene = scene;
    }

SicstusConnection.prototype.makeRequest = function(request, callback){
    var ajax = new XMLHttpRequest();
    console.log('http://localhost:'+this.port+'/'+request);
    ajax.open('GET', 'http://localhost:'+this.port+'/'+request, true);
    ajax.onload = callback;
 	ajax.onerror = function(){console.log("error");	};
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	ajax.send();
}

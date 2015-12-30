function HUD(scene, width, height){
    this.scene = scene;
    this.width = width;
    this.height = height;
	
	this.transValues = [-3.5, 1, -10];

	this.charMap = {
		space: [0, 2],
		A: [1, 4],
		B: [2, 4],
		C: [3, 4],
		D: [4, 4],
		E: [5, 4],
		F: [6, 4],
		G: [7, 4],
		H: [8, 4],
		I: [9, 4],
		J: [10, 4],
		K: [11, 4],
		L: [12, 4],
		M: [13, 4],
		N: [14, 4],
		O: [15, 4],
		P: [0, 5],
		Q: [1, 5],
		R: [2, 5],
		S: [3, 5],
		T: [4, 5],
		U: [5, 5],
		V: [6, 5],
		W: [7, 5],
		X: [8, 5],
		Y: [9, 5],
		Z: [10, 5],
		a: [1, 6],
		b: [2, 6],
		c: [3, 6],
		d: [4, 6],
		e: [5, 6],
		f: [6, 6],
		g: [7, 6],
		h: [8, 6],
		i: [9, 6],
		j: [10, 6],
		k: [11, 6],
		l: [12, 6],
		m: [13, 6],
		n: [14, 6],
		o: [15, 6],
		p: [0, 7],
		q: [1, 7],
		r: [2, 7],
		s: [3, 7],
		t: [4, 7],
		u: [5, 7],
		v: [6, 7],
		w: [7, 7],
		x: [8, 7],
		y: [9, 7],
		z: [10, 7],
		zero: [0, 3],
		one: [1, 3],
		two: [2, 3],
		three: [3, 3],
		four: [4, 3],
		five: [5, 3],
		six: [6, 3],
		seven: [7, 3],
		eight: [8, 3],
		nine: [9, 3]
	};

    
    this.screen = this.makeScreen(width, height);
    this.screenMap = this.makeCleanScreenMap(width, height);

    this.appearance = new CGFappearance(this.scene);
    this.fontTexture = new CGFtexture(this.scene, "textures/oolite-font.png");
	this.appearance.setTexture(this.fontTexture);

	this.textShader=new CGFshader(this.scene.gl, "shaders/font.vert", "shaders/font.frag");
	this.textShader.setUniformsValues({'dims': [16, 16]});

	
}

HUD.prototype.moveHUD = function(x, y, z){
	this.transValues[0] += x;
	this.transValues[1] += y;
	this.transValues[2] += z;

}

HUD.prototype.makeScreen = function(width, height){
    var screen = []
    for(var i = 0; i < height; i++){
        var screenLine = [];
        for(var j = 0; j < width; j++){
            //var obj = new Plane(this.scene, 10);
            var obj = new rectangle(this.scene, [-0.5, 0.5],[0.5, -0.5]);
            screenLine.push(obj);
        }
        screen.push(screenLine);
    }

    return screen;
}

HUD.prototype.makeCleanScreenMap = function(width, height){
	var screenMap = []
    for(var i = 0; i < height; i++){
        var screenMapLine = [];
        for(var j = 0; j < width; j++){
            screenMapLine.push(this.charMap.space);
        }
        screenMap.push(screenMapLine);
    }

    return screenMap;
}

HUD.prototype.writeOnHUD = function(str, widthSt, heightSt){
	if(str.length > (heightSt - 1*this.width)+(this.width - this.widthSt)){
		return;
	}

	var chars = str.split("");
	var widthCount = widthSt;
	var heightCount = heightSt;
	for(var i = 0; i < chars.length; i++){
		switch(chars[i]){
			case ' ': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.space; break;
			case 'A': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.A; break;
			case 'B': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.B; break;
			case 'C': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.C; break;
			case 'D': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.D; break;
			case 'E': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.E; break;
			case 'F': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.F; break;
			case 'G': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.G; break;
			case 'H': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.H; break;
			case 'I': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.I; break;
			case 'J': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.J; break;
			case 'K': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.K; break;
			case 'L': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.L; break;
			case 'M': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.M; break;
			case 'N': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.N; break;
			case 'O': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.O; break;
			case 'P': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.P; break;
			case 'Q': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.Q; break;
			case 'R': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.R; break;
			case 'S': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.S; break;
			case 'T': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.T; break;
			case 'U': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.U; break;
			case 'V': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.V; break;
			case 'W': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.W; break;
			case 'X': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.X; break;
			case 'Y': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.Y; break;
			case 'Z': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.Z; break;
			case 'a': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.a; break;
			case 'b': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.b; break;
			case 'c': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.c; break;
			case 'd': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.d; break;
			case 'e': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.e; break;
			case 'f': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.f; break;
			case 'g': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.g; break;
			case 'h': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.h; break;
			case 'i': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.i; break;
			case 'j': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.j; break;
			case 'k': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.k; break;
			case 'l': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.l; break;
			case 'm': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.m; break;
			case 'n': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.n; break;
			case 'o': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.o; break;
			case 'p': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.p; break;
			case 'q': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.q; break;
			case 'r': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.r; break;
			case 's': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.s; break;
			case 't': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.t; break;
			case 'u': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.u; break;
			case 'v': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.v; break;
			case 'w': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.w; break;
			case 'x': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.x; break;
			case 'y': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.y; break;
			case 'z': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.z; break;
			case '0': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.zero; break;
			case '1': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.one; break;
			case '2': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.two; break;
			case '3': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.three; break;
			case '4': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.four; break;
			case '5': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.five; break;
			case '6': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.six; break;
			case '7': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.seven; break;
			case '8': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.eight; break;
			case '9': this.screenMap[this.height-1-heightCount][widthCount++] = this.charMap.nine; break;
		}
		if(widthCount > this.width-1){
			widthCount = 0;
			heightCount++;
		}
	}

}

HUD.prototype.display = function(){
    this.scene.pushMatrix();

    this.scene.translate(this.transValues[0], this.transValues[1], this.transValues[2]);
    
    this.scene.scale(0.1, 0.1, 1);
    this.appearance.apply();
    this.scene.setActiveShader(this.textShader);
    
    for(var i = 0; i < this.height; i++){
        this.scene.pushMatrix();
        this.scene.translate(0, i, 0);
        for(var j = 0; j < this.width; j++){
            this.scene.pushMatrix();
            this.scene.translate(j, 0, 0);
            this.textShader.setUniformsValues({'charCoords': this.screenMap[i][j]});
            this.screen[i][j].display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }
    
    this.scene.setActiveShader(this.scene.defaultShader);
    //this.screen[0][0].display();

    this.scene.popMatrix();
}
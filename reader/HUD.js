function HUD(scene, width, height){
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.screen = this.makeScreen(width, height);

    this.appearance = new CGFappearance(this.scene);
    this.fontTexture = new CGFtexture(this.scene, "textures/oolite-font.png");
	this.appearance.setTexture(this.fontTexture);

	this.textShader=new CGFshader(this.scene.gl, "shaders/font.vert", "shaders/font.frag");
	this.textShader.setUniformsValues({'dims': [16, 16]});
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

HUD.prototype.display = function(){
    this.scene.pushMatrix();
    this.scene.translate(-3.5, 1, -10);
    this.scene.scale(0.1, 0.1, 1);
    this.appearance.apply();
    this.scene.setActiveShader(this.textShader);
    
    for(var i = 0; i < this.height; i++){
        this.scene.pushMatrix();
        this.scene.translate(0, i, 0);
        for(var j = 0; j < this.width; j++){
            this.scene.pushMatrix();
            this.scene.translate(j, 0, 0);
            this.textShader.setUniformsValues({'charCoords': [1, 4]});
            this.screen[i][j].display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }
    
    this.scene.setActiveShader(this.scene.defaultShader);
    //this.screen[0][0].display();

    this.scene.popMatrix();
}
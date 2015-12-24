
function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.initLights();
    this.enableTextures(true);

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);
	this.defaultAppearance = new CGFappearance(this);
	this.defaultAppearance.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.defaultAppearance.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.defaultAppearance.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.defaultAppearance.setShininess(10.0);
    this.defaultAppearance.setTextureWrap("REPEAT", "REPEAT");


	this.currentTexture = "clear";
	this.isTexturePresent = false;

	this.texturesStack = [];
	

	this.interface;

	this.GoldenPlayer = 0;
	this.SilverPlayer = 0;
	this.connection = new SicstusConnection(8082, this);

	this.board = new Board(this, this.graph);

	this.connection.makeRequest("teste", function(){console.log("board resot");});
	this.connection.makeRequest("boardstate", this.board.updateBoard.bind(this.board));

	this.stateMachine = new StateMachine(this.connection, this);

	this.hud = new HUD(this, 10, 10);

	this.undo = function(){
		this.StateMachine.stepBack();
	}
	this.reset = function(){
		this.stateMachine.resetGame();
	}

	this.setUpdatePeriod(10000);
	this.setPickEnabled(true);

};

XMLscene.prototype.update = function(){
	this.connection.makeRequest('areuthere', function(){console.log("Iamhere");});
}

XMLscene.prototype.initLights = function () {



	this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setDiffuse(1.0,1.0,1.0,1.0);
    this.lights[0].update();


};

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
 	this.defaultAppearance.apply();
};


XMLscene.prototype.logPicking = function ()
{
	if (this.pickMode == false) {
		if (this.pickResults != null && this.pickResults.length > 0) {
			for (var i=0; i< this.pickResults.length; i++) {
				var obj = this.pickResults[i][0];
				if (obj)
				{
					var customId = this.pickResults[i][1];
					this.stateMachine.handlePick(customId);
					console.log('id is ' + customId);
					var x = Math.floor(customId/1000);
   					var y = Math.floor(customId % 1000)-1;
   					console.log('x: ' + x);
   					console.log('y: ' + y);
				}
			}
			this.pickResults.splice(0,this.pickResults.length);
		}
	}
}


// Handler called when the graph is finally loaded.
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function ()
{

	this.axis=new CGFaxis(this, this.graph.refLength);

	this.materialStack = [];
	this.camera.near = this.graph.frustumNear;
	this.camera.far = this.graph.frustumFar;

	this.setGlobalAmbientLight(this.graph.globalAmbLight[0], this.graph.globalAmbLight[1], this.graph.globalAmbLight[2], this.graph.globalAmbLight[3]);

	this.gl.clearColor(this.graph.bgLight[0],this.graph.bgLight[1], this.graph.bgLight[2],this.graph.bgLight[3]);

	this.lightslist =  [];

	this.lightslist = {
		light0: false,
		light1: false,
		light2: false,
		light3: false,
		light4: false,
		light5: false,
		light6: false,
		light7: false,
	};

	for(var i = 0; i < ((this.graph.lightsNum > 8)? 8:this.graph.lightsNum); i++){

		this.lights[i].setPosition(this.graph.lightsDic[i].position[0] , this.graph.lightsDic[i].position[1] , this.graph.lightsDic[i].position[2], this.graph.lightsDic[i].position[3] );
		this.lights[i].setAmbient(this.graph.lightsDic[i].ambient[0], this.graph.lightsDic[i].ambient[1], this.graph.lightsDic[i].ambient[2], this.graph.lightsDic[i].ambient[3]);
		this.lights[i].setDiffuse(this.graph.lightsDic[i].diffuse[0], this.graph.lightsDic[i].diffuse[1], this.graph.lightsDic[i].diffuse[2], this.graph.lightsDic[i].diffuse[3]);
		this.lights[i].setSpecular(this.graph.lightsDic[i].specular[0], this.graph.lightsDic[i].specular[1], this.graph.lightsDic[i].specular[2], this.graph.lightsDic[i].specular[3]);
		if(this.graph.lightsDic[i].enable == true){
			this.lights[i].enable();
			this.lightslist["light"+i] = true;
		}
		else{

		}
		this.lights[i].setVisible(false);

		this.interface.group.add(this.lightslist, 'light'+i);

	}
};

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
	this.logPicking();

	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	//has to be here
	this.hud.display();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();
	this.setDefaultAppearance();

	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if (this.graph.loadedOk)
	{

		for(i = 0; i < ((this.graph.lightsNum > 8)? 8:this.graph.lightsNum); i++){
			if(this.lightslist['light'+i])
				this.lights[i].enable();
			else
				this.lights[i].disable();

			this.lights[i].update();
		}

		//apply initial transformations
		this.pushMatrix();
		this.multMatrix(this.graph.initialsMatrix);

		// Draw axis
	    this.axis.display();

		this.board.display();
		
		//traverse the render tree and draw elements
		this.traverseGraph(this.graph.nodes[this.graph.root]);

		//restore previous state
		this.popMatrix();
	};


};

/**
* Traverses the scene graph recursively
* @param elem element of the scene graph to be parsed (as built in encodeNode in MySceneGraph)
* @return null when a descendant is declared that doesn't exist
*/
XMLscene.prototype.traverseGraph = function(elem){


	//reached a leaf
	if (!elem.descendants){
		this.DrawPrimitive(elem);
	}

	//this is a node
	else{

		for(var i = 0; i < elem.animations.length; i++){
			if(!elem.animations[i].done)
				this.currAnim = elem.animations[i];
		}

		//apply transformations
		this.pushMatrix();
		if(elem.animations.length != 0){
			if(elem.animationStartTimes[elem.currentAnimation] == 0){
				elem.animationStartTimes[elem.currentAnimation] = Date.now();
			}
			if(this.graph.animations[elem.animations[elem.currentAnimation]] == null){
				console.error("Animation not found");
			}
			else{
				var animMatrix = this.graph.animations[elem.animations[elem.currentAnimation]].object.update(elem.animationStartTimes[elem.currentAnimation], elem);
			}
			if(animMatrix[0] == "done"){
				elem.currentAnimation++;
				if(elem.currentAnimation == elem.animations.length){
					elem.currentAnimation = elem.animations.length-1;
				}
			}
			this.multMatrix(animMatrix[1]);
		}
		this.multMatrix(elem.matrix);



		//apply materials and textures
		if(elem.material != "null"){
			this.pushMaterial(elem)
			this.applyMaterial();
		}
		this.PushTexture();
		this.ApplyTexture(elem.texture);


		//traverse the tree forwards
		var descendants = elem.descendants.slice();
		for(var i = 0; i < elem.descendants.length; i++){
			if(this.graph.nodes[descendants[i]])
				this.traverseGraph(this.graph.nodes[descendants[i]]);
			else if (this.graph.leaves[descendants[i]]){
				this.traverseGraph(this.graph.leaves[descendants[i]]);
			}
			else{
				console.log("ERROR: Non-existant descendant "+ descendants[i]);
				this.graph.loadedOk = false;
				return;
			}
		}

		//restore previous state
		if(elem.material != "null"){
			this.popMaterial();
			this.applyMaterial();
		}
		this.PopTexture();
		this.popMatrix();

	}
};

/**
* Draws the actual primitives when a leaf is reached in the traversal method above
* @param elem the element to be drawn
* @param texture texture to be applied to the primitive
*/
XMLscene.prototype.DrawPrimitive = function(elem, texture){
	var textureId = this.currentTexture;


	if (textureId !== "clear"){
		texture = this.graph.textures[textureId];
		elem.object.updateTexCoords(texture);
	}

	elem.object.display();
}

/**
* Pushes the current texture into the texture stack
*/
XMLscene.prototype.PushTexture = function(){
	this.texturesStack.push(this.currentTexture);
}

/**
* Applies the provided texture or unbinds the current texture if it's clear
* @texture texture to be applied
*/
XMLscene.prototype.ApplyTexture = function(texture){

	if (texture !== "null" && texture !== "clear"){
		this.graph.textures[texture].texture.bind();
		this.currentTexture = texture;
	}
	else if (texture === "clear" && this.currentTexture !== "clear"){
		this.graph.textures[this.currentTexture].texture.unbind();
		this.currentTexture = texture;
	}

}

/**
* Pops the texture at the top of the texture stack and binds ir unbinds textures as needed
*/
XMLscene.prototype.PopTexture = function(){
	var stackTop = this.texturesStack[this.texturesStack.length-1];
	this.texturesStack.pop();
	if (stackTop === "clear" && this.currentTexture !== "clear"){
		this.graph.textures[this.currentTexture].texture.unbind();

	}
	else if (stackTop !== "clear"){
		this.graph.textures[stackTop].texture.bind();

	}
	this.currentTexture = stackTop;
}

/**
* Pushes a material into the materials stack
* @param elem element form which to extract the material to be pushed
*/
XMLscene.prototype.pushMaterial = function(elem){
	this.materialStack.push(this.graph.materials[elem.material]);
}

/**
* Applies the material at the top of the material stack
*/
XMLscene.prototype.applyMaterial = function(){
	if(this.materialStack.length != 0){
		this.materialStack[this.materialStack.length-1].apply();
	}
}

/**
* Pops the material at the top of the stack
*/
XMLscene.prototype.popMaterial = function(){
	this.materialStack.pop();
}


function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.initLights();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

	this.axis=new CGFaxis(this);


	//testing primitives
	this.testRect = new rectangle(this, [0, 2], [4, 0]);
	this.testTri = new triangle(this, [0, 0, 0], [4, 0, 0], [2, 2, 0]);
};

XMLscene.prototype.initLights = function () {
	
    this.shader.bind();

	this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setDiffuse(1.0,1.0,1.0,1.0);
    this.lights[0].update();
 	
    this.shader.unbind();
};

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);	
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () 
{
	//this.gl.clearColor(this.graph.background[0],this.graph.background[1],this.graph.background[2],this.graph.background[3]);
	
	this.gl.clearColor(this.graph.bgLight[0],this.graph.bgLight[1],this.graph.bgLight[2],this.graph.bgLight[3]);

	console.log((this.graph.lightsNum > 8)? 8:this.graph.lightsNum);

	for(var i = 0; i < ((this.graph.lightsNum > 8)? 8:this.graph.lightsNum); i++){
		this.lights[i].setPosition(this.graph.lightsDic[i].position[0], this.graph.lightsDic[i].position[1], this.graph.lightsDic[i].position[2], this.graph.lightsDic[i].position[3]);
		this.lights[i].setAmbient(this.graph.lightsDic[i].ambient[0], this.graph.lightsDic[i].ambient[1], this.graph.lightsDic[i].ambient[2], this.graph.lightsDic[i].ambient[3]);
		this.lights[i].setDiffuse(this.graph.lightsDic[i].diffuse[0], this.graph.lightsDic[i].diffuse[1], this.graph.lightsDic[i].diffuse[2], this.graph.lightsDic[i].diffuse[3]);
		this.lights[i].setSpecular(this.graph.lightsDic[i].specular[0], this.graph.lightsDic[i].specular[1], this.graph.lightsDic[i].specular[2], this.graph.lightsDic[i].specular[3]);
		if(this.graph.lightsDic[i].enable == 1){
			this.lights[i].enable();
		}
		this.lights[i].setVisible(true);
		
	}
	

	

	//this.lights[0].setVisible(true);
    //this.lights[0].enable();
};

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
    this.shader.bind();
	
	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	// Draw axis
	this.axis.display();

	this.setDefaultAppearance();

	// ---- END Background, camera and axis setup


	//testing primitives display
	//this.testRect.display();
	this.testTri.display();


	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if (this.graph.loadedOk)
	{
		
		for(i = 0; i < ((this.graph.lightsNum > 8)? 8:this.graph.lightsNum); i++){
			this.lights[i].update();
		}
		//this.traverseGraph(this.graph.nodes[this.graph.root]);
	};	
	
    this.shader.unbind();
};

XMLscene.prototype.traverseGraph = function(elem){


	//we have reached a leaf
	if (!elem.descendants){
		console.log("Reached leaf with id " + elem.id);

	}

	//this is a node
	else{
		console.log("Traversal: reached node with id "+elem.id);

		//apply transformations
		var transformations = elem.transformations.slice();
		this.pushMatrix();
		for(var i = 0; i < transformations.length; i++){
			transformations[i].Apply();
		}

		//TODO apply materials and textures

		//traverse the tree forwards
		var descendants = elem.descendants.slice();
		for(var i = 0; i < elem.descendants.length; i++){
			if(this.graph.nodes[descendants[i]])
				this.traverseGraph(this.graph.nodes[descendants[i]]);
			else if (this.graph.leaves[descendants[i]]){
				this.traverseGraph(this.graph.leaves[descendants[i]]);
			}
			else{
				console.log("ERROR: Non-existant descendant");
			}
		}
		

		
		//restore previous state
		this.popMatrix();
		
	}
};

function MySceneGraph(filename, scene) {
	this.loadedOk = null;

	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;

	//List of drawable primitives
	this.allowedPrimitives = ['rectangle', 'sphere', 'cylinder','triangle'];

	/*
	* Queue of errors detected while loading the lsx file
	* On size > 0, abort drawing
	*/
	this.errors = [];

	/*
	* Queue of warnings detected while loading the lsx files
	* On size > 0 keep drawing but behaviour can be unexpected
	*/
	this.warnings = [];

	/*
	* Dictionary containing all the nodes of the scene graph
	* Care must be taken that all the ids are unique and that no cycles are present
	*/
	this.nodes = [];

	/*
	* Dictionary containing all the leaves of the scene graph
	* Care must be taken that all the ids are unique and that no cycles are present
	*/
	this.leaves = [];

	// File reading
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */

	this.reader.open('scenes/'+filename, this);

}

MySceneGraph.prototype.ParseLeaves= function(rootElement) {
	console.log("Parsing leaves");

	var elems = rootElement.getElementsByTagName('LEAVES');

	if (elems == null){
		this.errors.push("LEAVES element is missing");
	}
	if (elems.length != 1){
		this.warnings.push("more than one LEAVES element present");
	}

	var numberLeaves = elems[0].children.length;
	for(var i=0;i<numberLeaves;i++){
		var leaf = elems[0].children[i];

		console.log(leaf);

		if(this.leaves[leaf.id] != null){
			this.errors.push("there are leaves with repeated id \"" + id +"\"");
			return;
		}

		var strargs = this.reader.getString(leaf, "args").split(" ");
		var args = [];
		for (var j = 0; j < args.length; j++){
			args[j] = Float.parseFloat(strargs[j]);
			if (args[j] == NaN){
				this.errors.push("no conversion to float for argument no."+j+" of leaf with id " + leaf.id);
				return;
			}

		}
		this.leaves[leaf.id] = {id: leaf.id,
								type: this.reader.getItem(leaf, "type", this.allowedPrimitives),
								args: args};

		console.log("Parsed leaf with id " + leaf.id);

	}
	console.log("Leaves parsed");
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function()
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;

	// Here should go the calls for different functions to parse the various blocks
	//var error = this.parseGlobalsExample(rootElement);
	this.parseLSX(rootElement);
	

	this.loadedOk=true;

	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};


/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
MySceneGraph.prototype.parseGlobalsExample= function(rootElement) {

	var elems =  rootElement.getElementsByTagName('globals');
	if (elems == null) {
		return "globals element is missing.";
	}

	if (elems.length != 1) {
		return "either zero or more than one 'globals' element found.";
	}

	// various examples of different types of access
	var globals = elems[0];
	this.background = this.reader.getRGBA(globals, 'background');
	this.drawmode = this.reader.getItem(globals, 'drawmode', ["fill","line","point"]);
	this.cullface = this.reader.getItem(globals, 'cullface', ["back","front","none", "frontandback"]);
	this.cullorder = this.reader.getItem(globals, 'cullorder', ["ccw","cw"]);

	console.log("Globals read from file: {background=" + this.background + ", drawmode=" + this.drawmode + ", cullface=" + this.cullface + ", cullorder=" + this.cullorder + "}");

	var tempList=rootElement.getElementsByTagName('list');

	if (tempList == null  || tempList.length==0) {
		return "list element is missing.";
	}

	this.list=[];
	// iterate over every element
	var nnodes=tempList[0].children.length;
	for (var i=0; i< nnodes; i++)
	{
		var e=tempList[0].children[i];

		// process each element and store its information
		this.list[e.id]=e.attributes.getNamedItem("coords").value;
		console.log("Read list item id "+ e.id+" with value "+this.list[e.id]);
	};

};

/*
 * Callback to be executed on any read error
 */

MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);
	this.loadedOk=false;
};

//Needs to consider the case of multilpe tag definition
MySceneGraph.prototype.parseLSX=function(rootElement){
	var elems =  rootElement.getElementsByTagName('INITIALS');
		if(elems.length == 0){
			this.errors.push('Missing INITIALS TAG');
			return "Missing INITIALS tag.";
		}
	console.log('Starting INITIALS parsing');
	var initials = elems[0];
	var initRet = this.parseInitials(initials);
	if(initRet != null){
		return "Something went wrong there :/";
	}
	console.log('Done INITIALS parsing');
	
	elems = rootElement.getElementsByTagName('ILLUMINATION');
	if(elems.length == 0){
			this.errors.push('Missing ILLUMINATION TAG');
			return "Missing ILLUMINATION tag.";
		}
	console.log('Starting ILLUMINATION parsing');
	var illum = elems[0];
	var illumRet = this.parseIllum(illum);

	this.ParseLeaves(rootElement);

}

//Everything is an error until default values are selected
MySceneGraph.prototype.parseInitials=function(initials){
	//frustum processing
	var frustum = initials.getElementsByTagName('frustum');
	if(frustum == null || frustum.length != 1){
		this.errors.push('Missing frustum tag or multiple frustum tags found.');
		return "Missing frustum tag or multiple frustum tags found.";
	}

	this.frustumNear = this.reader.getFloat(frustum[0], 'near', 'near');
	this.frustumFar = this.reader.getFloat(frustum[0], 'far', 'far');

	//initial translate processing
	var initTrans = initials.getElementsByTagName('translate');
	if(initTrans == null || initTrans.length != 1){
		this.errors.push('Missing translate tag or multiple translate tags found.');
		return "Missing translate tag or multiple frustum tags found.";
	}

	this.initTransx = this.reader.getFloat(initTrans[0], 'x', ['x', 'y', 'z']);
	this.initTransy = this.reader.getFloat(initTrans[0], 'y', ['x', 'y', 'z']);
	this.initTransz = this.reader.getFloat(initTrans[0], 'z', ['x', 'y', 'z']);

	//initial rotations processing
	var initRot = initials.getElementsByTagName('rotation');
	if(initRot == null || initRot.length != 3){
		this.errors.push('Missing 1 or both rotation tags on the INITIALS tag');
		return "Missing 1 or both rotation tags on the INITIALS tag";
	}
	
	var initRot1 = initRot[0];

	this.initRot1Axis = this.reader.getString(initRot1, 'axis', ['axis', 'angle']);
	this.initRot1Axis = this.reader.getString(initRot1, 'angle', ['axis', 'angle']);

	var initRot2 = initRot[1];

	this.initRot2Axis = this.reader.getString(initRot2, 'axis', ['axis', 'angle']);
	this.initRot2Axis = this.reader.getString(initRot2, 'angle', ['axis', 'angle']);

	var initRot3 = initRot[2];

	this.initRot3Axis = this.reader.getString(initRot3, 'axis', ['axis', 'angle']);
	this.initRot3Axis = this.reader.getString(initRot3, 'angle', ['axis', 'angle']);

	//inital scaling processing

	var initScale = initials.getElementsByTagName('scale');
	if(initScale == null || initScale.length != 1){
		this.errors.push('Missing scale tag on the INITIALS tag');
		return "Missing sacle tag on the INITIALS tag";
	}

	this.initScalex = this.reader.getFloat(initScale[0], 'sx', ['sx', 'sy', 'sz']);
	this.initScaley = this.reader.getFloat(initScale[0], 'sy', ['sx', 'sy', 'sz']);
	this.initScalez = this.reader.getFloat(initScale[0], 'sz', ['sx', 'sy', 'sz']);

	//reference length processing 

	var ref = initials.getElementsByTagName('reference');
	if(ref == null || ref.length != 1){
		this.errors.push('Missing reference tag on the INITIALS tag');
		return "Missing reference tag on the INITIALS tag";
	}

	this.refLength = this.reader.getFloat(ref[0], 'length', 'length');

}

MySceneGraph.prototype.parseIllum=function(illum){
	var ambient = illum.getElementsByTagName('ambient');
	if(ambient == null || ambient.length != 1){
		this.errors.push('Missing abient tag on the ILLUMINATION tag');
		return "Missing abient tag on the ILLUMINATION tag";
	}

	//BEM Q ME LIXARAM AQUI CRL
	//A getRGBA e pra valores declarados juntos (rgb="1 1 1 1")
	//this.ambLight = this.reader.getRGBA(ambient, '')
	this.ambLightR = this.reader.getFloat(ambient[0], 'r', ['r', 'g', 'b', 'a']);
	this.ambLightG = this.reader.getFloat(ambient[0], 'g', ['r', 'g', 'b', 'a']);
	this.ambLightB = this.reader.getFloat(ambient[0], 'b', ['r', 'g', 'b', 'a']);
	this.ambLightA = this.reader.getFloat(ambient[0], 'a', ['r', 'g', 'b', 'a']);
	

	var doubleside = illum.getElementsByTagName('doubleside');
	if(ambient == null || ambient.length != 1){
		this.errors.push('Missing doubleside tag on the ILLUMINATION tag');
		return "Missing doubleside tag on the ILLUMINATION tag";   
	}

	this.doubleside = this.reader.getInteger(doubleside[0], 'value', 'value');
	
	var backgrd = illum.getElementsByTagName('background');
	if(ambient == null || ambient.length != 1){
		this.errors.push('Missing background tag on the ILLUMINATION tag');
		return "Missing background tag on the ILLUMINATION tag";
	}

	this.bgLightR = this.reader.getFloat(backgrd[0], 'r', ['r', 'g', 'b', 'a']);
	this.bgLightG = this.reader.getFloat(backgrd[0], 'g', ['r', 'g', 'b', 'a']);
	this.bgLightB = this.reader.getFloat(backgrd[0], 'b', ['r', 'g', 'b', 'a']);
	this.bgLightA = this.reader.getFloat(backgrd[0], 'a', ['r', 'g', 'b', 'a']);

}
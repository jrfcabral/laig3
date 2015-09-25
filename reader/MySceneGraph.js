
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
	this.ParseLeaves(rootElement);

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



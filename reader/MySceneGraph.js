
function MySceneGraph(filename, scene) {
    this.loadedOk = null ;

    // Establish bidirectional references between scene and graph
    this.scene = scene;
    scene.graph = this;

    //List of drawable primitives
    this.allowedPrimitives = ['rectangle', 'sphere', 'cylinder', 'triangle'];

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

    /*
	* Dictionary containing all the lights of the scene
	* Care must be taken that all the ids are unique
	*/
    this.lightsDic = [];
    this.lightsNum;

    /*
	* Dictionary containing all textures specified in the LSX file
	* Care must be taken that all the ids are unique
	* Need to check what best identifiers would be
	*/
    this.textures = [];

    /*
	* Dictionary containing all materials specified in the LSX file
	* Care must be taken that all the ids are unique
	*/
    this.materials = [];


	 /*
	* Dictionary containing all animations specified in the LSX file
	* Care must be taken that all the ids are unique
	*/	
    this.linearAnimations = [];
    this.circularAnimations = [];

    // File reading
    this.reader = new CGFXMLreader();

    /*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */

    this.reader.open('scenes/' + filename, this);

}

/**
* Loops through the list of nodes declared on the Graph Scene file
* Since a node is more complicated than a leave the processing into internal representation has been delegate to the encodeNode function.
* See ProcessNode documentation for details on the node's interal representation.
* @param rootElement object corresponding to the <SCENE> tag from which all others descend
* @return null if the function encounters a fatal error situation
*/
MySceneGraph.prototype.ParseNodes = function(rootElement) {
    console.log("Starting NODES parsing");

    elems = rootElement.getElementsByTagName('NODES');
	console.log(elems[0]);
    if (!elems[0]){
        this.errors.push("NODES element is missing");
        return;
    }
    if (elems.length != 1)
        this.warnings.push("more than one NODES element is present");

    this.root = elems[0].getElementsByTagName('ROOT')[0].id;
    if (!this.root) {
        this.errors.push("No ROOT element in NODES");
        return;
    }


    var nodes = elems[0].getElementsByTagName('NODE');
    var numberNodes = nodes.length;
    for (var i = 0; i < numberNodes; i++) {
        console.log("Parsing node with id " + nodes[i].id);
        this.EncodeNode(nodes[i]);
    }
    console.log("Done NODES parsing");

}
;


/**
* Creates node data structure
* Internal representation of a node as an object with the fields:
* id: the unique id of the node
* material: the unique id of a material
* texture: the unique id of a texture
* transformations: stack of transformations to be applied when this node is processed
* descendants: array of the ids of nodes or leaves that descend from this node
* @param node object corresponding to a <NODE>
* @return returns when either no <MATERIAL> or no <TEXTURE> tag is found (or both)
*/
MySceneGraph.prototype.EncodeNode = function(node) {

	if(this.nodes[node.id] != null){
		this.errors.push("There are two or more nodes wih the same id " + node.id);
		return;
	}

    var material = node.getElementsByTagName('MATERIAL')[0];
    if(!material){this.errors.push("MATERIAL tag missing on NODE " + node.id);return;}
	else if(material.id != "null" && this.materials[material.id] == null){
		this.errors.push("node " + node.id + " references a non-existant or damaged material.");
	}
	//console.log(this.textures["wood"]);

    var texture = node.getElementsByTagName('TEXTURE')[0];
     if(!texture){this.errors.push("TEXTURE tag missing on NODE " + node.id);return;}
    if(texture.id != "null" && texture.id != "clear" && this.textures[texture.id] == null){
    	this.errors.push("node " + node.id + " references a non-existant or damaged texture");
    }
	
	var nodeAnims = [];
	var anim = node.getElementsByTagName('ANIMATION');
	var animNum = anim.length;
	var startTimes = []; //important for later
	console.log("animations.length is " + anim.length);
	for(var i = 0; i < animNum; i++){
		if(anim[i].id == null){
			this.errors.push("Animation in node " + node.id + "has no id");
			return;
		}
		else if(this.linearAnimations[anim[i].id] == null && this.circularAnimations[anim[i].id] == null){
			this.errors.push("node " + node.id + " references a non-existant or damaged animation");
		}
		nodeAnims.push(anim[i].id);
		startTimes.push(0);
	}

    var transformations = [];
    var descendant_ids = [];

    //process all transformations, which should occupy indexes between 2 until a node with tag descendents is found
    var i;
    var matrix = mat4.create();
    mat4.identity(matrix);
    for (i = 2+animNum; node.children[i].tagName != 'DESCENDANTS'; i++) { 
        var transformation = node.children[i];
		var transformation_matrix = mat4.create();
		mat4.identity(transformation_matrix);

        switch(transformation.tagName){

        	case 'ROTATION':
        		var axis = transformation.getAttribute('axis');
        		var vector = vec3.create();
        		if(axis == 'x')
        			vec3.set(vector, 1, 0, 0);
        		else if(axis == 'y')
        			vec3.set(vector, 0, 1, 0);
        		else if (axis == 'z')
        			vec3.set(vector, 0, 0, 1);

        		var angle = parseFloat(transformation.getAttribute('angle'));
        		angle = angle*Math.PI/180.0;

        		mat4.rotate(matrix, matrix, angle, vector);
        		break;

        	case 'SCALE':
        		var scale_vector = vec3.create();
        		vec3.set(scale_vector, transformation.getAttribute('sx'), transformation.getAttribute('sy'), transformation.getAttribute('sz') );
        		mat4.scale(matrix, matrix, scale_vector);
        		break;

        	case 'TRANSLATION':
        		var translation_vector = vec3.create();
        		vec3.set(translation_vector, transformation.getAttribute('x'), transformation.getAttribute('y'), transformation.getAttribute('z') );
        		mat4.translate(matrix, matrix, translation_vector);
        		break;

        	default:
        		this.errors.push("Malformed transformation tags or delimiters at " +node.id);
        		return;
        		break;


        }

    }

    var descendants = node.getElementsByTagName('DESCENDANTS')[0];

    for (var j = 0; j < descendants.children.length; j++) {
        descendant_ids[j] = descendants.children[j].id;
    }

    this.nodes[node.id] = {
        id: node.id,
        material: material.id,
        texture: texture.id,
        animations: nodeAnims,
        currentAnimation: 0, //to be discussed
        animationStartTimes: startTimes,
        matrix: matrix,
        descendants: descendant_ids
    };

}

/**
* Parses leaves within the <LEAVES> tag
* Internal representation of a leaf as an object with the fields:
* id: the unique id of the leaf
* type: one of the identifiers of the drawable primitives. Allowed primitves are on the array allowedPrimitives of MySceneGraph.
* args: array of the float arguments of the primitives
* @param rootElement object corresponding to the <SCENE> tag from which all others descend
* @return returns null when no <LEAVES> tag is found or when a value can't be converted to a float
*/
MySceneGraph.prototype.ParseLeaves = function(rootElement) {
    console.log("Parsing leaves");

    var elems = rootElement.getElementsByTagName('LEAVES');

    if (elems[0] == null ) {
        this.errors.push("LEAVES element is missing");
        return;
    }
    if (elems.length != 1) {
        this.warnings.push("more than one LEAVES element present");
    }

    var numberLeaves = elems[0].children.length;

	if(numberLeaves < 1){
		this.errors.push("There are no leaves in the LEAVES tag");
		return;
	}

    for (var i = 0; i < numberLeaves; i++) {
        var leaf = elems[0].children[i];

        if (this.leaves[leaf.id] != null ) {
            this.errors.push("there are leaves with repeated id \"" + id + "\"");
           	continue;
        }

        //tokenize args value and convert it into a list of floats
        var strargs = this.reader.getString(leaf, "args").split(" ");
        var args = [];

        for (var j = 0; j < strargs.length; j++) {
            args[j] = parseFloat(strargs[j]);
            //check for values that can't be converted into floats
            if (args[j] == NaN) {
                this.errors.push("no conversion to float for argument no." + j + " of leaf with id " + leaf.id);
                return;
            }
        }

	var object;
	var type= this.reader.getItem(leaf, "type", this.allowedPrimitives);

	if(type === "rectangle")
		object = new rectangle(this.scene,[args[0],args[1]],[args[2],args[3]]);

	else if (type === "sphere")
		object = new sphere(this.scene, args[0],args[1],args[2]);

	else if(type === "triangle")
		object = new triangle(this.scene, [args[0],args[1],args[2]],
		[args[3],args[4],args[5]],
		[args[6],args[7],args[8]]);

	else if (type ==="cylinder")
		object = new cylinder(this.scene, args[0], args[1],args[2], args[3], args[4]);
	else{
		this.errors.push("Unknown primitive type on LEAF " + leaf.id)
	}
    //store values in leaves hashmap, key is the unique id
    this.leaves[leaf.id] = {
    	id: leaf.id,
        object: object
    };

        console.log("Parsed leaf with id " + leaf.id);

    }
    console.log("Leaves parsed");
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function()
{
    console.log("XML Loading finished.");
    var rootElement = this.reader.xmlDoc.documentElement;

    // Here should go the calls for different functions to parse the various blocks
    this.parseLSX(rootElement);

	if (this.errors.length == 0){
    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
	}
}
;


/*
 * Callback to be executed on any read error
 */

MySceneGraph.prototype.onXMLError = function(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
}
;

/**
* Main function for LSX parsing.
* @param rootElement object corresponding to the <SCENE> tag from which all others descend
*/
MySceneGraph.prototype.parseLSX = function(rootElement) {

    var elems = rootElement.getElementsByTagName('INITIALS');
    if (elems.length == 0) {
        this.errors.push('Missing INITIALS TAG');
    }
	else{
    	console.log('Starting INITIALS parsing');
    	var initials = elems[0];
    	this.parseInitials(initials);
    	console.log('Done INITIALS parsing');
	}


    elems = rootElement.getElementsByTagName('ILLUMINATION');
    if (elems.length == 0) {
        this.errors.push('Missing ILLUMINATION TAG');
    }
	else{
		console.log('Starting ILLUMINATION parsing');
    	var illum = elems[0];
    	this.parseIllum(illum);
    	console.log('Done ILLUMINATION parsing');
	}

    elems = rootElement.getElementsByTagName('LIGHTS');
    if (elems.length == 0) {
        this.errors.push('Missing LIGHTS TAG');
    }
	else{
		console.log('Starting LIGHTS parsing');
    	var lights = elems[0];
    	this.parseLights(lights);
    	console.log('Done LIGHTS parsing');
	}
    


    elems = rootElement.getElementsByTagName('TEXTURES');
    if (elems.length == 0) {
        this.errors.push('Missing TEXTURES tag.');
    }
	else{
		console.log('Starting TEXTURES parsing');
    	var tex = elems[0];
    	this.parseTex(tex);
    	console.log('Done TEXTURES parsing');
	}
    

    elems = rootElement.getElementsByTagName('MATERIALS');
    if (elems.length == 0) {
        this.errors.push('Missing MATERIALS tag.');
    }
	else{
		console.log('Starting MATERIALS parsing');
    	var mat = elems[0];
    	this.parseMaterials(mat);
    	console.log('Done MATERIALS parsing');
	}

	elems = rootElement.getElementsByTagName('ANIMATIONS');
	if (elems.length == 0) {
        this.errors.push('Missing ANIMATIONS tag.');
    }
    else{
    	console.log('Starting ANIMATIONS parsing');
    	var anims = elems[0];
    	this.parseAnims(anims);
    	console.log('Done ANIMATIONS parsing');
	}

	console.log(this.animations);

    this.ParseLeaves(rootElement);
    this.ParseNodes(rootElement);

    console.log('WARNINGS: ')
    if (this.warnings.length != 0) {
        for (var i = 0; i < this.warnings.length; i++) {
            console.warn(this.warnings[i]);
        }
    }
    else {
        console.log('No warnings!');
    }

    console.log('ERRORS: ')
    if (this.errors.length != 0) {
        for (var i = 0; i < this.errors.length; i++) {
            this.onXMLError(this.errors[i]);
        }
    }
    else {
        console.log('No errors!');
    }

}

/**
* Parses the <INITIALS> tag
* @param initials corresponds to the <INITIALS> tag
* 
*/
MySceneGraph.prototype.parseInitials = function(initials) {
    //frustum processing
    var frustum = initials.getElementsByTagName('frustum');
    if (frustum == null  || frustum.length != 1) {
        this.errors.push('Missing frustum tag or multiple frustum tags found inside INITIALS.');
    }
    else {
        this.frustumNear = this.reader.getFloat(frustum[0], 'near');
        this.frustumFar = this.reader.getFloat(frustum[0], 'far');
    }

	this.transformationsOK = true;

    //initial translation processing
    var initTrans = initials.getElementsByTagName('translation');
    if (initTrans == null  || initTrans.length != 1) {
        this.errors.push('Missing translation tag or multiple translation tags found.');
        this.transformationsOK = false;
    }
    else {
        initTransx = this.reader.getFloat(initTrans[0], 'x');
     	initTransy = this.reader.getFloat(initTrans[0], 'y');
        initTransz = this.reader.getFloat(initTrans[0], 'z');
    }

    //initial rotations processing
    var initRot = initials.getElementsByTagName('rotation');
    if (initRot == null  || initRot.length != 3) {
        this.errors.push('Missing rotation tags on the INITIALS tag. There should be three of them.');
         this.transformationsOK = false;
    }
    else {
    	
        var initRot1 = initRot[0];

        initRot1Axis = this.reader.getString(initRot1, 'axis');
        initRot1Angle = parseFloat(this.reader.getString(initRot1, 'angle'))*Math.PI/180;

        var initRot2 = initRot[1];

        initRot2Axis = this.reader.getString(initRot2, 'axis');
        initRot2Angle = parseFloat(this.reader.getString(initRot2, 'angle'))*Math.PI/180;

        var initRot3 = initRot[2];

        initRot3Axis = this.reader.getString(initRot3, 'axis');
        initRot3Angle = parseFloat(this.reader.getString(initRot3, 'angle'))*Math.PI/180;
    }
	

    //inital scaling processing

    var initScale = initials.getElementsByTagName('scale');
    if (initScale == null  || initScale.length != 1) {
        this.errors.push('Missing scale tag on the INITIALS tag');
         this.transformationsOK = false;
    }
    else {
        initScalex = this.reader.getFloat(initScale[0], 'sx');
        initScaley = this.reader.getFloat(initScale[0], 'sy');
        initScalez = this.reader.getFloat(initScale[0], 'sz');
    }

    //hashmap to help translate axis character into vector
    var axii = [];
    axii["x"] = [1,0,0];
    axii["y"] = [0,1,0];
    axii["z"] = [0,0,1];

	//compute transformation matrix corresponding to the transformation values read from lsx
	
	if(this.transformationsOK){
		this.initialsMatrix = mat4.create();
   		mat4.identity(this.initialsMatrix);
   		mat4.scale(this.initialsMatrix, this.initialsMatrix, [initScalex, initScaley, initScalez]);
		mat4.rotate(this.initialsMatrix, this.initialsMatrix, initRot3Angle, axii[initRot3Axis]);
		mat4.rotate(this.initialsMatrix, this.initialsMatrix, initRot2Angle, axii[initRot2Axis]);
		mat4.rotate(this.initialsMatrix, this.initialsMatrix, initRot1Angle, axii[initRot1Axis]);
		mat4.translate(this.initialsMatrix, this.initialsMatrix,[initTransx, initTransy, initTransz]);	
	}	
   

    //reference length processing

    var ref = initials.getElementsByTagName('reference');
    if (ref == null  || ref.length != 1) {
        this.errors.push('Missing reference tag on the INITIALS tag');
    }
    else {
        this.refLength = this.reader.getFloat(ref[0], 'length');
    }


}

/**
* Parses the <ILLUMINATION> tag
* @param illum corresponds to the <ILLUMINATION> tag
* 
*/
MySceneGraph.prototype.parseIllum = function(illum) {
    var ambient = illum.getElementsByTagName('ambient');
    if (ambient == null  || ambient.length != 1) {
        this.errors.push('Missing ambient tag in the ILLUMINATION tag');
    }
    else {
        this.globalAmbLight = this.getRGBAProper(ambient[0]);
    }

    var backgrd = illum.getElementsByTagName('background');
    if (backgrd == null  || backgrd.length != 1) {
        this.errors.push('Missing background tag in the ILLUMINATION tag');
    }
    else {
        this.bgLight = this.getRGBAProper(backgrd[0]);
    }


}

/**
* Parses the <LIGHTS> tag
* @param lights corresponds to the <LIGHTS> tag
* 
*/
MySceneGraph.prototype.parseLights = function(lights) {

    var numberLights = lights.children.length;
    if (numberLights > 8) {
        this.warnings.push('WebGL only supports 8 lights. Only the first 8 lights will be taken into account.');
    }

    this.lightsNum = numberLights;

    for (var i = 0; i < ((this.lightsNum > 8)? 8:this.lightsNum); i++) {
        var light = lights.children[i];
        
		for(var j = 0; j < i; j++){
			if(this.lightsDic[j].id == light.id){
        		this.errors.push("There are two or more LIGHTs with the same id " + light.id);
        	}
		}

        

        var enable = light.getElementsByTagName('enable');
        if (enable == null  || enable.length != 1) {
            this.errors.push('Missing enable tag or multiple enable tags on light ' + light.id);
        }
        else {
            enable = enable[0];

            this.enableVal = this.reader.getInteger(enable, 'value', ['0', '1']);
            if (this.enableVal != 0 && this.enableVal != 1) {
                this.errors.push('Illegal value for enable tag on light' + light.id);

            }
        }

        var position = light.getElementsByTagName('position');
        if (position == null  || position.length != 1) {
            this.errors.push('Missing position tag or multiple position tags on light' + light.id);
			this.transformationsOK = false;
        }
        else {
            position = position[0];

            posx = this.reader.getFloat(position, 'x');
            posY = this.reader.getFloat(position, 'y');
            posZ = this.reader.getFloat(position, 'z');
            posW = this.reader.getFloat(position, 'w');
        }

		if(this.transformationsOK){
		var position = [posx, posY, posZ, posW];
		vec4.transformMat4(position, position, this.initialsMatrix);
		}


        var illum = this.getIllumination(light, 'LIGHT');
        if (illum == -1) {
            this.errors.push("Something went wrong parsing the illumination values for light" + light.id);
        }	
        var enableLight;
		if (this.enableVal == 1)
			enableLight = true;
		else
			enableLight = false;
        //Can't see why lig	hts need IDs and it's easier to just go with numbers here
        this.lightsDic[i] = {
            id: light.id,
            enable: enableLight,
            position: position,
            ambient: illum[0],
            diffuse: illum[1],
            specular: illum[2]            
        };
    }
}


/**
* Parses the <TEXTURES> tag
* @param lights corresponds to the <TEXTURES> tag
* 
*/
MySceneGraph.prototype.parseTex = function(tex) {

    var numberTex = tex.children.length;
	var texOK = true;
    for (var i = 0; i < numberTex; i++) {
        var texture = tex.children[i];

        if(this.textures[texture.id] != null){
        	this.errors.push("There are two or more textures with the same id " + texture.id);
        	continue;
        }

        var filePath = texture.getElementsByTagName('file');
        if (filePath == null  || filePath.length != 1) {
            this.errors.push('Missing file tag or multiple file tags on texture ' + texture.id);
			texOK = false;
        }
        else {
            filePath = filePath[0];
            file = this.reader.getString(filePath, 'path');
        }



        var ampFactor = texture.getElementsByTagName('amplif_factor');
        if (ampFactor == null  || ampFactor.length != 1) {
            this.errors.push('Missing amplif_factor tag or multiple amplif_factor tags on texture' + texture.id);
			texOK = false;
        }
        else {
            ampFactor = ampFactor[0];
            amplifS = this.reader.getFloat(ampFactor, 's');
          	amplifT = this.reader.getFloat(ampFactor, 't');
        }

		if(texOK){
			textureObject = new CGFtexture(this.scene, file);
      	    this.textures[texture.id] = {
            	id: texture.id,
            	path:file,
            	ampFactor: [amplifS, amplifT],
            	texture: textureObject,
       	    };	
		}
		
    }


}

/**
* Parses the <MATERIALS> tag
* @param lights corresponds to the <MATERIALS> tag
* 
*/
MySceneGraph.prototype.parseMaterials = function(mat) {
    var numberMat = mat.children.length;

    for (var i = 0; i < numberMat; i++) {
        var material = mat.children[i];

		if(this.materials[material.id] != null){
        	this.errors.push("There are two or more materials with the same id " + material.id);
        	continue;
        }

        var shininess = material.getElementsByTagName('shininess');
        if (shininess == null  || shininess.length != 1) {
            this.errors.push('Missing shininess tag or multiple shininess tags on material' + material.id);

        }
        else {
            shininess = shininess[0];
            this.shine = this.reader.getFloat(shininess, 'value');

        }

        var illum = this.getIllumination(material, 'MATERIAL');
        if (illum == -1) {
            this.errors.push("Something went wrong parsing the illumination values for material" + material.id);
        }

        var emissionLightMat = material.getElementsByTagName('emission');
        if (emissionLightMat == null  || emissionLightMat.length != 1) {
            this.errors.push('Missing emission tag or multiple emission tags on MATERIAL ' + material.id);
            return -1;
        }

        emissionLightMat = emissionLightMat[0];

        this.emi = this.getRGBAProper(emissionLightMat, 'MATERIAL', material.id, 'emission');

        actMaterial = new CGFappearance(this.scene);
        actMaterial.setAmbient(illum[0][0], illum[0][1], illum[0][2], illum[0][3]);
        actMaterial.setDiffuse(illum[1][0], illum[1][1], illum[1][2], illum[1][3]);
        actMaterial.setSpecular(illum[2][0], illum[2][1], illum[2][2], illum[2][3]);
        actMaterial.setEmission(this.emi[0], this.emi[1], this.emi[2], this.emi[3]);
		actMaterial.setTextureWrap('REPEAT', 'REPEAT');
        this.materials[material.id] = actMaterial;
    }
}

MySceneGraph.prototype.parseAnims = function(anims){
	var numAnims = anims.children.length;
	
	for(var i = 0; i < numAnims; i++){
		var animation = anims.children[i];
		var animOK = true;
		if(!animation.id){
			this.errors.push("There's an animation with no id.");
		}
		console.log(animation);
		if(this.linearAnimations[animation.id] != null || this.circularAnimations[animation.id] != null){
        	this.errors.push("There are two or more animations with the same id " + animation.id);
        	continue;
        }

       var animSpan = this.reader.getFloat(animation, 'span');
       if(animSpan == null){
       		this.errors.push("Missing span attribute from animation " + animation.id);
       }
      
		var animType = this.reader.getString(animation, 'type');
		if(animType == null){
			this.errors.push("Missing type attribute from animation " + animation.id);
		}

		if(animType == "linear"){
			this.parseLinearAnimation(animation, animSpan);
		}
		else if(animType == "circular"){

		}
		else{
			this.errors.push("Unknown animation type in animation " + animation.id);
		}
   
	}
}

MySceneGraph.prototype.parseLinearAnimation = function(animation, animSpan){
	var controlPoints = this.parseControlPoints(animation);
	if(!controlPoints)
			this.errors.push("Linear Animations need at least 2 control points.");
	else{
		var animObj = new LinearAnimation(animSpan, controlPoints);
		if(!animObj)
			this.errors.push("Something went wrong instantiating animation " + animation.id);

		if(animObj && controlPoints){
			this.linearAnimations[animation.id] = {
				id: animation.id,
				span: animSpan,
				points: controlPoints,
				object: animObj
			};
		}
		
	}

}

MySceneGraph.prototype.parseCircularAnimation = function(animation, animSpan){
	console.log("Under construction :S");
}


MySceneGraph.prototype.parseControlPoints = function(anim){
	var numPoints = anim.children.length;
	if(numPoints < 2)
		return false;
	this.points = [];

	for(var i = 0; i < numPoints; i++){
		var controlPoint = anim.children[i];
		this.pointCoords = this.getXYZ(controlPoint);
		this.points[i] = this.pointCoords;
	}
	return this.points;
}

MySceneGraph.prototype.getXYZ = function(elem){
	this.X = this.reader.getFloat(elem, 'x', true);
	this.Y = this.reader.getFloat(elem, 'y', true);
	this.Z = this.reader.getFloat(elem, 'z', true);

	return [this.X, this.Y, this.Z];
}

/**
* Gets all the color components (R, G, B, A)
* @param elem element from which to parse the color
* @param tag name of the tag the colors are being gotten from
* @param tagId id of the aforementioned tag
* @param comp name of the light component the colors pertain to (ambient, diffuse, etc) 
* @return an array with the color components in the right order (RGBA)
*/
MySceneGraph.prototype.getRGBAProper = function(elem, tag, tagId, comp) {
    this.R = this.reader.getFloat(elem, 'r');
    this.G = this.reader.getFloat(elem, 'g');
    this.B = this.reader.getFloat(elem, 'b');
    this.A = this.reader.getFloat(elem, 'a');
	
	if(this.R < 0 || this.R > 1){
		this.warnings.push("Red has an out of range value on " + tag + " " + tagId + " on the " + comp + " component");
	}
	if(this.G < 0 || this.G > 1){
		this.warnings.push("Green has an out of range value on " + tag + " " + tagId + " on the " + comp + " component");
	}
	if(this.B < 0 || this.B > 1){
		this.warnings.push("Blue has an out of range value on " + tag + " " + tagId + " on the " + comp + " component");
	}
	if(this.A < 0 || this.A > 1){
		this.warnings.push("Alpha has an out of range value on " + tag + " " + tagId + " on the " + comp + " component");
	}


    return [this.R, this.G, this.B, this.A];
}


/**
* Gets ambient, diffuse and specular light components
* @param obj object from which to extract the components
* @param tag a string containing the name of the tag that corresponds to the object passed
* (used to report errors)
* @return an array of arrays containing the different light components in the right order
* (ambient, diffuse, specular)
*/
MySceneGraph.prototype.getIllumination = function(obj, tag) {

    var ambientLight = obj.getElementsByTagName('ambient');
    if (ambientLight == null  || ambientLight.length != 1) {
        this.errors.push("Missing ambient tag on or mutiple ambient tags found on " + tag +" "+ obj.id);

    }
    else {
        ambientLight = ambientLight[0];
        this.ambient = this.getRGBAProper(ambientLight, tag, obj.id, 'ambient');
    }


    var diffuseLight = obj.getElementsByTagName('diffuse');
    if (diffuseLight == null  || diffuseLight.length != 1) {
        this.errors.push("Missing diffuse tag on or mutiple ambient tags found on " + tag + " " + obj.id);

    }
    else {
        diffuseLight = diffuseLight[0];
        this.diffuse = this.getRGBAProper(diffuseLight, tag, obj.id, 'diffuse');
    }


    var specularLight = obj.getElementsByTagName('specular');
    if (specularLight == null  || specularLight.length != 1) {
        this.errors.push("Missing specular tag on or mutiple ambient tags found on " + tag + " " + obj.id);

    }
    else {
        specularLight = specularLight[0];
        this.specular = this.getRGBAProper(specularLight, tag, obj.id, 'specular');
    }


    return [this.ambient, this.diffuse, this.specular];
}

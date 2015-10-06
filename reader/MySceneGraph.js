
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
    this.textures = []

    /*
	* Dictionary containing all materials specified in the LSX file
	* Care must be taken that all the ids are unique
	* Need to check what best identifiers would be
	*/
    this.materials = []

    // File reading
    this.reader = new CGFXMLreader();

    /*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */

    this.reader.open('scenes/' + filename, this);

}

/*
* Loops through the list of nodes declared on the Graph Scene file
* Since a node is more complicated than a leave the processing into internal representation has been delegate to the encodeNode function.
* See ProcessNode documentation for details on the node's interal representation.
*/
MySceneGraph.prototype.ParseNodes = function(rootElement) {
    console.log("Parsing nodes");

    elems = rootElement.getElementsByTagName('NODES');

    if (elems == null )
        this.errors.push("NODES element is missing");
    if (elems.length != 1)
        this.warnings.push("more than one NODES element is present");

    this.root = elems[0].getElementsByTagName('ROOT')[0].id;
    if (!this.root) {
        this.errors.push("No ROOT element in NODES");
        return;
    }

    console.log(this.root);

    var nodes = elems[0].getElementsByTagName('NODE');
    var numberNodes = nodes.length;
    for (var i = 0; i < numberNodes; i++) {
        console.log("Parsing node with id " + nodes[i].id);
        this.EncodeNode(nodes[i]);
    }
    console.log("Nodes parsed");

}
;


/*
* Internal representation of a node as an object with the fields:
* id: the unique id of the node
* material: the unique id of a material
* texture: the unique id of a texture
* transformations: stack of transformations to be applied when this node is processed
* descendants: array of the ids of nodes or leaves that descend from this node
*/
MySceneGraph.prototype.EncodeNode = function(node) {
    var material = node.getElementsByTagName('MATERIAL')[0];
	if(material.id != "null" && this.materials[material.id] == null){
		this.errors.push("node " + node.id + " references a non-existant material.");
	}
	//console.log(this.textures["wood"]);

    var texture = node.getElementsByTagName('TEXTURE')[0];
    if(texture.id != "null" && texture.id != "clear" && this.textures[texture.id] == null){
    	this.errors.push("node " + node.id + " references a non-existant texture");
    }

    if (!material || !texture) {
        this.errors.push("node with id \"" + node.id + "\" did not have a material or a texture");
        return;
    }

    var transformations = [];
    var descendant_ids = [];

    //process all transformations, which should occupy indexes between 2 until a node with tag descendents is found
    var i;
    var matrix = mat4.create();
    mat4.identity(matrix);
    for (i = 2; node.children[i].tagName != 'DESCENDANTS'; i++) {
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


        }

    }
    console.log(matrix);

    var descendants = node.getElementsByTagName('DESCENDANTS')[0];

    for (var j = 0; j < descendants.children.length; j++) {
        descendant_ids[j] = descendants.children[j].id;
    }

    this.nodes[node.id] = {
        id: node.id,
        material: material.id,
        texture: texture.id,
        matrix: matrix,
        descendants: descendant_ids
    };

}

/*
* Internal representation of a leaf as an object with the fields:
* id: the unique id of the leaf
* type: one of the identifiers of the drawable primitives. Allowed primitves are on the array allowedPrimitives of MySceneGraph.
* args: array of the float arguments of the primitives
*/
MySceneGraph.prototype.ParseLeaves = function(rootElement) {
    console.log("Parsing leaves");

    var elems = rootElement.getElementsByTagName('LEAVES');

    if (elems == null ) {
        this.errors.push("LEAVES element is missing");
    }
    if (elems.length != 1) {
        this.warnings.push("more than one LEAVES element present");
    }

    var numberLeaves = elems[0].children.length;
    for (var i = 0; i < numberLeaves; i++) {
        var leaf = elems[0].children[i];

        if (this.leaves[leaf.id] != null ) {
            this.errors.push("there are leaves with repeated id \"" + id + "\"");
            return;
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
    //var error = this.parseGlobalsExample(rootElement);
    this.parseLSX(rootElement);


    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
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

//Needs to consider the case of multilpe tag definition
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

    this.ParseLeaves(rootElement);
    this.ParseNodes(rootElement);

    console.log('WARNINGS: ')
    if (this.warnings.length != 0) {
        for (var i = 0; i < this.warnings.length; i++) {
            console.warn(this.warnings[i]);
        }
    }
    else {
        console.log('No warnings! :)');
    }

    console.log('ERRORS: ')
    if (this.errors.length != 0) {
        for (var i = 0; i < this.errors.length; i++) {
            this.onXMLError(this.errors[i]);
        }
    }
    else {
        console.log('No errors! :D');
    }

}

//Everything is an error until default values are selected
MySceneGraph.prototype.parseInitials = function(initials) {
    //frustum processing
    var frustum = initials.getElementsByTagName('frustum');
    if (frustum == null  || frustum.length != 1) {
        this.errors.push('Missing frustum tag or multiple frustum tags found.');
    }
    else {
        this.frustumNear = this.reader.getFloat(frustum[0], 'near', 'near');
        this.frustumFar = this.reader.getFloat(frustum[0], 'far', 'far');
    }


    //initial translation processing
    var initTrans = initials.getElementsByTagName('translation');
    if (initTrans == null  || initTrans.length != 1) {
        this.errors.push('Missing translation tag or multiple translation tags found.');
    }
    else {
        this.initTransx = this.reader.getFloat(initTrans[0], 'x', ['x', 'y', 'z']);
        this.initTransy = this.reader.getFloat(initTrans[0], 'y', ['x', 'y', 'z']);
        this.initTransz = this.reader.getFloat(initTrans[0], 'z', ['x', 'y', 'z']);
    }

    //initial rotations processing
    var initRot = initials.getElementsByTagName('rotation');
    if (initRot == null  || initRot.length != 3) {
        this.errors.push('Missing 1 of the rotation tags on the INITIALS tag');
    }
    else {
        var initRot1 = initRot[0];

        this.initRot1Axis = this.reader.getString(initRot1, 'axis', ['axis', 'angle']);
        this.initRot1Axis = this.reader.getString(initRot1, 'angle', ['axis', 'angle']);

        var initRot2 = initRot[1];

        this.initRot2Axis = this.reader.getString(initRot2, 'axis', ['axis', 'angle']);
        this.initRot2Axis = this.reader.getString(initRot2, 'angle', ['axis', 'angle']);

        var initRot3 = initRot[2];

        this.initRot3Axis = this.reader.getString(initRot3, 'axis', ['axis', 'angle']);
        this.initRot3Axis = this.reader.getString(initRot3, 'angle', ['axis', 'angle']);
    }


    //inital scaling processing

    var initScale = initials.getElementsByTagName('scale');
    if (initScale == null  || initScale.length != 1) {
        this.errors.push('Missing scale tag on the INITIALS tag');
    }
    else {
        this.initScalex = this.reader.getFloat(initScale[0], 'sx', ['sx', 'sy', 'sz']);
        this.initScaley = this.reader.getFloat(initScale[0], 'sy', ['sx', 'sy', 'sz']);
        this.initScalez = this.reader.getFloat(initScale[0], 'sz', ['sx', 'sy', 'sz']);
    }

    //reference length processing

    var ref = initials.getElementsByTagName('reference');
    if (ref == null  || ref.length != 1) {
        this.errors.push('Missing reference tag on the INITIALS tag');
    }
    else {
        this.refLength = this.reader.getFloat(ref[0], 'length', 'length');
    }


}

MySceneGraph.prototype.parseIllum = function(illum) {
    var ambient = illum.getElementsByTagName('ambient');
    if (ambient == null  || ambient.length != 1) {
        this.errors.push('Missing ambient tag in the ILLUMINATION tag');
    }
    else {
        this.globalAmbLight = this.getRGBAProper(ambient[0]);
    }

    var backgrd = illum.getElementsByTagName('background');
    if (ambient == null  || ambient.length != 1) {
        this.errors.push('Missing background tag in the ILLUMINATION tag');
    }
    else {
        this.bgLight = this.getRGBAProper(backgrd[0]);
    }


}

MySceneGraph.prototype.parseLights = function(lights) {

    var numberLights = lights.children.length;
    if (numberLights > 8) {
        this.warnings.push('WebGL only supports 8 lights. Only the first 8 lights will be taken into account.');
    }

    this.lightsNum = numberLights;

    for (var i = 0; i < numberLights; i++) {
        var light = lights.children[i];

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

        }
        else {
            position = position[0];

            this.posX = this.reader.getFloat(position, 'x', ['x', 'y', 'z', 'w']);
            this.posY = this.reader.getFloat(position, 'y', ['x', 'y', 'z', 'w']);
            this.posZ = this.reader.getFloat(position, 'z', ['x', 'y', 'z', 'w']);
            this.posW = this.reader.getFloat(position, 'w', ['x', 'y', 'z', 'w']);
        }


        var illum = this.getIllumination(light, 'LIGHT');
        if (illum == -1) {
            this.errors.push("Something went wrong parsing the illumination values for light" + light.id);
        }

        //Can't see why lights need IDs and it's easier to just go with numbers here
        this.lightsDic[i] = {
            id: light.id,
            enable: this.enableVal,
            position: [this.posX, this.posY, this.posZ, this.posW],
            ambient: illum[0],
            diffuse: illum[1],
            specular: illum[2]
        };
    }
}

MySceneGraph.prototype.parseTex = function(tex) {

    var numberTex = tex.children.length;

    for (var i = 0; i < numberTex; i++) {
        var texture = tex.children[i];

        var filePath = texture.getElementsByTagName('file');
        if (filePath == null  || filePath.length != 1) {
            this.errors.push('Missing file tag or multiple file tags on texture' + texture.id);

        }
        else {
            filePath = filePath[0];
            this.file = this.reader.getString(filePath, 'path', 'path');
        }



        var ampFactor = texture.getElementsByTagName('amplif_factor');
        if (ampFactor == null  || ampFactor.length != 1) {
            this.errors.push('Missing amplif_factor tag or multiple amplif_factor tags on texture' + texture.id);

        }
        else {
            ampFactor = ampFactor[0];
            this.amplifS = this.reader.getFloat(ampFactor, 's', ['s', 't']);
            this.amplifT = this.reader.getFloat(ampFactor, 't', ['s', 't']);
        }



        this.textures[texture.id] = {
            id: texture.id,
            path: this.file,
            ampFactor: [this.amplifS, this.amplifT]
        };
    }


}

MySceneGraph.prototype.parseMaterials = function(mat) {
    var numberMat = mat.children.length;

    for (var i = 0; i < numberMat; i++) {
        var material = mat.children[i];

        var shininess = material.getElementsByTagName('shininess');
        if (shininess == null  || shininess.length != 1) {
            this.errors.push('Missing shininess tag or multiple shininess tags on material' + material.id);

        }
        else {
            shininess = shininess[0];
            this.shine = this.reader.getFloat(shininess, 'value', 'value');

        }

        var illum = this.getIllumination(material, 'MATERIAL');
        if (illum == -1) {
            this.errors.push("Something went wrong parsing the illumination values for material" + material.id);
        }

        var emissionLightMat = material.getElementsByTagName('emission');
        if (emissionLightMat == null  || emissionLightMat.length != 1) {
            this.errors.push('Missing emission tag or multiple specular tags on material' + material.id);
            return -1;
        }

        emissionLightMat = emissionLightMat[0];

        this.emi = this.getRGBAProper(emissionLightMat);

        this.actMaterial = new CGFappearance(this.scene);
        this.actMaterial.setAmbient(illum[0][0], illum[0][1], illum[0][2], illum[0][3]);
        this.actMaterial.setDiffuse(illum[1][0], illum[1][1], illum[1][2], illum[1][3]);
        this.actMaterial.setSpecular(illum[2][0], illum[2][1], illum[2][2], illum[2][3]);
        this.actMaterial.setEmission(this.emi[0], this.emi[1], this.emi[2], this.emi[3]);

        this.materials[material.id] = this.actMaterial;
    }
}

/* Gets all the color components */
MySceneGraph.prototype.getRGBAProper = function(elem) {
    this.R = this.reader.getFloat(elem, 'r', ['r', 'g', 'b', 'a']);
    this.G = this.reader.getFloat(elem, 'g', ['r', 'g', 'b', 'a']);
    this.B = this.reader.getFloat(elem, 'b', ['r', 'g', 'b', 'a']);
    this.A = this.reader.getFloat(elem, 'a', ['r', 'g', 'b', 'a']);

    return [this.R, this.G, this.B, this.A];
}


/*  Gets ambient, diffuse and specular light components*/
MySceneGraph.prototype.getIllumination = function(obj, tag) {

    var ambientLight = obj.getElementsByTagName('ambient');
    if (ambientLight == null  || ambientLight.length != 1) {
        this.warnings.push('Missing ambient tag on' + tag, obj.id + 'default values will be used');

    }
    else {
        ambientLight = ambientLight[0];
        this.ambient = this.getRGBAProper(ambientLight);
    }


    var diffuseLight = obj.getElementsByTagName('diffuse');
    if (diffuseLight == null  || diffuseLight.length != 1) {
        this.warnings.push('Missing ambient tag on' + tag, obj.id + 'default values will be used');

    }
    else {
        diffuseLight = diffuseLight[0];
        this.diffuse = this.getRGBAProper(diffuseLight);
    }


    var specularLight = obj.getElementsByTagName('specular');
    if (specularLight == null  || specularLight.length != 1) {
        this.warnings.push('Missing ambient tag on' + tag, obj.id + 'default values will be used');

    }
    else {
        specularLight = specularLight[0];
        this.specular = this.getRGBAProper(specularLight);
    }


    return [this.ambient, this.diffuse, this.specular];
}

/**
 * MyInterface
 * @constructor
 */
 
 
function MyInterface(scene) {
	//call CGFinterface constructor 
	CGFinterface.call(this);
	this.scene = scene;
};

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * init
 * @param {CGFapplication} application
 */
MyInterface.prototype.init = function(application) {
	// call CGFinterface init
	CGFinterface.prototype.init.call(this, application);
	
	// init GUI. For more information on the methods, check:
	//  http://workshop.chromeexperiments.com/examples/gui
	
	this.gui = new dat.GUI();


	this.group = this.gui.addFolder("Lights");

	this.gameOpts = this.gui.addFolder("Game Options");
	this.gameOpts.add(this.scene, 'undo');

	this.gameMode = this.gameOpts.addFolder('Game Mode')
	this.gameMode.add(this.scene, 'HvH').listen().onChange(function(value){
		this.object.HvB = !value;
		if(value){
			this.object.Random = false;
			this.object.Greedy = false;
		}
	});
	this.gameMode.add(this.scene, 'HvB').listen().onChange(function(value){
		this.object.HvH = !value;
		if(!value){
			this.object.Random = false;
			this.object.Greedy = false;
		}
		
	});

	this.botDiff = this.gameOpts.addFolder('Bot difficulty');
	
	this.botDiff.add(this.scene, 'Random').listen().onChange(function(value){
		if(!this.object.HvB){
			this.object.Random = false;
		}
		this.object.Greedy = !value;
	});
	this.botDiff.add(this.scene, 'Greedy').listen().onChange(function(value){
		if(!this.object.HvB){
			this.object.Greedy = false;
		}
		this.object.Random = !value;
		
	});


	this.scene.interface = this;
	
	return true;
};

/**
 * processKeyboard
 * @param event {Event}
 */
MyInterface.prototype.processKeyboard = function(event) {
	// call CGFinterface default code (omit if you want to override)
	CGFinterface.prototype.processKeyboard.call(this,event);
	
	// Check key codes e.g. here: http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
	// or use String.fromCharCode(event.keyCode) to compare chars
	
	// for better cross-browser support, you may also check suggestions on using event.which in http://www.w3schools.com/jsref/event_key_keycode.asp
	switch (event.keyCode)
	{
		case 42: console.warn*("lol xd"); break;
	};
};
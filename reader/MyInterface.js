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
	this.gameOpts.add(this.scene, 'replay');
	this.gameOpts.add(this.scene, 'reset');
	this.gameOpts.add(this.scene, 'HUD');
	this.gameOpts.add(this.scene, 'GoldenPlayer', {'Human': 0, 'Random': 'random', 'Greedy':'greedy'});
	this.gameOpts.add(this.scene, 'SilverPlayer', {'Human': 0, 'Random': 'random', 'Greedy':'greedy'});

	this.camControls = this.gameOpts.addFolder("Camera Controls");
	this.camControls.add(this.scene, 'RotateLeft');
	this.camControls.add(this.scene, 'RotateRight');


	this.scene.interface = this;
	
	return true;
};


MyInterface.prototype.setActiveCamera = function(cam){
	CGFinterface.prototype.setActiveCamera.call(this, cam);
}

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
		case 97: this.setActiveCamera(this.scene.camera); break;
		case 98: this.setActiveCamera(this.scene.leCamera); break;
		case 49: this.scene.loadScene1(); break;
		case 50: this.scene.loadScene2(); break;
		case 51: this.scene.loadScene3(); break;

	};
};
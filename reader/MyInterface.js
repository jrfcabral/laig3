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
	this.gameOpts.add(this.scene.board, 'AnimationSpeeds', 500, 3000);

	this.camControls = this.gameOpts.addFolder("Camera Controls");
	this.camControls.add(this.scene, 'RotateLeft');
	this.camControls.add(this.scene, 'RotateRight');
	this.camControls.add(this.scene, 'camHeight', -20, 0).listen().onChange(function(value){
		this.object.camera.setTarget(vec3.fromValues(0, value, 0));
	});

	this.sceneSelect = this.gameOpts.addFolder("Scenes");
	this.sceneSelect.add(this.scene, 'Scene1');
	this.sceneSelect.add(this.scene, 'Scene2');
	this.sceneSelect.add(this.scene, 'Scene3');

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
		case 119: this.scene.hud.moveHUD(0, 0.5, 0); break;
		case 115: this.scene.hud.moveHUD(0, -0.5, 0); break;
		case 97: this.scene.hud.moveHUD(-0.5, 0, 0); break;
		case 100: this.scene.hud.moveHUD(0.5, 0, 0); break;
		case 113: this.scene.hud.resetHUDPosition();
		case 49: this.scene.loadScene1(); break;
		case 50: this.scene.loadScene2(); break;
		case 51: this.scene.loadScene3(); break;
		

	};
	//console.log(event.keyCode);
};

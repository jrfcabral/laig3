/**
* This class represents a plane that shall be manipulated with the use of shaders to represent terrain
*/
function terrain(scene, heightmap, texture) {
    
    CGFobject.call(this, scene);
    
    this.scene = scene;
    this.heightmap = new CGFtexture(scene,heightmap);
    this.textured = new CGFtexture(scene,texture);
    
    
    this.shader = new CGFshader(scene.gl,"shaders/heightmap.vert","shaders/texture.frag");
    this.shader.setUniformsValues({
        uSampler2: 1,
        uSampler3: 2
    });
    this.plane = new Plane(this.scene,200);
}

terrain.prototype = Object.create(CGFobject.prototype);
terrain.prototype.constructor = terrain;

terrain.prototype.display = function() {
    this.scene.setActiveShader(this.shader);
    this.textured.bind(1);
    this.heightmap.bind(2);
    this.plane.display();
    this.scene.setActiveShader(this.scene.defaultShader);
}
;

terrain.prototype.updateTexCoords = function() {}
;

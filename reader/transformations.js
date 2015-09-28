function Translation(scene, x, y, z){
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.z = z;
}

Translation.prototype.Apply = function(){
    this.scene.translate(this.x, this.y, this.z);
}

function Rotation(scene, axis, angle){
    this.scene = scene;
    this.axis = axis;
    this.angle = angle;
}

Rotation.prototype.Apply = function(){
    if (this.axis == 'x')
        this.scene.rotate(this.angle, 1, 0, 0);
    else if (axis == 'y')
        this.scene.rotate(this.angle, 0, 1, 0);
    else if (axis == 'Z')
        this.scene.rotate(this.angle, 0, 0, 1);
}

function Scale(scene, x, y, z){
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.z = z;
}

Scale.prototype.Apply = function(){
    this.scene.scale(x, y, z);
}

function Transformation(transformation, scene){

    switch (transformation.tagName){
        case 'TRANSLATION':
            return new Translation(scene, parseFloat(transformation.getAttribute('x')),
                parseFloat(transformation.getAttribute('y')),
                parseFloat(transformation.getAttribute('z')));
            break;
        case 'ROTATION':
            return new Rotation(scene, transformation.getAttribute('axis'), parseFloat(transformation.getAttribute('angle')));
        case 'SCALE':
            return new Scale(scene,  parseFloat(transformation.getAttribute('sx')),
                parseFloat(transformation.getAttribute('sy')),
                parseFloat(transformation.getAttribute('sz')));
    }
}
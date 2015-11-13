attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vecTexCoord;

uniform sampler2D uSampler3;


void main() {
    vec3 offset = vec3(0.0,0.0,0.0);

    offset.xyz = aVertexNormal*texture2D(uSampler3, aTextureCoord).xyz;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+5.0*offset, 1.0);
	vecTexCoord = aTextureCoord;
}

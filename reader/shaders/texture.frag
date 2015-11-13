#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;

varying vec2 vecTexCoord;


void main() {
	
	gl_FragColor = texture2D(uSampler2, vecTexCoord);
		
	
}
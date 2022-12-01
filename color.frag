// Nathan Blair
precision highp float;

varying vec2 vPosition;

uniform sampler2D input_texture;


void main() {
    vec2 uv = vPosition.xy * 0.5 + 0.5;
    float brightness = texture2D(input_texture, uv).r;

    gl_FragColor = vec4(brightness, 0.5 + brightness * 0.5, 1.0, 1.0);
}
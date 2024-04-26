varying float vOpacity;
varying vec2 vUvOffset;
varying vec2 vUv;

uniform sampler2D uSprite;

void main() {

    vec2 uv = vUvOffset + vUv / 3.0;
    vec4 color = texture2D(uSprite, uv);

    gl_FragColor = vec4(color.rgb, vOpacity);
}
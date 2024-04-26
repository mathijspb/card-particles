attribute float opacity;
attribute vec2 uvOffset;

varying float vOpacity;
varying vec2 vUvOffset;
varying vec2 vUv;

void main() {
    vOpacity = opacity;
    vUvOffset = uvOffset;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
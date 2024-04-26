import { WebGLRenderer, Scene, Camera, PCFSoftShadowMap } from 'three';
import onWindowResize from './hooks/onWindowResize';

export default class Renderer {
    private renderer: WebGLRenderer;
    public domElement: HTMLCanvasElement;

    constructor() {
        this.renderer = this.createRenderer();
        this.domElement = this.renderer.domElement;

        // Hooks
        onWindowResize(this, this.resize);
    }

    private createRenderer(): WebGLRenderer {
        const renderer = new WebGLRenderer({
            antialias: true
        });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFSoftShadowMap;
        return renderer;
    }

    public render(scene: Scene, camera: Camera): void {
        this.renderer.render(scene, camera);
    }

    public resize(): void {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
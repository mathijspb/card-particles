import { PerspectiveCamera } from 'three';
import onWindowResize from './hooks/onWindowResize';
import Debugger from './Debugger';

export default class Camera {
    public camera: PerspectiveCamera;
    private debug = Debugger.addFolder({ title: 'Camera' });

    constructor() {
        this.camera = this.createCamera();

        // Hooks
        onWindowResize(this, this.resize);
    }

    createCamera() {
        const camera = new PerspectiveCamera(45);
        camera.position.z = 20;
        this.debug.addBinding(camera, 'position');
        return camera;
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
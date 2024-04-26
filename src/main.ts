import './style.css';

import Renderer from './Renderer';
import World from './World';
import onUpdate from './hooks/onUpdate';
import AssetLoader, { ImageLoader, GltfLoader, TextureLoader } from '@zooizooi/asset-loader';
import assets from './configs/assets';
import Consola from './Consola';
import Assets from './Assets';
import Globals from './Globals';
import Camera from './Camera';

AssetLoader.addLoader('gltf', GltfLoader);
AssetLoader.addLoader('image', ImageLoader);
AssetLoader.addLoader('texture', TextureLoader);

Assets.logger.listen((log) => {
    Consola.showMessage('asset-loader: ' + log);
});

Assets.loadList(assets).then(() => {
    const renderer = new Renderer();
    document.body.appendChild(renderer.domElement);

    Globals.renderer = renderer;

    const world = new World();
    const camera = new Camera();

    Globals.camera = camera.camera;

    onUpdate(() => {
        renderer.render(world.scene, camera.camera);
    });
});
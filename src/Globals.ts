import { Camera } from 'three';
import Renderer from './Renderer';

const globals: {
    renderer: Renderer | undefined,
    camera: Camera | undefined,
} = {
    renderer: undefined,
    camera: undefined,
};

export default globals;
import gsap from 'gsap';
import { Camera, CanvasTexture, DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, MeshBasicMaterial, Object3D, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3 } from 'three';
import onUpdate, { UpdateParams } from './hooks/onUpdate';
import onWindowResize from './hooks/onWindowResize';
import { range } from '@zooizooi/utils';
import globals from './Globals';
import Debugger from './Debugger';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import Assets from './Assets';

function calculateCoordinates(pointer: Vector3, dimensions: Vector2, camera: Camera): Vector3 {
    const vector = new Vector3((pointer.x / dimensions.width) * 2 - 1, -(pointer.y / dimensions.height) * 2 + 1, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(distance));
}

const AMOUNT = 100;

export default class World {
    public scene = new Scene();
    private viewportDimensions = new Vector2();
    private velocity = new Vector3();
    private gravity = new Vector3();
    private particles: Particle[] = [];
    private totalDistance = 0;
    private debug = Debugger.addFolder({ title: 'Particles' });
    private mouse = {
        position: new Vector3()
    };
    private position = {
        previous: new Vector3(),
        current: new Vector3()
    };
    private settings =  {
        gravity: new Vector2(0, 0.0010),
        spawnDistance: 3,
        velocityModifier: 0.03,
        dieSpeed: 0.01,
        opacityRange: { min: 0.2, max: 0.8 },
        zRange: { min: 0.2, max: 0.8 },
        maxZ: 2,
    };
    private mesh: InstancedMesh;
    private particleIndex = 0;

    private div: HTMLDivElement;

    constructor() {
        this.bindHandlers();
        this.setupEventListeners();
        this.mesh = this.createMesh();
        this.particles = this.createParticles();

        const div = document.createElement('div');
        div.style.cssText = 'position:absolute;top:0;left:0;background-color:red;width:40px;height:40px';
        document.body.appendChild(div);
        this.div = div;

        // Debug
        this.debug.addBinding(this.settings, 'gravity', { step: 0.0001, picker: 'inline' });
        this.debug.addBinding(this.settings, 'spawnDistance'); //, { min: 1, max: 10 }
        this.debug.addBinding(this.settings, 'velocityModifier'); //, { min: 1, max: 10 }
        this.debug.addBinding(this.settings, 'dieSpeed', { min: 0.001, max: 0.1, step: 0.001 }); //, { min: 1, max: 10 }
        this.debug.addBinding(this.settings, 'opacityRange', { min: 0, max: 1 }); //, { min: 1, max: 10 }
        // this.debug.addBinding(this.settings, 'zRange', { min: 0, max: 1 }); //, { min: 1, max: 10 }
        // this.debug.addBinding(this.settings, 'maxZ'); //, { min: 1, max: 10 }

        // Hooks
        onUpdate(this, this.update);4;
        onWindowResize(this, this.resize);
    }

    bindHandlers() {
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
    }

    setupEventListeners() {
        window.addEventListener('mousedown', this.mouseDownHandler);
        window.addEventListener('mousemove', this.mouseMoveHandler);
        window.addEventListener('mouseup', this.mouseUpHandler);
    }

    createSprite() {
        const gridSize = 3;
        const imageWidth = 200;
        const imageHeight = 300;

        const canvas = document.createElement('canvas');
        canvas.width = imageWidth * gridSize;
        canvas.height = imageHeight * gridSize;

        // canvas.style.cssText = 'position:fixed;top:0;left:0';
        // document.body.appendChild(canvas);

        const context = canvas.getContext('2d');

        const images = [
            Assets.get('image-01')?.data,
            Assets.get('image-02')?.data,
            Assets.get('image-03')?.data,
            Assets.get('image-04')?.data,
            Assets.get('image-05')?.data,
            Assets.get('image-06')?.data,
            Assets.get('image-07')?.data,
            Assets.get('image-08')?.data,
            Assets.get('image-09')?.data,
        ];

        images.forEach((image, index) => {
            const x = (index % gridSize) * imageWidth;
            const y = Math.floor(index / gridSize) * imageHeight;
            context?.drawImage(image, x, y, imageWidth, imageHeight);
        });

        return new CanvasTexture(canvas);
    }

    createMesh() {
        const geometry = new PlaneGeometry(4, 6);

        const opacity = new Float32Array(AMOUNT);
        const opacityAttribute = new InstancedBufferAttribute(opacity, 1);
        opacityAttribute.setUsage(DynamicDrawUsage);
        geometry.setAttribute('opacity', opacityAttribute);

        const uvOffset = new Float32Array(AMOUNT * 2);
        for (let i = 0; i < AMOUNT * 2; i += 2) {
            const a = i % (9 * 2);
            const b = Math.floor(a / 2);
            const x = (b % 3) / 3;
            const y = Math.floor(b / 3) / 3;
            uvOffset[i + 0] = x;
            uvOffset[i + 1] = y;
        }

        const uvOffsetAttribute = new InstancedBufferAttribute(uvOffset, 2);
        uvOffsetAttribute.setUsage(DynamicDrawUsage);
        geometry.setAttribute('uvOffset', uvOffsetAttribute);

        const sprite = this.createSprite();
        sprite.needsUpdate = true;

        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uSprite: { value: sprite }
            },
            transparent: true,
            depthWrite: false,
            // depthTest: false,
        });

        const mesh = new InstancedMesh(geometry, material, AMOUNT);
        mesh.instanceMatrix.setUsage(DynamicDrawUsage);
        this.scene.add(mesh);
        return mesh;
    }

    createParticles() {
        const particles = [];
        for (let i = 0; i < AMOUNT; i++) {
            particles.push(new Particle());
        }
        return particles;
    }

    private count = 0;

    update({ delta }: UpdateParams) {
        delta = gsap.ticker.deltaRatio();

        this.updatePosition();
        this.updateVelocity(delta);
        this.spawnParticles(delta);
        this.updateParticles(delta);

        this.div.style.transform = `translateX(${this.count}px)`;
        this.count += 1 * delta;


        // console.log(, delta);
    }

    updatePosition() {
        if (!globals.camera) return;
        this.position.previous.copy(this.position.current);
        this.position.current.copy(calculateCoordinates(this.mouse.position, this.viewportDimensions, globals.camera));
    }

    updateVelocity(delta: number) {
        this.velocity.subVectors(this.position.current, this.position.previous);
    }

    spawnParticles(delta: number) {
        this.totalDistance += this.position.current.distanceTo(this.position.previous);
        if (this.totalDistance > this.settings.spawnDistance) {
            this.spawnParticle(delta);
            this.totalDistance = 0;
        }
    }

    spawnParticle(delta: number) {
        if (!globals.camera) return;

        const velocity = this.velocity.normalize().multiplyScalar(delta * 0.13);
        // const particle = this.particles.find((particle: Particle) => particle.isDead);
        const particle = this.particles[this.particleIndex];
        // const particle = findItemDescending(this.particles,) .find((particle: Particle) => particle.isDead);

        // let particle;
        // for (let i = this.particles.length - 1; i >= 0; i--) {
        //     const p = this.particles[i];
        //     if (p.isDead) {
        //         particle = p;
        //         break;
        //     }
        // }

        this.particleIndex++;
        this.particleIndex = this.particleIndex % AMOUNT;

        if (particle) {
            particle.setup({ velocity });
            particle.position.copy(this.position.current);

            const direction = new Vector3();
            const directionVelocity = this.velocity.clone().normalize();
            direction.x = -directionVelocity.length() * 0.5;
            direction.y = directionVelocity.x;
            // direction.z = v.length();
            particle.setRotation(direction);
        }
    }

    updateParticles(delta: number) {
        this.gravity.set(this.settings.gravity.x, -this.settings.gravity.y, 0);

        this.particles.forEach((particle, index) => {
            particle.dieSpeed = this.settings.dieSpeed;
            particle.opacityRange.min = this.settings.opacityRange.min;
            particle.opacityRange.max = this.settings.opacityRange.max;
            particle.zRange.min = this.settings.zRange.min;
            particle.zRange.max = this.settings.zRange.max;
            particle.maxZ = this.settings.maxZ;
            particle.run({ gravity: this.gravity, delta });
            particle.updateMatrix();
            this.mesh.setMatrixAt(index, particle.matrix);
            this.mesh.instanceMatrix.needsUpdate = true;

            const opacity = this.mesh.geometry.getAttribute('opacity');
            opacity.setX(index, particle.opacity);
            opacity.needsUpdate = true;
        });
    }

    resize() {
        this.viewportDimensions.width = window.innerWidth;
        this.viewportDimensions.height = window.innerHeight;
    }

    mouseDownHandler() {
    }

    mouseMoveHandler(event: MouseEvent) {
        this.mouse.position.x = event.clientX;
        this.mouse.position.y = event.clientY;
    }

    mouseUpHandler() {
    }
}

interface ParticleProps {
    velocity: Vector3
}

class Particle extends Object3D {
    public acceleration = new Vector3();
    public velocity = new Vector3();
    private lifespan = 1;
    public dieSpeed = 0.01;
    public isDead = true;
    public opacity = 0;
    public opacityRange = { min: 0.2, max: 0.8 };
    public zRange = { min: 0.2, max: 0.8 };
    public maxZ = -5;
    private rotationDirection = new Vector3();

    public setup(props: ParticleProps) {
        this.reset();
        this.velocity.copy(props.velocity);
    }

    public reset() {
        this.acceleration.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.lifespan = 1;
        this.isDead = false;
    }

    public run({ gravity, delta }: { gravity: Vector3, delta: number }) {

        const g = gravity.clone().multiplyScalar(delta * 3);

        this.applyForce(g, delta);
        this.update(delta);
    }

    public setRotation(direction: Vector3) {
        this.rotation.setFromVector3(direction);
        this.rotationDirection.x = Math.sign(this.rotation.x);
        this.rotationDirection.y = Math.sign(this.rotation.y);
        this.rotationDirection.z = Math.sign(this.rotation.z);
    }

    private applyForce(force: Vector3, delta: number) {
        this.acceleration.add(force);
    }

    public update(delta: number) {
        if (this.isDead) return;

        const a = this.acceleration.clone().multiplyScalar(delta * 0.5);
        const b = this.acceleration.clone().multiplyScalar(delta * 0.5);
        this.velocity.add(a);
        this.position.add(this.velocity);
        this.velocity.add(b);

        this.lifespan -= this.dieSpeed * delta * 2;
        this.isDead = this.lifespan <= 0;
        this.acceleration.multiplyScalar(0);
        this.updateOpacity();
        this.updateRotation(delta);
        // this.updateZ();
    }

    private updateOpacity() {
        const min = Math.max(1.0 - this.opacityRange.max, 0.001);
        const max = Math.min(1.0 - this.opacityRange.min, 0.999);
        this.opacity = range(this.lifespan, 1, max, 0, 1) * range(this.lifespan, min, 0, 1, 0);
        // this.opacity = 1;
    }

    updateRotation(delta: number) {
        this.rotation.x -= 0.01 * this.rotationDirection.x * delta * 1;
        this.rotation.y -= 0.01 * this.rotationDirection.y * delta * 2;
        this.rotation.z -= 0.01 * this.rotationDirection.z * delta * 2;
    }

    updateZ() {
        const min = Math.max(1.0 - this.zRange.max, 0.001);
        const max = Math.min(1.0 - this.zRange.min, 0.999);
        this.position.z = range(this.lifespan, 1, max, 0, 1) * range(this.lifespan, min, 0, 1, 0) * this.maxZ;
    }
}
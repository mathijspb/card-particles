export default function onWindowResize(scope: any, callback: Function) {
    const boundedCallback = callback.bind(scope);
    boundedCallback();
    window.addEventListener('resize', () => {
        boundedCallback();
    });
}
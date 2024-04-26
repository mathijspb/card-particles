const callbacks: any = [];
let isHidden = false;
let prevTime = performance.now();

document.addEventListener('visibilitychange', () => {
    isHidden = document.hidden;
    prevTime = performance.now();
});

function update() {
    if (isHidden) return;
    const time = performance.now();
    requestAnimationFrame(update);
    const delta = (time - prevTime) / 1000;
    callbacks.forEach((callback: any) => callback({ delta, time }));
    prevTime = time;
}
requestAnimationFrame(update);

function onUpdate(scopeOrCallback: any | Function, callback?: Function) {
    let newCallback;
    if (typeof scopeOrCallback === 'function') {
        newCallback = scopeOrCallback;
    } else if (callback) {
        newCallback = callback.bind(scopeOrCallback);
    }
    callbacks.push(newCallback);

    function remove() {
        const indexToRemove = callbacks.indexOf(this.remove.prototype.callback);
        if (indexToRemove !== -1) callbacks.splice(indexToRemove, 1);
    }
    remove.prototype.callback = newCallback;

    return { remove };
}

export default onUpdate;
export interface UpdateParams {
    delta: number;
    time: number;
}
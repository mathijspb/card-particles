import gsap from 'gsap';

const callbacks: any = [];
let isHidden = false;

document.addEventListener('visibilitychange', () => {
    isHidden = document.hidden;
});

function update() {
    if (isHidden) return;
    const delta = gsap.ticker.deltaRatio();
    callbacks.forEach((callback: any) => callback({ delta }));
}

// gsap.ticker.fps(60);
gsap.ticker.add(update);

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
}
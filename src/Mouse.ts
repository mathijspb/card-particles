interface Properties {
    scope: object,
    element: HTMLElement | Window,
    move?: () => void,
    enter?: () => void,
    leave?: () => void,
}

export default class Mouse {
    private properties: Properties;

    constructor(properties: Properties) {
        this.properties = properties;

        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);

        properties.element.addEventListener('mousemove', this.mouseMoveHandler);
    }

    private mouseMoveHandler(event: MouseEvent) {
        if (this.properties.move) this.properties.move();
    }
}
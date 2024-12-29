class drag {
    constructor(node, update, context) {
        this.translate = { x: 0, y: 0 };
        this.position = { x: 0, y: 0 };
        this.displacement = { x: 0, y: 0 };
        this.translateCurrent = { x: 0, y: 0 };
        this.positionCurrent = { x: 0, y: 0 };
        if (update === undefined) {
            this.update = () => {
                requestAnimationFrame(() => {
                    this.node.style.transform = "translate(" + this.translateCurrent.x + "px,"
                        + this.translateCurrent.y + "px)";
                });
            };
        }
        else {
            this.update = update;
        }
        this.node = node;
        this.init(context);
        this.hook = () => {};
    }
    mousedown = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.cRect = this.container.getBoundingClientRect();
        this.tRect = this.node.getBoundingClientRect();
        [this.position.x, this.position.y] = [event.clientX, event.clientY];
        [this.translate.x, this.translate.y] = drag.translate2D(this.node.style.transform);
        window.addEventListener('mousemove', this.mousemove);
        window.addEventListener('mouseup', this.mouseup, { 'once': true });
    }

    mousemove = (event) => {
        event.preventDefault();
        event.stopPropagation();
        [this.displacement.x, this.displacement.y] = [event.clientX - this.position.x, event.clientY - this.position.y];
        [this.translateCurrent.x, this.translateCurrent.y] = [this.displacement.x + this.translate.x, this.displacement.y + this.translate.y];

        if (this.translateCurrent.x < 0) {
            this.displacement.x = - this.translate.x;
            this.translateCurrent.x = 0;
        }
        if (this.translateCurrent.y < 0) {
            this.displacement.y = - this.translate.y;
            this.translateCurrent.y = 0;
        }

        if (this.translateCurrent.x + this.tRect.width > this.cRect.width) {
            this.translateCurrent.x = this.cRect.width - this.tRect.width;
        }

        if (this.translateCurrent.y + this.tRect.height > this.cRect.height) {
            this.translateCurrent.y = this.cRect.height - this.tRect.height;
        }

        this.update();
    }

    mouseup = (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.removeEventListener('mousemove', this.mousemove);
    }

    init(context) {
        this.node.addEventListener('mousedown', this.mousedown);
        this.node.style.transform = "translate(0px, 0px)";
        this.container = context === undefined? this.node.offsetParent : context;
        this.cRect = this.container.getBoundingClientRect();
        this.tRect = this.node.getBoundingClientRect();
    }

    put(x, y) {
        this.translateCurrent.x = x;
        this.translateCurrent.y = y;
        requestAnimationFrame(() => {
            this.node.style.transform = "translate(" + x + "px,"
                + y + "px)";
        });
    }

    static translate2D(transform) {
        let extract = transform.match(/translate\(([-\d.e+]+)px, ([-\d.e+]+)px\)/);
        return [parseFloat(extract[1]), parseFloat(extract[2])];
    }

    static updateX = function () {
        requestAnimationFrame(() => {
            this.node.style.transform = "translate(" + this.translateCurrent.x + "px,"
                + 0 + "px)";
        });

        this.hook();
    }

    static updateXY = function (){
        requestAnimationFrame(() => {
            this.node.style.transform = "translate(" + this.translateCurrent.x + "px,"
                + this.translateCurrent.y + "px)";
        });
        this.hook();
    }

    static updateY = function () {
        requestAnimationFrame(() => {
            this.node.style.transform = "translate(" + 0 + "px,"
                + this.translateCurrent.y + "px)";
        });
        this.hook();
    }
}
export const ASTEROID_SIZE = {
    SMALL: 1,
    MEDIUM: 2,
    LARGE: 3,
}

export class Asteroid {
    constructor({position, velocity, radius, context}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.context = context;
        this.size = this.getSize(radius);
    }
    draw() {
        this.context.beginPath();
        this.context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        this.context.closePath();

        this.context.strokeStyle = 'white';
        this.context.stroke();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    getSize(radius) {
        if(radius <= 25) return ASTEROID_SIZE.SMALL;
        if(radius > 25 && radius <= 45) return ASTEROID_SIZE.MEDIUM;
        if(radius > 45) return ASTEROID_SIZE.LARGE;
    }
}
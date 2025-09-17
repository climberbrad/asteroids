export class Projectile {
    constructor({position, velocity, context}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 2;
        this.context = context;
    }

    draw() {
        this.context.beginPath();
        this.context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        this.context.closePath();

        this.context.fillStyle = 'white';
        this.context.fill();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}
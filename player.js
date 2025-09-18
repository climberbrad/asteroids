export class Player {
    constructor({position, velocity, context, canvas}) {
        this.position = position;
        this.velocity = velocity;
        this.context = context;
        this.rotation = 0;
        this.canvas = canvas;
    }

    draw() {
        this.context.save();
        this.context.translate(this.position.x, this.position.y);
        this.context.rotate(this.rotation);
        this.context.translate(-this.position.x, -this.position.y);

        this.context.beginPath();
        this.context.moveTo(this.position.x + 20, this.position.y);
        this.context.lineTo(this.position.x - 10, this.position.y - 10);
        this.context.lineTo(this.position.x - 10, this.position.y + 10);
        this.context.closePath();
        this.context.strokeStyle = 'white';
        this.context.stroke();
        this.context.restore();
    };

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if(this.position.x < 0) {
            this.position.x = this.canvas.width;
        }

        if(this.position.x > this.canvas.width) {
            this.position.x = 0;
        }

        if(this.position.y < 0) {
            this.position.y = this.canvas.height;
        }

        if(this.position.y > this.canvas.height) {
            this.position.y = 0;
        }

    }

    getVertices() {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)

        return [
            {
                x: this.position.x + cos * 30 - sin * 0,
                y: this.position.y + sin * 30 + cos * 0,
            },
            {
                x: this.position.x + cos * -10 - sin * 10,
                y: this.position.y + sin * -10 + cos * 10,
            },
            {
                x: this.position.x + cos * -10 - sin * -10,
                y: this.position.y + sin * -10 + cos * -10,
            },
        ]
    }
}
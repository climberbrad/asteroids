export class ScoreBoard {
    constructor({context, canvas}) {
        this.context = context;
        this.canvas = canvas
        this.score = 0;
    }

    draw() {
        this.context.font = "15px Courier New";
        this.context.fillStyle = "white";

        // Set text alignment to the top-right
        this.context.textAlign = "right";
        this.context.textBaseline = "top";

        // Define the text and a small margin
        const text = `Score ${this.score}`;
        const margin = 20;

        // Draw the text
        this.context.fillText(text, this.canvas.width - margin, 10);
    }

    update() {
        this.draw();
    }
}
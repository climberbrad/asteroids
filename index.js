// https://www.youtube.com/watch?v=pF-cI9PEawk

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.style.cursor = "none";

const SPEED = 3;
const ROTATION_SPEED = 0.1;
const FRICTION = 0.98;
const PROJECTILE_SPEED = 5;

const projectiles = [];
const asteroids = [];

const GAME_STATE = {
    END: 0,
    RUNNING: 1
}

let state = GAME_STATE.RUNNING;
let player;
let scoreBoard;

const intervalId = window.setInterval(() => {
    if(state === GAME_STATE.END) return;

    const spawnLocation = Math.floor(Math.random() * 4);
    let x,y;
    let vx,vy;
    const radius = 50 * Math.random() + 10;

    switch(spawnLocation) {
        case 0: // LEFT
            x = 0 - radius;
            y = Math.random() * canvas.height;
            vx = 1;
            vy = 0;
            break;
        case 1: // BOTTOM
            x = Math.random() * canvas.width;
            y = canvas.height + radius
            vx = 0;
            vy = -1;
            break;
        case 2: // RIGHT
            x = canvas.width + radius;
            y = Math.random() * canvas.height;
            vx = -1;
            vy = 0;
            break;
        case 3: // TOP
            x = Math.random() * canvas.width;
            y = 0 - radius
            vx = 0;
            vy = 1;
            break;
    }

    asteroids.push(new Asteroid({
        position: {
            x: x,
            y: y
        },
        velocity: {
            x: vx,
            y: vy,
        },
        radius: radius,
    }));

}, 500)

function circleCollision(circleA, circleB) {
    const xDelta = circleB.position.x - circleA.position.x;
    const yDelta = circleB.position.y - circleA.position.y;

    // Pythagorean theorem
    const distance = Math.sqrt((xDelta * xDelta) + (yDelta * yDelta) );

    // touching circles
    if(distance <= circleA.radius + circleB.radius) {
        return true;
    }

    return false;
}

function circleTriangleCollision(circle, triangle) {
    // Check if the circle is colliding with any of the triangle's edges
    for (let i = 0; i < 3; i++) {
        let start = triangle[i]
        let end = triangle[(i + 1) % 3]

        let dx = end.x - start.x
        let dy = end.y - start.y
        let length = Math.sqrt(dx * dx + dy * dy)

        let dot =
            ((circle.position.x - start.x) * dx +
                (circle.position.y - start.y) * dy) /
            Math.pow(length, 2)

        let closestX = start.x + dot * dx
        let closestY = start.y + dot * dy

        if (!isPointOnLineSegment(closestX, closestY, start, end)) {
            closestX = closestX < start.x ? start.x : end.x
            closestY = closestY < start.y ? start.y : end.y
        }

        dx = closestX - circle.position.x
        dy = closestY - circle.position.y

        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= circle.radius) {
            return true
        }
    }

    // No collision
    return false
}

function isPointOnLineSegment(x, y, start, end) {
    return (
        x >= Math.min(start.x, end.x) &&
        x <= Math.max(start.x, end.x) &&
        y >= Math.min(start.y, end.y) &&
        y <= Math.max(start.y, end.y)
    )
}

class ScoreBoard {
    constructor() {
        this.score = 0;
    }

    draw() {
        context.font = "15px Courier New";
        context.fillStyle = "white";

        // Set text alignment to the top-right
        context.textAlign = "right";
        context.textBaseline = "top";

        // Define the text and a small margin
        const text = `Score ${scoreBoard.score}`;
        const margin = 20;

        // Draw the text
        context.fillText(text, canvas.width - margin, 10);
    }

    update() {
        this.draw();
    }
}

class Asteroid {
    constructor({position, velocity, radius}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
    }
    draw() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        context.closePath();

        context.strokeStyle = 'white';
        context.stroke();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Player {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.rotation = 0;
    }

    draw() {
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotation);
        context.translate(-this.position.x, -this.position.y);

        context.beginPath();
        context.moveTo(this.position.x + 20, this.position.y);
        context.lineTo(this.position.x - 10, this.position.y - 10);
        context.lineTo(this.position.x - 10, this.position.y + 10);
        context.closePath();
        context.strokeStyle = 'white';
        context.stroke();
        context.restore();
    };

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
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

class Projectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 5;
    }

    draw() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        context.closePath();

        context.fillStyle = 'white';
        context.fill();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

function newPlayer() {
    return new Player({
            position: {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            },
            velocity: {x: 0, y: 0}
        }
    );
}

function restartGame() {
    asteroids.length = 0;
    projectiles.length = 0;


    player = newPlayer();
    player.draw();

    scoreBoard = new ScoreBoard();
    scoreBoard.draw();

    state = GAME_STATE.RUNNING;
    animate();
}

window.addEventListener('keydown', (event) => {
    switch(event.code) {
        case 'KeyR':
            restartGame();
            break;
        case 'KeyA':
            keys.a.isPressed = true;
            break;
        case 'KeyD':
            keys.d.isPressed = true;
            break;
        case 'KeyW':
            keys.w.isPressed = true;
            break;
        case 'Space':
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + Math.cos(player.rotation) * 30,
                    y:player.position.y + Math.sin(player.rotation) * 30
                },
                velocity: {
                    x: Math.cos(player.rotation) * PROJECTILE_SPEED,
                    y: Math.sin(player.rotation) * PROJECTILE_SPEED
                },
            }));
            break;
    }
})

window.addEventListener('keyup', (event) => {
    switch(event.code) {
        case 'KeyA':
            keys.a.isPressed = false;
            break;
        case 'KeyD':
            keys.d.isPressed = false;
            break;
        case 'KeyW':
            keys.w.isPressed = false;
            break;
    }
})

const keys = {
    w: { isPressed: false },
    d: { isPressed: false },
    a: { isPressed: false },
}

function animate() {
    const windowId = window.requestAnimationFrame(animate);

    if(state === GAME_STATE.END) {
        context.fillStyle = "rgba(0, 0, 0, 0.7)"; // Semi-transparent black overlay
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "white";
        context.font = "48px Arial";
        context.textAlign = "center";
        context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);

        context.font = "24px Arial";
        context.fillText(`Score: ${scoreBoard.score}`, canvas.width / 2, canvas.height / 2 + 20);
        window.cancelAnimationFrame(windowId);

        context.font = "20px Arial";
        context.fillText("Press 'R' to Restart", canvas.width / 2, canvas.height / 2 + 75);

        // window.clearInterval(intervalId);
        return;
    }

    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    scoreBoard.update();

    // projectile mgmt
    for(let i= projectiles.length-1; i >= 0 ; i--) {
        const projectile = projectiles[i];
        projectile.update();

        // remove off-screen projectiles
        if(
            projectile.position.x + projectile.radius < 0 ||
            projectile.position.x - projectile.radius > canvas.width ||
            projectile.position.y - projectile.radius > canvas.height ||
            projectile.position.y + projectile.radius < 0
        ) {
            projectiles.splice(i, 1);
        }
    }

    // asteroid mgmt
    for(let i= asteroids.length-1; i >= 0 ; i--) {
        const asteroid = asteroids[i];
        asteroid.update();

        // GAME OVER
        if(circleTriangleCollision(asteroid, player.getVertices())) {
            state = 0;
        }

        // // remove off-screen asteroids
        if(
            asteroid.position.x + asteroid.radius < 0 ||
            asteroid.position.x - asteroid.radius > canvas.width ||
            asteroid.position.y - asteroid.radius > canvas.height ||
            asteroid.position.y + asteroid.radius < 0
        ) {
            asteroids.splice(i, 1);
        }

        // shot asteroid
        for(let j= projectiles.length-1; j >= 0 ; j--) {
            const projectile = projectiles[j];
            if(circleCollision(asteroid, projectile)) {
                projectiles.splice(j, 1);
                asteroids.splice(i, 1);
                scoreBoard.score += 10;
            }
        }
    }

    if(keys.w.isPressed) {
        player.velocity.x = Math.cos(player.rotation) * SPEED;
        player.velocity.y = Math.sin(player.rotation) * SPEED;
    } else if (!keys.w.isPressed) {
        player.velocity.x *= FRICTION;
        player.velocity.y *= FRICTION;
    }
    if(keys.d.isPressed) player.rotation += ROTATION_SPEED;
    if(keys.a.isPressed) player.rotation -= ROTATION_SPEED;
}

// MAIN
restartGame();
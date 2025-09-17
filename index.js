import {circleCollision, circleTriangleCollision} from "./utils.js";
import {Player} from "./player.js";
import {ScoreBoard} from "./scoreboard.js";
import {Asteroid} from "./asteroid.js"
import {Projectile} from "./projectile.js";

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
        context: context
    }));

}, 500)

function newPlayer() {
    return new Player({
            position: {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            },
            velocity: {x: 0, y: 0},
            context: context
        }
    );
}

function restartGame() {
    asteroids.length = 0;
    projectiles.length = 0;


    player = newPlayer();
    player.draw();

    scoreBoard = new ScoreBoard({context: context, canvas: canvas});
    scoreBoard.draw();

    state = GAME_STATE.RUNNING;
    animate();
}

window.addEventListener('keydown', (event) => {
    switch(event.code) {
        case 'KeyR':
            restartGame();
            break;a
        case 'ArrowLeft':
            keys.a.isPressed = true;
            break;
        case 'ArrowRight':
            keys.d.isPressed = true;
            break;
        case 'ArrowUp':
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
                context: context
            }));
            break;
    }
})

window.addEventListener('keyup', (event) => {
    switch(event.code) {
        case 'ArrowLeft':
            keys.a.isPressed = false;
            break;
        case 'ArrowRight':
            keys.d.isPressed = false;
            break;
        case 'ArrowUp':
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
import {circleCollision, circleTriangleCollision} from "./utils.js";
import {Player} from "./player.js";
import {ScoreBoard} from "./scoreboard.js";
import {Asteroid, ASTEROID_SIZE} from "./asteroid.js"
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
let highScore = 0;

function createAsteroid(x, y, vx, vy, radius) {
    return new Asteroid({
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
    })
}

function asteroidTimer() {
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

    asteroids.push(createAsteroid(x,y,vx,vy,radius));

}

let intervalTime = 2000;
function recursiveTimer() {
    asteroidTimer();

    setTimeout(recursiveTimer, intervalTime);
}

function updateInterval(newTime) {
    if (newTime > 0) {
        intervalTime = newTime;
        console.log(`Updated interval time to ${intervalTime}ms.`);
    }
}

recursiveTimer();
// After 5 seconds, update the interval time to 500ms
setInterval(() => {
    if(intervalTime > 300) {
        updateInterval(intervalTime - 100);
    }
}, 5000);

function newPlayer() {
    return new Player({
            position: {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            },
            velocity: {x: 0, y: 0},
            context: context,
            canvas: canvas,
        }
    );
}

function restartGame() {
    asteroids.length = 0;
    projectiles.length = 0;
    intervalTime = 2000;


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

function getPoints(asteroid) {
    if(asteroid.size === ASTEROID_SIZE.SMALL) return 50;
    if(asteroid.size === ASTEROID_SIZE.MEDIUM) return 20;
    if(asteroid.size === ASTEROID_SIZE.LARGE) return 10;
}

function animate() {
    const windowId = window.requestAnimationFrame(animate);

    if(state === GAME_STATE.END) {
        if(scoreBoard.score > highScore) {
            highScore = scoreBoard.score;
        }

        context.fillStyle = "rgba(0, 0, 0, 0.7)"; // Semi-transparent black overlay
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "white";
        context.font = "48px Arial";
        context.textAlign = "center";
        context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);

        context.font = "24px Arial";
        context.fillText(`Score: ${scoreBoard.score}`, canvas.width / 2, canvas.height / 2 + 20);
        window.cancelAnimationFrame(windowId);

        context.font = "14px Arial";
        context.fillText(`High Score: ${highScore}` , canvas.width / 2, canvas.height / 2 + 75);

        context.font = "20px Arial";
        context.fillText("Press 'R' to Restart", canvas.width / 2, canvas.height / 2 + 150);

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

        // projectile garbage collection
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

        // asteroid garbage collection
        if(
            asteroid.position.x + asteroid.radius < 0 ||
            asteroid.position.x - asteroid.radius > canvas.width ||
            asteroid.position.y - asteroid.radius > canvas.height ||
            asteroid.position.y + asteroid.radius < 0
        ) {
            asteroids.splice(i, 1);
        }

        // asteroid shot
        for(let j= projectiles.length-1; j >= 0 ; j--) {
            const projectile = projectiles[j];
            if(circleCollision(asteroid, projectile)) {
                projectiles.splice(j, 1);
                asteroids.splice(i, 1);
                scoreBoard.score += getPoints(asteroid);

                if(asteroid.size !== ASTEROID_SIZE.SMALL) {
                    asteroids.push(
                        createAsteroid(
                            asteroid.position.x + 2,
                            asteroid.position.y  + 12,
                            asteroid.velocity.x * Math.random() + 1,
                            asteroid.velocity.y * Math.random() + 1,
                            asteroid.radius - 15)
                    );
                }
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
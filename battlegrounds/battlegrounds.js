
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var directionSpeed = 3;
var rotationSpeed = 0.1;
var playerDirection = 0;

var bulletSpeed = 10;
var firerate = 1000;
var lastShot = performance.now();
var bullets = [];

var circlePos = {x: 150, y:150};
var notGameOver = true;

var dx = 0, dy = 0;

const keys = [
    {key: "w", pressed: false},
    {key: "s", pressed: false},
    {key: "a", pressed: false},
    {key: "d", pressed: false},
    {key: "ArrowRight", pressed: false},
    {key: "ArrowLeft", pressed: false},
    {key: " ", pressed: false},
];

window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);

var gameloop = setInterval(gameLoop, 100/6);

function keydown(e) {
    switch(e.key) {
        case "w":
            keys[0].pressed = true;
            break;
        case "s":
            keys[1].pressed = true;
            break;
        case "a":
            keys[2].pressed = true;
            break;
        case "d":
            keys[3].pressed = true;
            break;
        case "ArrowRight":
            keys[4].pressed = true;
            break;
        case "ArrowLeft":
            keys[5].pressed = true;
            break;
        case " ":
            keys[6].pressed = true;
            break;
        default:
            break;
    }
}

function keyup(e) {
    switch(e.key) {
        case "w":
            keys[0].pressed = false;
            break;
        case "s":
            keys[1].pressed = false;
            break;
        case "a":
            keys[2].pressed = false;
            break;
        case "d":
            keys[3].pressed = false;
            break;
        case "ArrowRight":
            keys[4].pressed = false;
            break;
        case "ArrowLeft":
            keys[5].pressed = false;
            break;
        case " ":
            keys[6].pressed = false;
            break;
        default:
            break;
    }
}

function updatePosition() {
    for(const k of keys) {
        if(!k.pressed) {
            continue;
        }
        var key = k.key;
        if(key == 'w') { // forward
            dx = -directionSpeed*Math.cos(playerDirection);
            dy = -directionSpeed*Math.sin(playerDirection);
        } else if(key == 'd') { // right
            dx = directionSpeed*Math.cos(playerDirection-Math.PI/2);
            dy = directionSpeed*Math.sin(playerDirection-Math.PI/2);
        } else if(key == 's') { // backwards
            dx = directionSpeed*Math.cos(playerDirection);
            dy = directionSpeed*Math.sin(playerDirection);
        } else if(key == 'a') { // left
            dx = directionSpeed*Math.cos(playerDirection+Math.PI/2);
            dy = directionSpeed*Math.sin(playerDirection+Math.PI/2);
        } else if(key == "ArrowRight") { // rotate clockwise
            playerDirection += rotationSpeed;
        } else if(key == "ArrowLeft") { // rotate counter clockwise
            playerDirection -= rotationSpeed;
        } else if(key == " ") { // space, shoot
            if(performance.now() - lastShot > firerate) {
                lastShot = performance.now();
                bullets.push({x: canvas.width/2, y: canvas.height/2, speed: bulletSpeed, direction: playerDirection});
            }
        }
    }

}

function updateWorld() {
    circlePos.x += dx;
    circlePos.y += dy;
    dx = 0, dy = 0;
}

function drawPlayer() {
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(400,300, 10, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(canvas.width/2,canvas.height/2);
    ctx.lineTo(canvas.width/2 + Math.cos(playerDirection)*15, canvas.height/2 + Math.sin(playerDirection)*15);
    ctx.stroke();
}

function drawBullets() {
    var new_bullets = [];
    ctx.fillStyle = "black";
    for(var i = 0; i < bullets.length; i++) {
        if(bullets[i].x < 0 || bullets[i].x > canvas.width || bullets[i].y < 0 || bullets[i].y > canvas.height ) {
            continue;
        }
        var newx = bullets[i].x + Math.cos(bullets[i].direction)*bullets[i].speed;
        var newy = bullets[i].y + Math.sin(bullets[i].direction)*bullets[i].speed;
        new_bullets.push({x:newx, y: newy, speed: bullets[i].speed, direction: bullets[i].direction});
        ctx.beginPath();
        ctx.arc(newx, newy, 3, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
    }
    bullets = new_bullets;
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,canvas.width, canvas.height);
}

function draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(circlePos.x, circlePos.y, 30, 30);
    drawPlayer();
    drawBullets();
}

function gameLoop() {
    updatePosition();
    updateWorld();
    clearCanvas();
    draw();
}

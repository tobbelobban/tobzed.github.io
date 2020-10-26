
class Line {
    constructor(x1,y1,x2,y2,color) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
        this.length = Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x1,this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
}

class Rectangle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
    }
}

class Circle {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
    }
}

class Player {
    constructor(direction, speed, rotationSpeed) {
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.direction = direction;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed;
        this.body = new Circle(canvas.width/2, canvas.height/2, 10, "green");
        this.gun = new Line(canvas.width/2, canvas.height/2, canvas.width/2 + 15, canvas.height/2, "red");
    }
}

class Bullet {
    constructor(x, y, radius, direction, speed, color) {
        this.bullet = new Circle(x, y, radius, color);
        this.speed = speed;
        this.direction = direction;
    }
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var firerate = 1000;
var lastShot = performance.now();
var bullets = [];

var notGameOver = true;
var dx = 0, dy = 0;

var recta = new Rectangle(150, 150, 40, 20, "red");
var circa = new Circle(560, 30, 50, "grey");
var world_objects = [];
world_objects.push(recta);
world_objects.push(circa);

var player = new Player(0, 3, 0.1);

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

function positionUpdate() {
    for(const k of keys) {
        if(!k.pressed) {
            continue;
        }
        var key = k.key;
        if(key == 'w') { // forward
            dx -= player.speed*Math.cos(player.direction);
            dy -= player.speed*Math.sin(player.direction);
        } else if(key == 'd') { // right
            dx += player.speed*Math.cos(player.direction-Math.PI/2);
            dy += player.speed*Math.sin(player.direction-Math.PI/2);
        } else if(key == 's') { // backwards
            dx += player.speed*Math.cos(player.direction);
            dy += player.speed*Math.sin(player.direction);
        } else if(key == 'a') { // left
            dx += player.speed*Math.cos(player.direction+Math.PI/2);
            dy += player.speed*Math.sin(player.direction+Math.PI/2);
        } else if(key == "ArrowRight") { // rotate clockwise
            player.direction += player.rotationSpeed;
        } else if(key == "ArrowLeft") { // rotate counter clockwise
            player.direction -= player.rotationSpeed;
        } else if(key == " ") { // space, shoot
            if(performance.now() - lastShot > firerate) {
                lastShot = performance.now();
                bullets.push(new Bullet(player.gun.x2, player.gun.y2, 3, player.direction, 10, "black"));
            }
        }
    }

}

function updateObjects() {
    for(obj of world_objects) {
        obj.x += dx;
        obj.y += dy;
    }
}

function updateBullets() {
    var new_bullets = [];
    for(var i = 0; i < bullets.length; i++) {
        if(bullets[i].bullet.x < 0 || bullets[i].bullet.x > canvas.width || bullets[i].bullet.y < 0 || bullets[i].bullet.y > canvas.height ) {
            continue;
        }
        bullets[i].bullet.x += Math.cos(bullets[i].direction)*bullets[i].speed + dx;
        bullets[i].bullet.y += Math.sin(bullets[i].direction)*bullets[i].speed + dy;
        new_bullets.push(bullets[i]);
    }
    bullets = new_bullets;
}

function updatePlayer() {
    player.gun.x2 = player.gun.length * Math.cos(player.direction) + player.x;
    player.gun.y2 = player.gun.length * Math.sin(player.direction) + player.y;
}

function updateWorld() {
    updateObjects();
    updateBullets();
    updatePlayer();
    dx = 0, dy = 0;
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,canvas.width, canvas.height);
}

function drawWorld() {
    for(const obj of world_objects) {
        obj.draw();
    }
}

function drawPlayer() {
    player.body.draw();
    player.gun.draw();
}

function drawBullets() {
    for(const b of bullets) {
        b.bullet.draw();
    }
}

function draw() {
    drawWorld();
    drawPlayer();
    drawBullets();
}

function gameLoop() {
    positionUpdate();
    updateWorld();
    clearCanvas();
    draw();
}

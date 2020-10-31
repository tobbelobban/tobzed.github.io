/*
    SETUP CANVAS AND 2D CONTEX
*/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;
var drawBB = true;
/*
    BEGIN CLASS DEFS
*/

class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    move(dx,dy) {
        this.x += dx;
        this.y += dy;
    }
}

class Line {
    constructor(x1,y1,x2,y2,color) {
        this.p1 = new Point(x1,y1);
        this.p2 = new Point(x2,y2);
        this.color = color;
        this.length = Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
    }

    move(dx,dy) {
        this.p1.move(dx,dy);
        this.p2.move(dx,dy);
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.p1.x+CANVAS_WIDTH/2,this.p1.y+CANVAS_HEIGHT/2);
        ctx.lineTo(this.p2.x+CANVAS_WIDTH/2, this.p2.y+CANVAS_HEIGHT/2);
        ctx.stroke();
    }
}

class Rectangle {
    constructor(x, y, width, height, color) {
        this.center = new Point(x,y);
        this.bb_min = new Point(x-width/2,y-height/2);
        this.bb_max = new Point(x+width/2,y+height/2);
        this.width = width;
        this.height = height;
        this.color = color;
    }

    move(dx,dy) {
        this.center.move(dx,dy);
        this.bb_min.move(dx,dy);
        this.bb_max.move(dx,dy);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.bb_min.x+CANVAS_WIDTH/2, this.bb_min.y+CANVAS_HEIGHT/2, this.width, this.height);
        if(drawBB) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(this.bb_min.x+CANVAS_WIDTH/2, this.bb_min.y+CANVAS_HEIGHT/2, this.width, this.height);
        }
    }
}

class Circle {
    constructor(x, y, radius, color) {
        this.radius = radius;
        this.color = color;
        this.center = new Point(x,y);
        this.bb_min = new Point(x-radius,y-radius);
        this.bb_max = new Point(x+radius,y+radius);
    }

    move(dx,dy) {
        this.center.move(dx,dy);
        this.bb_min.move(dx,dy);
        this.bb_max.move(dx,dy);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.center.x+CANVAS_WIDTH/2, this.center.y+CANVAS_HEIGHT/2, this.radius, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
        if(drawBB) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(this.bb_min.x+CANVAS_WIDTH/2, this.bb_min.y+CANVAS_HEIGHT/2, this.bb_max.x - this.bb_min.x, this.bb_max.y - this.bb_min.y);
        }
    }
}

class Bullet {
    constructor(x, y, radius, direction, speed, color) {
        this.body = new Circle(x, y, radius, color);
        this.speed = speed;
        this.direction = direction;
    }
}

class Player {
    constructor(direction, speed, rotationSpeed) {
        this.direction = direction;
        this.speed = speed;
        this.dy = 0;
        this.dx = 0;
        this.rotationSpeed = rotationSpeed;
        this.body = new Circle(0, 0, 10, "green");
        this.gun = new Line(0, 0, 15, 0, "red");
    }

    checkPossibleCollision(obj) {
        let dx1 = this.body.bb_min.x - obj.bb_max.x; // player is right of obj if > 0
        let dy1 = this.body.bb_min.y - obj.bb_max.y; // player is "under" obj if > 0
        let dx2 = obj.bb_min.x - this.body.bb_max.x; // player is left of obj if > 0
        let dy2 = obj.bb_min.y - this.body.bb_max.y; // player is "above" obj if > 0

        if(dx1 > 0 || dy1 > 0 || dx2 > 0 || dy2 > 0 ) {
            return false;
        }

        return true;
    }
}

/*
    BEGIN EXECUTION
*/

var firerate = 1000;
var lastShot = performance.now();
var bullets = [];

var notGameOver = true;

var recta = new Rectangle(150, 150, 40, 20, "red");
var circa = new Circle(-50, -120, 50, "grey");
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
            player.dx -= player.speed*Math.cos(player.direction);
            player.dy -= player.speed*Math.sin(player.direction);
        } else if(key == 'd') { // right
            player.dx += player.speed*Math.cos(player.direction-Math.PI/2);
            player.dy += player.speed*Math.sin(player.direction-Math.PI/2);
        } else if(key == 's') { // backwards
            player.dx += player.speed*Math.cos(player.direction);
            player.dy += player.speed*Math.sin(player.direction);
        } else if(key == 'a') { // left
            player.dx += player.speed*Math.cos(player.direction+Math.PI/2);
            player.dy += player.speed*Math.sin(player.direction+Math.PI/2);
        } else if(key == "ArrowRight") { // rotate clockwise
            player.direction += player.rotationSpeed;
        } else if(key == "ArrowLeft") { // rotate counter clockwise
            player.direction -= player.rotationSpeed;
        } else if(key == " ") { // space, shoot
            if(performance.now() - lastShot > firerate) {
                lastShot = performance.now();
                bullets.push(new Bullet(player.gun.p2.x, player.gun.p2.y, 3, player.direction, 10, "black"));
            }
        }
    }
}

function checkPlayerCollision() {
    for( obj of world_objects) {
        if(player.checkPossibleCollision(obj)) {
            console.log("collision detected");
        }
    }
}

function updateObjects() {
    for(obj of world_objects) {
        obj.move(player.dx,player.dy);
    }
}

function updateBullets() {
    var new_bullets = [];
    var tmp_dx = tmp_dy = 0;
    for(var i = 0; i < bullets.length; i++) {
        if(bullets[i].body.center.x < -CANVAS_WIDTH/2 || bullets[i].body.center.x > CANVAS_WIDTH/2 || bullets[i].body.center.y < -CANVAS_HEIGHT/2 || bullets[i].body.center.y > CANVAS_HEIGHT/2 ) {
            continue;
        }
        bullets[i].body.move(Math.cos(bullets[i].direction)*bullets[i].speed + player.dx,Math.sin(bullets[i].direction)*bullets[i].speed + player.dy);
        new_bullets.push(bullets[i]);
    }
    bullets = new_bullets;
}

function updatePlayer() {
    player.gun.p2.x = player.gun.length * Math.cos(player.direction);
    player.gun.p2.y = player.gun.length * Math.sin(player.direction);
}

function updateWorld() {
    updateObjects();
    updateBullets();
    updatePlayer();
    player.dx = player.dy = 0;
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
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
        b.body.draw();
    }
}

function draw() {
    drawWorld();
    drawPlayer();
    drawBullets();
}

function gameLoop() {
    positionUpdate();
    checkPlayerCollision();
    updateWorld();
    clearCanvas();
    draw();
}

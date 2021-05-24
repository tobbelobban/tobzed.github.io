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

function circleCollidingWithRectangle(circle, rect, dx, dy) {
    let hori_dist = Math.abs(circle.center.x - rect.center.x);
    let vert_dist = Math.abs(circle.center.y - rect.center.y);

    if (hori_dist - dx > (rect.width / 2 + circle.radius)) return false;
    if (vert_dist - dy > (rect.height / 2 + circle.radius)) return false;

    if (hori_dist - dx <= (rect.width / 2)) return true;
    if (vert_dist - dy <= (rect.height / 2)) return true;

    let cornerDistance_sq =
        ((hori_dist - dx - rect.width / 2) ** 2) +
        ((vert_dist - dy - rect.height / 2) ** 2);

    return (cornerDistance_sq < (circle.radius ** 2));
}

function circleCollidingWithCirlce(circle1, circle2, dx, dy) {
    let sq_dist = ((circle1.center.x - circle2.center.x - dx) ** 2) + ((circle1.center.y - circle2.center.y - dy) ** 2);
    return (sq_dist < ((circle1.radius + circle2.radius) ** 2));
}

function possibleObjectCollision(obj1, obj2) {
    if (obj1.bb_min.x - obj2.bb_max.x > 0) return false; // player is right of obj if > 0
    if (obj1.bb_min.y - obj2.bb_max.y > 0) return false; // player is "under" obj if > 0
    if (obj2.bb_min.x - obj1.bb_max.x > 0) return false; // player is left of obj if > 0
    if (obj2.bb_min.y - obj1.bb_max.y > 0) return false; // player is "above" obj if > 0
    return true;
}

function isColliding(obj1, obj2, dx, dy) {
    if (obj1 instanceof Rectangle) {
        if (obj2 instanceof Rectangle) {
            return possibleObjectCollision(obj1, obj2);
        } else {
            return circleCollidingWithRectangle(obj2, obj1, dx, dy);
        }

    } else if (obj1 instanceof Circle) {
        if (obj2 instanceof Rectangle) {
            return circleCollidingWithRectangle(obj1, obj2, dx, dy);
        } else {
            return circleCollidingWithCirlce(obj1, obj2, dx, dy);
        }
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

class Line {
    constructor(x1, y1, x2, y2, color) {
        this.p1 = new Point(x1, y1);
        this.p2 = new Point(x2, y2);
        this.color = color;
        this.length = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    move(dx, dy) {
        this.p1.move(dx, dy);
        this.p2.move(dx, dy);
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.p1.x + CANVAS_WIDTH / 2, this.p1.y + CANVAS_HEIGHT / 2);
        ctx.lineTo(this.p2.x + CANVAS_WIDTH / 2, this.p2.y + CANVAS_HEIGHT / 2);
        ctx.stroke();
    }
}

class Rectangle {
    constructor(x, y, width, height, color) {
        this.center = new Point(x, y);
        this.bb_min = new Point(x - width / 2, y - height / 2);
        this.bb_max = new Point(x + width / 2, y + height / 2);
        this.width = width;
        this.height = height;
        this.color = color;
    }

    move(dx, dy) {
        this.center.move(dx, dy);
        this.bb_min.move(dx, dy);
        this.bb_max.move(dx, dy);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.bb_min.x + CANVAS_WIDTH / 2, this.bb_min.y + CANVAS_HEIGHT / 2, this.width, this.height);
        //if (drawBB) {
        //    ctx.strokeStyle = "black";
        //    ctx.strokeRect(this.bb_min.x + CANVAS_WIDTH / 2, this.bb_min.y + CANVAS_HEIGHT / 2, this.width, this.height);
        //}
    }
}

class Circle {
    constructor(x, y, radius, color) {
        this.radius = radius;
        this.color = color;
        this.center = new Point(x, y);
        this.bb_min = new Point(x - radius, y - radius);
        this.bb_max = new Point(x + radius, y + radius);
    }

    move(dx, dy) {
        this.center.move(dx, dy);
        this.bb_min.move(dx, dy);
        this.bb_max.move(dx, dy);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.center.x + CANVAS_WIDTH / 2, this.center.y + CANVAS_HEIGHT / 2, this.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        //if (drawBB) {
        //    ctx.strokeStyle = "black";
        //    ctx.strokeRect(this.bb_min.x + CANVAS_WIDTH / 2, this.bb_min.y + CANVAS_HEIGHT / 2, this.bb_max.x - this.bb_min.x, this.bb_max.y - this.bb_min.y);
        //}
    }
}

class Bullet extends Circle {
    constructor(x, y, radius, direction, speed, color) {
        super(x, y, radius, color);
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
        this.firerate = 10;
        this.lastShot = performance.now() - 1000;
        this.bullets = [];
        this.rotationSpeed = rotationSpeed;
        this.body = new Circle(0, 0, 10, "green");
        this.gun = new Line(0, 0, 15, 0, "red");
    }

    draw() {
        this.body.draw();
        this.gun.draw();
    }

    tryShoot() {
        if (performance.now() - this.lastShot > (1000 / this.firerate)) {
            this.shoot();
        }
    }

    shoot() {
        this.bullets.push(new Bullet(this.gun.p2.x, this.gun.p2.y, 3, this.direction, 10, "black"));
        this.lastShot = performance.now();
    }
}

/*
    BEGIN EXECUTION
*/

var world_objects = [];
var players = [];
var gameloop;
startGame();

const keys = [
    { key: "w", pressed: false },
    { key: "s", pressed: false },
    { key: "a", pressed: false },
    { key: "d", pressed: false },
    { key: "ArrowRight", pressed: false },
    { key: "ArrowLeft", pressed: false },
    { key: " ", pressed: false },
];

function keydown(e) {
    switch (e.key) {
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
    switch (e.key) {
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
    players[0].dx = players[0].dy = 0;
    for (const k of keys) {
        if (!k.pressed) {
            continue;
        }
        var key = k.key;
        if (key == 'w') { // forward
            players[0].dx -= players[0].speed * Math.cos(players[0].direction);
            players[0].dy -= players[0].speed * Math.sin(players[0].direction);
        } else if (key == 'd') { // right
            players[0].dx += players[0].speed * Math.cos(players[0].direction - Math.PI / 2);
            players[0].dy += players[0].speed * Math.sin(players[0].direction - Math.PI / 2);
        } else if (key == 's') { // backwards
            players[0].dx += players[0].speed * Math.cos(players[0].direction);
            players[0].dy += players[0].speed * Math.sin(players[0].direction);
        } else if (key == 'a') { // left
            players[0].dx += players[0].speed * Math.cos(players[0].direction + Math.PI / 2);
            players[0].dy += players[0].speed * Math.sin(players[0].direction + Math.PI / 2);
        } else if (key == "ArrowRight") { // rotate clockwise
            players[0].direction += players[0].rotationSpeed;
        } else if (key == "ArrowLeft") { // rotate counter clockwise
            players[0].direction -= players[0].rotationSpeed;
        } else if (key == " ") { // space, shoot
            players[0].tryShoot();
        }
    }
}

function checkPlayerCollision() {
    for (let p of players) {
        for (const obj of world_objects) {
            if (possibleObjectCollision(p.body, obj)) {
                if (isColliding(p.body, obj, p.dx, p.dy)) {
                    p.dx *= 0.04;
                    p.dy *= 0.04;
                }
            }
        }
    }
}

function updateObjects() {
    for (obj of world_objects) {
        obj.move(players[0].dx, players[0].dy);
    }
}

function updateBullets() {
    for (var p = 0; p < players.length; p++) {
        for (var i = 0; i < players[p].bullets.length; i++) {
            let bulletHit = false;
            let bullet = players[p].bullets[i];
            for (const obj of world_objects) {
                if (possibleObjectCollision(bullet, obj) && isColliding(bullet, obj, 0, 0)) {
                    bulletHit = true;
                    break;
                }
            }

            if (bulletHit || bullet.x < -CANVAS_WIDTH / 2 || bullet.x > CANVAS_WIDTH / 2 || bullet.y < -CANVAS_HEIGHT / 2 || bullet.y > CANVAS_HEIGHT / 2) {
                players[p].bullets.splice(i, 1);
                continue;
            }
            players[p].bullets[i].move(Math.cos(bullet.direction) * bullet.speed + players[0].dx, Math.sin(bullet.direction) * bullet.speed + players[0].dy);
        }
    }

}

function updatePlayer() {
    players[0].gun.p2.x = players[0].gun.length * Math.cos(players[0].direction);
    players[0].gun.p2.y = players[0].gun.length * Math.sin(players[0].direction);
}

function updateWorld() {
    updateObjects();
    updateBullets();
    updatePlayer();
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawWorld() {
    for (const obj of world_objects) {
        obj.draw();
    }
}

function drawPlayers() {
    for (const player of players) {
        player.draw();
    }
}

function drawBullets() {
    for (const p of players) {
        for (const b of p.bullets) {
            b.draw();
        }
    }
}

function draw() {
    drawWorld();
    drawPlayers();
    drawBullets();
}

function init_world() {
    var recta = new Rectangle(150, 150, 40, 20, "red");
    var circa = new Circle(100, -120, 50, "grey");

    world_objects.push(recta);
    world_objects.push(circa);
    world_objects.push(new Rectangle(-300, 0, 300, 300, "blue"));
    players.push(new Player(0, 3, 0.1));
}

function startGame() {
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    init_world();
    gameloop = setInterval(gameLoop, 100 / 6);
}

function gameLoop() {
    positionUpdate();
    checkPlayerCollision();
    updateWorld();
    clearCanvas();
    draw();
}

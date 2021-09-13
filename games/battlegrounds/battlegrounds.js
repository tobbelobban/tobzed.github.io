
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;
let drawBB = false;

let worldObjects = [];
let worldBullets = [];
let animations = [];

let player;
let gameloop;
let player_dx, player_dy;

function circleCollidingWithRectangle(circle, rect, dx, dy) {
    let hori_dist = Math.abs(circle.center.x - rect.center.x + dx);
    let vert_dist = Math.abs(circle.center.y - rect.center.y + dy);

    if (hori_dist > (rect.width/2 + circle.radius)) return false;
    if (vert_dist > (rect.height/2 + circle.radius)) return false;

    if (hori_dist <= (rect.width/2)) return true;
    if (vert_dist <= (rect.height/2)) return true;

    let cornerDistance_sq =
        ((hori_dist - rect.width / 2) ** 2) +
        ((vert_dist - rect.height / 2) ** 2);

    return (cornerDistance_sq < (circle.radius ** 2));
}

function circleCollidingWithCirlce(circle1, circle2, dx, dy) {
    let sq_dist = ((circle1.center.x - circle2.center.x + dx) ** 2) + ((circle1.center.y - circle2.center.y + dy) ** 2);
    return (sq_dist < ((circle1.radius + circle2.radius) ** 2));
}

function possibleObjectCollision(obj1, obj2, dx, dy) {
    if (obj1.bb_min.x - obj2.bb_max.x + dx >= 0) return false; // obj1 is right of obj2 if > 0
    if (obj1.bb_min.y - obj2.bb_max.y + dy >= 0) return false; // obj1 is under obj2 if > 0
    if (obj1.bb_max.x - obj2.bb_min.x + dx <= 0) return false; // obj1 is left of obj2 if > 0
    if (obj1.bb_max.y - obj2.bb_min.y + dy <= 0) return false; // obj1 is above obj2 if > 0
    return true;
}

function isColliding(obj1, obj2, dx, dy) {
    if (obj1 instanceof Rectangle) {
        if (obj2 instanceof Rectangle) {
            return possibleObjectCollision(obj1, obj2, dx, dy);
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

function checkCollision(obj1, obj2, dx, dy) {
    return possibleObjectCollision(obj1, obj2, dx, dy) && isColliding(obj1, obj2, dx, dy);
}

function outsideCanvas(obj) {
    if (obj.bb_min.x > CANVAS_WIDTH / 2) return true;
    if (obj.bb_min.y > CANVAS_HEIGHT / 2) return true;
    if (obj.bb_max.x < -CANVAS_WIDTH / 2) return true;
    if (obj.bb_max.y < -CANVAS_HEIGHT / 2) return true;
    return false;
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
        if (drawBB) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(this.bb_min.x + CANVAS_WIDTH / 2, this.bb_min.y + CANVAS_HEIGHT / 2, this.width, this.height);
        }
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
        if (drawBB) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(this.bb_min.x + CANVAS_WIDTH / 2, this.bb_min.y + CANVAS_HEIGHT / 2, this.bb_max.x - this.bb_min.x, this.bb_max.y - this.bb_min.y);
        }
    }
}

class Bullet extends Circle {
    constructor(x, y, dx, dy, radius, direction, speed, color) {
        super(x, y, radius, color);
        this.speed = speed;
        this.dx = dx;
        this.dy = dy;
        this.direction = direction;
    }
}

class Gun extends Line {
    constructor(x1, y1, x2, y2, direction, color) {
        super(x1, y1, x2, y2, color);
        this.firerate = 10;
        this.magCapacity = 10;
        this.direction = direction;
        this.magCount = this.magCapacity;
        this.lastShot = performance.now() - 1000;
    }

    reload() {
        this.magCount = this.magCapacity;
    }

    isLoaded() {
        return (this.magCount > 0);
    }

    rotate(v) {
        this.direction += v;
        this.p2.x = this.length * Math.cos(this.direction);
        this.p2.y = this.length * Math.sin(this.direction);
    }

    tryShoot() {
        if (performance.now() - this.lastShot > (1000 / this.firerate) && this.isLoaded()) {
            this.shoot();
        }
    }

    shoot() {
        worldBullets.push(new Bullet(this.p2.x, this.p2.y, player_dx, player_dy, 3, this.direction, 7, "black"));
        this.magCount -= 1;
        this.lastShot = performance.now();
    }
}

class CrossHair {
    constructor(x1, y1, x2, y2, direction) {
        this.direction = direction;
        this.body = new Circle(x2, y2, 5, "red");
        this.line = new Line(x1, y1, x2, y2, "red");
    }

    rotate(v) {
        this.direction += v;
        let new_x = this.line.length * Math.cos(this.direction);
        let new_y = this.line.length * Math.sin(this.direction);
        this.body.move(new_x - this.body.center.x, new_y - this.body.center.y);
        this.line.p2.x = new_x;
        this.line.p2.y = new_y;
    }

    move(dx, dy) {
        this.line.move(dx,dy);
        this.body.move(dx,dy);
    }

    draw() {
        this.line.draw();
        this.body.draw();
    }
}

class Player {
    constructor(direction, speed, rotationSpeed) {
        this.direction = direction;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed;
        this.body = new Circle(0, 0, 10, "green");
        this.gun = new Gun(0, 0, 15, 0, direction, "red");
        //this.crossHair = new CrossHair(0,0,50,0,this.direction);
    }

    rotate(v) {
        this.direction += v;
    }

    updateDirection(v) {
        this.rotate(v);
        this.gun.rotate(v);
        //this.crossHair.rotate(v);
    }

    draw() {
        this.body.draw();
        this.gun.draw();
        //this.crossHair.draw();
    }
}

class ExplosionAnimation {
    constructor(x, y, duration, speed) {
        this.shape = new Circle(x,y,2,"red");
        this.duration = duration;
        this.growSpeed = speed;
        this.start = performance.now();
    }

    isDone() {        
        return (performance.now() - this.start > this.duration);
    }

    update() {
        this.shape = new Circle(this.shape.center.x-player_dx, this.shape.center.y-player_dy, this.shape.radius + 1, this.shape.color);
        if((performance.now() - this.start)/this.duration > 0.7) this.shape.color = "yellow";
    }

    draw() {
        this.shape.draw();
    }
}

const keys = [
    { key: "w", pressed: false },
    { key: "s", pressed: false },
    { key: "a", pressed: false },
    { key: "d", pressed: false },
    { key: "r", pressed: false },
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
        case "r":
            keys[4].pressed = true;
            break;
        case "ArrowRight":
            keys[5].pressed = true;
            break;
        case "ArrowLeft":
            keys[6].pressed = true;
            break;
        case " ":
            keys[7].pressed = true;
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
        case "r":
            keys[4].pressed = false;
            break;
        case "ArrowRight":
            keys[5].pressed = false;
            break;
        case "ArrowLeft":
            keys[6].pressed = false;
            break;
        case " ":
            keys[7].pressed = false;
            break;
        default:
            break;
    }
}

function playerUpdate() {
    player_dx = 0;
    player_dy = 0;
    for (const k of keys) {
        if (!k.pressed) {
            continue;
        }
        var key = k.key;
        if (key == 'w') { // forward
            player_dx += player.speed * Math.cos(player.direction);
            player_dy += player.speed * Math.sin(player.direction);
        } else if (key == 'd') { // right
            player_dx += player.speed * Math.cos(player.direction + Math.PI / 2);
            player_dy += player.speed * Math.sin(player.direction + Math.PI / 2);
        } else if (key == 's') { // backwards
            player_dx -= player.speed * Math.cos(player.direction);
            player_dy -= player.speed * Math.sin(player.direction);
        } else if (key == 'a') { // left
            player_dx += player.speed * Math.cos(player.direction - Math.PI / 2);
            player_dy += player.speed * Math.sin(player.direction - Math.PI / 2);
        } else if (key == "r") { // reload
            player.gun.reload();
        } else if (key == "ArrowRight") { // rotate clockwise
            player.updateDirection(player.rotationSpeed);
        } else if (key == "ArrowLeft") { // rotate counter clockwise
            player.updateDirection(-player.rotationSpeed);
        } else if (key == " ") { // space, shoot
            player.gun.tryShoot();
        }
    }
}

function checkPlayerCollision() {
    for (const obj of worldObjects) {
        if(checkCollision(player.body, obj, player_dx, player_dy)) {
            player_dx = player_dy = 0;
            break;
        }
    }
}

function updateObjects() {
    if(player_dx == 0 && player_dy == 0) return;
    for (obj of worldObjects) {
        obj.move(-player_dx, -player_dy);
    }
}

function updateBullets() {
    let newBullets = [];
    while(worldBullets.length > 0) {
        let b = worldBullets.pop();
        const bullet_dx = Math.cos(b.direction) * b.speed + b.dx;
        const bullet_dy = Math.sin(b.direction) * b.speed + b.dy;
        b.move(-player_dx, -player_dy);
        if(outsideCanvas(b)) continue;
        let collision = false;
        for(const obj of worldObjects) {
            if(checkCollision(b, obj, 0, 0)) {
                animations.push(new ExplosionAnimation(b.center.x, b.center.y, 200, 1));
                collision = true;
                break;
            }
        }
        if(collision) continue;
        b.move(bullet_dx, bullet_dy);
        newBullets.push(b);
    }
    worldBullets = newBullets;
}

function updateAnimations() {
    let newAnimations = [];
    while(animations.length > 0) {
        let a = animations.pop();
        if(a.isDone()) {
            continue;
        }
        a.update();
        newAnimations.push(a);
    }
    animations = newAnimations;
}

function updateWorld() {
    updateObjects();
    updateBullets();
    updateAnimations();
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawWorld() {
    for (const obj of worldObjects) {
        obj.draw();
    }
    for (const b of worldBullets) {
        b.draw();
    }
    for (const a of animations) {
        a.shape.draw();
    }
}

function drawPlayers() {
    player.draw();
}

function updateBulletCount() {
    let txt = "Bullets x " + player.gun.magCount;
    if(player.magCount > 0) {
        document.getElementById("bullets").innerText = txt;
    } else {
        document.getElementById("bullets").innerText = txt + ("\nRELOAD (r)");
    }
}

function draw() {
    drawWorld();
    drawPlayers();
}

function init_world() {

    var recta = new Rectangle(150, 150, 40, 20, "red");
    var circa = new Circle(100, -120, 50, "grey");

    worldObjects.push(recta);
    worldObjects.push(circa);
    worldObjects.push(new Rectangle(-300, 0, 300, 300, "blue"));

    player = new Player(0, 3, 0.1);
    draw();
}

function startGame() {
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    init_world();
    gameloop = setInterval(gameLoop, 20); // 60 fps
   
}

function gameLoop() {
    playerUpdate();
    checkPlayerCollision();
    updateWorld();
    clearCanvas();
    updateBulletCount();
    draw();
}

startGame();

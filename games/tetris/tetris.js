var player;
var canvas;
var ctx;
var gameInterval;
var speed = 1;
var released = true;
var score = 0;
var nextGoal = 20;
var piecePlaced = 0;
var tickSpeed = 600;
var level = 1;

var tiles = {
    setupTiles : function() {
        this.board = [];
        for(var i = 0; i < 10; i++) {
            this.board[i] = [];
        }
        for(var i = 0; i < 10; i++) {
            for(var j = 0; j < 21; j++) {
                j == 20 ? tiles.board[i][j] = new tile("white", true) :
                tiles.board[i][j] = new tile("grey", false);
            }
        }
    }
}

function startGame() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    tiles.setupTiles();
    player = new piece(4, 0, selectPiece());
    player.setupPiece();
    paintAll();
    document.getElementById("score").innerText = "Score: 0";
    window.addEventListener('keydown', keypress);
    window.addEventListener('keyup', keyup);
    document.getElementById("reset_btn").addEventListener("click", resetGame);
    document.getElementById("next_level").innerText = "Next level: " + nextGoal;
    document.getElementById("level").innerText = "Level: " + level;
    gameInterval = setInterval(tick, tickSpeed);
}

function resetGame() {
    clearInterval(gameInterval);
    score = 0;
    nextGoal = 20;
    level = 1;
    tickSpeed = 600;
    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("level").innerText = "Level: " + level;
    document.getElementById("next_level").innerText = "Next level: " + nextGoal;
    clearCanvas();
    tiles.setupTiles();
    player = new piece(4,0, selectPiece());
    player.setupPiece();
    paintAll();
    gameInterval = setInterval(tick,tickSpeed);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function tile(color, value) {
    this.value = value;
    this.color = color;
}

function selectPiece() {
    var id = Math.floor(Math.random()*7);
    switch (id) {
        case 0:
        return "line";
        case 1:
        return "square";
        case 2:
        return "rightSnake";
        case 3:
        return "leftSnake";
        case 4:
        return "pyramid";
        case 5:
        return "rightL";
        case 6:
        return "leftL";
        default:
    }
}

function piece(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.setupPiece = function() {
        switch (this.type) {
            case "line":
            this.x2 = this.x - 1;
            this.y2 = this.y;
            this.x3 = this.x + 1;
            this.y3 = this.y;
            this.x4 = this.x + 2;
            this.y4 = this.y;
            this.color = "#0000FF"; // blue
            break;

            case "square":
            this.x2 = this.x + 1;
            this.y2 = this.y;
            this.x3 = this.x;
            this.y3 = this.y + 1;
            this.x4 = this.x2;
            this.y4 = this.y3;
            this.color = "#FFFF00"; // yellow
            break;

            case "rightSnake":
            this.x2 = this.x + 1;
            this.y2 = this.y;
            this.x3 = this.x;
            this.y3 = this.y + 1;
            this.x4 = this.x - 1;
            this.y4 = this.y3;
            this.color = "#FF0000"; // red
            break;

            case "leftSnake":
            this.x2 = this.x - 1;
            this.y2 = this.y;
            this.x3 = this.x;
            this.y3 = this.y + 1;
            this.x4 = this.x + 1;
            this.y4 = this.y3;
            this.color = "#00FF00"; // green
            break;

            case "pyramid":
            this.x2 = this.x;
            this.y2 = this.y + 1;
            this.x3 = this.x - 1;
            this.y3 = this.y;
            this.x4 = this.x + 1;
            this.y4 = this.y;
            this.color = "#FF00FF"; // magenta
            break;

            case "rightL":
            this.x2 = this.x + 1;
            this.y2 = this.y;
            this.x3 = this.x - 1;
            this.y3 = this.y;
            this.x4 = this.x3;
            this.y4 = this.y + 1;
            this.color = "#00FFFF"; // cyan
            break;

            case "leftL":
            this.x2 = this.x + 1;
            this.y2 = this.y;
            this.x3 = this.x - 1;
            this.y3 = this.y;
            this.x4 = this.x2;
            this.y4 = this.y + 1;
            this.color = "orange";
            break;
        }
        this.saveOld();
        return !(tiles.board[this.x][this.y].value || tiles.board[this.x4][this.y4].value || tiles.board[this.x2][this.y2].value || tiles.board[this.x3][this.y3].value);
    }

    this.canRotate = function() {
        var tempx = this.x2;
        var tempy = this.y2;
        var newx = this.x + this.y - tempy;
        var newy = this.y - this.x + tempx;

        if(this.type === "square" || newx < 0 || newx > 9 || newy < 0 || newy > 19 || tiles.board[newx][newy].value) {
            return false;
        }

        tempx = this.x3;
        tempy = this.y3;
        newx = this.x + this.y - tempy;
        newy = this.y - this.x + tempx;

        if(newx < 0 || newx > 9 || newy < 0 || newy > 19 || tiles.board[newx][newy].value) {
            return false;
        }

        tempx = this.x4;
        tempy = this.y4;
        newx = this.x + this.y - tempy;
        newy = this.y - this.x + tempx;

        if(newx < 0 || newx > 9 || newy < 0 || newy > 19 || tiles.board[newx][newy].value) {
            return false;
        }
        return true;
    }

    this.rotate = function() {
        if(!this.canRotate()) {
            return false;
        }
        this.saveOld();
        this.x2 = this.x + this.y - this.oldy2;
        this.y2 = this.y - this.x + this.oldx2;

        this.x3 = this.x + this.y - this.oldy3;
        this.y3 = this.y - this.x + this.oldx3;

        this.x4 = this.x + this.y - this.oldy4;
        this.y4 = this.y - this.x + this.oldx4;
        return true;
    }

    this.drawPiece = function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x*30, this.y*30, 30, 30);
        ctx.fillRect(this.x2*30, this.y2*30, 30, 30);
        ctx.fillRect(this.x3*30, this.y3*30, 30, 30);
        ctx.fillRect(this.x4*30, this.y4*30, 30, 30);
        ctx.strokeStyle = "grey";
        ctx.strokeRect(this.x*30, this.y*30, 30, 30);
        ctx.strokeRect(this.x2*30, this.y2*30, 30, 30);
        ctx.strokeRect(this.x3*30, this.y3*30, 30, 30);
        ctx.strokeRect(this.x4*30, this.y4*30, 30, 30);

    }

    this.canDrop = function() {
        if(tiles.board[this.x][this.y + speed].value ||
            tiles.board[this.x2][this.y2 + speed].value ||
            tiles.board[this.x3][this.y3 + speed].value ||
            tiles.board[this.x4][this.y4 + speed]. value) {
                return false;
        }
        return true;
    }

    this.drop = function() {
        if(!this.canDrop()) {
            return false;
        }
        this.saveOld();
        this.y += speed;
        this.y2 += speed;
        this.y3 += speed;
        this.y4 += speed;
        return true;
    }

    this.moveLeft = function() {
        if(this.x == 0 || this.x2 == 0 || this.x3 == 0 || this.x4 == 0 ||
            tiles.board[this.x-1][this.y].value ||
            tiles.board[this.x2-1][this.y2].value ||
            tiles.board[this.x3-1][this.y3].value ||
            tiles.board[this.x4-1][this.y4].value) {
                return false;
        }
        this.saveOld();
        this.x--;
        this.x2--;
        this.x3--;
        this.x4--;
        return true;
    }

    this.moveRight = function() {
        if(this.x == 9 || this.x2 == 9 || this.x3 == 9 || this.x4 == 9 ||
            tiles.board[this.x+1][this.y].value ||
            tiles.board[this.x2+1][this.y2].value ||
            tiles.board[this.x3+1][this.y3].value ||
            tiles.board[this.x4+1][this.y4].value) {
                return false;
        }
        this.saveOld();
        this.x++;
        this.x2++;
        this.x3++;
        this.x4++;
        return true;
    }

    this.placePiece = function() {
        tiles.board[this.x][this.y].value = true;
        tiles.board[this.x2][this.y2].value = true;
        tiles.board[this.x3][this.y3].value = true;
        tiles.board[this.x4][this.y4]. value = true;
        tiles.board[this.x][this.y].color = this.color;
        tiles.board[this.x2][this.y2].color = this.color;
        tiles.board[this.x3][this.y3].color = this.color;
        tiles.board[this.x4][this.y4].color = this.color;
    }

    this.saveOld = function() {
        this.oldx = this.x;
        this.oldy = this.y;
        this.oldx2 = this.x2;
        this.oldy2 = this.y2;
        this.oldx3 = this.x3;
        this.oldy3 = this.y3;
        this.oldx4 = this.x4;
        this.oldy4 = this.y4;
    }
}

function paintAll() {
    for(var i = 0; i < 10; i++) {
        for(var j = 0; j < 21; j++) {
            ctx.fillStyle = tiles.board[i][j].color;
            ctx.fillRect(i*30, j*30, 30, 30);
            ctx.strokeStyle = "grey";
            ctx.strokeRect(i*30, j*30, 30, 30);
        }
    }
    player.drawPiece();
}

function clearLines(fromLine) {
    var lineCount = 0;
    for(var y = fromLine; y > -1; y--) {
        var lineDone = true;
        for(var x = 0; x < 10; x++) {
            if(!tiles.board[x][y].value) {
                lineDone = false;
            }
        }
        if(lineDone) {
            for(var x = 0; x < 10; x++) {
                tiles.board[x][y].value = false;
                tiles.board[x][y].color = "grey";
            }
            lineCount+=1;
        } else if (lineCount > 0) {
            for(var x = 0; x < 10; x++) {
                if(tiles.board[x][y].value) {
                    tiles.board[x][y+lineCount].color = tiles.board[x][y].color;
                    tiles.board[x][y].color = "grey";
                    tiles.board[x][y].value = false;
                    tiles.board[x][y+lineCount].value = true;
                }
            }
        }
    }
    score += lineCount;
    document.getElementById("score").innerText = "Score: " + score;
}

function findMinRow() {
    var lowest = player.y;
    if(lowest < player.y2) {
        lowest = player.y2;
    }
    if(lowest < player.y3) {
        lowest = player.y3;
    }
    if(lowest < player.y4) {
        return player.y4;
    }
    return lowest;
}

function newPiece() {
    player.placePiece();
    clearLines(findMinRow());
    player = new piece(4, 0, selectPiece());
    if(player.setupPiece()) {
        paintAll();
        return true;
    }
    return false;

}

function movePlayer() {
    ctx.fillStyle = "grey";
    ctx.fillRect(player.oldx*30, player.oldy*30, 30, 30);
    ctx.fillRect(player.oldx2*30, player.oldy2*30, 30, 30);
    ctx.fillRect(player.oldx3*30, player.oldy3*30, 30, 30);
    ctx.fillRect(player.oldx4*30, player.oldy4*30, 30, 30);

    ctx.strokeStyle = "grey";
    ctx.strokeRect(player.oldx*30, player.oldy*30, 30, 30);
    ctx.strokeRect(player.oldx2*30, player.oldy2*30, 30, 30);
    ctx.strokeRect(player.oldx3*30, player.oldy3*30, 30, 30);
    ctx.strokeRect(player.oldx4*30, player.oldy4*30, 30, 30);
    player.drawPiece();
}

function replace() {
    var falling = true;
    while(falling) {
        falling = player.drop();
    }
}

function keyup(e) {
    released = true;
}

function keypress(e) {
    //console.log(e.which);
    var moved = false;
    switch (e.keyCode) {
        case 32:
        replace();
        break;
        case 38:
        if(!released) {
            return;
        }
        released = false;
        moved = player.rotate();
        break;
        case 37:
        moved = player.moveLeft();
        break;
        case 39:
        moved = player.moveRight();
        break;
        case 40:
        moved = player.drop();
        break;
    }
    if(moved) {
        movePlayer();
    } else if (e.keyCode == 40 || e.keyCode == 32) {
        newPiece();
    }
}

function tick() {
    if(player.drop()) {
        movePlayer();
    } else {
        if(!newPiece()) {
            document.getElementById("score").innerText = "GAME OVER \nScore: " + score;
            clearInterval(gameInterval);
        }
    }
    if(score >= nextGoal) {
        nextGoal += 20;
        level += 1
        document.getElementById("next_level").innerText = "Next level: " + nextGoal;
        document.getElementById("level").innerText = "Level: " + level;
        clearInterval(gameInterval);
        tickSpeed *= 0.7;
        gameInterval = setInterval(tick,tickSpeed);
    }
}

startGame();

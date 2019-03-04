
var player;
var canvas;
var ctx;
var gameInterval;
var released = true;
var score = 0;
var piecePlaced = 0;

var tiles = {
    setupTiles : function() {
        this.board = [];
        for(var i = 0; i < 10; i++) {
            this.board[i] = [];
        }
        for(var i = 0; i < 10; i++) {
            for(var j = 0; j < 21; j++) {
                j == 20 ? tiles.board[i][j] = new tile("#A9A9A9", true) :
                tiles.board[i][j] = new tile("#A9A9A9", false);
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
    player.drawPiece();
    window.addEventListener('keydown', keypress);
    window.addEventListener('keyup', keyup);
    gameInterval = setInterval(tick, 600);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function tile(color, value) {
    this.value = value;
    this.color = color;
}

function selectPiece() {
    var id = Math.floor(Math.random()*7) + 1;
    switch (id) {
        case 1:
        return "line";
        case 2:
        return "square";
        case 3:
        return "rightSnake";
        case 4:
        return "leftSnake";
        case 5:
        return "pyramid";
        case 6:
        return "rightL";
        case 7:
        return "leftL";
        default:
        console.log(id);
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

            this.color = "red";
            break;
            case "square":
            this.x2 = this.x + 1;
            this.y2 = this.y;

            this.x3 = this.x;
            this.y3 = this.y + 1;

            this.x4 = this.x2;
            this.y4 = this.y3;
            this.color = "green";
            break;
            case "rightSnake":
            this.x2 = this.x + 1;
            this.y2 = this.y;

            this.x3 = this.x;
            this.y3 = this.y + 1;

            this.x4 = this.x - 1;
            this.y4 = this.y3;
            this.color = "yellow";
            break;
            case "leftSnake":
            this.x2 = this.x - 1;
            this.y2 = this.y;

            this.x3 = this.x;
            this.y3 = this.y + 1;

            this.x4 = this.x + 1;
            this.y4 = this.y3;
            this.color = "orange";
            break;
            case "pyramid":
            this.x2 = this.x;
            this.y2 = this.y + 1;

            this.x3 = this.x - 1;
            this.y3 = this.y;

            this.x4 = this.x + 1;
            this.y4 = this.y;
            this.color = "purple";
            break;
            case "rightL":
            this.x2 = this.x + 1;
            this.y2 = this.y;

            this.x3 = this.x - 1;
            this.y3 = this.y;

            this.x4 = this.x3;
            this.y4 = this.y + 1;
            this.color = "black";
            break;
            case "leftL":
            this.x2 = this.x + 1;
            this.y2 = this.y;

            this.x3 = this.x - 1;
            this.y3 = this.y;

            this.x4 = this.x2;
            this.y4 = this.y + 1;
            this.color = "white";
            break;
        }
        this.saveOld();
    }
    this.canRotate = function() {
        var tempx = this.x2;
        var tempy = this.y2;
        var newx = this.x + this.y - tempy;
        var newy = this.y - this.x + tempx;
        if(this.type === "square" || newx < 0 || newx > 9 || newy < 0 || newy > 19) {
            return false;
        }
        tempx = this.x3;
        tempy = this.y3;
        newx = this.x + this.y - tempy;
        newy = this.y - this.x + tempx;
        if(newx < 0 || newx > 9 || newy < 0 || newy > 19) {
            return false;
        }
        tempx = this.x4;
        tempy = this.y4;
        newx = this.x + this.y - tempy;
        newy = this.y - this.x + tempx;
        if(newx < 0 || newx > 9 || newy < 0 || newy > 19) {
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
    }
    this.canDrop = function() {
        if(tiles.board[this.x][this.y + 1].value ||
            tiles.board[this.x2][this.y2 + 1].value ||
            tiles.board[this.x3][this.y3 + 1].value ||
            tiles.board[this.x4][this.y4 + 1]. value) {
                return false;
            }
            return true;
        }
        this.drop = function() {
            if(!this.canDrop()) {
                return false;
            }
            this.saveOld();
            this.y++;
            this.y2++;
            this.y3++;
            this.y4++;
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
                            tiles.board[x][y].color = "#A9A9A9";
                        }
                        lineCount+=1;
                    } else if (lineCount > 0) {
                        for(var x = 0; x < 10; x++) {
                            if(tiles.board[x][y].value) {
                                var tempColor = tiles.board[x][y].color;
                                tiles.board[x][y].color = "#A9A9A9";
                                tiles.board[x][y].value = false;

                                tiles.board[x][y+lineCount].value = true;
                                tiles.board[x][y+lineCount].color = tempColor;
                            }
                        }
                    }
                }
                score += lineCount;
                console.log(score);
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
                player.setupPiece();
                clearCanvas();
                paintAll();
            }

            function movePlayer() {
                ctx.clearRect(player.oldx*30, player.oldy*30, 30, 30);
                ctx.clearRect(player.oldx2*30, player.oldy2*30, 30, 30);
                ctx.clearRect(player.oldx3*30, player.oldy3*30, 30, 30);
                ctx.clearRect(player.oldx4*30, player.oldy4*30, 30, 30);
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
                if(!player.drop()) {
                    newPiece();
                } else {
                    movePlayer();
                }
            }

            startGame();

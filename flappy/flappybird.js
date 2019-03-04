
var playerComp;
var score;
var obstacles;
var gameSpeed = -1;
var framesToGo = 150;
var clearWalls = false;

function startGame() {
  obstacles = [];
  gameArea.start();
  playerComp = new component(15, 15, "red", 10, 120, "player", true);
  playerComp.gravity = 0.05;
  score = new component("30px", "Consolas", "black", 280, 40, "text");
}

var gameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
    this.canvas.width = 480;
    this.canvas.height = 270;
    this.frameCount = 1;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(updateGameArea, 20);
    window.addEventListener("keydown", function(e) {
      gameArea.key = e.keyCode;
    })
    window.addEventListener('keyup', function (e) {
      gameArea.key = false;
    })
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop : function() {
    clearInterval(this.interval);
  }
}

function restart() {
  location.reload();
}

function component(width, height, color, x, y, type, movable) {
    this.movable = movable;
    this.bounce = 0.6;
    this.type = type;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = 0;
    this.gravitySpeed = 0;
    this.update = function() {
      ctx = gameArea.context;
      ctx.fillStyle = color;
      if(this.type == "text") {
        ctx.font = this.width + " " + this.height;
        ctx.fillText(this.text, this.x, this.y);
      } else {
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
    this.newPos = function() {
      this.gravitySpeed += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY + this.gravitySpeed;
      if(this.movable) {
        this.hitBottom();
        this.hitTop();
      }
    }
    this.hitBottom = function() {
      var btm = gameArea.canvas.height - this.height;
      if(this.y > btm) {
        this.y = btm;
        this.gravitySpeed = -(this.gravitySpeed * this.bounce);
      }
    }
    this.hitTop = function() {
      if(this.y <= 0) {
        this.y = 0;
        this.gravitySpeed = -(this.gravitySpeed * this.bounce);
      }
    }
    this.objCollision = function(otherObj) {
      var coll = true;
      if( (this.y > otherObj.y+otherObj.height) ||
          (this.y+this.height < otherObj.y)     ||
          (this.x > otherObj.x+otherObj.width)  ||
          (this.x+this.width < otherObj.x) ) {
        coll = false;
      }
      return coll;
    }
}

function everyinterval(n) {
  if ((gameArea.frameCount / n) % 1 == 0) {return true;}
  return false;
}

function updateGameArea() {
  for(i = 0; i < obstacles.length; i++) {
    if(playerComp.objCollision(obstacles[i])) {
      gameArea.stop();
      return;
    }
  }
  gameArea.clear();
  gameArea.frameCount++;

  var x, y;

  if(gameArea.frameCount % 1000 === 0) {
    clearWalls = true;
  }

  if(clearWalls && obstacles[obstacles.length-1].x+obstacles[obstacles.length-1].width < 0) {
    clearWalls = false;
    obstacles = [];
    gameSpeed--;
    framesToGo = Math.floor(framesToGo / 2);
  }

  if((gameArea.frameCount == 1 || everyinterval(framesToGo)) && !clearWalls) {
    x = gameArea.canvas.width;
    minHeight = 20;
    maxHeight = 200;
    height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
    minGap = 50;
    maxGap = 200;
    gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
    obstacles.push(new component(10, height, "green", x, 0));
    obstacles[obstacles.length - 1].speedX = gameSpeed;
    obstacles.push(new component(10, x - height - gap, "green", x, height + gap));
    obstacles[obstacles.length - 1].speedX = gameSpeed;
  }
  for(i = 0; i < obstacles.length; i++) {
    obstacles[i].newPos();
    obstacles[i].update();
  }
  playerComp.speedX = 0;
  playerComp.speedY = 0;
  if (gameArea.key && gameArea.key == 38) {
    playerComp.gravity = -0.2;
  } else {
    playerComp.gravity = 0.05;
  }
  if(gameArea.key && gameArea.key == 32) {
    playerComp.gravity = 2;
  }
  playerComp.newPos();
  playerComp.update();
  score.text = "SCORE: " + gameArea.frameCount;
  score.update();
}

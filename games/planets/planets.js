
var canvas = document.getElementById("canvas");
function Planet(init_x,init_y,r,c) {
    this.x = init_x;
    this.y = init_y;
    this.radius_ = r;
    this.color = c;
}

var sun = new Planet(canvas.width/2,canvas.height/2,70,"#ffff00");
var earth = new Planet(0,150,20,"#00ff00");
var moon = new Planet(earth.radius_+20,earth.radius_+20,7,"#102f81");

function tick() {
    var ctx = canvas.getContext("2d");
    var time = new Date();

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = sun.color;
    ctx.fillStyle = sun.color;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius_, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    ctx.save();

    ctx.translate(sun.x,sun.y);
    ctx.rotate((Math.PI/30)*time.getSeconds() + (Math.PI/30000)*time.getMilliseconds());
    ctx.strokeStyle = earth.color;
    ctx.fillStyle = earth.color;
    ctx.beginPath();
    ctx.arc(earth.x, earth.y, earth.radius_, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    ctx.save();

    ctx.translate(earth.x,earth.y);
    ctx.rotate((Math.PI/30)*time.getSeconds() + (Math.PI/30000)*time.getMilliseconds());
    ctx.strokeStyle = moon.color;
    ctx.fillStyle = moon.color;
    ctx.beginPath();
    ctx.arc(moon.x, moon.y, moon.radius_, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    ctx.restore();
    ctx.restore();

    window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);

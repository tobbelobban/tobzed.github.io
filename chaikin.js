
var canvas = document.getElementById("canvas");

var control_polygon = [];
var chaikin = [];

canvas.addEventListener("click", MouseClicked);

function chaikin_update() {
    var min_new_count = 4*control_polygon.length;
    chaikin = control_polygon;
    var current_pts_count = chaikin.length;
    if(min_new_count <= current_pts_count || current_pts_count < 3) {
        return;
    }
    while(current_pts_count < min_new_count) {
        var tmp = [];
        for(var i = 0; i < chaikin.length-1; i++) {
            var neighbour = i+1;
            tmp.push({x: 0.75*chaikin[i].x+0.25*chaikin[neighbour].x,y: 0.75*chaikin[i].y+0.25*chaikin[neighbour].y});
            tmp.push({x: 0.25*chaikin[i].x+0.75*chaikin[neighbour].x,y: 0.25*chaikin[i].y+0.75*chaikin[neighbour].y});
        }

        chaikin = tmp;
        current_pts_count = chaikin.length;
    }
}

function draw_chaikin() {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    for(var p = 0; p < chaikin.length; p++) {
        ctx.moveTo(chaikin[p].x,chaikin[p].y);
        ctx.arc(chaikin[p].x,chaikin[p].y,2,0,2*Math.PI);
        ctx.fill();
    }
}

function draw_control_polygon() {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.StrokeStyle = "#000000";
    ctx.setLineDash([5,3]);
    ctx.beginPath();
    ctx.moveTo(control_polygon[0].x,control_polygon[0].y);
    for(var p = 1; p < control_polygon.length; p++) {
        ctx.lineTo(control_polygon[p].x,control_polygon[p].y);
    }
    ctx.stroke();
    ctx.fillStyle = "#0000ff";
    ctx.setLineDash([]);
    ctx.beginPath();
    for(var p = 0; p < control_polygon.length; p++) {
        ctx.moveTo(control_polygon[p].x,control_polygon[p].y);
        ctx.arc(control_polygon[p].x,control_polygon[p].y,8,0,2*Math.PI);
        ctx.fill();
    }
}

function MouseClicked(e) {
    if(e.clientX <=canvas.width && e.clientX >= 0 && e.clientY <=canvas.height && e.clientY >= 0) {
        control_polygon.push({x: e.clientX, y: e.clientY})
        draw_control_polygon();
        chaikin_update();
        draw_chaikin();
    }
}

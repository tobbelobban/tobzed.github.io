
var canvas = document.getElementById("canvas");

var control_polygon = [];
var chaikin = [];
var selectedPoint = -1;
var radius = 8;

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
    ctx.StrokeStyle = "#696969";
    ctx.setLineDash([3,3]);
    ctx.beginPath();
    ctx.moveTo(control_polygon[0].x,control_polygon[0].y);
    for(var p = 1; p < control_polygon.length; p++) {
        ctx.lineTo(control_polygon[p].x,control_polygon[p].y);
    }
    ctx.stroke();
    ctx.fillStyle = "#0000ff";
    ctx.setLineDash([]);
    for(var p = 0; p < control_polygon.length; p++) {
        ctx.beginPath();
        ctx.moveTo(control_polygon[p].x,control_polygon[p].y);
        if(p == selectedPoint) {
            ctx.fillStyle = "#00ff00";
            ctx.arc(control_polygon[p].x,control_polygon[p].y,8,0,2*Math.PI);
            ctx.fill();
            ctx.fillStyle = "#0000ff";
        } else {
            ctx.arc(control_polygon[p].x,control_polygon[p].y,8,0,2*Math.PI);
            ctx.fill();
        }
    }
}

function MouseClicked(e) {
    var unselect = false;
    var offsetLeft = canvas.offsetLeft, offsetTop = canvas.offsetTop;
    var xPos = e.clientX - offsetLeft, yPos = e.clientY - offsetTop;
    if(xPos <=canvas.width && xPos >= 0 && yPos <=canvas.height && yPos >= 0) {
        if(selectedPoint < 0) {
            for(var p = 0; p < control_polygon.length; p++) {
                var distance = Math.sqrt(Math.pow(control_polygon[p].x-xPos,2) + Math.pow(control_polygon[p].y-yPos,2));
                if(distance < radius) {
                    selectedPoint = p;
                    break;
                }
            }
        } else {
            var distance = Math.sqrt(Math.pow(control_polygon[selectedPoint].x-xPos,2) + Math.pow(control_polygon[selectedPoint].y-yPos,2));
            if(distance < radius) {
                selectedPoint = -1;
                unselect = true;
            } else {
                control_polygon[selectedPoint].x = xPos;
                control_polygon[selectedPoint].y = yPos;
            }
        }

        if(selectedPoint < 0 && !unselect) {
            control_polygon.push({x: xPos, y: yPos});
        }
        draw_control_polygon();
        chaikin_update();
        draw_chaikin();
    }
}

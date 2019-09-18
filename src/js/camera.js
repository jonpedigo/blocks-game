const camera = {
  x: 0,
  y: 0,
}

function set(ctx, hero) {
  camera.x = (hero.x + hero.width/2) - ctx.canvas.width/2
  camera.y = (hero.y + hero.height/2) - ctx.canvas.height/2
}

function drawName(ctx, object){
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(object.name ? object.name : '', object.x - camera.x, object.y - camera.y);
}

function drawObject(ctx, object, withNames = true) {
  if(object.color) ctx.fillStyle = object.color
  ctx.fillRect(object.x - camera.x, object.y - camera.y, object.width, object.height);
  ctx.fillStyle = 'white';

  if(withNames) {
    drawName(ctx, object)
  }
}

export default {
  set,
	drawObject,
}

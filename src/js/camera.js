const camera = {
  x: 0,
  y: 0,
}

function set(ctx, hero) {
  camera.x = (hero.x + hero.width/2) - ctx.canvas.width/2
  camera.y = (hero.y + hero.height/2) - ctx.canvas.height/2
}

function drawObject(ctx, object) {
  ctx.fillRect(object.x - camera.x, object.y - camera.y, object.width, object.height);
}

export default {
  set,
	drawObject,
}

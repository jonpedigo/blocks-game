const camera = {
  x: 0,
  y: 0,
  limitX: null,
  limitY: null,
  centerX: null,
  centerY: null,
}

function setLimit(limitX = null, limitY = null, centerX = camera.x, centerY = camera.y) {
  camera.centerX = centerX
  camera.centerY = centerY

  camera.limitX = limitX
  camera.limitY = limitY
}

function clearLimit() {
  camera.centerX = null
  camera.centerY = null

  camera.limitX = null
  camera.limitY = null
}

function setHeroX(ctx, hero) {
  camera.x = (hero.x + hero.width/2) - ctx.canvas.width/2
}
function setHeroY(ctx, hero) {
  camera.y = (hero.y + hero.height/2) - ctx.canvas.height/2
}


function get(){
  return camera
}

function set(ctx, hero) {
  if (camera.limitX) {
    const potentialX = (hero.x + hero.width/2)
    if(potentialX > (camera.centerX + camera.limitX - (ctx.canvas.width/2))) {
      camera.x = (camera.centerX + camera.limitX - ctx.canvas.width)
    } else if (potentialX < (camera.centerX - camera.limitX + (ctx.canvas.width/2))) {
      camera.x = camera.centerX - camera.limitX
    } else {
      setHeroX(ctx, hero)
    }
  } else {
    setHeroX(ctx, hero)
  }

  if (camera.limitY) {
    const potentialY = (hero.y + hero.height/2)
    if (potentialY > (camera.centerY + camera.limitY - (ctx.canvas.height/2))) {
      camera.y = camera.centerY + camera.limitY - ctx.canvas.height
    } else if (potentialY < (camera.centerY - camera.limitY + (ctx.canvas.height/2))) {
      camera.y = camera.centerY - camera.limitY
    } else {
      setHeroY(ctx, hero)
    }
  } else {
    setHeroY(ctx, hero)
  }
}

function drawName(ctx, object){
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(object.name ? object.name : '', object.x - camera.x, object.y - camera.y);
}

function drawObject(ctx, object, withNames = false) {
  // if(object.color) ctx.fillStyle = object.color
  ctx.fillRect(object.x - camera.x, object.y - camera.y, object.width, object.height);
  // ctx.fillStyle = 'white';

  if(withNames) {
    drawName(ctx, object)
  }
}

function drawVertice(ctx, vertice) {
  ctx.beginPath();
  ctx.moveTo(vertice.a.x - camera.x,vertice.a.y - camera.y);
  ctx.lineTo(vertice.b.x - camera.x,vertice.b.y - camera.y);
  ctx.stroke();
}

export default {
  set,
  get,
	drawObject,
  drawVertice,
  clearLimit,
  setLimit,
}

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
  camera.x = ((hero.x + hero.width/2)/window.hero.zoomMultiplier) - ctx.canvas.width/2
}
function setHeroY(ctx, hero) {
  camera.y = ((hero.y + hero.height/2)/window.hero.zoomMultiplier) - ctx.canvas.height/2
}


function get(){
  return camera
}

function set(ctx, hero) {
  if (camera.limitX) {
    const potentialX = (hero.x + hero.width/2)/window.hero.zoomMultiplier

    // too late, more
    if(potentialX > (((camera.centerX + camera.limitX)/window.hero.zoomMultiplier) - (ctx.canvas.width/2))) {
      camera.x = ((camera.centerX + camera.limitX)/window.hero.zoomMultiplier) - ctx.canvas.width
    // too soon, less
  } else if (potentialX < (((camera.centerX - camera.limitX)/window.hero.zoomMultiplier) + (ctx.canvas.width/2))) {
      camera.x = ((camera.centerX - camera.limitX)/window.hero.zoomMultiplier)
    } else {
      setHeroX(ctx, hero)
    }
  } else {
    setHeroX(ctx, hero)
  }

  if (camera.limitY) {
    const potentialY = (hero.y + hero.height/2)/window.hero.zoomMultiplier
    if (potentialY > (((camera.centerY + camera.limitY)/window.hero.zoomMultiplier) - (ctx.canvas.height/2))) {
      camera.y = ((camera.centerY + camera.limitY)/window.hero.zoomMultiplier) - ctx.canvas.height
    } else if (potentialY < (((camera.centerY - camera.limitY)/window.hero.zoomMultiplier) + (ctx.canvas.height/2))) {
      camera.y = (camera.centerY - camera.limitY)/window.hero.zoomMultiplier
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
  ctx.fillRect((object.x/window.hero.zoomMultiplier - camera.x), (object.y/window.hero.zoomMultiplier - camera.y), object.width/window.hero.zoomMultiplier, object.height/window.hero.zoomMultiplier);
  // ctx.fillStyle = 'white';

  if(withNames) {
    drawName(ctx, object)
  }
}

function drawVertice(ctx, vertice) {
  ctx.beginPath();
  // ctx.lineWidth = '4';
  ctx.moveTo( (vertice.a.x/window.hero.zoomMultiplier - camera.x), (vertice.a.y/window.hero.zoomMultiplier - camera.y));
  ctx.lineTo( (vertice.b.x/window.hero.zoomMultiplier - camera.x), (vertice.b.y/window.hero.zoomMultiplier - camera.y));
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

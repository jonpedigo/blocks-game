const camera = {
  x: 0,
  y: 0,
  limitX: null,
  limitY: null,
  centerX: null,
  centerY: null,
}
window.camera = camera

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
  camera.x = (((hero.x + hero.width/2)/camera.multiplier)) - window.CONSTANTS.PLAYER_CANVAS_WIDTH/2
}
function setHeroY(ctx, hero) {
  camera.y = (((hero.y + hero.height/2)/camera.multiplier)) - window.CONSTANTS.PLAYER_CANVAS_HEIGHT/2
}


function get(){
  return camera
}

function set(ctx = window.ctx, hero = window.hero) {
  camera.multiplier = hero.zoomMultiplier / window.canvasMultiplier
  if(hero.animationZoomMultiplier) camera.multiplier = hero.animationZoomMultiplier / window.canvasMultiplier
  if (camera.limitX) {
    const potentialX = ((hero.x + hero.width/2)/camera.multiplier)

    // too late, more
    if(potentialX > ((((camera.centerX + camera.limitX)/camera.multiplier)) - (window.CONSTANTS.PLAYER_CANVAS_WIDTH/2))) {
      camera.x = (((camera.centerX + camera.limitX)/camera.multiplier)) - window.CONSTANTS.PLAYER_CANVAS_WIDTH
    // too soon, less
  } else if (potentialX < ((((camera.centerX - camera.limitX)/camera.multiplier)) + (window.CONSTANTS.PLAYER_CANVAS_WIDTH/2))) {
      camera.x = (((camera.centerX - camera.limitX)/camera.multiplier))
    } else {
      setHeroX(ctx, hero)
    }
  } else {
    setHeroX(ctx, hero)
  }

  if (camera.limitY) {
    const potentialY = ((hero.y + hero.height/2)/camera.multiplier)

    if (potentialY > ((((camera.centerY + camera.limitY)/camera.multiplier))- (window.CONSTANTS.PLAYER_CANVAS_HEIGHT/2))) {
      camera.y = (((camera.centerY + camera.limitY)/camera.multiplier)) - window.CONSTANTS.PLAYER_CANVAS_HEIGHT
    } else if (potentialY < ((((camera.centerY - camera.limitY)/camera.multiplier)) + (window.CONSTANTS.PLAYER_CANVAS_HEIGHT/2))) {
      camera.y = ((camera.centerY - camera.limitY)/camera.multiplier)
    } else {
      setHeroY(ctx, hero)
    }
  } else {
    setHeroY(ctx, hero)
  }
}

function drawName(ctx, object){
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "12px Courier New";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";

	ctx.fillText(object.name ? object.name : '', object.x - camera.x, object.y - camera.y);
}

function drawNameCenter(ctx, object) {
  ctx.fillStyle = "rgb(250, 250, 250)";
  let fontSize = 20/(camera.multiplier)
  if(fontSize < 12) fontSize = 12
  ctx.font = `${fontSize}px Courier New`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  // ctx.textAlign = 'start'
  // ctx.textBaseline = 'alphabetic'
  let lineWidth = (object.width - fontSize)/camera.multiplier
  // NEED TO REVISE THIS WHOLE GOD DAMN THING
  let { width, height } = window.measureWrapText(ctx, object.name, 0, 0, lineWidth, fontSize)
  // console.log(object.width, )
  window.wrapText(ctx, object.name, (object.x+(object.width/2))/camera.multiplier - camera.x, ((object.y+(object.height/2))/camera.multiplier - camera.y - (height/2)), lineWidth, fontSize)
  // window.wrapText(ctx, object.name, ((object.x+(object.width/2))/camera.multiplier - camera.x), ((object.y+(object.height/2))/camera.multiplier - camera.y - (fontSize/2)), lineWidth, fontSize)
}

function drawNameAbove(ctx, object) {
  ctx.fillStyle = "rgb(250, 250, 250)";
  let fontSize = 20/(camera.multiplier)
  if(fontSize < 12) fontSize = 12
  ctx.font = `${fontSize}px Courier New`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  let lineWidth = (object.width - fontSize)/camera.multiplier
  // NEED TO REVISE THIS WHOLE GOD DAMN THING
  let { width, height } = window.measureWrapText(ctx, object.name, 0, 0, lineWidth, fontSize)
  // console.log(object.width, )
  window.wrapText(ctx, object.name, (object.x + (object.width/2))/camera.multiplier - camera.x, object.y/camera.multiplier - camera.y - height, lineWidth, fontSize)
}

function drawObject(ctx, object, withNames = false) {
  if(object.color) ctx.fillStyle = object.color
  ctx.fillRect((object.x/camera.multiplier - camera.x), (object.y/camera.multiplier - camera.y), (object.width/camera.multiplier), (object.height/camera.multiplier));
  // ctx.fillStyle = 'white';
  if(withNames) {
    drawName(ctx, object)
  }
}

function drawText(ctx, object, withNames = false) {
  // if(object.color) ctx.fillStyle = object.color
  ctx.fillRect((object.x/camera.multiplier - camera.x), (object.y/camera.multiplier - camera.y), (object.width/camera.multiplier), (object.height/camera.multiplier));
  // ctx.fillStyle = 'white';

  if(withNames) {
    drawName(ctx, object)
  }
}

function drawVertice(ctx, vertice) {
  if(vertice.glow) {
    ctx.filter = "drop-shadow(4px 4px 8px #fff)";
    // ctx.shadowBlur = vertice.glow;
    // ctx.shadowColor = "white";
  }
  if(vertice.color) {
    ctx.strokeStyle = vertice.color;
  }
  if(vertice.thickness) {
    ctx.lineWidth = vertice.thickness
  }

  ctx.beginPath();
  // ctx.lineWidth = '4';
  ctx.moveTo( (vertice.a.x/camera.multiplier - camera.x), (vertice.a.y/camera.multiplier - camera.y));
  ctx.lineTo( (vertice.b.x/camera.multiplier - camera.x), (vertice.b.y/camera.multiplier - camera.y));
  ctx.stroke();

  if(vertice.glow) {
    // ctx.shadowBlur = 0;
    ctx.filter = "none";
    drawVertice(ctx, {...vertice, glow: false})
  }
  if(vertice.color) {
    ctx.strokeStyle = "#999";
  }
  if(vertice.thickness) {
    ctx.lineWidth = 1
  }
}

function init() {

}

function loaded() {

}

export default {
  init,
  loaded,
  set,
  get,
	drawObject,
  drawVertice,
  drawNameCenter,
  drawNameAbove,
  clearLimit,
  setLimit,
}

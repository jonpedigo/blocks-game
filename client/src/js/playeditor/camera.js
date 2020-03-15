import gridTool from '../grid.js'

function drawName(ctx, object){
	ctx.fillStyle = "rgb(0, 0, 250)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(object.id ? object.id : '', (object.x * window.scaleMultiplier) - window.camera.x, (object.y * window.scaleMultiplier) - window.camera.y);
}

function drawObject(ctx, object, withNames = false) {
  if(object.color) ctx.fillStyle = object.color
  ctx.fillRect((object.x * window.scaleMultiplier) - window.camera.x, (object.y * window.scaleMultiplier) - window.camera.y, (object.width * window.scaleMultiplier), (object.height * window.scaleMultiplier));

  if(withNames) {
    drawName(ctx, object)
  }
}

function drawGrid(ctx, object) {
  let thickness = .3
  if(object.x % (window.gridNodeSize * 10) === 0 && object.y % (window.gridNodeSize * 10) === 0) {
    thickness = .8
  }
  ctx.strokeStyle = "#999";
  drawBorder(ctx, object, thickness)
}

function drawBorder(ctx, object, thickness = 2) {
  ctx.lineWidth = thickness;
  // ctx.fillRect(((object.x * window.scaleMultiplier) - window.camera.x) - (xBorderThickness), ((object.y * window.scaleMultiplier) - window.camera.y) - (yBorderThickness), (object.width * window.scaleMultiplier) + (xBorderThickness * 2), (object.height * window.scaleMultiplier) + (yBorderThickness * 2));
  [({a:{x:object.x,y:object.y}, b:{x:object.x + object.width,y:object.y}}),
  ({a:{x:object.x + object.width,y:object.y}, b:{x:object.x + object.width,y:object.y + object.height}}),
  ({a:{x:object.x + object.width,y:object.y + object.height}, b:{x:object.x,y:object.y + object.height}}),
  ({a:{x:object.x,y:object.y + object.height}, b:{x:object.x,y:object.y}})].forEach((vertice) => {
    drawVertice(ctx, vertice)
  })
}

function drawVertice(ctx, vertice) {
  ctx.beginPath();
  ctx.moveTo( (vertice.a.x * window.scaleMultiplier - window.camera.x), (vertice.a.y * window.scaleMultiplier - window.camera.y));
  ctx.lineTo( (vertice.b.x * window.scaleMultiplier - window.camera.x), (vertice.b.y * window.scaleMultiplier - window.camera.y));
  ctx.stroke();
}

function render(ctx, hero, objects) {
  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if(window.grid) {
    gridTool.forEach((grid) => {
      drawGrid(ctx, grid)
    })
  }


  ////////////////
  ////////////////
  // OBJECTS
  ////////////////
  ////////////////
	ctx.fillStyle = 'white';
  let vertices = [...window.objects,...window.objectFactory].reduce((prev, object) => {
		prev.push({a:{x:object.x,y:object.y}, b:{x:object.x + object.width,y:object.y}})
		prev.push({a:{x:object.x + object.width,y:object.y}, b:{x:object.x + object.width,y:object.y + object.height}})
		prev.push({a:{x:object.x + object.width,y:object.y + object.height}, b:{x:object.x,y:object.y + object.height}})
		prev.push({a:{x:object.x,y:object.y + object.height}, b:{x:object.x,y:object.y}})
		return prev
	}, [])
  ctx.strokeStyle = '#FFF'
  ctx.lineWidth = 1;

  for(let i = 0; i < vertices.length; i++) {
    drawVertice(ctx, vertices[i])
  }

  ////////////////
  ////////////////
  // HEROS
  ////////////////
  ////////////////
  for(var heroId in window.heros) {
    if(heroId === window.editingHero.id) {
      drawObject(ctx, {...window.heros[heroId], color: 'red'});
    } else {
      drawObject(ctx, {...window.heros[heroId], color: 'white'});
    }
  }


  ////////////////
  ////////////////
  // DRAGGING UI BOXES
  ////////////////
  ////////////////
  if(clickStart.x && currentTool === TOOLS.ADD_OBJECT) {
    drawBorder(ctx, { x: (clickStart.x/window.scaleMultiplier), y: (clickStart.y/window.scaleMultiplier), width: mousePos.x - (clickStart.x/window.scaleMultiplier), height: mousePos.y - (clickStart.y/window.scaleMultiplier)})
  }
  if(clickStart.x && currentTool === TOOLS.AREA_SELECTOR) {
    ctx.strokeStyle = '#FFF'
    let possibleBox = { x: (clickStart.x/window.scaleMultiplier), y: (clickStart.y/window.scaleMultiplier), width: mousePos.x - (clickStart.x/window.scaleMultiplier), height: mousePos.y - (clickStart.y/window.scaleMultiplier)}
    if(Math.abs(possibleBox.width) >= window.CONSTANTS.PLAYER_CANVAS_WIDTH && Math.abs(possibleBox.height) >= window.CONSTANTS.PLAYER_CANVAS_HEIGHT) ctx.strokeStyle = '#FFF'
    else ctx.strokeStyle = 'red'
    drawBorder(ctx, possibleBox)
  }

  ////////////////
  ////////////////
  // PREFERENCES
  ////////////////
  ////////////////
  if(window.preferences.gameBoundaries) {
    ctx.fillStyle='white';
    ctx.globalAlpha = 0.2;
    drawObject(ctx, window.preferences.gameBoundaries);
    ctx.globalAlpha = 1.0;
  }

  if(currentTool == TOOLS.PROCEDURAL && window.preferences.proceduralBoundaries) {
    ctx.fillStyle='yellow';
    ctx.globalAlpha = 0.2;
    drawObject(ctx, window.preferences.proceduralBoundaries);
    ctx.globalAlpha = 1.0;
  }

  if(window.preferences.lockCamera) {
    ctx.fillStyle='#0A0';
    ctx.globalAlpha = 0.2;
    drawObject(ctx, window.preferences.lockCamera);
    ctx.globalAlpha = 1.0;
  }

  ////////////////
  ////////////////
  // HEROS SETTINGS
  ////////////////
  ////////////////
  for(var heroId in window.heros) {
    let currentHero = window.heros[heroId];

    if(window.preferences.lockCamera) {
      ctx.strokeStyle='#0A0';
      drawBorder(ctx, {x: currentHero.x - (window.CONSTANTS.PLAYER_CANVAS_WIDTH * currentHero.zoomMultiplier)/2 + currentHero.width/2, y: currentHero.y - (window.CONSTANTS.PLAYER_CANVAS_HEIGHT * currentHero.zoomMultiplier)/2 + currentHero.height/2, width: (window.CONSTANTS.PLAYER_CANVAS_WIDTH * currentHero.zoomMultiplier), height: (window.CONSTANTS.PLAYER_CANVAS_HEIGHT * currentHero.zoomMultiplier)})
    }

    if(currentHero.reachablePlatformHeight && currentHero.gravity) {
      let y = (currentHero.y + currentHero.height)
      let x = currentHero.x - currentHero.reachablePlatformWidth
      let width = (currentHero.reachablePlatformWidth * 2) + (currentHero.width)
      let height = currentHero.reachablePlatformHeight
      let color = 'rgba(50, 255, 50, 0.5)'
      drawObject(ctx, {x, y, width, height, color})
    }
  }

  drawObject(ctx, {x: window.editingHero.spawnPointX, y: window.editingHero.spawnPointY - 205, width: 5, height: 400, color: 'white'})
  drawObject(ctx, {x: window.editingHero.spawnPointX - 205, y: window.editingHero.spawnPointY, width: 400, height: 5, color: 'white'})
}

function setCameraHeroX(ctx, hero) {
  window.camera.x = ((hero.x + hero.width/2) * window.scaleMultiplier) - ctx.canvas.width/2
}
function setCameraHeroY(ctx, hero) {
  window.camera.y = ((hero.y + hero.height/2) * window.scaleMultiplier) - ctx.canvas.height/2
}
function setCamera(ctx, hero) {
  setCameraHeroX(ctx, hero)
  setCameraHeroY(ctx, hero)
}

export default {
  render,
  setCamera,
}

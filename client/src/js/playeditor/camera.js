import gridTool from '../grid.js'

window.camera = {
  x: -100,
  y: -100,
}

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

// function drawGrid(ctx, object) {
//   let thickness = .3
//   if(object.x % (window.grid.nodeSize * 10) === 0 && object.y % (window.grid.nodeSize * 10) === 0) {
//     thickness = .8
//   }
//   ctx.strokeStyle = "#999";
//   drawBorder(ctx, object, thickness)
// }

function drawBorder(ctx, object, thickness = 2) {
  // ctx.fillRect(((object.x * window.scaleMultiplier) - window.camera.x) - (xBorderThickness), ((object.y * window.scaleMultiplier) - window.camera.y) - (yBorderThickness), (object.width * window.scaleMultiplier) + (xBorderThickness * 2), (object.height * window.scaleMultiplier) + (yBorderThickness * 2));
  [({a:{x:object.x,y:object.y}, b:{x:object.x + object.width,y:object.y}, thickness}),
  ({a:{x:object.x + object.width,y:object.y}, b:{x:object.x + object.width,y:object.y + object.height}, thickness}),
  ({a:{x:object.x + object.width,y:object.y + object.height}, b:{x:object.x,y:object.y + object.height}, thickness}),
  ({a:{x:object.x,y:object.y + object.height}, b:{x:object.x,y:object.y}, thickness})].forEach((vertice) => {
    drawVertice(ctx, vertice)
  })
}

function drawVertice(ctx, vertice) {
  if(vertice.glow) {
    ctx.filter = "drop-shadow(4px 4px 8px #fff)";
  }
  if(vertice.color) {
    ctx.strokeStyle = vertice.color;
  }
  if(vertice.thickness) {
    ctx.lineWidth = vertice.thickness
  }

  ctx.beginPath();
  ctx.moveTo( (vertice.a.x * window.scaleMultiplier - window.camera.x), (vertice.a.y * window.scaleMultiplier - window.camera.y));
  ctx.lineTo( (vertice.b.x * window.scaleMultiplier - window.camera.x), (vertice.b.y * window.scaleMultiplier - window.camera.y));
  ctx.stroke();

  if(vertice.glow) {
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

function render(ctx, hero, objects) {
  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);


  ////////////////
  ////////////////
  // GRID
  ////////////////
  ////////////////
  if(window.grid) {
    let height = window.grid.nodeSize * window.grid.height
    let width = window.grid.nodeSize * window.grid.width

    ctx.strokeStyle = "#999";
    for(var x = 0; x < window.grid.width; x++) {
      ctx.lineWidth = .3
      if(x % 10 === 0) {
        ctx.lineWidth = .8
      }
      drawVertice(ctx, {a: {
        x: window.grid.startX + (x * window.grid.nodeSize),
        y: window.grid.startY,
      },
      b: {
        x: window.grid.startX + (x * window.grid.nodeSize),
        y: window.grid.startY + height,
      }})
    }
    for(var y = 0; y < window.grid.height; y++) {
      ctx.lineWidth = .3
      if(y % 10 === 0) {
        ctx.lineWidth = .8
      }
      drawVertice(ctx, {a: {
        x: window.grid.startX,
        y: window.grid.startY + (y * window.grid.nodeSize),
      },
      b: {
        x: window.grid.startX + width,
        y: window.grid.startY + (y * window.grid.nodeSize),
      }})
    }
  }

  ////////////////
  ////////////////
  // EDITING OBJECT SETTINGS
  ////////////////
  ////////////////
  if(window.editingObject.id && window.currentTool == window.TOOLS.SIMPLE_EDITOR) {
    let object = window.editingObject

    // if(object.gridX) {
    //   drawObject(ctx, {color: 'rgba(100,100,200, 1)', x: (object.gridX * window.grid.nodeSize) + window.grid.startX, y: (object.gridY * window.grid.nodeSize) + window.grid.startY, width: window.grid.nodeSize, height: window.grid.nodeSize})
    // }

    drawObject(ctx, {...object, color: 'rgba(0,0,255, 1)'})

    if(window.editingObject.pathfindingLimit) {
      drawObject(ctx, {x: (window.editingObject.pathfindingLimit.x * window.grid.nodeSize) + window.grid.startX, y: (window.editingObject.pathfindingLimit.y * window.grid.nodeSize) + window.grid.startY, width: window.editingObject.pathfindingLimit.width * window.grid.nodeSize, height: window.editingObject.pathfindingLimit.height * window.grid.nodeSize, color: 'rgba(255,255,0, .5)'})
    }

    if(window.editingObject.path && window.editingObject.path.length) {
      window.editingObject.path.forEach((path) => {
        drawObject(ctx, {x: (path.x * window.grid.nodeSize) + window.grid.startX, y: (path.y * window.grid.nodeSize) + window.grid.startY, width: window.grid.nodeSize, height: window.grid.nodeSize, color: 'rgba(0,255,255, .5)'})
      })
    }
  }

  ////////////////
  ////////////////
  // ORIGIN AND SPAWN POINTS
  ////////////////
  ////////////////
  drawObject(ctx, {x: 0, y: 0, width: 2, height: 2000, color: 'white'})
  drawObject(ctx, {x: 0, y: 0, width: 2000, height: 2, color: 'white'})

  drawObject(ctx, {x: window.preferences.worldSpawnPointX, y: window.preferences.worldSpawnPointY - 205, width: 5, height: 400, color: 'white'})
  drawObject(ctx, {x: window.preferences.worldSpawnPointX - 205, y: window.preferences.worldSpawnPointY, width: 400, height: 5, color: 'white'})

  ////////////////
  ////////////////
  // OBJECTS
  ////////////////
  ////////////////
  let vertices = [...window.objects,...window.objectFactory].reduce((prev, object) => {
    const extraProps = {}
    if(object.tags && object.tags.glowing) {
      extraProps.glow = 3
      extraProps.thickness = 2
      extraProps.color = 'white'
    }
		prev.push({a:{x:object.x,y:object.y}, b:{x:object.x + object.width,y:object.y}, ...extraProps})
		prev.push({a:{x:object.x + object.width,y:object.y}, b:{x:object.x + object.width,y:object.y + object.height}, ...extraProps})
		prev.push({a:{x:object.x + object.width,y:object.y + object.height}, b:{x:object.x,y:object.y + object.height}, ...extraProps})
		prev.push({a:{x:object.x,y:object.y + object.height}, b:{x:object.x,y:object.y}, ...extraProps})
		return prev
	}, [])

  ctx.strokeStyle = '#999'
  ctx.lineWidth = 1;
  for(let i = 0; i < vertices.length; i++) {
    drawVertice(ctx, vertices[i])
  }

  ////////////////
  ////////////////
  // HEROS
  ////////////////
  ////////////////
  ctx.fillStyle = 'white';
  for(var heroId in window.heros) {
    if(heroId === window.editingHero.id && window.currentTool == window.TOOLS.HERO_EDITOR) {
      drawObject(ctx, {...window.heros[heroId], color: '#0A0'});
    } else {
      drawObject(ctx, {...window.heros[heroId], color: 'white'});
    }
  }

  ////////////////
  /// PATHFINDING OBSTACLES
  ////////////////
  ////////////////
  if(window.grid) {
    ctx.lineWidth = 1
    window.grid.nodes.forEach((nodeRow) => {
      nodeRow.forEach((node) => {
        if(node.hasObstacle == true) {
          drawVertice(ctx, {a: {
            x: node.gridX * window.grid.nodeSize + window.grid.startX,
            y: node.gridY * window.grid.nodeSize + window.grid.startY,
          },
          b: {
            x: (node.gridX + 1) * window.grid.nodeSize + window.grid.startX,
            y: (node.gridY + 1) * window.grid.nodeSize + window.grid.startY,
          }, color: 'red'})
        }
      })

    })
  }



  ////////////////
  ////////////////
  // DRAGGING UI BOXES
  ////////////////
  ////////////////
  if(window.clickStart.x && (currentTool === TOOLS.ADD_OBJECT || currentTool === TOOLS.SIMPLE_EDITOR)) {
    drawBorder(ctx, { x: (clickStart.x/window.scaleMultiplier), y: (clickStart.y/window.scaleMultiplier), width: mousePos.x - (clickStart.x/window.scaleMultiplier), height: mousePos.y - (clickStart.y/window.scaleMultiplier)})
  }
  if(window.clickStart.x && (currentTool === TOOLS.AREA_SELECTOR || currentTool === TOOLS.PROCEDURAL )) {
    ctx.strokeStyle = '#FFF'
    let possibleBox = { x: (clickStart.x/window.scaleMultiplier), y: (clickStart.y/window.scaleMultiplier), width: mousePos.x - (clickStart.x/window.scaleMultiplier), height: mousePos.y - (clickStart.y/window.scaleMultiplier)}
    if(Math.abs(possibleBox.width) >= (window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.editingHero.zoomMultiplier) && Math.abs(possibleBox.height) >= window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.editingHero.zoomMultiplier) ctx.strokeStyle = '#FFF'
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

  if((currentTool == TOOLS.AREA_SELECTOR || currentTool == TOOLS.PROCEDURAL) && window.preferences.proceduralBoundaries) {
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

      ctx.strokeStyle='#0A0';
      drawBorder(ctx, {x: currentHero.x - (window.CONSTANTS.PLAYER_CAMERA_WIDTH * currentHero.zoomMultiplier)/2 + currentHero.width/2, y: currentHero.y - (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * currentHero.zoomMultiplier)/2 + currentHero.height/2, width: (window.CONSTANTS.PLAYER_CAMERA_WIDTH * currentHero.zoomMultiplier), height: (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * currentHero.zoomMultiplier)})

    if(currentHero.reachablePlatformHeight && currentHero.tags.gravity) {
      let y = (currentHero.y + currentHero.height)
      let x = currentHero.x - currentHero.reachablePlatformWidth
      let width = (currentHero.reachablePlatformWidth * 2) + (currentHero.width)
      let height = currentHero.reachablePlatformHeight
      let color = 'rgba(50, 255, 50, 0.5)'
      drawObject(ctx, {x, y, width, height, color})
    }
  }

  if(window.editingHero.spawnPointX && window.currentTool == window.TOOLS.HERO_EDITOR) {
    drawObject(ctx, {x: window.editingHero.spawnPointX, y: window.editingHero.spawnPointY - 205, width: 5, height: 400, color: 'rgba(255, 0,0,1)'})
    drawObject(ctx, {x: window.editingHero.spawnPointX - 205, y: window.editingHero.spawnPointY, width: 400, height: 5, color: 'rgba(255, 0,0,1)'})
  }

  if(window.editingObject.spawnPointX && window.currentTool == window.TOOLS.SIMPLE_EDITOR) {
    drawObject(ctx, {x: window.editingObject.spawnPointX, y: window.editingObject.spawnPointY - 205, width: 5, height: 400, color: 'rgba(255, 0,0,1)'})
    drawObject(ctx, {x: window.editingObject.spawnPointX - 205, y: window.editingObject.spawnPointY, width: 400, height: 5, color: 'rgba(255, 0,0,1)'})
  }
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

function init() {
  window.camera.x = -150
  window.camera.y = -150
}

export default {
  init,
  render,
  setCamera,
}

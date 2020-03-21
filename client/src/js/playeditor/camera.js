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
//   if(object.x % (window.gridNodeSize * 10) === 0 && object.y % (window.gridNodeSize * 10) === 0) {
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
    ctx.filter = "drop-shadow(4px 4px 8px #fff) blur(5px)";
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
  if(window.grid && grid[0] && grid[0][0]) {
    let startGrid = grid[0][0]
    let startX = startGrid.x
    let startY = startGrid.y
    let height = window.gridNodeSize * window.gridSize.y
    let width = window.gridNodeSize * window.gridSize.x

    ctx.strokeStyle = "#999";
    for(var x = 0; x < window.gridSize.x; x++) {
      ctx.lineWidth = .3
      if(x % 10 === 0) {
        ctx.lineWidth = .8
      }

      drawVertice(ctx, {a: {
        x: startX + (x * window.gridNodeSize),
        y: startY,
      },
      b: {
        x: startX + (x * window.gridNodeSize),
        y: startY + height,
      }})
    }
    for(var y = 0; y < window.gridSize.y; y++) {
      ctx.lineWidth = .3
      if(y % 10 === 0) {
        ctx.lineWidth = .8
      }
      drawVertice(ctx, {a: {
        x: startX,
        y: startY + (y * window.gridNodeSize),
      },
      b: {
        x: startX + width,
        y: startY + (y * window.gridNodeSize),
      }})
    }
  }

  if(window.pfgrid) {
    ctx.lineWidth = 1
    window.pfgrid.nodes.forEach((nodeRow) => {
      nodeRow.forEach((node) => {
        if(node.walkable == false) {
          drawVertice(ctx, {a: {
            x: (node.x * window.gridNodeSize),
            y: (node.y * window.gridNodeSize),
          },
          b: {
            x: (node.x * window.gridNodeSize) + window.gridNodeSize,
            y: (node.y * window.gridNodeSize) + window.gridNodeSize,
          }, color: 'red'})
        }
      })

    })
  }

  ////////////////
  ////////////////
  // EDITING OBJECT SETTINGS
  ////////////////
  ////////////////
  if(window.editingObject.id) {
    let object = window.editingObject

    if(object.gridX) {
      drawObject(ctx, {color: '#BBB', x: (object.gridX * window.gridNodeSize) + window.grid[0][0].x, y: (object.gridY * window.gridNodeSize) + window.grid[0][0].y, width: window.gridNodeSize, height: window.gridNodeSize})
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
  ctx.fillStyle = 'white';
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
  if(clickStart.x && (currentTool === TOOLS.AREA_SELECTOR || currentTool === TOOLS.PROCEDURAL)) {
    ctx.strokeStyle = '#FFF'
    let possibleBox = { x: (clickStart.x/window.scaleMultiplier), y: (clickStart.y/window.scaleMultiplier), width: mousePos.x - (clickStart.x/window.scaleMultiplier), height: mousePos.y - (clickStart.y/window.scaleMultiplier)}
    if(Math.abs(possibleBox.width) >= window.CONSTANTS.PLAYER_CAMERA_WIDTH && Math.abs(possibleBox.height) >= window.CONSTANTS.PLAYER_CAMERA_HEIGHT) ctx.strokeStyle = '#FFF'
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

      ctx.strokeStyle='#0A0';
      drawBorder(ctx, {x: currentHero.x - (window.CONSTANTS.PLAYER_CAMERA_WIDTH * currentHero.zoomMultiplier)/2 + currentHero.width/2, y: currentHero.y - (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * currentHero.zoomMultiplier)/2 + currentHero.height/2, width: (window.CONSTANTS.PLAYER_CAMERA_WIDTH * currentHero.zoomMultiplier), height: (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * currentHero.zoomMultiplier)})

    if(currentHero.reachablePlatformHeight && currentHero.gravity) {
      let y = (currentHero.y + currentHero.height)
      let x = currentHero.x - currentHero.reachablePlatformWidth
      let width = (currentHero.reachablePlatformWidth * 2) + (currentHero.width)
      let height = currentHero.reachablePlatformHeight
      let color = 'rgba(50, 255, 50, 0.5)'
      drawObject(ctx, {x, y, width, height, color})
    }
  }

  if(window.editingHero.spawnPointX) {
    drawObject(ctx, {x: window.editingHero.spawnPointX, y: window.editingHero.spawnPointY - 205, width: 5, height: 400, color: 'rgba(255, 0,0,1)'})
    drawObject(ctx, {x: window.editingHero.spawnPointX - 205, y: window.editingHero.spawnPointY, width: 400, height: 5, color: 'rgba(255, 0,0,1)'})
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

import gridTool from '../grid.js'


function init() {
  window.camera = {
    x: -100,
    y: -100,
  }

  window.scaleMultiplier = .2

  window.camera.x = -150
  window.camera.y = -150
}

function drawGrid({startX, startY, gridWidth, gridHeight, normalLineWidth = .2, specialLineWidth = .6, color = 'white'}) {
  let height = w.editingGame.grid.nodeSize * gridHeight
  let width = w.editingGame.grid.nodeSize * gridWidth

  ctx.strokeStyle = "#999";
  if(color) {
    ctx.strokeStyle = color;
  }
  for(var x = 0; x <= gridWidth; x++) {
    ctx.lineWidth = normalLineWidth
    if(x % 10 === 0) {
      ctx.lineWidth = specialLineWidth
    }
    drawVertice(ctx, {a: {
      x: startX + (x * w.editingGame.grid.nodeSize),
      y: startY,
    },
    b: {
      x: startX + (x * w.editingGame.grid.nodeSize),
      y: startY + height,
    }})
  }
  for(var y = 0; y <= gridHeight; y++) {
    ctx.lineWidth = normalLineWidth
    if(y % 10 === 0) {
      ctx.lineWidth = specialLineWidth
    }
    drawVertice(ctx, {a: {
      x: startX,
      y: startY + (y * w.editingGame.grid.nodeSize),
    },
    b: {
      x: startX + width,
      y: startY + (y * w.editingGame.grid.nodeSize),
    }})
  }
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
//   if(object.x % (w.editingGame.grid.nodeSize * 10) === 0 && object.y % (w.editingGame.grid.nodeSize * 10) === 0) {
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

function getObjectVertices(object) {
  let prev = []
  if(object.removed) return prev

  const extraProps = {}
  if(object.tags.invisible) {
    ctx.fillStyle='red';
    ctx.globalAlpha = 0.2;
    drawObject(ctx, object);
    ctx.globalAlpha = 1.0;
    return prev
  }
  if(object.tags && object.tags.glowing) {
    extraProps.glow = 3
    extraProps.thickness = 2
    extraProps.color = 'white'
  }

  if(object.color) extraProps.color = object.color
  prev.push({a:{x:object.x,y:object.y}, b:{x:object.x + object.width,y:object.y}, ...extraProps})
  prev.push({a:{x:object.x + object.width,y:object.y}, b:{x:object.x + object.width,y:object.y + object.height}, ...extraProps})
  prev.push({a:{x:object.x + object.width,y:object.y + object.height}, b:{x:object.x,y:object.y + object.height}, ...extraProps})
  prev.push({a:{x:object.x,y:object.y + object.height}, b:{x:object.x,y:object.y}, ...extraProps})
  return prev
}

function render(ctx, hero, objects, grid) {
  let objectEditorState = window.objecteditor.get()

  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);


  ////////////////
  ////////////////
  // GRID
  ////////////////
  ////////////////
  if(w.editingGame.grid && w.editingGame.grid.nodes) {
    drawGrid({startX: w.editingGame.grid.startX, startY: w.editingGame.grid.startY, gridWidth: w.editingGame.grid.width, gridHeight: w.editingGame.grid.height, normalLineWidth: .2, specialLineWidth: .5, color: 'white'})
    if(w.editingGame.world && w.editingGame.world.gameBoundaries && w.editingGame.world.gameBoundaries.behavior == 'purgatory') {
      // let value = {
      //   startX: w.editingGame.world.gameBoundaries.x,
      //   startY: w.editingGame.world.gameBoundaries.y,
      //   gridWidth: w.editingGame.world.gameBoundaries.width/w.editingGame.grid.nodeSize,
      //   gridHeight: w.editingGame.world.gameBoundaries.height/w.editingGame.grid.nodeSize
      // }
      // drawGrid({...value, normalLineWidth: .2, specialLineWidth: 0, color: 'red'})
      // let value2 = {
      //   startX: w.editingGame.world.gameBoundaries.x + window.CONSTANTS.PLAYER_CAMERA_WIDTH - w.editingGame.grid.nodeSize,
      //   startY: w.editingGame.world.gameBoundaries.y + window.CONSTANTS.PLAYER_CAMERA_HEIGHT - w.editingGame.grid.nodeSize,
      //   gridWidth: ((w.editingGame.world.gameBoundaries.width - window.CONSTANTS.PLAYER_CAMERA_WIDTH * 2)/w.editingGame.grid.nodeSize) + 2,
      //   gridHeight: ((w.editingGame.world.gameBoundaries.height - window.CONSTANTS.PLAYER_CAMERA_HEIGHT * 2)/w.editingGame.grid.nodeSize) + 2
      // }
      // drawGrid({...value2, normalLineWidth: .3})
    } else if(w.editingGame.world && w.editingGame.world.gameBoundaries) {
      // let value = {
      //   startX: w.editingGame.world.gameBoundaries.x,
      //   startY: w.editingGame.world.gameBoundaries.y,
      //   gridWidth: w.editingGame.world.gameBoundaries.width/w.editingGame.grid.nodeSize,
      //   gridHeight: w.editingGame.world.gameBoundaries.height/w.editingGame.grid.nodeSize
      // }
      // drawGrid({...value, normalLineWidth: .4})
    }
  }

  ////////////////
  ////////////////
  // EDITING OBJECT SETTINGS
  ////////////////
  ////////////////
  if(objectEditorState && (currentTool === TOOLS.ADD_OBJECT || currentTool === TOOLS.SIMPLE_EDITOR)) {
    let objectById = w.editingGame.objectsById[objectEditorState.id]

    // if(object.gridX) {
    //   drawObject(ctx, {color: 'rgba(100,100,200, 1)', x: (object.gridX * w.editingGame.grid.nodeSize) + w.editingGame.grid.startX, y: (object.gridY * w.editingGame.grid.nodeSize) + w.editingGame.grid.startY, width: w.editingGame.grid.nodeSize, height: w.editingGame.grid.nodeSize})
    // }

    if(objectById) drawObject(ctx, {...objectById, color: 'rgba(0,0,255, 1)'})

    if(objectEditorState.pathfindingLimit) {
      drawObject(ctx, {x: (objectEditorState.pathfindingLimit.gridX * w.editingGame.grid.nodeSize) + w.editingGame.grid.startX, y: (objectEditorState.pathfindingLimit.gridY * w.editingGame.grid.nodeSize) + w.editingGame.grid.startY, width: objectEditorState.pathfindingLimit.gridWidth * w.editingGame.grid.nodeSize, height: objectEditorState.pathfindingLimit.gridHeight * w.editingGame.grid.nodeSize, color: 'rgba(255,255,0, .2)'})
    }

    if(objectById && objectById.path && objectById.path.length) {
      objectById.path.forEach((path) => {
        drawObject(ctx, {x: (path.x * w.editingGame.grid.nodeSize) + w.editingGame.grid.startX, y: (path.y * w.editingGame.grid.nodeSize) + w.editingGame.grid.startY, width: w.editingGame.grid.nodeSize, height: w.editingGame.grid.nodeSize, color: 'rgba(0,255,255, .5)'})
      })
    }


    if(objectEditorState && objectEditorState.parentId && window.currentTool == window.TOOLS.SIMPLE_EDITOR) {
      drawObject(ctx, {...w.editingGame.objectsById[objectEditorState.parentId], color: 'rgba(255, 0,0,.2)'})
    }

    if(objectEditorState.spawnPointX && (window.currentTool == window.TOOLS.SIMPLE_EDITOR || window.currentTool == window.TOOLS.ADD_OBJECT)) {
      drawObject(ctx, {x: objectEditorState.spawnPointX, y: objectEditorState.spawnPointY - 205, width: 5, height: 400, color: 'rgba(255, 0,0,1)'})
      drawObject(ctx, {x: objectEditorState.spawnPointX - 205, y: objectEditorState.spawnPointY, width: 400, height: 5, color: 'rgba(255, 0,0,1)'})
    }

    if(objectEditorState && objectEditorState.parent  && window.currentTool == window.TOOLS.SIMPLE_EDITOR) {
      drawObject(ctx, {...objectEditorState.parent, color: 'rgba(0,0,255, 1)'})
    }
    if(objectEditorState && objectEditorState.children && window.currentTool == window.TOOLS.SIMPLE_EDITOR) {
      objectEditorState.children.forEach((object) => {
        drawObject(ctx, {...object, color: 'rgba(255,0,0,0.6)'})
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

  drawObject(ctx, {x: w.editingGame.world.worldSpawnPointX, y: w.editingGame.world.worldSpawnPointY - 205, width: 5, height: 400, color: 'white'})
  drawObject(ctx, {x: w.editingGame.world.worldSpawnPointX - 205, y: w.editingGame.world.worldSpawnPointY, width: 400, height: 5, color: 'white'})

  ////////////////
  ////////////////
  // OBJECTS
  ////////////////
  ////////////////
  let vertices = [...w.editingGame.objects].reduce((prev, object) => {
    prev.push(...getObjectVertices(object))
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
  for(var heroId in w.editingGame.heros) {
    if(heroId === window.editingHero.id) {
      drawObject(ctx, {...w.editingGame.heros[heroId], color: '#0A0'});
    } else {
      drawObject(ctx, {...w.editingGame.heros[heroId], color: 'white'});
    }
  }

  ////////////////
  /// PATHFINDING OBSTACLES
  ////////////////
  ////////////////
  if(w.editingGame.grid) {
    ctx.lineWidth = 1
    w.editingGame.grid.nodes.forEach((nodeRow) => {
      nodeRow.forEach((node) => {
        if(node.hasObstacle == true) {
          drawVertice(ctx, {a: {
            x: node.gridX * w.editingGame.grid.nodeSize + w.editingGame.grid.startX,
            y: node.gridY * w.editingGame.grid.nodeSize + w.editingGame.grid.startY,
          },
          b: {
            x: (node.gridX + 1) * w.editingGame.grid.nodeSize + w.editingGame.grid.startX,
            y: (node.gridY + 1) * w.editingGame.grid.nodeSize + w.editingGame.grid.startY,
          }, color: 'red'})
        }
      })

    })
  }



  ////////////////
  ////////////////
  // MAP/DRAGGING UI BOXES
  ////////////////
  ////////////////
  if(window.clickStart.x && (currentTool === TOOLS.ADD_OBJECT || currentTool === TOOLS.SIMPLE_EDITOR)) {
    drawBorder(ctx, { x: (clickStart.x/window.scaleMultiplier), y: (clickStart.y/window.scaleMultiplier), width: mousePos.x - (clickStart.x/window.scaleMultiplier), height: mousePos.y - (clickStart.y/window.scaleMultiplier)})
  }
  if(window.clickStart.x && (currentTool === TOOLS.WORLD_EDITOR || currentTool === TOOLS.PROCEDURAL )) {
    ctx.strokeStyle = '#FFF'
    let possibleBox = { x: (clickStart.x/window.scaleMultiplier), y: (clickStart.y/window.scaleMultiplier), width: mousePos.x - (clickStart.x/window.scaleMultiplier), height: mousePos.y - (clickStart.y/window.scaleMultiplier)}
    if(Math.abs(possibleBox.width) >= (window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.editingHero.zoomMultiplier) && Math.abs(possibleBox.height) >= window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.editingHero.zoomMultiplier) ctx.strokeStyle = '#FFF'
    else ctx.strokeStyle = 'red'
    drawBorder(ctx, possibleBox)
  }

  if(w.gridHighlight && w.gridHighlight.parent) {
    drawObject(ctx, {...w.gridHighlight.parent, color: 'rgba(255,255,255, .3)'})
    w.gridHighlight.children.forEach((object) => {
      drawObject(ctx, {...object, color: 'rgba(255,255,255,0.7)'})
    })
  } else if(w.gridHighlight) {
    drawObject(ctx, {...w.gridHighlight, color: 'rgba(255,255,255,0.6)'})
  }

  if(window.highlightedObjectGroup && window.highlightedObjectGroup.length) {
    window.highlightedObjectGroup.forEach((object) => {
      drawObject(ctx, {...object, color: 'rgba(255,0,0,0.6)'})
    })
  }

  if(window.draggingObject && window.draggingObject.parent) {
    // if its not a parent-child relatiooon
    if(!window.draggingObject.dontSaveParent) {
      getObjectVertices(window.draggingObject.parent).forEach((vertice) => {
        drawVertice(ctx, vertice)
      })
    }
    window.draggingObject.children.forEach((object) => {
      drawObject(ctx, {...object, color: 'rgba(255,0,0,1)'})
    })
  } else if(window.draggingObject){
    getObjectVertices(window.draggingObject).forEach((vertice) => {
      drawVertice(ctx, vertice)
    })
  }

  ////////////////
  ////////////////
  // GAME
  ////////////////
  ////////////////
  if((currentTool == TOOLS.WORLD_EDITOR || currentTool == TOOLS.PROCEDURAL) && w.editingGame.world.proceduralBoundaries) {
    ctx.fillStyle='yellow';
    ctx.globalAlpha = 0.2;
    drawObject(ctx, w.editingGame.world.proceduralBoundaries);
    ctx.globalAlpha = 1.0;
  }

  if(w.editingGame.world.lockCamera) {
    ctx.strokeStyle='#0A0';
    drawBorder(ctx, w.editingGame.world.lockCamera);
  }

  if(w.editingGame.world && w.editingGame.world.gameBoundaries) {
    if(w.editingGame.world.gameBoundaries.behavior == 'purgatory') {
      ctx.strokeStyle='red';
      let valueRed = {
        x: w.editingGame.world.gameBoundaries.x-1,
        y: w.editingGame.world.gameBoundaries.y-1,
        width: w.editingGame.world.gameBoundaries.width+1,
        height: w.editingGame.world.gameBoundaries.height+1
      }
      drawBorder(ctx, valueRed);
      ctx.strokeStyle='white';
      let valueWhite = {
        x: w.editingGame.world.gameBoundaries.x + ((window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.editingHero.zoomMultiplier)/2),
        y: w.editingGame.world.gameBoundaries.y + ((window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.editingHero.zoomMultiplier)/2),
        width: w.editingGame.world.gameBoundaries.width - ((window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.editingHero.zoomMultiplier)),
        height: w.editingGame.world.gameBoundaries.height - ((window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.editingHero.zoomMultiplier))
      }
      drawBorder(ctx, valueWhite);
    } else {
      ctx.strokeStyle='white';
      let value = {
        x: w.editingGame.world.gameBoundaries.x-1,
        y: w.editingGame.world.gameBoundaries.y-1,
        width: w.editingGame.world.gameBoundaries.width+1,
        height: w.editingGame.world.gameBoundaries.height+1
      }
      drawBorder(ctx, value);
    }
  }


  ////////////////
  ////////////////
  // HEROS SETTINGS
  ////////////////
  ////////////////
  for(var heroId in w.editingGame.heros) {
    let currentHero = w.editingGame.heros[heroId];

    if(!w.editingGame.world.lockCamera || !w.editingGame.world.lockCamera.x || ((window.CONSTANTS.PLAYER_CAMERA_WIDTH * currentHero.zoomMultiplier)) < w.editingGame.world.lockCamera.width) {
      ctx.strokeStyle='#0A0';
      drawBorder(ctx, {x: currentHero.x - (window.CONSTANTS.PLAYER_CAMERA_WIDTH * currentHero.zoomMultiplier)/2 + currentHero.width/2, y: currentHero.y - (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * currentHero.zoomMultiplier)/2 + currentHero.height/2, width: (window.CONSTANTS.PLAYER_CAMERA_WIDTH * currentHero.zoomMultiplier), height: (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * currentHero.zoomMultiplier)})
    }

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

  if(window.editingHero.parentId && window.currentTool == window.TOOLS.HERO_EDITOR) {
    drawObject(ctx, {...w.editingGame.objectsById[window.editingHero.parentId], color: 'rgba(255, 0,0,.2)'})
  }

  /// FRAMES PER SECOND
  ctx.font =`24pt Arial`
  ctx.fillStyle="rgba(255,255,255,.3)"
  ctx.fillText(Math.ceil(window.fps), 20, 40)
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
  init,
  render,
  setCamera,
}

import collisions from './collisions'

function convertToGridXY(object, options = { }) {
  // pretend we are dealing with a 0,0 plane
  let x = object.x - w.game.grid.nodes[0][0].x
  let y = object.y - w.game.grid.nodes[0][0].y

  let diffX = x % w.game.grid.nodeSize
  x -= diffX
  let gridX = x/w.game.grid.nodeSize

  let diffY = y % w.game.grid.nodeSize
  y -= diffY
  let gridY = y/w.game.grid.nodeSize

  let width = Math.floor(object.width / w.game.grid.nodeSize)
  let height = Math.floor(object.height / w.game.grid.nodeSize)

  return { x, y, gridX, gridY, diffX, diffY, width, height }
}

function generateGridNodes(gridProps) {
  const grid = []

  for(var i = 0; i < gridProps.width; i++) {
    grid.push([])
    for(var j = 0; j < gridProps.height; j++) {
      grid[i].push({x: gridProps.startX + (i * w.game.grid.nodeSize), y: gridProps.startX + (j * w.game.grid.nodeSize), width: w.game.grid.nodeSize, height: w.game.grid.nodeSize, gridX: i, gridY: j})
    }
  }

  return grid
}

function forEach(fx) {
  for(var i = 0; i < w.game.grid.width; i++) {
    for(var j = 0; j < w.game.grid.height; j++) {
      fx(w.game.grid.nodes[i][j])
    }
  }
}

function snapXYToGrid(x, y, options = { closest: true }) {
  let diffX = x % w.game.grid.nodeSize;
  if(diffX > w.game.grid.nodeSize/2 && options.closest) {
    x += (w.game.grid.nodeSize - diffX)
  } else {
    x -= diffX
  }

  let diffY = y % w.game.grid.nodeSize;
  if(diffY > w.game.grid.nodeSize/2 && options.closest) {
    y += (w.game.grid.nodeSize - diffY)
  } else {
    y -= diffY
  }
  return { x, y }
}

function getRandomGridWithinXY(min, max) {
  let xyrandom = (Math.random() * (max - min)) + min
  let diff = xyrandom % w.game.grid.nodeSize
  return xyrandom - diff
}

function getAllDiffs({x, y, width, height}) {
  let leftDiff = x % w.game.grid.nodeSize
  let topDiff = y % w.game.grid.nodeSize
  let rightDiff = (x + width) % w.game.grid.nodeSize
  let bottomDiff = (y + height) % w.game.grid.nodeSize
  return { leftDiff, topDiff, rightDiff, bottomDiff }
}

function snapObjectToGrid(object) {
  let diffX = object.x % w.game.grid.nodeSize;
  if(diffX > w.game.grid.nodeSize/2) {
    object.x += (w.game.grid.nodeSize - diffX)
  } else {
    object.x -= diffX
  }

  let diffY = object.y % w.game.grid.nodeSize;
  if(diffY > w.game.grid.nodeSize/2) {
    object.y += (w.game.grid.nodeSize - diffY)
  } else {
    object.y -= diffY
  }

  let diffWidth = object.width % w.game.grid.nodeSize;
  if(diffWidth > w.game.grid.nodeSize/2) {
    object.width += (w.game.grid.nodeSize - diffWidth)
  } else {
    object.width -= diffWidth
  }

  let diffHeight = object.height % w.game.grid.nodeSize;
  if(diffHeight > w.game.grid.nodeSize/2) {
    object.height += (w.game.grid.nodeSize - diffHeight)
  } else {
    object.height -= diffHeight
  }
}


function snapTinyObjectToGrid(object, tinySize) {
  let medium = w.game.grid.nodeSize - tinySize
  const { x, y } = snapXYToGrid(object.x, object.y)
  object.y = y + medium/2
  object.x = x + medium/2
  object.width = tinySize
  object.height = tinySize
}

function snapDragToGrid(object) {
  // if negative width
  if(object.width < 0) {
    object.x += object.width
    object.width = Math.abs(object.width)
  }
  if(object.height < 0) {
    object.y += object.height
    object.height = Math.abs(object.height)
  }

  let diffX = object.x % w.game.grid.nodeSize
  object.x -= diffX

  if(diffX > w.game.grid.nodeSize/2) {
    diffX -= w.game.grid.nodeSize/2
  }

  let diffY = object.y % w.game.grid.nodeSize;
  object.y -= diffY

  if(diffY > w.game.grid.nodeSize/2) {
    diffY -= w.game.grid.nodeSize/2
  }

  let diffWidth = object.width % w.game.grid.nodeSize;
  if(diffWidth > w.game.grid.nodeSize/2) {
    // object.width += (w.game.grid.nodeSize - diffWidth)
  } else {
    // object.width -= diffWidth
  }

  let diffHeight = object.height % w.game.grid.nodeSize;
  if(diffHeight > w.game.grid.nodeSize/2) {
    // object.height += (w.game.grid.nodeSize - diffHeight)
  } else {
    // object.height -= diffHeight
  }

  object.width = Math.ceil(object.width/w.game.grid.nodeSize) * w.game.grid.nodeSize
  object.height = Math.ceil(object.height/w.game.grid.nodeSize) * w.game.grid.nodeSize

  if(diffY + diffHeight > w.game.grid.nodeSize) {
    object.height += w.game.grid.nodeSize
  }
  if(diffX + diffWidth > w.game.grid.nodeSize) {
    object.width += w.game.grid.nodeSize
  }

  object.gridX = object.x/w.game.grid.nodeSize
  object.gridY = object.y/w.game.grid.nodeSize
  object.gridWidth = object.width/w.game.grid.nodeSize
  object.gridHeight = object.height/w.game.grid.nodeSize
}

window.snapAllObjectsToGrid = function() {
	w.game.objects.forEach((object) => {
    if(object.removed) return

		snapObjectToGrid(object)
	})

  snapObjectToGrid(window.hero)
  window.hero.width = w.game.grid.nodeSize
  window.hero.height = w.game.grid.nodeSize
}

function createGridNodeAt(x, y) {
  let diffX = x % w.game.grid.nodeSize
  x -= diffX

  let diffY = y % w.game.grid.nodeSize
  y -= diffY

  return {
    x, y, width: w.game.grid.nodeSize, height: w.game.grid.nodeSize,
  }
}

function addObstacle(object) {
  if(((!object.path || !object.path.length) && object.tags.stationary && object.tags.obstacle) || w.game.world.globalTags.calculatePathCollisions || object.tags.onlyHeroAllowed) {
    // pretend we are dealing with a 0,0 plane
    let x = object.x - w.game.grid.startX
    let y = object.y - w.game.grid.startY

    let diffX = x % w.game.grid.nodeSize
    x -= diffX
    x = x/w.game.grid.nodeSize

    let diffY = y % w.game.grid.nodeSize
    y -= diffY
    y = y/w.game.grid.nodeSize

    let gridWidth = object.width / w.game.grid.nodeSize;
    let gridHeight = object.height / w.game.grid.nodeSize;

    for(let currentx = x; currentx < x + gridWidth; currentx++) {
      for(let currenty = y; currenty < y + gridHeight; currenty++) {
        hasObstacleUpdate(currentx, currenty, true)
      }
    }
  }
}

function hasObstacleUpdate(x, y, hasObstacle) {
  if(x >= 0 && x < w.game.grid.width) {
    if(y >= 0 && y < w.game.grid.height) {
      let gridNode = w.game.grid.nodes[x][y]
      gridNode.hasObstacle = hasObstacle
    }
  }
}

function removeObstacle(object) {
  if(true) {
    // pretend we are dealing with a 0,0 plane
    let x = object.x - w.game.grid.startX
    let y = object.y - w.game.grid.startY

    let diffX = x % w.game.grid.nodeSize
    x -= diffX
    x = x/w.game.grid.nodeSize

    let diffY = y % w.game.grid.nodeSize
    y -= diffY
    y = y/w.game.grid.nodeSize

    let gridWidth = object.width / w.game.grid.nodeSize;
    let gridHeight = object.height / w.game.grid.nodeSize;

    for(let currentx = x; currentx < x + gridWidth; currentx++) {
      for(let currenty = y; currenty < y + gridHeight; currenty++) {
        hasObstacleUpdate(currentx, currenty, false)
      }
    }
  }
}

function updateGridObstacles() {
  forEach((gridNode) => {
    gridNode.hasObstacle = false
  })

  w.game.objects.forEach((obj) => {
    if(obj.removed) return

    if(obj.tags && obj.tags.obstacle || obj.tags.onlyHeroAllowed) {
      addObstacle(obj)
    }
  })
}

function keepXYWithinBoundaries(object, options = { bypassGameBoundaries : false, pathfindingLimit: null }) {
  const {gridX, gridY} = convertToGridXY(object)
  return keepGridXYWithinBoundaries(gridX, gridY, options)
}

function keepGridXYWithinBoundaries(attemptingX, attemptingY, options = { bypassGameBoundaries : false, pathfindingLimit: null }) {
  let hero = window.hero
  if(role.isPlayEditor) {
    hero = window.editingHero
  }

  if(w.game.world.gameBoundaries && w.game.world.gameBoundaries.x >= 0 && (w.game.world.gameBoundaries.behavior === 'boundaryAll' || w.game.world.gameBoundaries.behavior === 'pacmanFlip') && !options.bypassGameBoundaries) {
    const {gridX, gridY, width, height } = convertToGridXY(w.game.world.gameBoundaries)
    if(attemptingX > gridX + width - 1) {
      return false
    } else if(attemptingX < gridX) {
      return false
    } else if(attemptingY > gridY + height - 1) {
      return false
    } else if(attemptingY < gridY) {
      return false
    }
  }

  if(w.game.world.gameBoundaries && w.game.world.gameBoundaries.x >= 0 && w.game.world.gameBoundaries.behavior === 'purgatory' && !options.bypassGameBoundaries) {
    const {gridX, gridY, width, height } = convertToGridXY(w.game.world.gameBoundaries)
    if(attemptingX > gridX + width - (((window.playerCameraWidth * hero.zoomMultiplier)/2)/w.game.grid.nodeSize) - 1) {
      return false
    } else if(attemptingX < gridX + (((window.playerCameraWidth * hero.zoomMultiplier)/2)/w.game.grid.nodeSize)) {
      return false
    } else if(attemptingY > gridY + height - (((window.playerCameraHeight * hero.zoomMultiplier)/2)/w.game.grid.nodeSize) - 1) {
      return false
    } else if(attemptingY < gridY + (((window.playerCameraHeight * hero.zoomMultiplier)/2)/w.game.grid.nodeSize)) {
      return false
    }
  }

  const pathfindingLimit = options.pathfindingLimit
  if(pathfindingLimit){
    if(attemptingX > pathfindingLimit.gridX + pathfindingLimit.gridWidth - 1) {
      return false
    } else if(attemptingX < pathfindingLimit.gridX) {
      return false
    } else if(attemptingY > pathfindingLimit.gridY + pathfindingLimit.gridHeight - 1) {
      return false
    } else if(attemptingY < pathfindingLimit.gridY) {
      return false
    }
  }

  //prevents someone from trying to path find off the grid.... BREAKS CODE
  if(attemptingX >= (w.game.grid.startX/w.game.grid.nodeSize) && attemptingX < w.game.grid.width + w.game.grid.startX) {
    if(attemptingY >= (w.game.grid.startY/w.game.grid.nodeSize) && attemptingY < w.game.grid.height + w.game.grid.startY) {
      return true
    }
  }

  return false
}

export default {
  forEach,
  snapObjectToGrid,
  snapDragToGrid,
  snapTinyObjectToGrid,
  createGridNodeAt,
  generateGridNodes,
  snapXYToGrid,
  updateGridObstacles,
  getAllDiffs,
  addObstacle,
  removeObstacle,
  convertToGridXY,
  getRandomGridWithinXY,
  keepGridXYWithinBoundaries,
  keepXYWithinBoundaries,
}

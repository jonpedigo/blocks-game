import collisions from './collisions'

function convertToGridXY(object, options = { }) {
  // pretend we are dealing with a 0,0 plane
  let x = object.x - GAME.grid.nodes[0][0].x
  let y = object.y - GAME.grid.nodes[0][0].y

  let diffX = x % GAME.grid.nodeSize
  x -= diffX
  let gridX = x/GAME.grid.nodeSize

  let diffY = y % GAME.grid.nodeSize
  y -= diffY
  let gridY = y/GAME.grid.nodeSize

  let width = Math.floor(object.width / GAME.grid.nodeSize)
  let height = Math.floor(object.height / GAME.grid.nodeSize)

  return { x, y, gridX, gridY, diffX, diffY, width, height }
}

function generateGridNodes(gridProps) {
  const grid = []

  const nodeData = gridProps.nodeData
  for(var i = 0; i < gridProps.width; i++) {
    grid.push([])
    for(var j = 0; j < gridProps.height; j++) {
      const node = {x: gridProps.startX + (i * GAME.grid.nodeSize), y: gridProps.startX + (j * GAME.grid.nodeSize), width: GAME.grid.nodeSize, height: GAME.grid.nodeSize, gridX: i, gridY: j}
      const key = 'x:'+node.gridX+'y:'+node.gridY
      if(nodeData && nodeData[key]) {
        node.sprite = nodeData[key].sprite
        node.color = nodeData[key].color
      }
      grid[i].push(node)
    }
  }

  return grid
}

function snapXYToGrid(x, y, options = { closest: true }) {
  let diffX = x % GAME.grid.nodeSize;
  if(diffX > GAME.grid.nodeSize/2 && options.closest) {
    x += (GAME.grid.nodeSize - diffX)
  } else {
    x -= diffX
  }

  let diffY = y % GAME.grid.nodeSize;
  if(diffY > GAME.grid.nodeSize/2 && options.closest) {
    y += (GAME.grid.nodeSize - diffY)
  } else {
    y -= diffY
  }
  return { x, y }
}

function getRandomGridWithinXY(min, max) {
  let xyrandom = (Math.random() * (max - min)) + min
  let diff = xyrandom % GAME.grid.nodeSize
  return xyrandom - diff
}

function getAllDiffs({x, y, width, height}) {
  let leftDiff = x % GAME.grid.nodeSize
  let topDiff = y % GAME.grid.nodeSize
  let rightDiff = (x + width) % GAME.grid.nodeSize
  let bottomDiff = (y + height) % GAME.grid.nodeSize
  return { leftDiff, topDiff, rightDiff, bottomDiff }
}

function snapObjectToGrid(object) {
  let diffX = object.x % GAME.grid.nodeSize;
  if(diffX > GAME.grid.nodeSize/2) {
    object.x += (GAME.grid.nodeSize - diffX)
  } else {
    object.x -= diffX
  }

  let diffY = object.y % GAME.grid.nodeSize;
  if(diffY > GAME.grid.nodeSize/2) {
    object.y += (GAME.grid.nodeSize - diffY)
  } else {
    object.y -= diffY
  }

  let diffWidth = object.width % GAME.grid.nodeSize;
  if(diffWidth > GAME.grid.nodeSize/2) {
    object.width += (GAME.grid.nodeSize - diffWidth)
  } else {
    object.width -= diffWidth
  }

  let diffHeight = object.height % GAME.grid.nodeSize;
  if(diffHeight > GAME.grid.nodeSize/2) {
    object.height += (GAME.grid.nodeSize - diffHeight)
  } else {
    object.height -= diffHeight
  }
}


function snapTinyObjectToGrid(object, tinySize) {
  let medium = GAME.grid.nodeSize - tinySize
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

  let diffX = object.x % GAME.grid.nodeSize
  object.x -= diffX

  if(diffX > GAME.grid.nodeSize/2) {
    diffX -= GAME.grid.nodeSize/2
  }

  let diffY = object.y % GAME.grid.nodeSize;
  object.y -= diffY

  if(diffY > GAME.grid.nodeSize/2) {
    diffY -= GAME.grid.nodeSize/2
  }

  let diffWidth = object.width % GAME.grid.nodeSize;
  if(diffWidth > GAME.grid.nodeSize/2) {
    // object.width += (GAME.grid.nodeSize - diffWidth)
  } else {
    // object.width -= diffWidth
  }

  let diffHeight = object.height % GAME.grid.nodeSize;
  if(diffHeight > GAME.grid.nodeSize/2) {
    // object.height += (GAME.grid.nodeSize - diffHeight)
  } else {
    // object.height -= diffHeight
  }

  object.width = Math.ceil(object.width/GAME.grid.nodeSize) * GAME.grid.nodeSize
  object.height = Math.ceil(object.height/GAME.grid.nodeSize) * GAME.grid.nodeSize

  if(diffY + diffHeight > GAME.grid.nodeSize) {
    object.height += GAME.grid.nodeSize
  }
  if(diffX + diffWidth > GAME.grid.nodeSize) {
    object.width += GAME.grid.nodeSize
  }

  object.gridX = object.x/GAME.grid.nodeSize
  object.gridY = object.y/GAME.grid.nodeSize
  object.gridWidth = object.width/GAME.grid.nodeSize
  object.gridHeight = object.height/GAME.grid.nodeSize
}

function createGridNodeAt(x, y) {
  let diffX = x % GAME.grid.nodeSize
  x -= diffX

  let diffY = y % GAME.grid.nodeSize
  y -= diffY

  return {
    x, y, width: GAME.grid.nodeSize, height: GAME.grid.nodeSize,
  }
}

function keepXYWithinBoundaries(object, options = { bypassGameBoundaries : false, pathfindingLimit: null }) {
  const {gridX, gridY} = convertToGridXY(object)
  return keepGridXYWithinBoundaries(gridX, gridY, options)
}

function keepGridXYWithinBoundaries(attemptingX, attemptingY, options = { bypassGameBoundaries : false, pathfindingLimit: null }) {
  if(GAME.world.gameBoundaries && GAME.world.gameBoundaries.x >= 0 && (GAME.world.gameBoundaries.behavior === 'boundaryAll' || GAME.world.gameBoundaries.behavior === 'pacmanFlip') && !options.bypassGameBoundaries) {
    const {gridX, gridY, width, height } = convertToGridXY(GAME.world.gameBoundaries)
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

  if(GAME.world.gameBoundaries && GAME.world.gameBoundaries.x >= 0 && GAME.world.gameBoundaries.behavior === 'purgatory' && !options.bypassGameBoundaries) {
    let hero = GAME.heros[HERO.id]
    if(PAGE.role.isPlayEditor) {
      hero = window.editingHero
      // single player only feature
    }
    const {gridX, gridY, width, height } = convertToGridXY(GAME.world.gameBoundaries)
    if(attemptingX > gridX + width - (((HERO.cameraWidth * hero.zoomMultiplier)/2)/GAME.grid.nodeSize) - 1) {
      return false
    } else if(attemptingX < gridX + (((HERO.cameraWidth * hero.zoomMultiplier)/2)/GAME.grid.nodeSize)) {
      return false
    } else if(attemptingY > gridY + height - (((HERO.cameraHeight * hero.zoomMultiplier)/2)/GAME.grid.nodeSize) - 1) {
      return false
    } else if(attemptingY < gridY + (((HERO.cameraHeight * hero.zoomMultiplier)/2)/GAME.grid.nodeSize)) {
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
  if(attemptingX >= (GAME.grid.startX/GAME.grid.nodeSize) && attemptingX < GAME.grid.width + GAME.grid.startX) {
    if(attemptingY >= (GAME.grid.startY/GAME.grid.nodeSize) && attemptingY < GAME.grid.height + GAME.grid.startY) {
      return true
    }
  }

  return false
}

export default {
  snapObjectToGrid,
  snapDragToGrid,
  snapTinyObjectToGrid,
  createGridNodeAt,
  generateGridNodes,
  snapXYToGrid,
  getAllDiffs,
  convertToGridXY,
  getRandomGridWithinXY,
  keepGridXYWithinBoundaries,
  keepXYWithinBoundaries,
}

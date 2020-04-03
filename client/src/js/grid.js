import collisions from './collisions'

function init() {
  window.grid = {
    width: 50,
    height: 50,
    nodeSize: 40,
    startX: 0,
    startY: 0,
  }
}

function convertToGridXY(object, options = {}) {
  // pretend we are dealing with a 0,0 plane
  let x = object.x - window.grid.nodes[0][0].x
  let y = object.y - window.grid.nodes[0][0].y

  let diffX = x % window.grid.nodeSize
  x -= diffX
  x = x/window.grid.nodeSize

  let diffY = y % window.grid.nodeSize
  y -= diffY
  y = y/window.grid.nodeSize

  let width = Math.floor(object.width / window.grid.nodeSize)
  let height = Math.floor(object.height / window.grid.nodeSize)

  return { x, y, diffX, diffY, width, height }
}

function generateGridNodes(gridProps) {
  const grid = []

  for(var i = 0; i < gridProps.width; i++) {
    grid.push([])
    for(var j = 0; j < gridProps.height; j++) {
      grid[i].push({x: gridProps.startX + (i * window.grid.nodeSize), y: gridProps.startX + (j * window.grid.nodeSize), width: window.grid.nodeSize, height: window.grid.nodeSize, gridX: i, gridY: j})
    }
  }

  return grid
}

function forEach(fx) {
  for(var i = 0; i < window.grid.width; i++) {
    for(var j = 0; j < window.grid.height; j++) {
      fx(window.grid.nodes[i][j])
    }
  }
}

function snapXYToGrid(x, y) {
  let diffX = x % window.grid.nodeSize;
  if(diffX > window.grid.nodeSize/2) {
    x += (window.grid.nodeSize - diffX)
  } else {
    x -= diffX
  }

  let diffY = y % window.grid.nodeSize;
  if(diffY > window.grid.nodeSize/2) {
    y += (window.grid.nodeSize - diffY)
  } else {
    y -= diffY
  }
  return { x, y }
}

function getRandomGridWithinXY(min, max) {
  let xyrandom = (Math.random() * (max - min)) + min
  let diff = xyrandom % window.grid.nodeSize
  return xyrandom - diff
}

function getAllDiffs({x, y, width, height}) {
  let leftDiff = x % window.grid.nodeSize
  let topDiff = y % window.grid.nodeSize
  let rightDiff = (x + width) % window.grid.nodeSize
  let bottomDiff = (y + height) % window.grid.nodeSize
  return { leftDiff, topDiff, rightDiff, bottomDiff }
}

function snapObjectToGrid(object) {
  let diffX = object.x % window.grid.nodeSize;
  if(diffX > window.grid.nodeSize/2) {
    object.x += (window.grid.nodeSize - diffX)
  } else {
    object.x -= diffX
  }

  let diffY = object.y % window.grid.nodeSize;
  if(diffY > window.grid.nodeSize/2) {
    object.y += (window.grid.nodeSize - diffY)
  } else {
    object.y -= diffY
  }

  let diffWidth = object.width % window.grid.nodeSize;
  if(diffWidth > window.grid.nodeSize/2) {
    object.width += (window.grid.nodeSize - diffWidth)
  } else {
    object.width -= diffWidth
  }

  let diffHeight = object.height % window.grid.nodeSize;
  if(diffHeight > window.grid.nodeSize/2) {
    object.height += (window.grid.nodeSize - diffHeight)
  } else {
    object.height -= diffHeight
  }
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

  let diffX = object.x % window.grid.nodeSize
  object.x -= diffX

  if(diffX > window.grid.nodeSize/2) {
    diffX -= window.grid.nodeSize/2
  }

  let diffY = object.y % window.grid.nodeSize;
  object.y -= diffY

  if(diffY > window.grid.nodeSize/2) {
    diffY -= window.grid.nodeSize/2
  }

  let diffWidth = object.width % window.grid.nodeSize;
  if(diffWidth > window.grid.nodeSize/2) {
    // object.width += (window.grid.nodeSize - diffWidth)
  } else {
    // object.width -= diffWidth
  }

  let diffHeight = object.height % window.grid.nodeSize;
  if(diffHeight > window.grid.nodeSize/2) {
    // object.height += (window.grid.nodeSize - diffHeight)
  } else {
    // object.height -= diffHeight
  }

  object.width = Math.ceil(object.width/window.grid.nodeSize) * window.grid.nodeSize
  object.height = Math.ceil(object.height/window.grid.nodeSize) * window.grid.nodeSize

  if(diffY + diffHeight > window.grid.nodeSize) {
    object.height += window.grid.nodeSize
  }
  if(diffX + diffWidth > window.grid.nodeSize) {
    object.width += window.grid.nodeSize
  }
}

window.snapAllObjectsToGrid = function() {
	window.objects.forEach((object) => {
		snapObjectToGrid(object)
	})

  snapObjectToGrid(window.hero)
  window.hero.width = window.grid.nodeSize
  window.hero.height = window.grid.nodeSize
}

function update(hero, objects) {

}

function createGridNodeAt(x, y) {
  let diffX = x % window.grid.nodeSize
  x -= diffX

  let diffY = y % window.grid.nodeSize
  y -= diffY

  return {
    x, y, width: window.grid.nodeSize, height: window.grid.nodeSize,
  }
}

function addObstacle(object) {
  if(((!object.path || !object.path.length) && object.tags.stationary && object.tags.obstacle) || window.world.globalTags.calculatePathCollisions) {
    // pretend we are dealing with a 0,0 plane
    let x = object.x - window.grid.startX
    let y = object.y - window.grid.startY

    let diffX = x % window.grid.nodeSize
    x -= diffX
    x = x/window.grid.nodeSize

    let diffY = y % window.grid.nodeSize
    y -= diffY
    y = y/window.grid.nodeSize

    let gridWidth = object.width / window.grid.nodeSize;
    let gridHeight = object.height / window.grid.nodeSize;

    for(let currentx = x; currentx < x + gridWidth; currentx++) {
      for(let currenty = y; currenty < y + gridHeight; currenty++) {
        hasObstacleUpdate(currentx, currenty, true)
      }
    }
  }
}

function hasObstacleUpdate(x, y, hasObstacle) {
  if(x >= 0 && x < window.grid.width) {
    if(y >= 0 && y < window.grid.height) {
      let gridNode = window.grid.nodes[x][y]
      gridNode.hasObstacle = hasObstacle
    }
  }
}

function removeObstacle(object) {
  if(true) {
    // pretend we are dealing with a 0,0 plane
    let x = object.x - window.grid.startX
    let y = object.y - window.grid.startY

    let diffX = x % window.grid.nodeSize
    x -= diffX
    x = x/window.grid.nodeSize

    let diffY = y % window.grid.nodeSize
    y -= diffY
    y = y/window.grid.nodeSize

    let gridWidth = object.width / window.grid.nodeSize;
    let gridHeight = object.height / window.grid.nodeSize;

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

  window.objects.forEach((obj) => {
    if(obj.tags && obj.tags.obstacle) {
      addObstacle(obj)
    }
  })
}

function keepXYWithinBoundaries(object, options = { bypassGameBoundaries : false, pathfindingLimit: null }) {
  const {x, y} = convertToGridXY(object)
  console.log()
  return keepGridXYWithinBoundaries(x, y, options)
}

function keepGridXYWithinBoundaries(attemptingX, attemptingY, options = { bypassGameBoundaries : false, pathfindingLimit: null }) {
  if(window.world.gameBoundaries.x >= 0 && window.world.gameBoundaries.behavior === 'boundaryAll' && !options.bypassGameBoundaries) {
    const {x, y, width, height } = convertToGridXY(window.world.gameBoundaries)
    if(attemptingX > x + width - 1) {
      return false
    } else if(attemptingX < x) {
      return false
    } else if(attemptingY > y + height - 1) {
      return false
    } else if(attemptingY < y) {
      return false
    }
  }

  if(window.world.gameBoundaries.x >= 0 && window.world.gameBoundaries.behavior === 'purgatory' && !options.bypassGameBoundaries) {
    const {x, y, width, height } = convertToGridXY(window.world.gameBoundaries)
    if(attemptingX > x + width - (window.CONSTANTS.PLAYER_CAMERA_WIDTH)/window.grid.nodeSize) {
      return false
    } else if(attemptingX < x - 1 + (window.CONSTANTS.PLAYER_CAMERA_WIDTH)/window.grid.nodeSize) {
      return false
    } else if(attemptingY > y + height - (window.CONSTANTS.PLAYER_CAMERA_HEIGHT)/window.grid.nodeSize) {
      return false
    } else if(attemptingY < y - 1 + (window.CONSTANTS.PLAYER_CAMERA_HEIGHT)/window.grid.nodeSize) {
      return false
    }
  }

  const pathfindingLimit = options.pathfindingLimit
  if(pathfindingLimit){
    if(attemptingX > pathfindingLimit.x + pathfindingLimit.width - 1) {
      return false
    } else if(attemptingX < pathfindingLimit.x - 1) {
      return false
    } else if(attemptingY > pathfindingLimit.y + pathfindingLimit.height - 1) {
      return false
    } else if(attemptingY < pathfindingLimit.y - 1) {
      return false
    }
  }

  //prevents someone from trying to path find off the grid.... BREAKS CODE
  if(attemptingX >= (window.grid.startX/window.grid.nodeSize) && attemptingX < window.grid.width + window.grid.startX) {
    if(attemptingY >= (window.grid.startY/window.grid.nodeSize) && attemptingY < window.grid.height + window.grid.startY) {
      return true
    }
  }

  return false
}

export default {
  init,
  forEach,
  update,
  snapObjectToGrid,
  snapDragToGrid,
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

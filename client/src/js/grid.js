import collisions from './collisions'

function init() {
  window.gridNodeSize = 40
}

function convertToGridXY(object, options = {}) {
  // pretend we are dealing with a 0,0 plane
  let x = object.x - window.grid[0][0].x
  let y = object.y - window.grid[0][0].y

  if(options.strict) {
    let diffX = x % window.gridNodeSize;
    x -= diffX
    x = x/window.gridNodeSize
    if(diffX < 2) {
    } else if (diffX > 38) {
      x+=1
    }

    let diffY = y % window.gridNodeSize;
    y -= diffY
    y = y/window.gridNodeSize

    if(diffY < 2) {
    } else if (diffY > 38) {
      y+=1
    }

    return { x, y, diffX, diffY }
  }
  //
  // let diffX = x % window.gridNodeSize;
  // if(diffX > window.gridNodeSize/2) {
  //   x += (window.gridNodeSize - diffX)
  // } else {
  //   x -= diffX
  // }
  // x = x/window.gridNodeSize
  //
  // let diffY = y % window.gridNodeSize;
  // console.log('diffY', diffY)
  // if(diffY > window.gridNodeSize/2) {
  //   y += (window.gridNodeSize - diffY)
  // } else {
  //   y -= diffY
  // }
  // y = y/window.gridNodeSize
  //
  // return { x, y, diffX, diffY }

  let diffX = x % window.gridNodeSize
  x -= diffX
  x = x/window.gridNodeSize


  let diffY = y % window.gridNodeSize
  y -= diffY
  y = y/window.gridNodeSize

  return { x, y, diffX, diffY }
}

function createGrid(gridSize, gridNodeSize = 40, start = { x: 0, y: 0 }) {
  const grid = []

  for(var i = 0; i < gridSize.x; i++) {
    grid.push([])
    for(var j = 0; j < gridSize.y; j++) {
      grid[i].push({x: start.x + (i * gridNodeSize), y: start.y + (j * gridNodeSize), width: gridNodeSize, height: gridNodeSize, gridX: i, gridY: j})
    }
  }

  return grid
}

function forEach(fx) {
  for(var i = 0; i < window.gridSize.x; i++) {
    for(var j = 0; j < window.gridSize.y; j++) {
      fx(window.grid[i][j])
    }
  }
}

function snapXYToGrid(x, y) {
  let diffX = x % window.gridNodeSize;
  if(diffX > window.gridNodeSize/2) {
    x += (window.gridNodeSize - diffX)
  } else {
    x -= diffX
  }

  let diffY = y % window.gridNodeSize;
  if(diffY > window.gridNodeSize/2) {
    y += (window.gridNodeSize - diffY)
  } else {
    y -= diffY
  }
  return { x, y }
}

function snapObjectToGrid(object) {
  let diffX = object.x % window.gridNodeSize;
  if(diffX > window.gridNodeSize/2) {
    object.x += (window.gridNodeSize - diffX)
  } else {
    object.x -= diffX
  }

  let diffY = object.y % window.gridNodeSize;
  if(diffY > window.gridNodeSize/2) {
    object.y += (window.gridNodeSize - diffY)
  } else {
    object.y -= diffY
  }

  let diffWidth = object.width % window.gridNodeSize;
  if(diffWidth > window.gridNodeSize/2) {
    object.width += (window.gridNodeSize - diffWidth)
  } else {
    object.width -= diffWidth
  }

  let diffHeight = object.height % window.gridNodeSize;
  if(diffHeight > window.gridNodeSize/2) {
    object.height += (window.gridNodeSize - diffHeight)
  } else {
    object.height -= diffHeight
  }
}

window.snapAllObjectsToGrid = function() {
	window.objects.forEach((object) => {
		snapObjectToGrid(object)
	})

  snapObjectToGrid(window.hero)
  window.hero.width = window.gridNodeSize
  window.hero.height = window.gridNodeSize
}

function update(hero, objects) {

}

function createGridNodeAt(x, y) {
  let diffX = x % window.gridNodeSize
  x -= diffX

  let diffY = y % window.gridNodeSize
  y -= diffY

  return {
    x, y, width: window.gridNodeSize, height: window.gridNodeSize,
  }

}

function addObstacle(object, options = {}) {
  if(object.path && object.path.length) {
    let x = object.path[0].x
    let y = object.path[0].y
    if(!options.silently){
      window.socket.emit('updateGridNode', {x, y}, {hasObstacle: true})
    }
    grid[x][y].hasObstacle = true
    return
  } else if(object.tags.stationary) {
    // pretend we are dealing with a 0,0 plane
    let x = object.x - grid[0][0].x
    let y = object.y - grid[0][0].y

    let diffX = x % window.gridNodeSize
    x -= diffX
    x = x/window.gridNodeSize

    let diffY = y % window.gridNodeSize
    y -= diffY
    y = y/window.gridNodeSize

    if(x >= 0 && x < window.gridSize.x) {
      if(y >= 0 && y < window.gridSize.y) {
        let gridNode = grid[x][y]
        if(!options.silently){
          window.socket.emit('updateGridNode', {x, y}, {hasObstacle: true})
        }
        grid[x][y].hasObstacle = true
        return {gridX: x, gridY: y}
      }
    }
  }
}

function removeObstacle(object) {
  if(object.path && object.path.length) {
    let x = object.path[0].x
    let y = object.path[0].y
    window.socket.emit('updateGridNode', {x, y}, {hasObstacle: false})
    grid[x][y].hasObstacle = false
    return
  } else if(object.tags.stationary) {
    // pretend we are dealing with a 0,0 plane
    let x = object.x - grid[0][0].x
    let y = object.y - grid[0][0].y

    let diffX = x % window.gridNodeSize
    x -= diffX
    x = x/window.gridNodeSize

    let diffY = y % window.gridNodeSize
    y -= diffY
    y = y/window.gridNodeSize

    if(x >= 0 && x < window.gridSize.x) {
      if(y >= 0 && y < window.gridSize.y) {
        let gridNode = grid[x][y]
        window.socket.emit('updateGridNode', {x, y}, {hasObstacle: false})
        grid[x][y].hasObstacle = false
        return {gridX: x, gridY: y}
      }
    }
  }
}

function updateGridObstacles(options = {}) {
  forEach((gridNode) => {
    gridNode.hasObstacle = false
  })

  window.objects.forEach((obj) => {
    if(obj.tags && obj.tags.obstacle) {
      addObstacle(obj, {silently: true})
    }
  })

  if(!options.silently) {
    window.socket.emit('updateGrid', grid)
  }
}

function generatePathfindingGrid() {

}

export default {
  init,
  forEach,
  update,
  snapObjectToGrid,
  createGridNodeAt,
  createGrid,
  generatePathfindingGrid,
  snapXYToGrid,
  updateGridObstacles,
  addObstacle,
  removeObstacle,
  convertToGridXY,
}

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

  // if(options.strict) {
  //   let diffX = x % window.grid.nodeSize;
  //   x -= diffX
  //   x = x/window.grid.nodeSize
  //   if(diffX < 2) {
  //   } else if (diffX > 38) {
  //     x+=1
  //   }
  //
  //   let diffY = y % window.grid.nodeSize;
  //   y -= diffY
  //   y = y/window.grid.nodeSize
  //
  //   if(diffY < 2) {
  //   } else if (diffY > 38) {
  //     y+=1
  //   }
  //
  //   return { x, y, diffX, diffY }
  // }
  //
  // let diffX = x % window.grid.nodeSize;
  // if(diffX > window.grid.nodeSize/2) {
  //   x += (window.grid.nodeSize - diffX)
  // } else {
  //   x -= diffX
  // }
  // x = x/window.grid.nodeSize
  //
  // let diffY = y % window.grid.nodeSize;
  // console.log('diffY', diffY)
  // if(diffY > window.grid.nodeSize/2) {
  //   y += (window.grid.nodeSize - diffY)
  // } else {
  //   y -= diffY
  // }
  // y = y/window.grid.nodeSize
  //
  // return { x, y, diffX, diffY }

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

function addObstacle(object, options = {}) {
  // if(object.path && object.path.length) {
  //   //if pathfinding objects cant path through eachother
  //   // let x = object.path[0].x
  //   // let y = object.path[0].y
  //   // if(!options.silently){
  //   //   window.socket.emit('updateGridNode', {x, y}, {hasObstacle: true})
  //   // }
  //   // grid[x][y].hasObstacle = true
  //   // return
  // } else if(true) {
    snapObjectToGrid(object)

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
        emitObstacleUpdate(currentx, currenty, true, options.silently)
      }
    }
  // }
}

function emitObstacleUpdate(x, y, hasObstacle, silently) {
  if(x >= 0 && x < window.grid.width) {
    if(y >= 0 && y < window.grid.height) {
      let gridNode = window.grid.nodes[x][y]
      // if(!silently){
      //   console.log('emitting')
      //   window.socket.emit('updateGrid', window.grid)
      // }
      gridNode.hasObstacle = hasObstacle
      // window.pfgrid.setWalkableAt(x, y, !gridNode.hasObstacle);
      return {gridX: x, gridY: y}
    }
  }
}

function removeObstacle(object) {
  if(object.path && object.path.length) {
    // let x = object.path[0].x
    // let y = object.path[0].y
    // window.socket.emit('updateGridNode', {x, y}, {hasObstacle: false})
    // grid[x][y].hasObstacle = false
    // return
  } else {
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
        console.log(currentx, currenty)
        emitObstacleUpdate(currentx, currenty, false)
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

  // if(!options.silently) {
  //   window.socket.emit('updateGrid', grid)
  // }
}

export default {
  init,
  forEach,
  update,
  snapObjectToGrid,
  createGridNodeAt,
  generateGridNodes,
  snapXYToGrid,
  updateGridObstacles,
  addObstacle,
  removeObstacle,
  convertToGridXY,
}

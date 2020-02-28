import collisions from './collisions'

function init() {
  // const gridSize = {x: 100, y: 50}
  window.gridNodeSize = 100/window.divideScreenSizeBy

  window.socket.emit('askGrid');
  window.socket.on('onUpdateGrid', (grid, gridNodeSize, gridSize) => {
    window.grid = grid
    window.gridSize = gridSize
    window.gridNodeSize = gridNodeSize
  })
}

function createGrid(gridSize, gridNodeSize = 100/window.divideScreenSizeBy, start = { x: 0, y: 0 }) {
  const grid = []

  for(var i = 0; i < gridSize.x; i++) {
    grid.push([])
    for(var j = 0; j < gridSize.y; j++) {
      grid[i].push({x: start.x + (i * gridNodeSize), y: start.y + (j * gridNodeSize), width: gridNodeSize, height: gridNodeSize})
    }
  }

  return grid
}

function forEach(fx) {
  for(var i = 0; i < window.gridSize.x; i++) {
    for(var j = 0; j < window.gridSize.y; j++) {
      fx(grid[i][j])
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
}

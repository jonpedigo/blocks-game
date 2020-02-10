import collisions from './collisions'

function init() {
  window.grid = []
  window.grid.gridSize = 50
  window.grid.gridNodeSize = 100/window.divideScreenSizeBy

  for(var i = 0; i < window.grid.gridSize; i++) {
    window.grid.push([])
    for(var j = 0; j < window.grid.gridSize; j++) {
      window.grid[i].push({x: i * window.grid.gridNodeSize, y: j * window.grid.gridNodeSize, width: window.grid.gridNodeSize, height: window.grid.gridNodeSize})
    }
  }
}

function forEach(fx) {
  for(var i = 0; i < grid.gridSize; i++) {
    for(var j = 0; j < grid.gridSize; j++) {
      fx(grid[i][j])
    }
  }
}

function snapObjectToGrid(object) {
  let diffX = object.x % grid.gridNodeSize;
  if(diffX > grid.gridNodeSize/2) {
    object.x += (grid.gridNodeSize - diffX)
  } else {
    object.x -= diffX
  }

  let diffY = object.y % grid.gridNodeSize;
  if(diffY > grid.gridNodeSize/2) {
    object.y += (grid.gridNodeSize - diffY)
  } else {
    object.y -= diffY
  }

  let diffWidth = object.width % grid.gridNodeSize;
  if(diffWidth > grid.gridNodeSize/2) {
    object.width += (grid.gridNodeSize - diffWidth)
  } else {
    object.width -= diffWidth
  }

  let diffHeight = object.height % grid.gridNodeSize;
  if(diffHeight > grid.gridNodeSize/2) {
    object.height += (grid.gridNodeSize - diffHeight)
  } else {
    object.height -= diffHeight
  }
}

window.snapAllObjectsToGrid = function() {
	window.objects.forEach((object) => {
		snapObjectToGrid(object)
	})

  snapObjectToGrid(window.hero)
  window.hero.width = grid.gridNodeSize
  window.hero.height = grid.gridNodeSize
}

function update(hero, objects) {

}

function createGridNodeAt(x, y) {
  let diffX = x % grid.gridNodeSize
  x -= diffX

  let diffY = y % grid.gridNodeSize
  y -= diffY

  return {
    x, y, width: grid.gridNodeSize, height: grid.gridNodeSize,
  }

}



export default {
  init,
  forEach,
  update,
  snapObjectToGrid,
  createGridNodeAt,
}

function init() {
  window.defaultObject = {
    velocityX: 0,
    velocityY: 0,
    velocityMax: 100,
    speed: 100,
    color: 'white',
    // cant put objects in it cuz of some pass by reference BS...
  }
}

window.anticipateObjectAdd = function() {
  const { minX, maxX, minY, maxY, centerY, centerX, leftDiff, rightDiff, topDiff, bottomDiff, cameraHeight, cameraWidth } = window.getViewBoundaries(window.hero)

  let isWall = window.anticipatedObject.wall

  if (leftDiff < 1 && window.hero.directions.left) {
    let newObject = {
      x: minX - window.grid.nodeSize,
      y: isWall ? minY + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minY, maxY),
      width: window.grid.nodeSize,
      height: isWall ? (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * 2) - (window.grid.nodeSize * 3) : window.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  } else if (topDiff < 1 && window.hero.directions.up) {
    let newObject = {
      x: isWall ? minX + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minX, maxX),
      y: minY - window.grid.nodeSize,
      width: isWall ? (window.CONSTANTS.PLAYER_CAMERA_WIDTH * 2) - (window.grid.nodeSize * 4) : window.grid.nodeSize,
      height: window.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  } else if (rightDiff > window.grid.nodeSize - 1 && window.hero.directions.right) {
    let newObject = {
      x: maxX + window.grid.nodeSize,
      y: isWall ? minY + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minY, maxY),
      width: window.grid.nodeSize,
      height: isWall ? (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * 2) - (window.grid.nodeSize * 4) : window.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  } else if (bottomDiff > window.grid.nodeSize - 1 && window.hero.directions.down) {
    let newObject = {
      x: isWall ? minX + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minX, maxX),
      y: maxY + window.grid.nodeSize,
      width: isWall ? (window.CONSTANTS.PLAYER_CAMERA_WIDTH * 2) - (window.grid.nodeSize * 4) : window.grid.nodeSize,
      height: window.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  }

  function addAnticipatedObject(newObject) {
    let {x , y} = grid.snapXYToGrid(newObject.x, newObject.y)
    if(grid.keepGridXYWithinBoundaries(x/window.grid.nodeSize, y/window.grid.nodeSize)) {
      window.addObjects([{...newObject, ...window.anticipatedObject}])
      window.anticipatedObject = null
    }
  }
}

export default {
  init
}

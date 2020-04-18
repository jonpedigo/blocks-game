import physics from './physics.js'
import pathfinding from './pathfinding.js'
import collisions from './collisions'
import grid from './grid.js'

function init() {
  window.defaultObject = {
    velocityX: 0,
    velocityY: 0,
    velocityMax: 100,
    speed: 100,
    color: '#999',
    // cant put objects in it cuz of some pass by reference BS...
  }
  window.defaultObjects = []
}

function loaded() {
  window.defaultObject.tags = JSON.parse(JSON.stringify(window.tags))
}

window.anticipateObjectAdd = function(hero) {
  const { minX, maxX, minY, maxY, centerY, centerX, leftDiff, rightDiff, topDiff, bottomDiff, cameraHeight, cameraWidth } = window.getViewBoundaries(hero)

  let isWall = window.anticipatedObject.wall

  if (leftDiff < 1 && hero.directions.left) {
    let newObject = {
      x: minX - w.game.grid.nodeSize,
      y: isWall ? minY + ( w.game.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minY, maxY),
      width: w.game.grid.nodeSize,
      height: isWall ? (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * 2) - (w.game.grid.nodeSize * 3) : w.game.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  } else if (topDiff < 1 && hero.directions.up) {
    let newObject = {
      x: isWall ? minX + ( w.game.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minX, maxX),
      y: minY - w.game.grid.nodeSize,
      width: isWall ? (window.CONSTANTS.PLAYER_CAMERA_WIDTH * 2) - (w.game.grid.nodeSize * 4) : w.game.grid.nodeSize,
      height: w.game.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  } else if (rightDiff > w.game.grid.nodeSize - 1 && hero.directions.right) {
    let newObject = {
      x: maxX + w.game.grid.nodeSize,
      y: isWall ? minY + ( w.game.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minY, maxY),
      width: w.game.grid.nodeSize,
      height: isWall ? (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * 2) - (w.game.grid.nodeSize * 4) : w.game.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  } else if (bottomDiff > w.game.grid.nodeSize - 1 && hero.directions.down) {
    let newObject = {
      x: isWall ? minX + ( w.game.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minX, maxX),
      y: maxY + w.game.grid.nodeSize,
      width: isWall ? (window.CONSTANTS.PLAYER_CAMERA_WIDTH * 2) - (w.game.grid.nodeSize * 4) : w.game.grid.nodeSize,
      height: w.game.grid.nodeSize,
    }
    addAnticipatedObject(newObject)
  }

  function addAnticipatedObject(newObject) {
    let {x , y} = grid.snapXYToGrid(newObject.x, newObject.y)
    if(grid.keepGridXYWithinBoundaries(x/w.game.grid.nodeSize, y/w.game.grid.nodeSize) && grid.keepGridXYWithinBoundaries((x + newObject.width)/w.game.grid.nodeSize, (y + newObject.height)/w.game.grid.nodeSize)) {
      window.addObjects([{...newObject, ...window.anticipatedObject}])
      window.anticipatedObject = null
    }
  }
}

window.addObjects = function(objects, options = { bypassCollisions: false }) {
  if(!objects.length) {
    objects = [objects]
  }

  let alertAboutCollision

  objects = objects.map((newObject, i) => {
    newObject = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultObject)), newObject)

    if(!newObject.id){
      newObject.id = 'object' + Date.now() + '-' + i;
    }

    if(w.game.objectsById[newObject.id]) {
      newObject.id += '-copy'
    }

    if(newObject.compendiumId) {
      newObject.fromCompendiumId = newObject.compendiumId
      delete newObject.compendiumId
    }

    newObject.spawnPointX = newObject.x
    newObject.spawnPointY = newObject.y

    if(!w.game.world.globalTags.calculatePathCollisions) {
      grid.addObstacle(newObject)
    }

    if(newObject.tags.obstacle && collisions.check(newObject, w.game.objects) && !options.bypassCollisions) {
      alertAboutCollision = true
    }

    //ALWAYS CONTAIN WITHIN BOUNDARIES OF THE GRID!!
    if(newObject.x + newObject.width > (w.game.grid.nodeSize * w.game.grid.width) + w.game.grid.startX) {
      if(window.usePlayEditor) alert('adding obj outside grid system, canceled')
      return null
    }
    if(newObject.y + newObject.height > (w.game.grid.nodeSize * w.game.grid.height) + w.game.grid.startY) {
      if(window.usePlayEditor) alert('adding obj outside grid system, canceled')
      return null
    }
    if(newObject.x < w.game.grid.startX) {
      if(window.usePlayEditor) alert('adding obj outside grid system, canceled')
      return null
    }
    if(newObject.y < w.game.grid.startY) {
      if(window.usePlayEditor) alert('adding obj outside grid system, canceled')
      return null
    }

    return newObject
  }).filter(obj => !!obj)

  if(window.usePlayEditor && alertAboutCollision) {
    if(confirm('already an object on this grid node..confirm to add anyways')) {
      emitNewObjects()
    }
  } else {
    emitNewObjects()
  }

  function emitNewObjects() {
    if(window.branch) {
      window.branch.objects.push(...objects)
    } else {
      window.socket.emit('addObjects', objects)
    }
  }

  return objects
}

function removeObjectState(object) {
  delete object.x
  delete object.y
  delete object._initialY
  delete object._initialX
  delete object.velocityY
  delete object.velocityX
  delete object.spawnedIds
  delete object.spawnWait
  delete object.target
  delete object.path
  delete object.removed
  delete object.lastPowerUpId
  delete object.direction
  delete object.gridX
  delete object.gridY
  delete object.spawnPool
}
window.removeObjectState = removeObjectState


window.respawnObject = function(object) {
  object.x = object.spawnPointX
  object.y = object.spawnPointY
}

export default {
  init,
  loaded,
}

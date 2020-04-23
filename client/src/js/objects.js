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

window.addObjects = function(objects, options = { bypassCollisions: false, fromLiveGame: false }, game) {
  if(!objects.length) {
    objects = [objects]
  }

  let alertAboutCollision

  objects = objects.map((newObject, i) => {
    newObject = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultObject)), newObject)

    if(!newObject.id){
      newObject.id = 'object-' + window.uniqueID() + '-' + i;
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

  if(window.usePlayEditor && !options.fromLiveGame) {
    if(alertAboutCollision) {
      if(!confirm('already an object on this grid node..confirm to add anyways')) return
    }

    let warnings = ""
    let sampleObject = objects[0]
    if(!sampleObject.tags.obstacle) {
      warnings+= 'NOT obstacle\n\n'
    }
    if(!sampleObject.tags.stationary) {
      warnings+= 'NOT stationary - does NOT effect pathfinding\n\n'
    }

    warnings+= "TAGS:\n"
    Object.keys(sampleObject.tags).forEach((tagName) => {
      if(sampleObject.tags[tagName] === true) {
        warnings+= tagName+'\n'
      }
    })
    if(sampleObject.velocityX || sampleObject.velocityY) {
      warnings += 'has VELOCITY\n'
    }
    if(sampleObject.heroUpdate) {
      warnings += 'has HERO UPDATE\n'
    }
    if(sampleObject.objectUpdate) {
      warnings += 'has OBJECT UPDATE\n'
    }

    if(confirm(warnings)) {
      emitNewObjects()
    }
  } else {
    emitNewObjects()
  }

  function emitNewObjects() {
    if(window.editingGame && window.editingGame.branch && !options.fromLiveGame) {
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
  delete object._deltaY
  delete object._deltaX
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
  delete object._parentId
  delete object._skipNextGravity
  delete object._lerpX
  delete object._lerpY
  delete object.fresh
}
window.removeObjectState = removeObjectState


window.respawnObject = function(object) {
  object.x = object.spawnPointX
  object.y = object.spawnPointY
}

window.openNameObjectModal = function(object, cb) {
  Swal.fire({
    title: 'Name object',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    // html:'<canvas id="swal-canvas" width="200" height="200"></canvas>',
    html:"<input type='radio' name='name-where' checked id='center-name'>Center name within object</input><br><input type='radio' name='name-where' id='name-above'>Display name above object</input>",
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
    preConfirm: (result) => {
      return [
        result,
        document.getElementById('center-name').checked,
        document.getElementById('name-above').checked,
      ]
    }
  }).then(cb)
}

window.openWriteChatModal = function(object, cb) {
  Swal.fire({
    title: 'What does this object say?',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    // html:'<canvas id="swal-canvas" width="200" height="200"></canvas>',
    // html:"<input type='radio' name='name-where' checked id='center-name'>Center name within object</input><br><input type='radio' name='name-where' id='name-above'>Display name above object</input>",
    input: 'textarea',
    inputAttributes: {
      autocapitalize: 'off'
    },
  }).then(cb)
}

export default {
  init,
  loaded,
}

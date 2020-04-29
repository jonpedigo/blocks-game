import pathfinding from './pathfinding.js'
import collision from '../collisions'
import gridTool from '../grid.js'

function init(){

}

function moveTowardsTarget(object, target, delta, options = { flat: false}) {
  let oldX = object.x
  let oldY = object.y

  if(object.x > target.x) {
    if(options.flat) object.velocityX = -object.speed || -100
    else {
      object.velocityX -= (object.speed || 100) * delta
    }
  }
  if(object.x < target.x) {
    if(options.flat) object.velocityX = object.speed || 100
    else object.velocityX += (object.speed || 100) * delta
  }
  let newX = object.x + object.velocityX * delta

  if(object.y > target.y) {
    if(options.flat) object.velocityY = -object.speed || -100
    else object.velocityY -= (object.speed || 100) * delta
  }
  if(object.y < target.y) {
    if(options.flat) object.velocityY = object.speed || 100
    else object.velocityY += (object.speed || 100) * delta
  }
  let newY = object.y + object.velocityY * delta

  if(target.x < oldX && target.x > newX || target.x > oldX && target.x < newX) {
    object.x = target.x
    object.velocityX = 0
  }
  if(target.y < oldY && target.y > newY || target.y > oldY && target.y < newY) {
    object.y = target.y
    object.velocityY = 0
  }
}

function moveOnPath(object, delta) {
  let pathX = (object.path[0].x * GAME.grid.nodeSize) + GAME.grid.startX
  let pathY = (object.path[0].y * GAME.grid.nodeSize) + GAME.grid.startY

  let pathSpeedX = object.speed || -100
  let pathSpeedY = object.speed || -100

  moveTowardsTarget(object, {x: pathX, y: pathY }, delta, { flat: true })
  let diffX = Math.abs(object.x - pathX)
  let diffY = Math.abs(object.y - pathY)

  const { gridX, gridY, x, y } = gridTool.convertToGridXY(object)
  object.gridX = gridX
  object.gridY = gridY

  if(object.gridX == object.path[0].x && diffX <= 2) {
    object.x = pathX
    object.velocityX = 0
  }

  if(object.gridY == object.path[0].y && diffY <= 2) {
    object.y = pathY
    object.velocityY = 0
  }

  if(object.gridY == object.path[0].y && object.gridX == object.path[0].x && diffX <= 2 && diffY <= 2) {
    object.velocityX = 0
    object.velocityY = 0
    object.path.shift();
    return
  }
}

function update(objects, delta) {
  objects.forEach((object) => {
    if(object.removed) return
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //MOVEMENT
    //////////////////////////////////////////
    //////////////////////////////////////////
    if(object.path && object.path.length) {
      if(window.resetPaths) {
        object.path = []
        object.velocityX = 0
        object.velocityY = 0
      } else moveOnPath(object, delta)
    } else if(object.target) {
      moveTowardsTarget(object, object.target, delta)
    }

    let hero = GAME.heroList[0]

    if(object.tags && object.tags['zombie']) {
      object.target = { x: hero.x, y: hero.y }
    }

    if(object.tags && object.tags['homing']) {
      if(!object.path || (object.path && !object.path.length)) {
        const { gridX, gridY } = gridTool.convertToGridXY(object)
        object.gridX = gridX
        object.gridY = gridY

        const heroGridPos = gridTool.convertToGridXY(hero)
        hero.gridX = heroGridPos.gridX
        hero.gridY = heroGridPos.gridY

        object.path = pathfinding.findPath({
          x: gridX,
          y: gridY,
        }, {
          x: hero.gridX,
          y: hero.gridY,
        }, { pathfindingLimit: object.pathfindingLimit })
      }
    }

    if(object.tags && object.tags['wander']) {
      if(!object.path || (object.path && !object.path.length)) {
        object.path = [pathfinding.walkAround(object)]
        const { gridX, gridY } = gridTool.convertToGridXY(object)
        object.gridX = gridX
        object.gridY = gridY
      }
    }

    if(object.tags && object.tags['pacer']) {
      if(!object.path || (object.path && !object.path.length)) {
        object.path = [pathfinding.walkWithPurpose(object)]
        const { gridX, gridY } = gridTool.convertToGridXY(object)
        object.gridX = gridX
        object.gridY = gridY
      }
    }

    if(object.tags && object.tags['spelunker']) {
      if(!object.path || (object.path && !object.path.length)) {
        object.path = [pathfinding.exploreCave(object)]
        const { gridX, gridY } = gridTool.convertToGridXY(object)
        object.gridX = gridX
        object.gridY = gridY
      }
    }

    if(object.tags && object.tags['lemmings']) {
      if(!object.path || (object.path && !object.path.length)) {
        object.path = [pathfinding.walkIntoWall(object)]
        const { gridX, gridY } = gridTool.convertToGridXY(object)
        object.gridX = gridX
        object.gridY = gridY
      }
    }

    if(object.tags && object.tags['goomba']) {
      if(object.velocityMax === 0) object.velocityMax = 100

      if(!object.direction) {
        object.direction = 'right'
      }

      if(object.direction === 'right' ) {
        object.velocityX = object.speed || 100
      }

      if(object.direction === 'left') {
        object.velocityX = -object.speed || -100
      }
    }

    if(object.tags && object.tags['goombaSideways']) {
      if(object.velocityMax === 0) object.velocityMax = 100

      if(!object.direction) {
        object.direction = 'down'
      }

      if(object.direction === 'down' ) {
        object.velocityY = object.speed || 100
      }

      if(object.direction === 'up') {
        object.velocityY = -object.speed || -100
      }
    }

    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    //////////////////////////////////////////
    // ZONE STUFF
    //////////////////////////////////////////
    //////////////////////////////////////////
    if(object.tags && object.tags['spawnZone']) {
      if(!object.spawnedIds) object.spawnedIds = []

      object.spawnedIds = object.spawnedIds.filter((id) => {
        if(GAME.objectsById[id] && !GAME.objectsById[id].removed) {
          return true
        } else return false
      })

      if(object.initialSpawnPool && (object.spawnPool === undefined || object.spawnPool === null)) {
        object.spawnPool = object.initialSpawnPool
      }

      if(object.spawnedIds.length < object.spawnTotal && !object.spawnWait && (object.spawnPool === undefined || object.spawnPool === null || object.spawnPool > 0)) {
        let newObject = {
          x: object.x,
          y: object.y,
          width: object.width,
          height: object.height,
          id: 'spawned-' + window.uniqueID(),
          ...object.spawnObject,
          spawned: true,
        }
        // let x = gridTool.getRandomGridWithinXY(object.x, object.x+width)
        // let y = gridTool.getRandomGridWithinXY(object.y, object.y+height)

        let createdObject = window.addObjects([newObject], { fromLiveGame: true })
        object.spawnedIds.push(createdObject[0].id)
        if(object.spawnPool) object.spawnPool--

        object.spawnWait = true
        setTimeout(() => {
          object.spawnWait = false
        }, object.spawnWaitTime || 1000)
      }
    }

    /// DEFAULT GAME FX
    if(window.defaultCustomGame) {
      window.defaultCustomGame.intelligence(object, delta)
    }

    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.intelligence(object, delta)
    }

    /// LIVE CUSTOM GAME FX
    if(window.liveCustomGame) {
      window.liveCustomGame.intelligence(object, delta)
    }
  })
}

export default {
  init,
  update,
}

import pathfinding from './pathfinding.js'
import collision from './collisions'
import gridTool from './grid.js'

function init(){

}

function moveTowardsTarget(object, delta) {
  if(object.x > object.target.x) {
    object.velocityX -= (object.speed || 100) * delta
  } else if(object.x < object.target.x) {
    object.velocityX += (object.speed || 100) * delta
  } else {
    object.velocityX = 0
  }

  if(object.y > object.target.y) {
    object.velocityY -= (object.speed || 100) * delta
  } else if(object.y < object.target.y) {
    object.velocityY += (object.speed || 100) * delta
  } else {
    object.velocityY = 0
  }
}

function moveOnPath(object) {
  const { x, y, diffX, diffY } = gridTool.convertToGridXY(object)
  object.gridX = x
  object.gridY = y

  if(object.gridY == object.path[0].y && object.gridX == object.path[0].x && diffX <= 2 && diffY <= 2) {
    object.velocityX = 0
    object.velocityY = 0
    object.path.shift();
    return
  }

  let pathX = (object.path[0].x * window.grid.nodeSize) + window.grid.nodes[0][0].x
  let pathY = (object.path[0].y * window.grid.nodeSize) + window.grid.nodes[0][0].y
  if(object.gridX == object.path[0].x && diffX <= 2) {
    object.velocityX = 0
  } else if(object.x > pathX) {
    object.velocityX = -object.speed || -100
  } else if(object.x < pathX) {
    object.velocityX = object.speed || 100
  }

  if(object.gridY == object.path[0].y && diffY <= 2) {
    object.velocityY = 0
  } else if(object.y > pathY) {
    object.velocityY = -object.speed || -100
  } else if(object.y < pathY) {
    object.velocityY = object.speed || 100
  }
}

function update(hero, objects, delta) {
  objects.forEach((object) => {
    if(object.removed) return

    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.intelligence(delta, object)
    }

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
      } else moveOnPath(object)
    } else if(object.target) {
      moveTowardsTarget(object, delta)
    }

    if(object.tags && object.tags['zombie']) {
      object.target = { x: window.hero.x, y: window.hero.y }
    }

    if(object.tags && object.tags['homing']) {
      if(!object.path || (object.path && !object.path.length)) {
        const { x, y } = gridTool.convertToGridXY(object)
        object.gridX = x
        object.gridY = y

        const heroGridPos = gridTool.convertToGridXY(window.hero)
        window.hero.gridX = heroGridPos.x
        window.hero.gridY = heroGridPos.y

        object.path = pathfinding.findPath({
          x: x,
          y: y,
        }, {
          x: window.hero.gridX,
          y: window.hero.gridY,
        }, object.pathfindingLimit)
      }
    }

    if(object.tags && object.tags['wander']) {
      if(!object.path || (object.path && !object.path.length)) {
        object.path = [pathfinding.walkAround(object)]
        const { x, y } = gridTool.convertToGridXY(object)
        object.gridX = x
        object.gridY = y
      }
    }

    if(object.tags && object.tags['pacer']) {
      if(!object.path || (object.path && !object.path.length)) {
        object.path = [pathfinding.walkWithPurpose(object)]
        const { x, y } = gridTool.convertToGridXY(object)
        object.gridX = x
        object.gridY = y
      }
    }

    if(object.tags && object.tags['lemmings']) {
      if(!object.path || (object.path && !object.path.length)) {
        object.path = [pathfinding.walkIntoWall(object)]
        const { x, y } = gridTool.convertToGridXY(object)
        object.gridX = x
        object.gridY = y
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

    if(object.tags && object.tags['stationary']) {
      object.velocityY = 0
      object.velocityX = 0
      object.accY = 0
      object.accX = 0
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
        if(window.objectsById[id] && !window.objectsById[id].removed) {
          return true
        } else return false
      })

      if(object.spawnedIds.length < object.spawnTotal && !object.spawnWait && (object.spawnPool === undefined || object.spawnPool === null || object.spawnPool > 0)) {
        let newObject = {
          x: object.x,
          y: object.y,
          width: object.width,
          height: object.height,
          ...object.spawnObject,
        }
        // let x = gridTool.getRandomGridWithinXY(object.x, object.x+width)
        // let y = gridTool.getRandomGridWithinXY(object.y, object.y+height)

        let createdObject = window.addObjects([newObject])
        object.spawnedIds.push(createdObject[0].id)
        if(object.spawnPool) object.spawnPool--

        object.spawnWait = true
        setTimeout(() => {
          object.spawnWait = false
        }, object.spawnWaitTime || 1000)
      }
    }
  })
}

export default {
  init,
  update,
}

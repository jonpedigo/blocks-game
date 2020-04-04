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

    /// CUSTOM GAME FX
    if(window.defaultGame) {
      window.defaultGame.intelligence(object, delta)
    }

    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.intelligence(object, delta)
    }

    if(object.tags && object.tags['stationary']) {
      object.velocityY = 0
      object.velocityX = 0
      object.accY = 0
      object.accX = 0
    }
  })
}

export default {
  init,
  update,
}

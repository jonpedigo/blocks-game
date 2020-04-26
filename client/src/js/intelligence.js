import pathfinding from './pathfinding.js'
import collision from './collisions'
import gridTool from './grid.js'
import physics from './physics.js'

function init(){

}

// function moveTowardsTarget(object, target, delta) {
//   if(object.x > target.x) {
//     object.velocityX -= (object.speed || 100) * delta
//   } else if(object.x < target.x) {
//     object.velocityX += (object.speed || 100) * delta
//   } else {
//     object.velocityX = 0
//   }
//
//   if(object.y > target.y) {
//     object.velocityY -= (object.speed || 100) * delta
//   } else if(object.y < target.y) {
//     object.velocityY += (object.speed || 100) * delta
//   } else {
//     object.velocityY = 0
//   }
// }

function checkIfWillCrossTarget(object, target, delta) {
  // let objectCopy = JSON.parse(JSON.stringify(object))
  // physics.updatePosition(objectCopy, delta)
  //
  // let greaterX = false
  // let lesserX = false
  // if(objectCopy.x > target.x) {
  //   greaterX = true
  // }
  //
  // let objectCopy = JSON.parse(JSON.stringify(object))
  // physics.updatePosition(objectCopy, delta)
  //
  // if(lesserX && greaterX) {
  //   objectCopy.x = target.x
  // }
  //
  // if(objectCopy.x > )
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
  let pathX = (object.path[0].x * w.game.grid.nodeSize) + w.game.grid.startX
  let pathY = (object.path[0].y * w.game.grid.nodeSize) + w.game.grid.startY

  let pathSpeedX = object.speed || -100
  let pathSpeedY = object.speed || -100

  // old lerp code
  // if(diffX < 5 && diffX >= 1) {
  //   pathSpeedX = pathSpeedX * (1 - (1/diffX))
  // }
  // if(diffY < 5 && diffY >= 1) {
  //   pathSpeedY = pathSpeedY * (1 - (1/diffY))
  // }

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

  //  else if(object.x > pathX) {
  //   object.velocityX = -pathSpeedX
  // } else if(object.x < pathX) {
  //   object.velocityX = pathSpeedX
  // }

  // else if(object.y > pathY) {
  //   object.velocityY = -pathSpeedY
  // } else if(object.y < pathY) {
  //   object.velocityY = pathSpeedY
  // }
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


    let hero = window.hero
    if(window.usePlayEditor) hero = window.editingHero
    /// DEFAULT GAME FX
    if(window.defaultCustomGame) {
      window.defaultCustomGame.intelligence(object, hero, delta)
    }

    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.intelligence(object, hero, delta)
    }

    /// LIVE CUSTOM GAME FX
    if(window.liveCustomGame) {
      window.liveCustomGame.intelligence(object, hero, delta)
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

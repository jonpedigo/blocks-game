// pathIdIndex: object.pathIdIndex,
// pathOnWayBack:  object.pathOnWayBack,
//
// _pathNeedsOwnPfGrid: object.pathNeedsOwnPfGrid,
// _pfGrid: object.pfGrid,

// window.pathTags = {
//   pathfindingLimit: false,
//   path: false,
//   pfGridUpdateOnLoop: false,
// }

// pathParts:  [
//  gridX,
//  gridY,
//  x, y
//  width, height
// ]
// pathId:  object.pathId,
// pathNavigation:  object.pathNavigation, // loop,  patrol


import pathfinding from '../../utils/pathfinding.js'
import collision from '../../utils/collisions'
import gridUtil from '../../utils/grid.js'

import { pathfindingAI, setTarget, setPathTarget } from './pathfinders'
import { spawnObject } from '../spawnZone'

function moveTowardsTarget(object, target, delta, options = { flat: false}) {
  let oldX = object.x
  let oldY = object.y

  if(object.x > target.x) {
    if(options.flat) object.velocityX = -object.mod().speed || -100
    else {
      object.velocityX -= (object.mod().speed || 100) * delta
    }
  }
  if(object.x < target.x) {
    if(options.flat) object.velocityX = object.mod().speed || 100
    else object.velocityX += (object.mod().speed || 100) * delta
  }
  let newX = object.x + object.velocityX * delta

  if(object.y > target.y) {
    if(options.flat) object.velocityY = -object.mod().speed || -100
    else object.velocityY -= (object.mod().speed || 100) * delta
  }
  if(object.y < target.y) {
    if(options.flat) object.velocityY = object.mod().speed || 100
    else object.velocityY += (object.mod().speed || 100) * delta
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

  let pathSpeedX = object.mod().speed || -100
  let pathSpeedY = object.mod().speed || -100

  moveTowardsTarget(object, {x: pathX, y: pathY }, delta, { flat: true })

  let diffX = Math.abs(object.x - pathX)
  let diffY = Math.abs(object.y - pathY)

  const { gridX, gridY, x, y } = gridUtil.convertToGridXY(object)
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

function onUpdate(objects, delta) {
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
    if(object._targetPursueId && object.mod().tags['zombie']) {
      const target = OBJECTS.getObjectOrHeroById(object._targetPursueId)
      setTarget(object, target)
    }

    if((object.path && object.path.length === 0) && object._targetPursueId && object.mod().tags['homing']) {
      const target = OBJECTS.getObjectOrHeroById(object._targetPursueId)
      setPathTarget(object, target)
    }

    if(object.path && object.path.length) {
      if(GAME.resetPaths) {
        object.path = []
        object.velocityX = 0
        object.velocityY = 0
      } else moveOnPath(object, delta)
    } else if(object.targetXY) {
      moveTowardsTarget(object, object.targetXY, delta)
    }

    pathfindingAI(object)

    spawnObject(object)
  })
}

export default {
  onUpdate,
}

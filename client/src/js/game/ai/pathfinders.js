import pathfinding from '../../utils/pathfinding.js'
import gridUtil from '../../utils/grid.js'

function pathfindingAI(object) {
  let hero = GAME.heroList[0]

  const autoTarget = !object.mod().tags['targetHeroOnAware'] && !object.mod().tags['targetVictimOnAware']
  if(object.tags && object.mod().tags['zombie'] && autoTarget) {
    setTarget(object, hero)
  }

  if(object.tags && object.mod().tags['homing'] && autoTarget) {
    if(!object.path || (object.path && !object.path.length)) {
      setPathTarget(object, hero)
    }
  }

  if(object.tags && object.mod().tags['wander']) {
    if(!object.path || (object.path && !object.path.length)) {
      object.path = [pathfinding.walkAround(object)]
      const { gridX, gridY } = gridUtil.convertToGridXY(object)
      object.gridX = gridX
      object.gridY = gridY
    }
  }

  if(object.tags && object.mod().tags['pacer']) {
    if(!object.path || (object.path && !object.path.length)) {
      object.path = [pathfinding.walkWithPurpose(object)]
      const { gridX, gridY } = gridUtil.convertToGridXY(object)
      object.gridX = gridX
      object.gridY = gridY
    }
  }

  if(object.tags && object.mod().tags['spelunker']) {
    if(!object.path || (object.path && !object.path.length)) {
      object.path = [pathfinding.exploreCave(object)]
      const { gridX, gridY } = gridUtil.convertToGridXY(object)
      object.gridX = gridX
      object.gridY = gridY
    }
  }

  if(object.tags && object.mod().tags['lemmings']) {
    if(!object.path || (object.path && !object.path.length)) {
      object.path = [pathfinding.walkIntoWall(object)]
      const { gridX, gridY } = gridUtil.convertToGridXY(object)
      object.gridX = gridX
      object.gridY = gridY
    }
  }

  if(object.tags && object.mod().tags['goomba']) {
    if(object.velocityMax === 0) object.velocityMax = 100

    if(!object._goalDirection) {
      object._goalDirection = 'right'
    }

    if(object._goalDirection === 'right' ) {
      object.velocityX = object.speed || 100
    }

    if(object._goalDirection === 'left') {
      object.velocityX = -object.speed || -100
    }
  }

  if(object.tags && object.mod().tags['goombaSideways']) {
    if(object.velocityMax === 0) object.velocityMax = 100

    if(!object._goalDirection) {
      object._goalDirection = 'down'
    }

    if(object._goalDirection === 'down' ) {
      object.velocityY = object.speed || 100
    }

    if(object._goalDirection === 'up') {
      object.velocityY = -object.speed || -100
    }
  }
}

function setPathTarget(object, target, pursue) {
  const { gridX, gridY } = gridUtil.convertToGridXY(object)
  object.gridX = gridX
  object.gridY = gridY

  const targetGridPos = gridUtil.convertToGridXY(target)
  target.gridX = targetGridPos.gridX
  target.gridY = targetGridPos.gridY

  object.path = pathfinding.findPath({
    x: gridX,
    y: gridY,
  }, {
    x: target.gridX,
    y: target.gridY,
  }, { pathfindingLimit: object.mod().pathfindingLimit })
  if(pursue) object._targetPursueId = target.id
}

function setTarget(object, target, pursue) {
  object.targetXY = { x: target.x, y: target.y }
  if(pursue) object._targetPursueId = target.id
}

export {
  pathfindingAI,
  setPathTarget,
  setTarget,
}

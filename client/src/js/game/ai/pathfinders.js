import pathfinding from '../../utils/pathfinding.js'
import gridUtil from '../../utils/grid.js'

export default function pathfinderIntelligence(object) {
  let hero = GAME.heroList[0]

  if(object.tags && object.tags['zombie']) {
    object.target = { x: hero.x, y: hero.y }
  }

  if(object.tags && object.tags['homing']) {
    if(!object.path || (object.path && !object.path.length)) {
      const { gridX, gridY } = gridUtil.convertToGridXY(object)
      object.gridX = gridX
      object.gridY = gridY

      const heroGridPos = gridUtil.convertToGridXY(hero)
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
      const { gridX, gridY } = gridUtil.convertToGridXY(object)
      object.gridX = gridX
      object.gridY = gridY
    }
  }

  if(object.tags && object.tags['pacer']) {
    if(!object.path || (object.path && !object.path.length)) {
      object.path = [pathfinding.walkWithPurpose(object)]
      const { gridX, gridY } = gridUtil.convertToGridXY(object)
      object.gridX = gridX
      object.gridY = gridY
    }
  }

  if(object.tags && object.tags['spelunker']) {
    if(!object.path || (object.path && !object.path.length)) {
      object.path = [pathfinding.exploreCave(object)]
      const { gridX, gridY } = gridUtil.convertToGridXY(object)
      object.gridX = gridX
      object.gridY = gridY
    }
  }

  if(object.tags && object.tags['lemmings']) {
    if(!object.path || (object.path && !object.path.length)) {
      object.path = [pathfinding.walkIntoWall(object)]
      const { gridX, gridY } = gridUtil.convertToGridXY(object)
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
}

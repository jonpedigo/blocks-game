import collisions from '../../collisions'
import gridTool from '../../grid.js'
import camera from '../../camera.js'
import pathfinding from '../../pathfinding.js'
import action from './action'

// we organize the code on the front end, default values, etc
function init() {

}

// once we have loaded up the game from the server for the first time, not on reload
function loaded() {
  window.gameState.paused = true
}

// this is an editor event but can also serve as a client event when its standalone arcade mode
// called by the editor
function start() {
  window.gameState.paused = false
  window.gameState.startTime = Date.now()
}

function onKeyDown(keysDown) {
  if(90 in keysDown) {
    if(window.hero.actionButtonBehavior === 'shootBullet') {
      action.shootBullet()
    }

    if(window.hero.actionButtonBehavior === 'dropWall') {
      action.dropWall()
    }
  }
}

function input(keysDown, delta) {
  if(window.hero.flags.paused || window.gameState.paused) return

}

function intelligence(object, delta) {
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
        id: 'spawned-' + object.spawnedIds.length + object.id + Date.now(),
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
}

function onCollide(agent, collider, result, removeObjects) {
  if(collider.tags && agent.tags && collider.tags['bullet'] && agent.tags['monster']) {
    removeObjects.push(agent)
    window.hero.score++
  }

  if(agent.tags && agent.tags['goomba'] && collider.tags && collider.tags['obstacle']) {
    if(result.overlap_x === 1 && agent.direction === 'right') {
      agent.direction = 'left'
    }
    if(result.overlap_x === -1 && agent.direction === 'left') {
      agent.direction = 'right'
    }
  }

  if(agent.tags && agent.tags['goombaSideways'] && collider.tags && collider.tags['obstacle']) {
    if(result.overlap_y === 1 && agent.direction === 'down') {
      agent.direction = 'up'
    }
    if(result.overlap_y === -1 && agent.direction === 'up') {
      agent.direction = 'down'
    }
  }
}

// after input, intel, physics, but before render
function update(delta) {
  window.resetPaths = false
}

function render(ctx) {

}

export default {
  init,
  loaded,
  start,
  onKeyDown,
  input,
  update,
  intelligence,
  render,
  onCollide,
}

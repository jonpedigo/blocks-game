import { Collisions, Polygon } from 'collisions';
import intelligence from './intelligence'

const physicsObjects = {}
// Create the collision system
const system = new Collisions()

// Create a Result object for collecting information about the collisions
let result = system.createResult()

function updatePosition(object, delta) {
  if(object.id.indexOf('hero') === -1) {
    object._initialX = object.x
    object._initialY = object.y
  }

  // if(object.accX) {
  //   object.velocityX += ( object.accX )
  //     if(object.accX > 0) {
  //     object.accX -= ( object.accDecayX )
  //     if(object.accX < 0) {
  //       object.accX = 0
  //     }
  //   } else if (object.accX < 0) {
  //     object.accX += ( object.accDecayX )
  //     if(object.accX > 0) {
  //       object.accX = 0
  //     }
  //   }
  // }
  if(object.velocityX) {
    if(object.velocityX >= object.velocityMax) object.velocityX = object.velocityMax
    else if(object.velocityX <= object.velocityMax * -1) object.velocityX = object.velocityMax * -1
    object.x += object.velocityX * delta
  }

  // if(object.accY) {
  //   object.velocityY += ( object.accY )
  //   if(object.accY > 0) {
  //     object.accY -= ( object.accDecayY )
  //     if(object.accY < 0) {
  //       object.accY = 0
  //     }
  //   } else if (object.accY < 0) {
  //     object.accY += ( object.accDecayY )
  //     if(object.accY > 0) {
  //       object.accY = 0
  //     }
  //   }
  // }

  if(object.gravity) {
    let distance = (object.velocityY * delta) +  ((1000 * (delta * delta))/2)
    object.y += distance
    object.velocityY += (1000 * delta)
  }

  if(object.velocityY) {
    if(object.velocityY >= object.velocityMax) {
      object.velocityY = object.velocityMax
    }
    else if(object.velocityY <= object.velocityMax * -1) {
      object.velocityY = object.velocityMax * -1
    }

    if(!object.gravity) {
      object.y += object.velocityY * delta
    }
  }

  containObjectWithinGridBoundaries(object)
}

function containObjectWithinGridBoundaries(object) {
  //CONTAIN WITHIN BOUNDARIES OF THE GRID!!
  if(object.x + object.width > (window.gridNodeSize * window.gridSize.x) + window.grid[0][0].x) {
    object.x = (window.gridNodeSize * window.gridSize.x) + window.grid[0][0].x - object.width
  }
  if(object.y + object.height > (window.gridNodeSize * window.gridSize.y) + window.grid[0][0].y) {
    object.y = (window.gridNodeSize * window.gridSize.y) + window.grid[0][0].y - object.height
  }

  if(object.x < window.grid[0][0].x) {
    object.x = window.grid[0][0].x
  }

  if(object.y < window.grid[0][0].y) {
    object.y = window.grid[0][0].y
  }
}

function update (hero, objects, delta) {
  let gameBoundaries = window.preferences.gameBoundaries
  if(gameBoundaries) {
    if(hero.x < gameBoundaries.x - hero.width) {
      hero.x = gameBoundaries.x + gameBoundaries.width
    } else if (hero.x > gameBoundaries.x + gameBoundaries.width) {
      hero.x = gameBoundaries.x - hero.width
    } else if(hero.y < gameBoundaries.y - hero.height) {
      hero.y = gameBoundaries.y + gameBoundaries.height
    } else if (hero.y > gameBoundaries.y + gameBoundaries.height) {
      hero.y = gameBoundaries.y - hero.height
    }
  }

  // set objects new position and widths
  [...objects, hero].forEach((object, i) => {
    updatePosition(object, delta)
    containObjectWithinGridBoundaries(object)

    if(!object.id) {
      console.log('OBJECT', object, 'WITHOUT ID')
      return
    }

    if(!physicsObjects[object.id]) {
      console.log('physics object not found for id: ' + object.id)
      return
    }

    let physicsObject = physicsObjects[object.id]
    physicsObject.x = object.x
    physicsObject.y = object.y
    physicsObject.gameObject = object
    if(Math.floor(Math.abs(object.width)) !== Math.floor(Math.abs(physicsObject._max_x - physicsObject._min_x)) || Math.floor(Math.abs(object.height)) !== Math.floor(Math.abs(physicsObject._max_y - physicsObject._min_y))) {
      physicsObject.setPoints([ [ 0, 0], [object.width, 0], [object.width, object.height] , [0, object.height]])
    }
  })

  // let raycast = new Polygon(prevX, prevY, [ [ 0, 0], [hero.x, hero.y] ])
  // system.insert(raycast)
  // // update physics system
  // system.update()
  //
  // const raycastPotentials = raycast.potentials()
  // for(const body of raycastPotentials) {
  //   // console.log(raycastPotentials)
  //   if(raycast.collides(body)) {
  //     console.log('messed up')
  //     // return
  //   }
  // }
  // raycast.remove()

  // update physics system
  system.update()

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  // OBJECTS COLLIDING WITH HERO
  /////////////////////////////////////////////////////
  const result = physicsObjects[window.hero.id].createResult()
  const potentials = physicsObjects[window.hero.id].potentials()
  let illegal = false
  let correction = {x: hero.x, y: hero.y}
  let removeObjects = []
  let heroPO = physicsObjects[window.hero.id]
  for(const body of potentials) {
    if(heroPO.collides(body, result)) {
      if(body.gameObject.tags && body.gameObject.tags['monster']) {
        if(heroPO.gameObject.tags['monsterDestroyer']) {
          if(body.gameObject.spawnPointX) {
            body.gameObject.x = body.gameObject.spawnPointX
            body.gameObject.y = body.gameObject.spawnPointY
          } else {
            removeObjects.push(body.gameObject)
          }
        } else {
          window.score--
          window.respawnHero()
        }
      }

      if(body.gameObject.tags && body.gameObject.tags['coin']) {
        window.score++
      }

      if(body.gameObject.tags && body.gameObject.tags['chatter'] && body.gameObject.heroUpdate && body.gameObject.heroUpdate.chat) {
        window.hero.showChat = true
        window.hero.chat = body.gameObject.heroUpdate.chat.slice()
        // window.hero.chat.name = body.id
        window.hero.paused = true
      }

      if(body.gameObject.tags && body.gameObject.tags['powerup']) {
        if(body.id !== window.hero.lastPowerUpId) {
          Object.assign(window.hero, {...body.gameObject.heroUpdate, lastPowerUpId: body.gameObject.id})
        }
      } else {
        window.hero.lastPowerUpId = null
      }

      if(body.gameObject.tags && body.gameObject.tags.deleteAfter) {
        removeObjects.push(body.gameObject)
      }
    }
  }

  hero.onGround = false

  heroCorrectionPhase()
  system.update()
  heroCorrectionPhase()
  system.update()
  heroCorrectionPhase(true)
  system.update()

  function heroCorrectionPhase(final = false) {
    const result = physicsObjects[window.hero.id].createResult()
    const potentials = physicsObjects[window.hero.id].potentials()
    let illegal = false
    let correction = {x: hero.x, y: hero.y}
    let heroPO = physicsObjects[window.hero.id]
    for(const body of potentials) {
      if(heroPO.collides(body, result)) {
        if(body.gameObject.tags && body.gameObject.tags['obstacle']) {
          illegal = true
          correction.x -= result.overlap * result.overlap_x
          correction.y -= result.overlap * result.overlap_y
        }
      }
    }

    if(illegal) {
      // hero.wallJumpLeft = false
      // hero.wallJumpRight = false
      if(result.overlap_y === 1) {
        if(hero.velocityY > 0) hero.velocityY = 0
        hero.onGround = true
      } else if(result.overlap_y === -1){
        if(hero.velocityY < 0) hero.velocityY = 0
      }
      if(result.overlap_x === 1) {
        // if(hero.onGround === false) hero.wallJumpLeft = true
        if(hero.velocityX > 0) hero.velocityX = 0
      } else if(result.overlap_x === -1){
        // if(hero.onGround === false) hero.wallJumpRight = true
        if(hero.velocityX < 0) hero.velocityX = 0
      }

      heroPO.x = correction.x
      heroPO.y = correction.y
    }

    if(final) {
      // just give up correction and prevent any movement from these mother fuckers
      if(illegal) {
        hero.x = hero._initialX
        hero.y = hero._initialY
      } else {
        hero.x = heroPO.x
        hero.y = heroPO.y
      }
    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  // OBJECTS COLLIDING WITH OTHER OBJECTS
  /////////////////////////////////////////////////////
  for(let id in physicsObjects){
    if(!physicsObjects[id]) continue
    if(id.indexOf('hero') > -1) continue
    let po = physicsObjects[id]
    let potentials = po.potentials()
    let result = po.createResult()
    for(const body of potentials) {
      if(po.collides(body, result)) {
        if(body.gameObject.tags && po.gameObject.tags && body.gameObject.tags['bullet'] && po.gameObject.tags['monster']) {
          removeObjects.push(po.gameObject)
          window.score++
        }

        if(po.gameObject.tags && po.gameObject.tags['goomba'] && body.gameObject.tags && body.gameObject.tags['obstacle']) {
          if(result.overlap_x === 1 && po.gameObject.direction === 'right') {
            po.gameObject.direction = 'left'
          }
          if(result.overlap_x === -1 && po.gameObject.direction === 'left') {
            po.gameObject.direction = 'right'
          }
        }
      }
    }
  }

  correctionPhase()
  system.update()
  correctionPhase()
  system.update()
  correctionPhase(true)

  function correctionPhase(final = false) {
    for(let id in physicsObjects){
      if(!physicsObjects[id]) continue
      if(id.indexOf('hero') > -1) continue
      let po = physicsObjects[id]
      let result = po.createResult()
      let correction = {x: po.x, y: po.y}
      let potentials = po.potentials()
      let illegal = false
      for(const body of potentials) {
        if(po.collides(body, result)) {
          if(po.gameObject.tags && po.gameObject.tags['obstacle'] && body.gameObject.tags && body.gameObject.tags['obstacle'] && !po.gameObject.tags['stationary'] && po.gameObject.tags['zombie']) {
            if(Math.abs(result.overlap_x) !== 0) {
              illegal = true
              correction.x -= result.overlap * result.overlap_x
            }
            if(Math.abs(result.overlap_y) !== 0) {
              illegal = true
              correction.y -= result.overlap * result.overlap_y
            }
            break;
          }
        }
      }

      if(illegal) {
        // hero.wallJumpLeft = false
        // hero.wallJumpRight = false
        if(result.overlap_y === 1) {
          if(po.gameObject.velocityY > 0) po.gameObject.velocityY = 0
          po.gameObject.onGround = true
        } else if(result.overlap_y === -1){
          if(po.gameObject.velocityY < 0) po.gameObject.velocityY = 0
        }
        if(result.overlap_x === 1) {
          // if(po.gameObject.onGround === false) po.gameObject.wallJumpLeft = true
          if(po.gameObject.velocityX > 0) po.gameObject.velocityX = 0
        } else if(result.overlap_x === -1){
          // if(po.gameObject.onGround === false) po.gameObject.wallJumpRight = true
          if(po.gameObject.velocityX < 0) po.gameObject.velocityX = 0
        }

        po.x = correction.x
        po.y = correction.y
      }

      if(final) {
        // just give up correction and prevent any movement from these mother fuckers
        if(illegal) {
          po.gameObject.x = po.gameObject._initialX
          po.gameObject.y = po.gameObject._initialY
        } else {
          po.gameObject.x = po.x
          po.gameObject.y = po.y
        }
      }
    }
  }

  removeObjects.forEach((gameObject) => {
    window.socket.emit('removeObject', gameObject)
  })

  window.objects.forEach((object, i) => {
    containObjectWithinGridBoundaries(object)
  })
  containObjectWithinGridBoundaries(window.hero)

}


function drawObject(ctx, object) {
  physicsObjects[object.id].draw(ctx)
}

function drawSystem(ctx) {
  ctx.fillStyle = '#000000'
	ctx.fillRect(0, 0, 1000, 1000)
  ctx.canvas.width = 1000
  ctx.canvas.height = 1000
	ctx.strokeStyle = '#FFFFFF'
	ctx.beginPath()
	system.draw(ctx)
	ctx.stroke()

  ctx.strokeStyle = '#00FF00'
  ctx.beginPath()
  system.drawBVH(ctx)
  ctx.stroke()
}

function addObject(object, moving = false) {
  const physicsObject = new Polygon(object.x, object.y, [ [ 0, 0], [object.width, 0], [object.width, object.height] , [0, object.height]])
  system.insert(physicsObject)
  physicsObjects[object.id] = physicsObject
  return physicsObject
}

function removeObject(object) {
  try {
    system.remove(physicsObjects[object.id])
    physicsObjects[object.id] = null;
  } catch(e) {

  }
}

function removeObjectById(id) {
  try {
    system.remove(physicsObjects[id])
    physicsObjects[id] = null;
  } catch(e) {

  }
}


export default {
  addObject,
  drawObject,
  drawSystem,
  removeObject,
  removeObjectById,
  update
}

import { Collisions, Polygon } from 'collisions';

const physicsObjects = {}
// Create the collision system
const system = new Collisions()

// Create a Result object for collecting information about the collisions
let result = system.createResult()

function updatePosition(object, delta) {
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
    object.x += Math.ceil( object.velocityX * delta)
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
    physicsObject.id = object.id
    physicsObject.tags = object.tags
    physicsObject.heroUpdate = object.heroUpdate
    physicsObject.chat = object.chat
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

  // check for basic collisions
  const result = physicsObjects[window.hero.id].createResult()
  const potentials = physicsObjects[window.hero.id].potentials()
  let illegal = false
  let correction = {x: hero.x, y: hero.y}
  let removeIds = []

  for(const body of potentials) {
    if(physicsObjects[window.hero.id].collides(body, result)) {
      if(body.tags && body.tags['monster']) {
        window.score--
        window.resetHero({x: window.hero.spawnPointX, y: window.hero.spawnPointY})
      }
      if(body.tags && body.tags['coin']) {
        window.score++
      }

      if(body.tags && body.tags['chatter']) {
        window.showChat = true
        window.currentChat = body.chat.slice()
        window.hero.paused = true
      }

      if(body.tags && body.tags['powerup']) {
        if(body.id !== window.hero.lastPowerUpId) {
          window.resetHero({...body.heroUpdate, lastPowerUpId: body.id})
          if(body.tags && body.tags.deleteAfterPowerup) {
            removeIds.push(body.id)
          }
        }
      } else {
        window.hero.lastPowerUpId = null
      }

      if(body.tags && body.tags['obstacle']) {
        illegal = true
        correction.x -= result.overlap * result.overlap_x
        correction.y -= result.overlap * result.overlap_y
        break;
      }
    }
  }

  removeIds.forEach((id) => {
    window.socket.emit('removeObject', id)
  })

  hero.onGround = false

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

    hero.x = correction.x
    hero.y = correction.y
    // physicsObjects[window.hero.id].x = hero.x
    // physicsObjects[window.hero.id].y = hero.y
  }

  let removeObjects = []
  for(let name in physicsObjects){
    if(!physicsObjects[name]) continue
    if(name === 'hero') continue
    let po = physicsObjects[name]
    let potentials = po.potentials()
    for(const body of potentials) {
      if(po.collides(body, result)) {
        if(body.tags && po.tags && body.tags['monster'] && po.tags['bullet']) {
          removeObjects.push(body.id)
          window.score++
        }
      }
    }
  }

  removeObjects.forEach((id) => {
    window.removeObject(id)
  })
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

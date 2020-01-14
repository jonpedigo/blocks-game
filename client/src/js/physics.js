import { Collisions, Polygon } from 'collisions';

const physicsObjects = {}
// Create the collision system
const system = new Collisions()

// Create a Result object for collecting information about the collisions
let result = system.createResult()

function updatePosition(object, modifier) {
  if(object.accX) {
    object.velocityX += ( object.accX )
      if(object.accX > 0) {
      object.accX -= ( object.accDecayX )
      if(object.accX < 0) {
        object.accX = 0
      }
    } else if (object.accX < 0) {
      object.accX += ( object.accDecayX )
      if(object.accX > 0) {
        object.accX = 0
      }
    }
  }
  if(object.velocityX) {
    if(object.velocityX > object.velocityMax) object.velocityX = object.velocityMax
    if(object.velocityX < object.velocityMax * -1) object.velocityX = object.velocityMax * -1
    object.x += Math.ceil( object.velocityX * modifier)
  }

  if(object.gravity) {
    object.velocityY += object.gravity
  }
  if(object.accY) {
    object.velocityY += ( object.accY )
    if(object.accY > 0) {
      object.accY -= ( object.accDecayY )
      if(object.accY < 0) {
        object.accY = 0
      }
    } else if (object.accY < 0) {
      object.accY += ( object.accDecayY )
      if(object.accY > 0) {
        object.accY = 0
      }
    }
  }
  if(object.velocityY) {
    if(object.velocityY > object.velocityMax) object.velocityY = object.velocityMax
    if(object.velocityY < object.velocityMax * -1) {
      object.velocityY = object.velocityMax * -1
    }
    object.y += Math.ceil( object.velocityY * modifier )
  }
}

function update (hero, objects, modifier) {

  // set objects new position and widths
  [...objects, hero].forEach((object, i) => {
    updatePosition(object, modifier)

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
    if(Math.floor(Math.abs(object.width)) !== Math.floor(Math.abs(physicsObject._max_x - physicsObject._min_x)) || Math.floor(Math.abs(object.height)) !== Math.floor(Math.abs(physicsObject._max_y - physicsObject._min_y))) {
      physicsObject.setPoints([ [ 0, 0], [object.width, 0], [object.width, object.height] , [0, object.height]])
    }
  })

  window.socket.emit('updateObjects', objects)

  //
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
  const result = physicsObjects.hero.createResult()
  const potentials = physicsObjects.hero.potentials()
  let illegal = false
  let correction = {x: hero.x, y: hero.y}

  for(const body of potentials) {
    if(physicsObjects.hero.collides(body, result)) {
      illegal = true
      correction.x -= result.overlap * result.overlap_x
      correction.y -= result.overlap * result.overlap_y
      break;
    }
  }

  hero.onGround = false
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

  if(illegal) {
    hero.x = correction.x
    hero.y = correction.y
    // physicsObjects.hero.x = hero.x
    // physicsObjects.hero.y = hero.y
  }

  let removeObjects = []
  console.log(physicsObjects)
  for(let name in physicsObjects){
    if(!physicsObjects[name]) continue
    if(name === 'hero') continue
    let po = physicsObjects[name]
    let potentials = po.potentials()
    for(const body of potentials) {
      if(po.collides(body, result)) {
        if(body.tags.indexOf('monster') >= 0 && po.tags.indexOf('bullet') >= 0) {
          removeObjects.push(body.id)
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
  system.remove(physicsObjects[object.id])
  physicsObjects[object.id] = null;
}

function removeObjectById(id) {
  system.remove(physicsObjects[id])
  physicsObjects[id] = null;
}


export default {
  addObject,
  drawObject,
  drawSystem,
  removeObject,
  removeObjectById,
  update
}

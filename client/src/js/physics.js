import { Collisions, Polygon } from 'collisions';

const physicsObjects = {}
// Create the collision system
const system = new Collisions()

// Create a Result object for collecting information about the collisions
let result = system.createResult()

function updatePosition(object, modifier) {
  if(object.accX) {
    object.velocityX += ( object.accX )
    if(object.velocityX > object.velocityMax) object.velocityX = object.velocityMax
    if(object.velocityX < object.velocityMax * -1) object.velocityX = object.velocityMax * -1
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
    object.x += ( object.velocityX * modifier)
  }

  if(object.gravity) {
    object.velocityY += object.gravity
  }
  if(object.accY) {
    object.velocityY += ( object.accY )
    if(object.velocityY > object.velocityMax) object.velocityY = object.velocityMax
    if(object.velocityY < object.velocityMax * -1) {
      object.velocityY = object.velocityMax * -1
    }
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
    object.y += ( object.velocityY * modifier )
  }
}

function update (hero, objects, modifier) {

  // set objects new position and widths
  [...objects, hero].forEach((object) => {
    updatePosition(object, modifier)

    let physicsObject = physicsObjects[object.name]
    physicsObject.x = object.x
    physicsObject.y = object.y
    if(Math.floor(Math.abs(object.width)) !== Math.floor(Math.abs(physicsObject._max_x - physicsObject._min_x)) || Math.floor(Math.abs(object.height)) !== Math.floor(Math.abs(physicsObject._max_y - physicsObject._min_y))) {
      physicsObject.setPoints([ [ 0, 0], [object.width, 0], [object.width, object.height] , [0, object.height]])
    }
  })

  //raycast check
  let prevX = physicsObjects.hero.x
  let prevY = physicsObjects.hero.y
  physicsObjects.hero.x = hero.x
  physicsObjects.hero.y = hero.y

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
    }
  }

  if(result.overlap_y === 1) {
    if(hero.velocityY > 0) hero.velocityY = 0
  } else if(result.overlap_y === -1){
    if(hero.velocityY < 0) hero.velocityY = 0
  }
  if(result.overlap_x === 1) {
    if(hero.velocityX > 0) hero.velocityX = 0
  } else if(result.overlap_x === -1){
    if(hero.velocityX < 0) hero.velocityX = 0
  }

  if(illegal) {
    hero.x = correction.x
    hero.y = correction.y
    physicsObjects.hero.x = hero.x
    physicsObjects.hero.y = hero.y
  }
}


function drawObject(ctx, object) {
  physicsObjects[object.name].draw(ctx)
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
  physicsObjects[object.name] = physicsObject
  return physicsObject
}

function removeObject(object) {
  system.remove(physicsObjects[object.name])
}

export default {
  addObject,
  drawObject,
  drawSystem,
  removeObject,
  update
}

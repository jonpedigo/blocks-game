import { Collisions, Polygon } from 'collisions';

const physicsObjects = {}
// Create the collision system
const system = new Collisions()

// Create a Result object for collecting information about the collisions
let result = system.createResult()

function update (hero, objects, modifier) {
  if(window.preferences.gravity > 0) hero.y = hero.y + (window.preferences.gravity * modifier)

  // set objects new position and widths
  objects.forEach((object) => {
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


  let raycast = new Polygon(prevX, prevY, [ [ 0, 0], [hero.x, hero.y] ])
  system.insert(raycast)
  // update physics system
  system.update()

  const raycastPotentials = raycast.potentials()
  for(const body of raycastPotentials) {
    // console.log(raycastPotentials)
    if(raycast.collides(body)) {
      console.log('messed up')
      // return
    }
  }
  raycast.remove()

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

/*!!!!!!!!!!!!!!
REGARDING PHYSICS, SOMETHING EARLIER ON THE i LIST ( objects ) loose the battle for corrections. They correct for everything else first
just make sure to set something to stationary if its not supposed to be move, or else it will be subject to spawn ( i ) order
*/

import { Collisions } from 'collisions';
import decomp from 'poly-decomp';

import {
  attachToParent,
  attachToRelative,
  attachSubObjects,
  addObject,
  removeObject,
  heroCorrection,
  heroCollisionEffects,
  objectCorrection,
  objectCollisionEffects,
  containObjectWithinGridBoundaries,
  shouldCheckConstructPart,
  applyCorrection,
} from './physicsTools.js'

const objects = {}

// Create the collision system
const system = new Collisions()
window.PHYSICS = {
  addObject,
  removeObject,
  system,
  objects,
  heroCorrection,
  correctAndEffectAllObjectAndHeros,
  prepareObjectsAndHerosForMovementPhase,
  prepareObjectsAndHerosForCollisionsPhase,
  updatePosition,
  postPhysics,
  draw: drawSystem
}

let cameraSet = false
function drawSystem(ctx, camera) {
  if(!cameraSet) {
    ctx.scale(camera.multiplier, camera.multiplier)
    cameraSet = true
  }
  // console.log(camera.x)
  // ctx.setTransform(0,0,0,0, camera.x, camera.y)

  ctx.fillStyle = '#000000'
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  // ctx.canvas.width = 1000
  // ctx.canvas.height = 1000
	ctx.strokeStyle = '#FFFFFF'
	ctx.beginPath()
	system.draw(ctx)
	ctx.stroke()

  ctx.strokeStyle = '#00FF00'
  ctx.beginPath()
  // system.drawBVH(ctx)
  ctx.stroke()
}

function correctAndEffectAllObjectAndHeros (delta) {
  // update physics system
  prepareObjectsAndHerosForCollisionsPhase()
  heroPhysics()
  objectPhysics()
  postPhysics()
  removeAndRespawn()
}

function setAngleVelocity(hero) {
  const angleCorrection = window.degreesToRadians(90)
  hero.velocityX = hero.velocityAngle * Math.cos(hero.angle - angleCorrection)
  hero.velocityY = hero.velocityAngle * Math.sin(hero.angle - angleCorrection)
}

function updatePosition(object, delta) {
  if(object.removed || object.mod().relativeId) return
  if(object._skipPosUpdate) return
  if(!object.mod().tags['moving']) return

  const allowGravity = true

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

  if(object.mod().tags.rotateable && typeof object.velocityAngle === 'number') setAngleVelocity(object)

  const maxVelocityX = object.mod().velocityMax + (object.mod().velocityMaxXExtra || 0)
  if(object.velocityX) {
    if(object.velocityX >= maxVelocityX) object.velocityX = maxVelocityX
    else if(object.velocityX <= maxVelocityX * -1) object.velocityX = maxVelocityX * -1
    object.x += object.velocityX * delta
  }
  if(object._flatVelocityX) {
    object.x += object._flatVelocityX * delta
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

  let gravityVelocityY = GAME.world.gravityVelocityY
  if(!gravityVelocityY) gravityVelocityY = 1000

  let applyWorldGravity = false
  if(GAME.world.tags.allMovingObjectsHaveGravityY && object.mod().tags.moving && !object.mod().tags.ignoreWorldGravity) {
    applyWorldGravity = true
  }

  if(object._skipNextGravity) {
    object._skipNextGravity = false
  } else if(object.tags && object.mod().tags.gravityY || applyWorldGravity) {
    let distance = (object.velocityY * delta) +  ((gravityVelocityY * (delta * delta))/2)
    object.y += distance
    if(allowGravity) object.velocityY += (gravityVelocityY * delta)
  }

  const maxVelocityY = object.mod().velocityMax + (object.mod().velocityMaxYExtra || 0)
  if(object.velocityY) {
    if(object.velocityY >= maxVelocityY) {
      object.velocityY = maxVelocityY
    }
    else if(object.velocityY <= maxVelocityY * -1) {
      object.velocityY = maxVelocityY * -1
    }

    if(object.tags && !object.mod().tags.gravityY) {
      if(allowGravity) object.y += object.velocityY * delta
    }
  }
  if(object._flatVelocityY) object.y += object._flatVelocityY * delta

  if(typeof object.mod().velocityDecay == 'number') {
    const velocityDecayY = object.mod().velocityDecay + (object.mod().velocityDecayYExtra || 0)
    const velocityDecayX = object.mod().velocityDecay + (object.mod().velocityDecayXExtra || 0)

    if(object.velocityX < 0) {
      object.velocityX += (velocityDecayX * delta)
      if(object.velocityX > 0) object.velocityX = 0
    } else {
      object.velocityX -= (velocityDecayX * delta)
      if(object.velocityX < 0) object.velocityX = 0
    }

    if(object.velocityY < 0) {
      object.velocityY += (velocityDecayY * delta)
      if(object.velocityY > 0) object.velocityY = 0
    } else {
      object.velocityY -= (velocityDecayY * delta)
      if(object.velocityY < 0) object.velocityY = 0
    }
  }

  if(object.tags && !object.mod().tags['moving']) {
    object.velocityY = 0
    object.velocityX = 0
    object.velocityAngle = 0
    object.accY = 0
    object.accX = 0
    object.x = object._initialX
    object.y = object._initialY
  }


  if(object.mod().tags.flipYAtMaxVelocity && Math.abs(object.velocityY) == object.mod().velocityMax) {
    object._flipY = true
  }
}

function getAllHeros() {
  return GAME.heroList.filter(({id}) => {
    if(id === 'ghost') return false
    else return true
  })
}

function prepareObjectsAndHerosForMovementPhase() {
  // set objects new position and widths
  let everything = [...GAME.objects]
  let allHeros = getAllHeros()
  everything.push(...allHeros)
  PHYSICS.correctedConstructs = {}

  // everything.forEach((object) => {
  //   if(object.subObjects) {
  //     OBJECTS.forAllSubObjects(object.subObjects, (subObject) => {
  //       if(subObject.mod().tags.potential || subObject.mod().tags.notInCollisions) return
  //       everything.push(subObject)
  //     })
  //   }
  // })

  everything.forEach((object, i) => {
    object._deltaX = 0
    object._deltaY = 0
    object._parentId = null
    object._initialX = object.x
    object._initialY = object.y

    object._flipY = false

    delete object._skipPosUpdate
    delete object._flatVelocityX
    delete object._flatVelocityY
    object.interactableObject = null
    object.interactableObjectResult = null

    if(object.constructParts) {
      object.constructParts.forEach((part) => {
        part._initialX = part.x
        part._initialY = part.y
      })
    }

    if(object.subObjects && object.subObjects.awarenessTriggerArea) {
      object._objectsAwareOfNext = []
    }

    object._objectsWithinNext = []

    if(object.subObjects) {
      OBJECTS.forAllSubObjects(object.subObjects, (subObject) => {
        if(subObject.mod().tags.potential || subObject.mod().tags.notInCollisions) return
        subObject._objectsWithinNext = []
      })
    }
  })
}

function prepareObjectsAndHerosForCollisionsPhase() {
  // set objects new position and widths
  let everything = [...GAME.objects]
  let allHeros = getAllHeros()
  everything.push(...allHeros)
  everything.forEach((object) => {
    if(object.subObjects) {
      OBJECTS.forAllSubObjects(object.subObjects, (subObject) => {
        if(subObject.mod().tags.potential || subObject.mod().tags.notInCollisions) return
        everything.push(subObject)
      })
    }
  })

  everything.forEach((object, i) => {
    if(!object.id) {
      console.log('OBJECT', object, 'WITHOUT ID')
      return
    }

    if(object.mod().tags.notInCollisions) {
      return
    }

    if(object.constructParts) {
      object.constructParts.forEach((part) => {
        if(!PHYSICS.objects[part.id]) {
          console.log('physics object not found for part : ' + part.id)
          return
        }

        let physicsObject = PHYSICS.objects[part.id]
        physicsObject.x = part.x + (object.x - object._initialX)
        physicsObject.y = part.y + (object.y - object._initialY)
        physicsObject.id = part.id
        physicsObject.gameObject = object
        physicsObject.constructPart = part
      })
    } else {
      if(!PHYSICS.objects[object.id]) {
        console.log('physics object not found for id: ' + object.id)
        return
      }

      let physicsObject = PHYSICS.objects[object.id]
      physicsObject.x = object.x
      physicsObject.y = object.y
      physicsObject.id = object.id
      physicsObject.gameObject = object

      if(object.mod().tags.rotateable) {
        if(object.angle === 0 || physicsObject._angle !== object.angle) {
          physicsObject.setPoints([ [ -object.height/2, -object.height/2], [object.width/2, -object.height/2], [object.width/2, object.height/2] , [-object.width/2, object.height/2]])
        }
        physicsObject.angle = object.angle
        physicsObject.x = object.x + object.width/2
        physicsObject.y = object.y + object.height/2
      } else {
        if(physicsObject.angle) physicsObject.angle = null
        if(Math.floor(Math.abs(object.width)) !== Math.floor(Math.abs(physicsObject._max_x - physicsObject._min_x)) || Math.floor(Math.abs(object.height)) !== Math.floor(Math.abs(physicsObject._max_y - physicsObject._min_y))) {
          physicsObject.setPoints([ [ 0, 0], [object.width, 0], [object.width, object.height] , [0, object.height]])
        }
      }
    }
  })

  system.update()
}

function heroPhysics() {
  let allHeros = getAllHeros()
  allHeros.forEach((hero) => {
    heroCollisionEffects(hero)
    if(hero.mod().relativeId) return
    heroCorrection(hero)
  })
}

function objectPhysics() {
  for(let id in PHYSICS.objects){
    let po = PHYSICS.objects[id]
    // console.log(po)
    if(!po.gameObject) {
      if(PHYSICS.debug) console.log('no game object found for phyics object id: ' + id)
      continue
    }
    if(po.gameObject.removed) continue
    if(po.gameObject.mod().tags.hero) continue
    objectCollisionEffects(po)
  }

  correctionPhase()
  system.update()
  correctionPhase(true)

  function correctionPhase(final = false) {
    for(let id in PHYSICS.objects){
      let po = PHYSICS.objects[id]
      if(!po.gameObject) continue
      if(po.gameObject.mod().relativeId) continue
      if(po.gameObject.removed) continue
      if(po.gameObject.mod().tags.hero) continue
      if(po.gameObject.mod().tags['skipCorrectionPhase']) {
        applyCorrection(po.gameObject, po)
        continue
      }
      if(!po.gameObject.mod().tags['moving']) continue
      if(po.constructPart && !shouldCheckConstructPart(po.constructPart)) continue
      objectCorrection(po, final)
    }
  }
}

function postPhysics() {
  let allHeros = getAllHeros()
  // GET DELTA
  allHeros.forEach((hero) => {
    if(hero.removed) return
    if(hero.interactableObject) {
      let input = GAME.heroInputs[hero.id]
      // INTERACT WITH SMALLEST OBJECT
      // window.emitGameEvent('onObjectInteractable', hero.interactableObject, hero)
      if(input && (input['e'] === true || input['v'] === true) && !hero._cantInteract && !hero.flags.paused) {
        window.local.emit('onHeroInteract', hero, hero.interactableObject)
        hero._cantInteract = true
      }
      // bad for JSON
      delete hero.interactableObjectResult
    }
    processAwarenessAndWithinEvents(hero)
  })

  // NON CHILD GO FIRST
  GAME.objects.forEach((object, i) => {
    if(object.removed) return
    if(!object.mod().parentId && !object._parentId) {
      containObjectWithinGridBoundaries(object)
      object._deltaX = object.x - object._initialX
      object._deltaY = object.y - object._initialY
    }
    processAwarenessAndWithinEvents(object)
  })

  allHeros.forEach((hero) => {
    if(hero.removed) return
    if(!hero.mod().parentId && !hero._parentId) {
      containObjectWithinGridBoundaries(hero)
      hero._deltaX = hero.x - hero._initialX
      hero._deltaY = hero.y - hero._initialY
    }
  })

  // THEN ATTACH CHILDREN OBJECTS TO PARENT
  GAME.objects.forEach((object, i) => {
    if(object.removed) return
    if(object.mod().parentId || object._parentId ) {
      attachToParent(object)
      containObjectWithinGridBoundaries(object)
    }
  })

  allHeros.forEach((hero) => {
    if(hero.removed) return
    if(hero.mod().parentId || hero._parentId ) {
      attachToParent(hero)
      containObjectWithinGridBoundaries(hero)
    }
  })


  // ATTACH OBJECTS THAT ARE SEPERATE FROM BOUNDARIES
  GAME.objects.forEach((object, i) => {
    if(object.removed) return
    if(object.mod().relativeId) {
      attachToRelative(object)
    }
    if(object.subObjects) {
      attachSubObjects(object, object.subObjects)
    }
  })

  allHeros.forEach((hero) => {
    if(hero.removed) return
    if(hero.mod().relativeId) {
      attachToRelative(hero)
    }
    if(hero.subObjects) {
      attachSubObjects(hero, hero.subObjects)
    }
  })
}

function processAwarenessAndWithinEvents(object) {
  if(object.mod().subObjects && object.mod().subObjects.awarenessTriggerArea) {
    if(object._objectsAwareOf) {
      const left = object._objectsAwareOf.filter((id) => {
        return object._objectsAwareOfNext.indexOf(id) == -1
      })
      const entered = object._objectsAwareOfNext.filter((id) => {
        return object._objectsAwareOf.indexOf(id) == -1
      })

      left.forEach((objectLeftId) => {
        const objectLeft = OBJECTS.getObjectOrHeroById(objectLeftId)
        if(object.tags && object.tags.hero) {
          window.emitGameEvent('onHeroUnaware', object, objectLeft)
        } else {
          window.emitGameEvent('onObjectUnaware', object, objectLeft)
        }
      })
      entered.forEach((objectEnteredId) => {
        const objectEntered = OBJECTS.getObjectOrHeroById(objectEnteredId)
        if(object.tags && object.tags.hero) {
          window.emitGameEvent('onHeroAware', object, objectEntered)
        } else {
          window.emitGameEvent('onObjectAware', object, objectEntered)
        }
      })
    }
    object._objectsAwareOf = object._objectsAwareOfNext
  }

  if(object.mod().tags.trackObjectsWithin && object._objectsWithin) {
    const left = object._objectsWithin.filter((id) => {
      return object._objectsWithinNext.indexOf(id) == -1
    })
    const entered = object._objectsWithinNext.filter((id) => {
      return object._objectsWithin.indexOf(id) == -1
    })

    left.forEach((objectLeftId) => {
      const objectLeft = OBJECTS.getObjectOrHeroById(objectLeftId)
      if(objectLeft.tags && objectLeft.tags.hero) {
        window.emitGameEvent('onHeroLeave', objectLeft, object)
      } else {
        window.emitGameEvent('onObjectLeave', objectLeft, object)
      }
    })
    entered.forEach((objectEnteredId) => {
      const objectEntered = OBJECTS.getObjectOrHeroById(objectEnteredId)
      if(objectEntered.tags && objectEntered.tags.hero) {
        window.emitGameEvent('onHeroEnter', objectEntered, object)
      } else {
        window.emitGameEvent('onObjectEnter', objectEntered, object)
      }
    })
  }

  object._objectsWithin = object._objectsWithinNext
}


function removeAndRespawn() {
  let allHeros = getAllHeros()
  allHeros.forEach((hero) => {

    if(hero._destroy) {
      if(hero.mod().tags.respawn) {
        hero._respawn = true
      } else hero._remove = true
      delete hero._destroy
      delete hero._destroyedBy
      window.emitGameEvent('onHeroDestroyed', {...hero, interactableObject: null, interactableObjectResult: null }, hero._destroyedBy)
    }

    if(hero._respawn) {
      HERO.respawn(hero)
      delete hero._respawn
    }
    if(hero._remove) {
      hero.removed = true
      HERO.removeHero(hero)
      delete hero._remove
    }

    if(hero.subObjects) {
      Object.keys(hero.subObjects).forEach((subObjectName) => {
        const subObject = hero.subObjects[subObjectName]
        processSubObjectRemoval(subObject)
      })
    }
  })

  GAME.objects.forEach(processObjectRemoval)
}

function processSubObjectRemoval(object) {
  if(object._destroy) {
    object._remove = true
    delete object._destroy
    delete object._destroyedBy
    window.emitGameEvent('onObjectDestroyed', object, object._destroyedBy)
  }

  if(object._remove) {
    object.removed = true
    delete object._remove
  }
}

function processObjectRemoval(object) {
  if(object._destroy) {
    if(object.mod().tags.respawn) {
      object._respawn = true
    } else object._remove = true
    delete object._destroy
    delete object._destroyedBy
    window.emitGameEvent('onObjectDestroyed', object, object._destroyedBy)
  }

  if(object._respawn) {
    OBJECTS.respawn(object)
    delete object._respawn
  }
  if(object._remove) {
    object.removed = true
    OBJECTS.removeObject(object)
    delete object._remove
  }

  if(object.subObjects) {
    Object.keys(object.subObjects).forEach((subObjectName) => {
      const subObject = object.subObjects[subObjectName]
      processSubObjectRemoval(subObject)
    })
  }
}

export default {
  postPhysics,
  correctAndEffectAllObjectAndHeros,
  updatePosition,
  prepareObjectsAndHerosForMovementPhase,
}

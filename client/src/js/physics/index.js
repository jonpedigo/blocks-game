import { Collisions } from 'collisions';
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
}

function correctAndEffectAllObjectAndHeros (delta) {
  // update physics system
  let removeObjects = []
  let respawnObjects = []
  prepareObjectsAndHerosForCollisionsPhase()
  heroPhysics(removeObjects, respawnObjects)
  objectPhysics(removeObjects, respawnObjects)
  postPhysics(removeObjects, respawnObjects)
  removeAndRespawn(removeObjects, respawnObjects)
}

function updatePosition(object, delta) {
  if(object.removed || object.relativeId) return

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

  let gravityVelocityY = GAME.world.gravityVelocityY
  if(!gravityVelocityY) gravityVelocityY = 1000

  if(object._skipNextGravity) {
    object._skipNextGravity = false
  } else if(object.tags && object.tags.gravityY) {
    let distance = (object.velocityY * delta) +  ((gravityVelocityY * (delta * delta))/2)
    object.y += distance
    object.velocityY += (gravityVelocityY * delta)
  }

  if(object.velocityY) {
    if(object.velocityY >= object.velocityMax) {
      object.velocityY = object.velocityMax
    }
    else if(object.velocityY <= object.velocityMax * -1) {
      object.velocityY = object.velocityMax * -1
    }

    if(object.tags && !object.tags.gravityY) {
      object.y += object.velocityY * delta
    }
  }

  if(object.tags && object.tags['stationary']) {
    object.velocityY = 0
    object.velocityX = 0
    object.accY = 0
    object.accX = 0
    object.x = object._initialX
    object.y = object._initialY
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

  everything.forEach((object, i) => {
    object._deltaX = 0
    object._deltaY = 0
    object._parentId = null
    object._initialX = object.x
    object._initialY = object.y
    object.interactableObject = null
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
        subObject.ownerId = object.id
        everything.push(subObject)
      })
    }
  })

  everything.forEach((object, i) => {
    if(!object.id) {
      console.log('OBJECT', object, 'WITHOUT ID')
      return
    }

    if(!PHYSICS.objects[object.id]) {
      console.log('physics object not found for id: ' + object.id)
      return
    }

    let physicsObject = PHYSICS.objects[object.id]
    physicsObject.x = object.x
    physicsObject.y = object.y
    physicsObject.id = object.id
    physicsObject.gameObject = object

    if(Math.floor(Math.abs(object.width)) !== Math.floor(Math.abs(physicsObject._max_x - physicsObject._min_x)) || Math.floor(Math.abs(object.height)) !== Math.floor(Math.abs(physicsObject._max_y - physicsObject._min_y))) {
      physicsObject.setPoints([ [ 0, 0], [object.width, 0], [object.width, object.height] , [0, object.height]])
    }
  })

  system.update()
}

function heroPhysics(removeObjects, respawnObjects) {
  let allHeros = getAllHeros()
  allHeros.forEach((hero) => {
    heroCollisionEffects(hero, removeObjects, respawnObjects)
    if(hero.relativeId) return
    heroCorrection(hero, removeObjects, respawnObjects)
  })
}

function objectPhysics(removeObjects, respawnObjects) {
  for(let id in PHYSICS.objects){
    let po = PHYSICS.objects[id]
    // console.log(po)
    if(!po.gameObject) {
      if(PHYSICS.debug) console.log('no game object found for phyics object id: ' + id)
      continue
    }
    if(po.gameObject.removed) continue
    if(po.gameObject.tags.hero) continue
    objectCollisionEffects(po, removeObjects, respawnObjects)
  }

  correctionPhase()
  system.update()
  correctionPhase(true)

  function correctionPhase(final = false) {
    for(let id in PHYSICS.objects){
      let po = PHYSICS.objects[id]
      if(!po.gameObject) continue
      if(po.gameObject.relativeId) continue
      if(po.gameObject.removed) continue
      if(po.gameObject.tags.hero) continue
      objectCorrection(po, final)
    }
  }
}

function postPhysics(removeObjects, respawnObjects) {
  let allHeros = getAllHeros()
  // GET DELTA
  allHeros.forEach((hero) => {
    if(hero.removed) return
    if(hero.interactableObject) {
      let input = GAME.heroInputs[hero.id]
      // INTERACT WITH SMALLEST OBJECT
      window.local.emit('onObjectInteractable', hero.interactableObject, hero, hero.interactableObjectResult, removeObjects, respawnObjects)
      if(input && 88 in input) {
        window.local.emit('onHeroInteract', hero, hero.interactableObject, hero.interactableObjectResult, removeObjects, respawnObjects)
      }
      // bad for JSON
      delete hero.interactableObjectResult
    }
  })

  // NON CHILD GO FIRST
  GAME.objects.forEach((object, i) => {
    if(object.removed) return
    if(!object.parentId && !object._parentId) {
      attachToParent(object)
      containObjectWithinGridBoundaries(object)
      object._deltaX = object.x - object._initialX
      object._deltaY = object.y - object._initialY
    }
  })

  allHeros.forEach((hero) => {
    if(hero.removed) return
    if(!hero.parentId && !hero._parentId) {
      attachToParent(hero)
      containObjectWithinGridBoundaries(hero)
      hero._deltaX = hero.x - hero._initialX
      hero._deltaY = hero.y - hero._initialY
    }
  })


  // THEN ATTACH CHILDREN OBJECTS TO PARENT
  GAME.objects.forEach((object, i) => {
    if(object.removed) return
    if(object.parentId || object._parentId ) {
      attachToParent(object)
      containObjectWithinGridBoundaries(object)
    }
  })

  allHeros.forEach((hero) => {
    if(hero.removed) return
    if(hero.parentId || hero._parentId ) {
      attachToParent(hero)
      containObjectWithinGridBoundaries(hero)
    }
  })


  // ATTACH OBJECTS THAT ARE SEPERATE FROM BOUNDARIES
  GAME.objects.forEach((object, i) => {
    if(object.removed) return
    if(object.relativeId) {
      attachToRelative(object)
    }
    if(object.subObjects) {
      attachSubObjects(object, object.subObjects)
    }
  })

  allHeros.forEach((hero) => {
    if(hero.removed) return
    if(hero.relativeId) {
      attachToRelative(hero)
    }
    if(hero.subObjects) {
      attachSubObjects(hero, hero.subObjects)
    }
  })
}

function removeAndRespawn(removeObjects, respawnObjects) {
  removeObjects.forEach((gameObject) => {
    // remove locally first
    gameObject.removed = true
    if(gameObject.tags.hero) {
      HERO.removeHero(gameObject)
    } else {
      OBJECTS.removeObject(gameObject)
    }
  })

  respawnObjects.forEach((gameObject) => {
    if(gameObject.id.indexOf('hero') > -1) {
      HERO.respawn(gameObject)
    } else if(gameObject.spawnPointX >= 0){
      OBJECTS.respawn(gameObject)
    }
  })
}

export default {
  postPhysics,
  correctAndEffectAllObjectAndHeros,
  updatePosition,
  prepareObjectsAndHerosForMovementPhase,
}

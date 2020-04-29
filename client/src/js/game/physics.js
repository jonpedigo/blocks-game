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

import heroTool from './hero.js'

const objects = {}

// Create the collision system
const system = new Collisions()
window.PHYSICS = {
  addObject,
  removeObject,
  system,
  objects,
}

function update (delta) {
  // update physics system
  system.update()
  let removeObjects = []
  let respawnObjects = []
  prepareObjectsAndHerosForCollisionsPhase(),
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

  if(object.tags && object.tags.gravity) {
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

    if(object._skipNextGravity) {
      object._skipNextGravity = false
    } else if(object.tags && !object.tags.gravity) {
      object.y += object.velocityY * delta
    }
  }
}

function getAllHeros() {
  let allHeros = Object.keys(w.game.heros).reduce((prev, id) => {
    if(id === 'ghost') return prev
    prev.push(w.game.heros[id])
    return prev
  }, [])
  return allHeros
}

function prepareObjectsAndHerosForMovementPhase() {
  // set objects new position and widths
  let everything = [...w.game.objects]
  let allHeros = getAllHeros()
  everything.push(...allHeros)

  everything.forEach((object, i) => {
    object._deltaX = 0
    object._deltaY = 0
    object._parentId = null
    object._initialX = object.x
    object._initialY = object.y
    object._interactableObject = null
  })
}

function prepareObjectsAndHerosForCollisionsPhase() {
  // set objects new position and widths
  let everything = [...w.game.objects]
  let allHeros = getAllHeros()
  everything.push(...allHeros)
  everything.forEach((object) => {
    if(object.subObjects) {
      window.forAllSubObjects(object.subObjects, (subObject) => {
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
}

function heroPhysics(removeObjects, respawnObjects) {
  let allHeros = getAllHeros()
  allHeros.forEach((hero) => {
    heroCollisionEffects(hero, removeObjects, respawnObjects)
    if(hero.relativeId) return
    heroCorrection(hero)
  })
}

function objectPhysics(removeObjects, respawnObjects) {
  for(let id in PHYSICS.objects){
    let po = PHYSICS.objects[id]
    // console.log(po)
    if(!po.gameObject) {
      console.log('no game object found for phyics object id: ' + id)
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
  w.game.objects.forEach((object, i) => {
    if(object.removed) return
    object._deltaX = object.x - object._initialX
    object._deltaY = object.y - object._initialY
  })

  allHeros.forEach((hero) => {
    if(hero.removed) return
    if(hero._interactableObject) {
      let input = window.heroInput[hero.id]
      // INTERACT WITH SMALLEST OBJECT
      window.local.emit('onObjectInteractable', hero._interactableObject, hero, hero._interactableObjectResult, removeObjects, respawnObjects)
      if(input && 88 in input) {
        /// DEFAULT GAME FX
        if(window.defaultCustomGame) {
          window.defaultCustomGame.onHeroInteract(hero, hero._interactableObject, hero._interactableObjectResult, removeObjects, respawnObjects)
        }

        /// CUSTOM GAME FX
        if(window.customGame) {
          window.customGame.onHeroInteract(hero, hero._interactableObject, hero._interactableObjectResult, removeObjects, respawnObjects)
        }

        /// LIVE CUSTOM GAME FX
        if(window.liveCustomGame) {
          window.liveCustomGame.onHeroInteract(hero, hero._interactableObject, hero._interactableObjectResult, removeObjects, respawnObjects)
        }

        heroTool.onCollide(hero, hero._interactableObject, hero._interactableObjectResult, removeObjects, respawnObjects, { fromInteractButton: true })
      }
      // bad for JSON
      delete hero._interactableObjectResult
    }
    hero._deltaX = hero.x - hero._initialX
    hero._deltaY = hero.y - hero._initialY
  })


  // ATTACH TO PARENT AND CONTAIN WITHIN BOUNDARIES
  w.game.objects.forEach((object, i) => {
    if(object.removed) return
    if(object.parentId || object._parentId ) {
      attachToParent(object)
    }
    containObjectWithinGridBoundaries(object)
  })

  allHeros.forEach((hero) => {
    if(hero.removed) return
    if(hero.parentId || hero._parentId ) {
      attachToParent(hero)
    }
    containObjectWithinGridBoundaries(hero)
  })


  // ATTACH OBJECTS THAT ARE SEPERATE FROM BOUNDARIES
  w.game.objects.forEach((object, i) => {
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
    window.local.emit('onRemoveObject', gameObject)
    window.socket.emit('removeObject', gameObject)
  })

  respawnObjects.forEach((gameObject) => {
    if(gameObject.id.indexOf('hero') > -1) {
      window.respawnHero(gameObject)
      window.socket.emit('updateHeroPos', gameObject)
      window.local.emit('onRespawnHero', gameObject)
    } else if(gameObject.spawnPointX >= 0){
      window.respawnObject(gameObject)
      window.local.emit('onRespawnObject', gameObject)
    } else {
      window.local.emit('onDeleteObject', gameObject)
      window.socket.emit('deleteObject', gameObject)
    }
  })
}

export default {
  update,
  updatePosition,
  prepareObjectsAndHerosForMovementPhase,
}

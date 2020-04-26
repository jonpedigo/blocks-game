import { Collisions, Polygon } from 'collisions';
import intelligence from './intelligence'
import collisions from './collisions';
import heroTool from './hero';

const physicsObjects = {}
window.physicsObjects = physicsObjects

// Create the collision system
const system = new Collisions()

// Create a Result object for collecting information about the collisions
let result = system.createResult()

// function lerpObject(object, delta) {
//   if(object._lerpX) {
//     let diffX = Math.abs(object.x - object._lerpX)
//     let speed = diffX * 10
//     if(speed < 100) speed = 100
//     if(diffX < 2) {
//       object.x = object._lerpX
//       delete object._lerpX
//     } else if(object.x > object._lerpX) {
//       object.x -= speed * delta
//     } else if(object.x < object._lerpX) {
//       object.x += speed * delta
//     }
//   }
//
//   if(object._lerpY) {
//     let diffY = Math.abs(object.y - object._lerpY)
//     let speed = diffY * 10
//     if(speed < 20) speed = 20
//     if(diffY < 2) {
//       object.y = object._lerpY
//       delete object._lerpY
//     } if(object.y > object._lerpY) {
//       object.y -= speed * delta
//     } else if(object.y < object._lerpY) {
//       object.y += speed * delta
//     }
//   }
// }

function updatePosition(object, delta) {
  if(object.removed) return

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

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
// HERO CORRECTIONS
/////////////////////////////////////////////////////
function heroCorrection(hero) {
  hero.onGround = false

  system.update()
  heroCorrectionPhase(false, 1)
  system.update()
  heroCorrectionPhase(false, 2)
  system.update()
  heroCorrectionPhase(true, 3)
  system.update()

  function heroCorrectionPhase(final = false, round) {
    const potentials = physicsObjects[hero.id].potentials()
    let illegal = false
    let landingObject = null
    let heroPO = physicsObjects[hero.id]
    let corrections = []
    for(const body of potentials) {
      if(!body.gameObject) {
        console.log('missing game object on body', body)
        continue
      }
      if(body.gameObject.removed) continue
      let result = physicsObjects[hero.id].createResult()
      if(heroPO.collides(body, result)) {
        if((body.gameObject.tags['obstacle'] && !body.gameObject.tags['heroPushable']) || body.gameObject.tags['noHeroAllowed']) {
          illegal = true
          // console.log(result.collision, result.overlap, result.overlap_x, result.overlap_y)
          corrections.push(result)
          if(result.overlap_y === 1) {
            if(body.gameObject.tags.movingPlatform) {
              landingObject = body
            }
          }
          // console.log('collided' + body.gameObject.id, hero.x - correction.x, hero.y - correction.y)
        }
      }
    }

    if(illegal) {
      let result = corrections.reduce((acc, next) => {
        if(Math.abs(next.overlap_y) !== 0 && acc.overlap_y == 0) {
          acc.overlap_y = next.overlap * next.overlap_y
        }
        if(Math.abs(next.overlap_x) !== 0 && acc.overlap_x == 0) {
          acc.overlap_x = next.overlap * next.overlap_x
        }
        return acc
      }, { overlap_y: 0, overlap_x: 0 })

      function correctHeroY() {
        if(result.overlap_y > 0) {
          hero.onGround = true
          if(landingObject && landingObject.gameObject.tags['movingPlatform']) {
            hero._parentId = landingObject.gameObject.id
            hero._skipNextGravity = true
          } else {
            if(hero.velocityY > 0) hero.velocityY = 0
          }
        } else if(result.overlap_y < 0){
          if(hero.velocityY < 0) hero.velocityY = 0
        }
        heroPO.y -= result.overlap_y
      }

      function correctHeroX() {
        if(result.overlap_x > 0) {
          hero.velocityX = 0
        } else if(result.overlap_x < 0){
          hero.velocityX = 0
        }
        heroPO.x -= result.overlap_x
      }

      // there was a problem with a double object collision. One Would
      // collide with X, one would collide with Y but both corrections were made,
      // even though one correction would have concelled out the other..
      // it was hard to tell which correction to prioritize. Basically now
      // I prioritize the correction that DOES NOT IMPEDE the heros current direction
      if(round === 1) {
        if(hero.directions.up || hero.directions.down) {
          correctHeroX()
        } else if(hero.directions.left || hero.directions.right) {
          correctHeroY()
        }
      } else {
        correctHeroX()
        correctHeroY()
      }
    }

    if(final) {

      hero.directions = {...window.defaultHero.directions}
      // just give up correction and prevent any movement from these mother fuckers
      if(illegal) {
        hero.x = hero._initialX
        hero.y = hero._initialY
        heroPO.x = hero._initialX
        heroPO.y = hero._initialY
      } else {
        if(heroPO.x > hero._initialX) {
          hero.directions.right = true
        } else if(heroPO.x < hero._initialX) {
          hero.directions.left = true
        }
        if(heroPO.y > hero._initialY) {
          hero.directions.down = true
        } else if(heroPO.y < hero._initialY) {
          hero.directions.up = true
        }

        hero.x = heroPO.x
        hero.y = heroPO.y
      }
    }
  }
}

function heroCollisionEffects(hero, removeObjects, respawnObjects) {
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  // HERO EFFECTS ON COLLISION
  /////////////////////////////////////////////////////
  const result = physicsObjects[hero.id].createResult()
  const potentials = physicsObjects[hero.id].potentials()
  let illegal = false
  let correction = {x: hero.x, y: hero.y}
  let heroPO = physicsObjects[hero.id]
  for(const body of potentials) {
    if(!body.gameObject) {
      console.log('missing game object on body', body)
      continue
    }
    if(body.gameObject.removed) continue
    if(heroPO.collides(body, result)) {
      heroTool.onCollide(heroPO.gameObject, body.gameObject, result, removeObjects, respawnObjects)
    }
  }

  // in case there was respawns or something
  heroPO.x = hero.x
  heroPO.y = hero.y
}


function containObjectWithinGridBoundaries(object) {

  // FOR ZOOM IN PURGATORY, PURGATORY ONLY SUPPORTS 1 PLAYER RIGHT NOW
  let hero = window.hero
  if(window.usePlayEditor) {
    hero = window.editingHero
  }

  //DO THE PACMAN FLIP!!
  let gameBoundaries = w.game.world.gameBoundaries
  if(gameBoundaries && gameBoundaries.x >= 0) {
    let objectToEdit = object
    if(object.tags.fresh) {
      objectToEdit = JSON.parse(JSON.stringify(object))
    }

    if(gameBoundaries.behavior === 'purgatory' && object.id.indexOf('hero') == -1 && (hero && hero.id)) {
      let legal = true
      if(objectToEdit.x + objectToEdit.width > gameBoundaries.x + gameBoundaries.width - ((window.CONSTANTS.PLAYER_CAMERA_WIDTH * hero.zoomMultiplier)/2 )) {
        objectToEdit.x = gameBoundaries.x + gameBoundaries.width - objectToEdit.width - (window.CONSTANTS.PLAYER_CAMERA_WIDTH * hero.zoomMultiplier)/2
        legal = false
      }
      if(objectToEdit.y + objectToEdit.height > gameBoundaries.y + gameBoundaries.height - ((window.CONSTANTS.PLAYER_CAMERA_HEIGHT * hero.zoomMultiplier)/2 )) {
        objectToEdit.y = gameBoundaries.y + gameBoundaries.height - objectToEdit.height - ((window.CONSTANTS.PLAYER_CAMERA_HEIGHT * hero.zoomMultiplier)/2 )
        legal = false
      }
      if(objectToEdit.x < gameBoundaries.x + ((window.CONSTANTS.PLAYER_CAMERA_WIDTH * hero.zoomMultiplier)/2)) {
        objectToEdit.x = gameBoundaries.x + ((window.CONSTANTS.PLAYER_CAMERA_WIDTH * hero.zoomMultiplier)/2)
        legal = false
      }
      if(objectToEdit.y < gameBoundaries.y + ((window.CONSTANTS.PLAYER_CAMERA_HEIGHT * hero.zoomMultiplier)/2)) {
        objectToEdit.y = gameBoundaries.y + ((window.CONSTANTS.PLAYER_CAMERA_HEIGHT * hero.zoomMultiplier)/2)
        legal = false
      }
      if(legal && object.tags.fresh){
        object.tags.fresh = false
        object.path = null
      }
    } else if(gameBoundaries.behavior === 'pacmanFlip' || (gameBoundaries.behavior === 'purgatory' && object.id.indexOf('hero') > -1)) {
      let legal = true
      if(objectToEdit.x < gameBoundaries.x - objectToEdit.width) {
        objectToEdit.x = gameBoundaries.x + gameBoundaries.width
        legal = false
      }
      if (objectToEdit.x > gameBoundaries.x + gameBoundaries.width) {
        objectToEdit.x = gameBoundaries.x - objectToEdit.width
        legal = false
      }
      if(objectToEdit.y < gameBoundaries.y - objectToEdit.height) {
        objectToEdit.y = gameBoundaries.y + gameBoundaries.height
        legal = false
      }
      if (objectToEdit.y > gameBoundaries.y + gameBoundaries.height) {
        objectToEdit.y = gameBoundaries.y - objectToEdit.height
        legal = false
      }
      if(legal && object.tags.fresh){
        object.tags.fresh = false
        object.path = null
      }
    } else if(gameBoundaries.behavior == 'boundaryAll' || objectToEdit.id.indexOf('hero') > -1){
      let legal = true
      //CONTAIN WITHIN BOUNDARIES OF THE GAME BOUNDARY PREF!!
      if(objectToEdit.x + objectToEdit.width > gameBoundaries.x + gameBoundaries.width) {
        objectToEdit.x = gameBoundaries.x + gameBoundaries.width - objectToEdit.width
        legal = false
      }
      if(objectToEdit.y + objectToEdit.height > gameBoundaries.y + gameBoundaries.height) {
        objectToEdit.y = gameBoundaries.y + gameBoundaries.height - objectToEdit.height
        legal = false
      }
      if(objectToEdit.x < gameBoundaries.x) {
        objectToEdit.x = gameBoundaries.x
        legal = false
      }
      if(objectToEdit.y < gameBoundaries.y) {
        objectToEdit.y = gameBoundaries.y
        legal = false
      }

      if(legal && object.tags.fresh){
        object.tags.fresh = false
        object.path = null
      }
    }
  }

  //ALWAYS CONTAIN WITHIN BOUNDARIES OF THE GRID!!
  if(object.x + object.width > (w.game.grid.nodeSize * w.game.grid.width) + w.game.grid.startX) {
    object.x = (w.game.grid.nodeSize * w.game.grid.width) + w.game.grid.startX - object.width
  }
  if(object.y + object.height > (w.game.grid.nodeSize * w.game.grid.height) + w.game.grid.startY) {
    object.y = (w.game.grid.nodeSize * w.game.grid.height) + w.game.grid.startY - object.height
  }
  if(object.x < w.game.grid.startX) {
    object.x = w.game.grid.startX
  }
  if(object.y < w.game.grid.startY) {
    object.y = w.game.grid.startY
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
  })
}

function prepareObjectsAndHerosForCollisionsPhase() {
  // set objects new position and widths
  let everything = [...w.game.objects]
  let allHeros = getAllHeros()
  everything.push(...allHeros)

  everything.forEach((object, i) => {
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
    physicsObject.gameObject = object

    if(Math.floor(Math.abs(object.width)) !== Math.floor(Math.abs(physicsObject._max_x - physicsObject._min_x)) || Math.floor(Math.abs(object.height)) !== Math.floor(Math.abs(physicsObject._max_y - physicsObject._min_y))) {
      physicsObject.setPoints([ [ 0, 0], [object.width, 0], [object.width, object.height] , [0, object.height]])
    }
  })
}


function objectCorrections(po, final, options = { bypassHero: false }) {
  // if you are creating a result up here youll only be able to correct for one obj at a time
  // if you are accumulating the result like for the hero
  let result = po.createResult()
  let correction = {x: po.x, y: po.y}
  let potentials = po.potentials()
  let illegal = false
  for(const body of potentials) {
    if(!body.gameObject) {
      console.log('missing game object on body', body)
      continue
    }

    if(body.gameObject.removed || (options.bypassHero && body.gameObject.id.indexOf('hero') >= 0)) continue
    if(po.collides(body, result)) {
      // OK onlyHeroAllowed basically acts as a SAFE ZONE for now
      if(po.gameObject.tags['monster'] && body.gameObject.tags && body.gameObject.tags['onlyHeroAllowed']) {
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

      // objects with NO path but SOME velocity get corrections
      if(po.gameObject.tags && po.gameObject.tags['obstacle'] && body.gameObject.tags && body.gameObject.tags['obstacle'] && !po.gameObject.tags['stationary'] && !po.gameObject.path && (po.gameObject.velocityY > 0 || po.gameObject.velocityX > 0)) {
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

      if(po.gameObject.tags && po.gameObject.tags['heroPushable'] && body.gameObject.tags && body.gameObject.tags['hero'] && !po.gameObject.tags['stationary']) {
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
    if(result.overlap_y === 1) {
      po.gameObject.velocityY = 0
      po.gameObject.onGround = true
    } else if(result.overlap_y === -1){
      po.gameObject.velocityY = 0
    }
    if(result.overlap_x === 1) {
      po.gameObject.velocityX = 0
    } else if(result.overlap_x === -1){
      po.gameObject.velocityX = 0
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

function updateCorrections() {
  system.update()
  // heros
  let allHeros = getAllHeros()
  allHeros.forEach((hero) => {
    heroCorrection(hero)
  })

  // objects
  correctionPhase()
  system.update()
  correctionPhase(true)
  function correctionPhase(final = false) {
    for(let id in physicsObjects){
      let po = physicsObjects[id]
      if(po.gameObject.removed) continue
      if(id.indexOf('hero') > -1) continue
      objectCorrections(po, final)
    }
  }

  // parents and boundaries
  w.game.objects.forEach((object, i) => {
    if(object.removed) return
    if(object.parentId || object._parentId) {
      attachToParent(object)
    }
    containObjectWithinGridBoundaries(object)
  })

  allHeros.forEach((hero) => {
    if(hero.parentId || hero._parentId ) {
      attachToParent(hero)
    }
    containObjectWithinGridBoundaries(hero)
  })
}

function update (delta) {
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
  let removeObjects = []
  let respawnObjects = []

  let allHeros = Object.keys(w.game.heros).map((id) => {
    return w.game.heros[id]
  })
  allHeros.forEach((hero) => {
    heroCollisionEffects(hero, removeObjects, respawnObjects)
    // if(hero.parentId) return
    heroCorrection(hero)
  })

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  // OBJECTS COLLIDING WITH OTHER OBJECTS
  /////////////////////////////////////////////////////
  for(let id in physicsObjects){
    if(id.indexOf('hero') > -1) continue
    let po = physicsObjects[id]
    // console.log(po)
    if(po.gameObject.removed) continue
    let potentials = po.potentials()
    let result = po.createResult()
    // po VS body. the po is the one you should EFFECT
    for(const body of potentials) {
      if(!body.gameObject) {
        console.log('missing game object on body', body)
        continue
      }
      if(body.gameObject.removed) continue
      if(po.collides(body, result)) {
        if(body.gameObject.tags['objectUpdate'] && body.gameObject.objectUpdate && collisions.shouldEffect(po.gameObject, body.gameObject)) {
          if(po.gameObject.lastPowerUpId !== body.gameObject.id) {
            window.mergeDeep(po.gameObject, {...body.gameObject.objectUpdate})
            po.gameObject.lastPowerUpId = body.gameObject.id
          }
        } else {
          po.gameObject.lastPowerUpId = null
        }

        let hero = window.hero
        if(window.usePlayEditor) hero = window.editingHero
        /// DEFAULT GAME FX
        if(window.defaultCustomGame) {
          window.defaultCustomGame.onCollide(po.gameObject, body.gameObject, result, removeObjects, respawnObjects, hero)
        }

        /// CUSTOM GAME FX
        if(window.customGame) {
          window.customGame.onCollide(po.gameObject, body.gameObject, result, removeObjects, respawnObjects, hero)
        }

        /// LIVE CUSTOM GAME FX
        if(window.liveCustomGame) {
          window.liveCustomGame.onCollide(po.gameObject, body.gameObject, result, removeObjects, respawnObjects, hero)
        }
      }
    }
  }

  correctionPhase()
  system.update()
  correctionPhase(true)

  function correctionPhase(final = false) {
    for(let id in physicsObjects){
      let po = physicsObjects[id]
      // if(po.gameObject.parentId) continue
      if(po.gameObject.removed) continue
      if(id.indexOf('hero') > -1) continue
      objectCorrections(po, final)
    }
  }

  removeObjects.forEach((gameObject) => {
    // remove locally first
    gameObject.removed = true
    window.socket.emit('removeObject', gameObject)
  })

  respawnObjects.forEach((gameObject) => {
    if(gameObject.id.indexOf('hero') > -1) {
      window.respawnHero(gameObject)
      window.socket.emit('updateHeroPos', gameObject)
    } else if(gameObject.spawnPointX >= 0){
      window.respawnObject(gameObject)
    } else {
      window.socket.emit('deleteObject', gameObject)
    }
  })

  w.game.objects.forEach((object, i) => {
    if(object.removed) return
    containObjectWithinGridBoundaries(object)
    object._deltaX = object.x - object._initialX
    object._deltaY = object.y - object._initialY
  })

  allHeros.forEach((hero) => {
    if(hero.removed) return
    containObjectWithinGridBoundaries(hero)
    hero._deltaX = hero.x - hero._initialX
    hero._deltaY = hero.y - hero._initialY
  })

  w.game.objects.forEach((object, i) => {
    if(object.removed) return
    if(object.parentId || object._parentId ) {
      attachToParent(object)
    }
  })

  allHeros.forEach((hero) => {
    if(hero.removed) return
    if(hero.parentId || hero._parentId ) {
      attachToParent(hero)
    }
  })
}


function attachToParent(object) {
  let parent = w.game.objectsById[object.parentId] || w.game.heros[object.parentId]

  if(parent) {
    object.x += parent._deltaX
    object.y += parent._deltaY
  } else delete object.parentId

  //// idk temporary parentId
  parent = w.game.objectsById[object._parentId] || w.game.heros[object._parentId]
  if(parent) {
    object.x += parent._deltaX
    object.y += parent._deltaY
  } else delete object._parentId


  // let relative = w.game.objectsById[object.relativeId] || w.game.heros[object.relativeId]

  // if(relative) {
  //   object.x += relative._deltaX
  //   object.y += relative._deltaY
  // } else delete object.relativeId
  //
  // //// idk temporary relativeId
  // relative = w.game.objectsById[object._relativeId] || w.game.heros[object._relativeId]
  // if(parent) {
  //   object.x += parent._deltaX
  //   object.y += parent._deltaY
  // } else delete object._relativeId
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
  if(physicsObjects[object.id]) return console.log("we already have added a physics object with id " + object.id)
  const physicsObject = new Polygon(object.x, object.y, [ [ 0, 0], [object.width, 0], [object.width, object.height] , [0, object.height]])
  system.insert(physicsObject)
  physicsObjects[object.id] = physicsObject
  return physicsObject
}

function removeObject(object) {
  try {
    system.remove(physicsObjects[object.id])
    delete physicsObjects[object.id];
  } catch(e) {
    console.error(e)
  }
}

function removeObjectById(id) {
  try {
    system.remove(physicsObjects[id])
    delete physicsObjects[id];
  } catch(e) {
    console.error(e)
  }
}

export default {
  addObject,
  drawObject,
  drawSystem,
  removeObject,
  removeObjectById,
  updatePosition,
  update,
  updateCorrections,
  heroCorrection,
  containObjectWithinGridBoundaries,
  prepareObjectsAndHerosForCollisionsPhase,
  prepareObjectsAndHerosForMovementPhase,
  // lerpObject,
}

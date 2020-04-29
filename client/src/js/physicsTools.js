import { Polygon } from 'collisions';
import collisions from './collisions';
import heroTool from './hero';

// Create a Result object for collecting information about the collisions
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

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
// HERO CORRECTIONS
/////////////////////////////////////////////////////
function heroCorrection(hero) {
  hero.onGround = false

  PHYSICS.system.update()
  heroCorrectionPhase(false, 1)
  PHYSICS.system.update()
  heroCorrectionPhase(false, 2)
  PHYSICS.system.update()
  heroCorrectionPhase(true, 3)
  PHYSICS.system.update()

  function heroCorrectionPhase(final = false, round) {
    const potentials = PHYSICS.objects[hero.id].potentials()
    let illegal = false
    let landingObject = null
    let heroPO = PHYSICS.objects[hero.id]
    let corrections = []
    for(const body of potentials) {
      if(!body.gameObject) {
        console.log('missing game object on body', body)
        continue
      }
      if(body.gameObject.removed) continue
      let result = PHYSICS.objects[hero.id].createResult()
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
          if(landingObject) window.local.emit('onHeroLand', hero, landingObject.gameObject, result, removeObjects, respawnObject)
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
  const result = PHYSICS.objects[hero.id].createResult()
  const potentials = PHYSICS.objects[hero.id].potentials()
  let illegal = false
  let correction = {x: hero.x, y: hero.y}
  let heroPO = PHYSICS.objects[hero.id]
  for(const body of potentials) {
    if(!body.gameObject) {
      console.log('missing game object on body', body)
      continue
    }
    if(body.gameObject.removed) continue
    if(body.gameObject.tags['requireActionButton']) continue
    if(heroPO.collides(body, result)) {
      heroTool.onCollide(heroPO.gameObject, body.gameObject, result, removeObjects, respawnObjects)
      /// DEFAULT GAME FX
      if(window.defaultCustomGame) {
        window.defaultCustomGame.onHeroCollide(heroPO.gameObject, body.gameObject, result, removeObjects, respawnObjects)
      }

      /// CUSTOM GAME FX
      if(window.customGame) {
        window.customGame.onHeroCollide(heroPO.gameObject, body.gameObject, result, removeObjects, respawnObjects)
      }

      /// LIVE CUSTOM GAME FX
      if(window.liveCustomGame) {
        window.liveCustomGame.onHeroCollide(heroPO.gameObject, body.gameObject, result, removeObjects, respawnObjects)
      }
    }
  }

  // in case there was respawns or something
  heroPO.x = hero.x
  heroPO.y = hero.y
}


function containObjectWithinGridBoundaries(object) {

  // FOR ZOOM IN PURGATORY, PURGATORY ONLY SUPPORTS 1 PLAYER RIGHT NOW
  let hero = window.hero
  if(role.isPlayEditor) {
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
      if(objectToEdit.x + objectToEdit.width > gameBoundaries.x + gameBoundaries.width - ((window.playerCameraWidth * hero.zoomMultiplier)/2 )) {
        objectToEdit.x = gameBoundaries.x + gameBoundaries.width - objectToEdit.width - (window.playerCameraWidth * hero.zoomMultiplier)/2
        legal = false
      }
      if(objectToEdit.y + objectToEdit.height > gameBoundaries.y + gameBoundaries.height - ((window.playerCameraHeight * hero.zoomMultiplier)/2 )) {
        objectToEdit.y = gameBoundaries.y + gameBoundaries.height - objectToEdit.height - ((window.playerCameraHeight * hero.zoomMultiplier)/2 )
        legal = false
      }
      if(objectToEdit.x < gameBoundaries.x + ((window.playerCameraWidth * hero.zoomMultiplier)/2)) {
        objectToEdit.x = gameBoundaries.x + ((window.playerCameraWidth * hero.zoomMultiplier)/2)
        legal = false
      }
      if(objectToEdit.y < gameBoundaries.y + ((window.playerCameraHeight * hero.zoomMultiplier)/2)) {
        objectToEdit.y = gameBoundaries.y + ((window.playerCameraHeight * hero.zoomMultiplier)/2)
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

function objectCorrection(po, final, options = { bypassHero: false }) {
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

    if(body.gameObject.removed || (options.bypassHero && body.gameObject.tags.hero)) continue
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
      let noPathButHasVelocity = (!po.gameObject.path && (po.gameObject.velocityY && po.gameObject.velocityY !== 0 || po.gameObject.velocityX && po.gameObject.velocityX !== 0))
      let bothAreObstacles = po.gameObject.tags && po.gameObject.tags['obstacle'] && body.gameObject.tags && body.gameObject.tags['obstacle']
      if(!po.gameObject.tags['stationary'] && bothAreObstacles && (noPathButHasVelocity || po.gameObject.tags['heroPushable'])) {
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

function objectCollisionEffects(po, removeObjects, respawnObjects) {
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  // OBJECTS COLLIDING WITH OTHER OBJECTS
  /////////////////////////////////////////////////////
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
      let collider = body.gameObject
      let agent = po.gameObject
      // problem is that this could also happen to the hero object which has its own..
      if(collider.tags['monsterDestroyer'] && agent.tags['monster']) {
        window.local.emit('onDestroyMonster', agent, collider, result, removeObjects, respawnObjects)
        if(agent.spawnPointX >= 0 && agent.tags['respawn']) {
          respawnObjects.push(agent)
        } else {
          removeObjects.push(agent)
        }
      }

      if(body.gameObject.tags['objectUpdate'] && body.gameObject.objectUpdate && collisions.shouldEffect(po.gameObject, body.gameObject)) {
        if(po.gameObject.lastPowerUpId !== body.gameObject.id) {
          window.mergeDeep(po.gameObject, {...body.gameObject.objectUpdate})
          po.gameObject.lastPowerUpId = body.gameObject.id
        }
      } else {
        po.gameObject.lastPowerUpId = null
      }

      if(po.gameObject.actionTriggerArea && body.gameObject.tags['requireActionButton']) {
        // sometimes the hero could be logged off
        let hero = w.game.heros[po.gameObject.ownerId]
        if(hero) {
          if(!hero._interactableObject) {
            hero._interactableObject = body.gameObject
            hero._interactableObjectResult = result
          } else if(body.gameObject.width < hero._interactableObject.width || body.gameObject.height < hero._interactableObject.height) {
            hero._interactableObject = body.gameObject
            hero._interactableObjectResult = result
          }
        }
      }

      if(po.gameObject.tags['victim'] && body.gameObject.tags['monster']) {
        window.local.emit('onMonsterDestroyVictim', po.gameObject, body.gameObject)
        if(po.gameObject.spawnPointX >= 0 && po.gameObject.tags['respawn']) {
          respawnObjects.push(po.gameObject)
        } else {
          removeObjects.push(po.gameObject)
        }
      }

      /// DEFAULT GAME FX
      if(window.defaultCustomGame) {
        window.defaultCustomGame.onCollide(po.gameObject, body.gameObject, result, removeObjects, respawnObjects)
      }

      /// CUSTOM GAME FX
      if(window.customGame) {
        window.customGame.onCollide(po.gameObject, body.gameObject, result, removeObjects, respawnObjects)
      }

      /// LIVE CUSTOM GAME FX
      if(window.liveCustomGame) {
        window.liveCustomGame.onCollide(po.gameObject, body.gameObject, result, removeObjects, respawnObjects)
      }
    }
  }
}
function attachSubObjects(object, subObjects) {
  window.forAllSubObjects(subObjects, (subObject) => {
    subObject.x = object.x + subObject.relativeX
    subObject.y = object.y + subObject.relativeY
    subObject.width = object.width + (subObject.relativeWidth)
    subObject.height = object.height + (subObject.relativeHeight)
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
}

function attachToRelative(object) {
  let relative = w.game.objectsById[object.relativeId] || w.game.heros[object.relativeId]

  if(relative) {
    object.x = relative.x + object.relativeX
    object.y = relative.y + object.relativeY
  } else delete object.relativeId
}

function addObject(object) {
  if(PHYSICS.objects[object.id]) return console.log("we already have added a physics object with id " + object.id)
  const physicsObject = new Polygon(object.x, object.y, [ [ 0, 0], [object.width, 0], [object.width, object.height] , [0, object.height]])
  PHYSICS.system.insert(physicsObject)
  PHYSICS.objects[object.id] = physicsObject
  if(object.subObjects) {
    window.forAllSubObjects(object.subObjects, (subObject, key) => {
      subObject.id = key + '-sub-' + object.id
      addObject(subObject)
    })
  }
  return physicsObject
}

function removeObject(object) {
  try {
    PHYSICS.system.remove(PHYSICS.objects[object.id])
    if(object.subObjects) {
      window.forAllSubObjects(object.subObjects, (subObject) => {
        if(subObject.id) {
          removeObject(subObject)
        }
      })
    }
    delete PHYSICS.objects[object.id];
  } catch(e) {
    console.error(e)
  }
}

export {
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
}

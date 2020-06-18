import { Polygon } from 'collisions';

function shouldCheckConstructPart(part) {
  if(PHYSICS.correctedConstructs[part.ownerId]) return false
  else return true
}

function cancelConstructPart(correctedPart, owner, partPO) {
  owner.x = owner._initialX
  owner.y = owner._initialY

  owner.constructParts.forEach((part) => {
    if(part.id == correctedPart.id) return
    PHYSICS.objects[part.id].constructPart.x = part._initialX
    PHYSICS.objects[part.id].constructPart.y = part._initialY
  })

  PHYSICS.correctedConstructs[owner.id] = true
}

function correctConstructPart(correctedPart, owner, partPO) {
  const correctionX = partPO.x - correctedPart.x
  const correctionY = partPO.y - correctedPart.y

  owner.x = owner._initialX + correctionX
  owner.y = owner._initialY + correctionY

  owner.constructParts.forEach((part) => {
    PHYSICS.objects[part.id].constructPart.x += correctionX
    PHYSICS.objects[part.id].constructPart.y += correctionY
  })

  PHYSICS.correctedConstructs[owner.id] = true
  // PHYSICS.system.update()
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
// HERO EFFECTS ON COLLISION
/////////////////////////////////////////////////////
function heroCollisionEffects(hero) {
  const result = PHYSICS.objects[hero.id].createResult()
  const potentials = PHYSICS.objects[hero.id].potentials()
  let illegal = false
  let correction = {x: hero.x, y: hero.y}
  let heroPO = PHYSICS.objects[hero.id]
  for(const body of potentials) {
    if(!body.gameObject) {
      if(PHYSICS.debug) console.log('missing game object on body', body)
      continue
    }
    if(body.gameObject.ownerId == hero.id) continue
    if(body.gameObject.removed) continue
    if(heroPO.collides(body, result)) {
      const collider = body.gameObject

      window.local.emit('onHeroCollide', heroPO.gameObject, collider, result)
    }
  }
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
// GAME.heros[HERO.id] CORRECTIONS
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
        if(PHYSICS.debug) console.log('missing game object on body', body)
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
            landingObject = body
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
          if(landingObject) window.local.emit('onHeroLand', hero, landingObject.gameObject, result)
          if(landingObject && landingObject.gameObject.tags['movingPlatform']) {
            hero._parentId = landingObject.gameObject.id
          } else {
            if(hero.velocityY > 0) hero.velocityY = 0
            if(hero.velocityAngle) hero.velocityAngle *= .09
          }
        } else if(result.overlap_y < 0){
          if(hero.velocityY < 0) hero.velocityY = 0
          if(hero.velocityAngle) hero.velocityAngle *= .09
        }
        heroPO.y -= result.overlap_y
      }

      function correctHeroX() {
        if(result.overlap_x > 0) {
          hero.velocityX = 0
          if(hero.velocityAngle) hero.velocityAngle *= .09
        } else if(result.overlap_x < 0){
          hero.velocityX = 0
          if(hero.velocityAngle) hero.velocityAngle *= .09
        }
        heroPO.x -= result.overlap_x
      }

      // there was a problem with a double object collision. One Would
      // collide with X, one would collide with Y but both corrections were made,
      // even though one correction would have concelled out the other..
      // it was hard to tell which correction to prioritize. Basically now
      // I prioritize the correction that DOES NOT IMPEDE the heros current direction
      if(round === 1) {
        if(hero.directions && (hero.directions.up || hero.directions.down)) {
          correctHeroX()
        } else if(hero.directions && (hero.directions.left || hero.directions.right)) {
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
        if(hero.tags.rotateable) {
          hero.x -= hero.width/2
          hero.y -= hero.height/2
        }
      }
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
function objectCollisionEffects(po) {

  let potentials = po.potentials()
  let result = po.createResult()
  // po VS body. the po is the one you should EFFECT
  for(const body of potentials) {
    if(!body.gameObject) {
      if(PHYSICS.debug) console.log('missing game object on body', body)
      continue
    }
    if(body.gameObject.removed) continue
    if(po.gameObject.ownerId === body.gameObject.id) continue
    if(po.collides(body, result)) {
      let collider = body.gameObject
      let agent = po.gameObject

      const isInteractable = OBJECTS.isInteractable(collider)
      if(agent.tags['heroInteractTriggerArea'] && isInteractable) {
        // sometimes the hero could be logged off
        let hero = GAME.heros[agent.ownerId]
        if(hero) {
          if(!hero.interactableObject) {
            hero.interactableObject = collider
            hero.interactableObjectResult = result
          } else if(collider.width < hero.interactableObject.width || collider.height < hero.interactableObject.height) {
            hero.interactableObject = collider
            hero.interactableObjectResult = result
          }
        }
      }

      // subobjects and construct parts dont collider with their owners
      window.local.emit('onObjectCollide', agent, collider, result)
    }
  }
}


/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
// OBJECT CORRECTIONS
/////////////////////////////////////////////////////
function objectCorrection(po, final) {
  // if you are creating a result up here youll only be able to correct for one obj at a time
  // if you are accumulating the result like for the hero
  let result = po.createResult()
  let correction = {x: po.x, y: po.y}
  let potentials = po.potentials()
  let illegal = false
  for(const body of potentials) {
    // for construct parts
    if(po.gameObject === body.gameObject) continue
    if(!body.gameObject) {
      if(PHYSICS.debug) console.log('missing game object on body', body)
      continue
    }
    if(body.gameObject.removed) continue
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

    const object = po.gameObject

    if(po.constructPart) {
      // just give up correction and prevent any movement from these mother fucker
      if(illegal) {
        cancelConstructPart(po.constructPart, po.gameObject, po)
      } else {
        correctConstructPart(po.constructPart, po.gameObject, po)
      }
    } else {
      // just give up correction and prevent any movement from these mother fuckers
      if(illegal) {
        object.x = object._initialX
        object.y = object._initialY
      } else {
        object.x = po.x
        object.y = po.y
        if(object.tags.rotateable) {
          object.x -= object.width/2
          object.y -= object.height/2
        }
      }
    }
  }
}

function containObjectWithinGridBoundaries(object) {
  //DO THE PACMAN FLIP!!
  let gameBoundaries = GAME.world.gameBoundaries
  if(gameBoundaries && gameBoundaries.x >= 0) {
    let objectToEdit = object
    if(object.tags.fresh) {
      objectToEdit = JSON.parse(JSON.stringify(object))
    }

    if(gameBoundaries.behavior === 'purgatory' && object.id.indexOf('hero') == -1 && (GAME.heros[HERO.id] && HERO.id)) {
      // FOR ZOOM IN PURGATORY, PURGATORY ONLY SUPPORTS 1 PLAYER RIGHT NOW
      let hero = GAME.heros[HERO.id]
      if(PAGE.role.isPlayEditor) {
        hero = window.editingHero
      }

      let legal = true
      if(objectToEdit.x + objectToEdit.width > gameBoundaries.x + gameBoundaries.width - ((HERO.cameraWidth * hero.zoomMultiplier)/2 )) {
        objectToEdit.x = gameBoundaries.x + gameBoundaries.width - objectToEdit.width - (HERO.cameraWidth * hero.zoomMultiplier)/2
        legal = false
      }
      if(objectToEdit.y + objectToEdit.height > gameBoundaries.y + gameBoundaries.height - ((HERO.cameraHeight * hero.zoomMultiplier)/2 )) {
        objectToEdit.y = gameBoundaries.y + gameBoundaries.height - objectToEdit.height - ((HERO.cameraHeight * hero.zoomMultiplier)/2 )
        legal = false
      }
      if(objectToEdit.x < gameBoundaries.x + ((HERO.cameraWidth * hero.zoomMultiplier)/2)) {
        objectToEdit.x = gameBoundaries.x + ((HERO.cameraWidth * hero.zoomMultiplier)/2)
        legal = false
      }
      if(objectToEdit.y < gameBoundaries.y + ((HERO.cameraHeight * hero.zoomMultiplier)/2)) {
        objectToEdit.y = gameBoundaries.y + ((HERO.cameraHeight * hero.zoomMultiplier)/2)
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
  if(object.x + object.width > (GAME.grid.nodeSize * GAME.grid.width) + GAME.grid.startX) {
    object.x = (GAME.grid.nodeSize * GAME.grid.width) + GAME.grid.startX - object.width
  }
  if(object.y + object.height > (GAME.grid.nodeSize * GAME.grid.height) + GAME.grid.startY) {
    object.y = (GAME.grid.nodeSize * GAME.grid.height) + GAME.grid.startY - object.height
  }
  if(object.x < GAME.grid.startX) {
    object.x = GAME.grid.startX
  }
  if(object.y < GAME.grid.startY) {
    object.y = GAME.grid.startY
  }
}


function rotatePoint(point, center, radian){
  // console.log(point.x - center.x)
    var rotatedX = Math.cos(radian) * (point.x - center.x) - Math.sin(radian) * (point.y-center.y) + center.x;

    var rotatedY = Math.sin(radian) * (point.x - center.x) + Math.cos(radian) * (point.y - center.y) + center.y;

    return {rotatedX, rotatedY}
}



function attachSubObjects(owner, subObjects) {
  OBJECTS.forAllSubObjects(subObjects, (subObject) => {
    if(subObject.relativeWidth) subObject.width = owner.width + (subObject.relativeWidth)
    if(subObject.relativeHeight) subObject.height = owner.height + (subObject.relativeHeight)

    if((subObject.tags.relativeToDirection || subObject.tags.relativeToAngle)) {
      const direction = owner.inputDirection

      let radians = 0

      if(subObject.tags.relativeToAngle) {
        radians = owner.angle
      } else if(subObject.tags.relativeToDirection) {
        if(direction === 'right') {
          radians = degreesToRadians(90)
        }

        // down
        if(direction === 'down') {
          radians = degreesToRadians(180)
        }

        // left
        if(direction === 'left') {
          radians = degreesToRadians(270)
        }
      }


      var rotatedRelativeX = Math.cos(radians) * (subObject.relativeX) - Math.sin(radians) * (subObject.relativeY);
      var rotatedRelativeY = Math.sin(radians) * (subObject.relativeX) + Math.cos(radians) * (subObject.relativeY);

      subObject.x = owner.x + owner.width/2 + rotatedRelativeX - subObject.width/2
      subObject.y = owner.y + owner.height/2 + rotatedRelativeY - subObject.height/2

      subObject.angle = radians
      subObject.tags.rotateable = true
    } else {
      if(typeof subObject.relativeX === 'number') subObject.x = owner.x + owner.width/2 + subObject.relativeX - subObject.width/2
      if(typeof subObject.relativeY === 'number') subObject.y = owner.y + owner.height/2 + subObject.relativeY - subObject.height/2
    }
  })
}

function attachToParent(object) {
  let parent = GAME.objectsById[object.parentId] || GAME.heros[object.parentId]

  if(parent) {
    object.x += parent._deltaX
    object.y += parent._deltaY
  } else delete object.parentId

  parent = GAME.objectsById[object._parentId] || GAME.heros[object._parentId]
  if(parent) {
    object.x += parent._deltaX
    object.y += parent._deltaY
  } else delete object._parentId
}

function attachToRelative(object) {
  let relative = GAME.objectsById[object.relativeId] || GAME.heros[object.relativeId]

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
  return physicsObject
}

function removeObject(object) {
  try {
    PHYSICS.system.remove(PHYSICS.objects[object.id])
    delete PHYSICS.objects[object.id];
  } catch(e) {
    console.error(object, e)
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
  shouldCheckConstructPart,
}

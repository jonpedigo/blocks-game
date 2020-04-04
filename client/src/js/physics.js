import { Collisions, Polygon } from 'collisions';
import intelligence from './intelligence'
import collisions from './collisions';
import hero from './hero';

const physicsObjects = {}
// Create the collision system
const system = new Collisions()

// Create a Result object for collecting information about the collisions
let result = system.createResult()

function updatePosition(object, delta) {
  if(object.removed) return

  if(object.id.indexOf('hero') === -1) {
    object._initialX = object.x
    object._initialY = object.y
  }

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

    if(object.tags && !object.tags.gravity) {
      object.y += object.velocityY * delta
    }
  }
}

function containObjectWithinGridBoundaries(object) {

  //DO THE PACMAN FLIP!!
  let gameBoundaries = window.world.gameBoundaries
  if(gameBoundaries && gameBoundaries.x >= 0) {
    let objectToEdit = object
    if(object.tags.fresh) {
      objectToEdit = {...object}
    }

    if(gameBoundaries.behavior === 'pacmanFlip' || gameBoundaries.behavior === 'purgatory') {
      let legal = false
      if(objectToEdit.x < gameBoundaries.x - objectToEdit.width) {
        objectToEdit.x = gameBoundaries.x + gameBoundaries.width
        legal = true
      }
      if (objectToEdit.x > gameBoundaries.x + gameBoundaries.width) {
        objectToEdit.x = gameBoundaries.x - objectToEdit.width
        legal = true
      }
      if(objectToEdit.y < gameBoundaries.y - objectToEdit.height) {
        objectToEdit.y = gameBoundaries.y + gameBoundaries.height
        legal = true
      }
      if (objectToEdit.y > gameBoundaries.y + gameBoundaries.height) {
        objectToEdit.y = gameBoundaries.y - objectToEdit.height
        legal = true
      }
      if(legal){
        object.tags.fresh = false
      }
    } else if(gameBoundaries.behavior == 'boundaryAll' || objectToEdit.id.indexOf('hero') > -1){
      let legal = false
      //CONTAIN WITHIN BOUNDARIES OF THE GAME BOUNDARY PREF!!
      if(objectToEdit.x + objectToEdit.width > gameBoundaries.x + gameBoundaries.width) {
        objectToEdit.x = gameBoundaries.x + gameBoundaries.width - objectToEdit.width
        legal = true
      }
      if(objectToEdit.y + objectToEdit.height > gameBoundaries.y + gameBoundaries.height) {
        objectToEdit.y = gameBoundaries.y + gameBoundaries.height - objectToEdit.height
        legal = true
      }
      if(objectToEdit.x < gameBoundaries.x) {
        objectToEdit.x = gameBoundaries.x
        legal = true
      }
      if(objectToEdit.y < gameBoundaries.y) {
        objectToEdit.y = gameBoundaries.y
        legal = true
      }
      if(legal){
        object.tags.fresh = false
      }
    }
  }

  //ALWAYS CONTAIN WITHIN BOUNDARIES OF THE GRID!!
  if(object.x + object.width > (window.grid.nodeSize * window.grid.width) + window.grid.startX) {
    object.x = (window.grid.nodeSize * window.grid.width) + window.grid.startX - object.width
  }
  if(object.y + object.height > (window.grid.nodeSize * window.grid.height) + window.grid.startY) {
    object.y = (window.grid.nodeSize * window.grid.height) + window.grid.startY - object.height
  }
  if(object.x < window.grid.startX) {
    object.x = window.grid.startX
  }
  if(object.y < window.grid.startY) {
    object.y = window.grid.startY
  }
}

function update (delta) {
  // set objects new position and widths
  [...window.objects, window.hero].forEach((object, i) => {
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
    physicsObject.gameObject = object
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
  let removeObjects = []

  function heroCollisions() {
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    // OBJECTS COLLIDING WITH HERO
    /////////////////////////////////////////////////////
    const result = physicsObjects[window.hero.id].createResult()
    const potentials = physicsObjects[window.hero.id].potentials()
    let illegal = false
    let correction = {x: window.hero.x, y: window.hero.y}
    let heroPO = physicsObjects[window.hero.id]
    for(const body of potentials) {
      if(body.gameObject.removed) continue
      if(heroPO.collides(body, result)) {
        hero.onCollide(heroPO.gameObject, body.gameObject, result, removeObjects)
      }
    }

    heroPO.x = window.hero.x
    heroPO.y = window.hero.y

    window.hero.onGround = false

    system.update()
    heroCorrectionPhase(false, 1)
    system.update()
    heroCorrectionPhase(false, 2)
    system.update()
    heroCorrectionPhase(true, 3)
    system.update()

    function heroCorrectionPhase(final = false, round) {
      const potentials = physicsObjects[window.hero.id].potentials()
      let illegal = false
      let landingObject = null
      let heroPO = physicsObjects[window.hero.id]
      let corrections = []
      // console.log('round' + round, heroPO.x, heroPO.y)
      for(const body of potentials) {
        if(body.gameObject.removed) continue
        let result = physicsObjects[window.hero.id].createResult()
        if(heroPO.collides(body, result)) {
          if(body.gameObject.tags['obstacle'] || body.gameObject.tags['noHeroAllowed']) {
            illegal = true
            // console.log(result.collision, result.overlap, result.overlap_x, result.overlap_y)
            corrections.push(result)
            if(result.overlap_y === 1) {
              if(body.gameObject.tags.movingPlatform) {
                landingObject = body.gameObject
              }
            }
            // console.log('collided' + body.gameObject.id, window.hero.x - correction.x, window.hero.y - correction.y)
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
            window.hero.velocityY = 0
            window.hero.onGround = true
            if(landingObject && landingObject.tags['movingPlatform']) {
              let diffX = landingObject._initialX - landingObject.x
              heroPO.x -= diffX
            }
          } else if(result.overlap_y < 0){
            window.hero.velocityY = 0
          }
          heroPO.y -= result.overlap_y
        }

        function correctHeroX() {
          if(result.overlap_x > 0) {
            window.hero.velocityX = 0
          } else if(result.overlap_x < 0){
            window.hero.velocityX = 0
          }
          heroPO.x -= result.overlap_x
        }

        // there was a problem with a double object collision. One Would
        // collide with X, one would collide with Y but both corrections were made,
        // even though one correction would have concelled out the other..
        // it was hard to tell which correction to prioritize. Basically now
        // I prioritize the correction that DOES NOT IMPEDE the heros current direction
        if(round === 1) {
          if(window.hero.directions.up || window.hero.directions.down) {
            correctHeroX()
          } else if(window.hero.directions.left || window.hero.directions.right) {
            correctHeroY()
          }
        } else {
          correctHeroX()
          correctHeroY()
        }
      }

      if(final) {
        window.hero.directions = {...window.defaultHero.directions}
        // just give up correction and prevent any movement from these mother fuckers
        if(illegal) {
          window.hero.x = window.hero._initialX
          window.hero.y = window.hero._initialY
        } else {
          if(heroPO.x > window.hero._initialX) {
            window.hero.directions.right = true
          } else if(heroPO.x < window.hero._initialX) {
            window.hero.directions.left = true
          }
          if(heroPO.y > window.hero._initialY) {
            window.hero.directions.down = true
          } else if(heroPO.y < window.hero._initialY) {
            window.hero.directions.up = true
          }

          window.hero.x = heroPO.x
          window.hero.y = heroPO.y
        }
      }
    }
  }

  heroCollisions()

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  // OBJECTS COLLIDING WITH OTHER OBJECTS
  /////////////////////////////////////////////////////
  for(let id in physicsObjects){
    if(!physicsObjects[id]) continue
    if(physicsObjects[id].gameObject.removed) continue
    if(id.indexOf('hero') > -1) continue
    let po = physicsObjects[id]
    let potentials = po.potentials()
    let result = po.createResult()
    for(const body of potentials) {
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

        /// DEFAULT GAME FX
        if(window.defaultGame) {
          window.defaultGame.onCollide(po.gameObject, body.gameObject, result, removeObjects)
        }

        /// CUSTOM GAME FX
        if(window.customGame) {
          window.customGame.onCollide(po.gameObject, body.gameObject, result, removeObjects)
        }
      }
    }
  }

  correctionPhase()
  system.update()
  correctionPhase()
  system.update()
  correctionPhase(true)

  function correctionPhase(final = false) {
    for(let id in physicsObjects){
      if(!physicsObjects[id]) continue
      if(physicsObjects[id].gameObject.removed) continue
      if(id.indexOf('hero') > -1) continue
      let po = physicsObjects[id]
      // if you are creating a result up here youll only be able to correct for one obj at a time
      // if you are accumulating the result like for the hero
      let result = po.createResult()
      let correction = {x: po.x, y: po.y}
      let potentials = po.potentials()
      let illegal = false
      for(const body of potentials) {
        if(body.gameObject.removed) continue
        if(po.collides(body, result)) {
          if(body.gameObject.tags && body.gameObject.tags['onlyHeroAllowed']) {
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

          if(po.gameObject.tags && po.gameObject.tags['obstacle'] && body.gameObject.tags && body.gameObject.tags['obstacle'] && !po.gameObject.tags['stationary'] && (po.gameObject.tags['zombie'] || po.gameObject.tags['goomba'] || po.gameObject.tags['goombaSideways'])) {
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
          if(po.gameObject.velocityY > 0) po.gameObject.velocityY = 0
          po.gameObject.onGround = true
        } else if(result.overlap_y === -1){
          if(po.gameObject.velocityY < 0) po.gameObject.velocityY = 0
        }
        if(result.overlap_x === 1) {
          if(po.gameObject.velocityX > 0) po.gameObject.velocityX = 0
        } else if(result.overlap_x === -1){
          if(po.gameObject.velocityX < 0) po.gameObject.velocityX = 0
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
  }

  removeObjects.forEach((gameObject) => {
    window.socket.emit('removeObject', gameObject)
  })

  window.objects.forEach((object, i) => {
    if(object.removed) return

    containObjectWithinGridBoundaries(object)
  })
  containObjectWithinGridBoundaries(window.hero)

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

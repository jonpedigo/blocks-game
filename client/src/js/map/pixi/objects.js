import * as PIXI from 'pixi.js'
import tinycolor from 'tinycolor2'
import { GlowFilter, OutlineFilter, DropShadowFilter } from 'pixi-filters'
import { createDefaultEmitter } from './particles'
import './pixi-layers'
import { Ease, ease } from 'pixi-ease'
import { setColor, getHexColor, startPulse } from './utils'

const updatePixiObject = (gameObject) => {
  if(PAGE.role.isHost) gameObject = gameObject.mod()

  let camera = MAP.camera
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  }

  /////////////////////
  /////////////////////
  // SUB OBJECTS
  if(gameObject.subObjects) {
    OBJECTS.forAllSubObjects(gameObject.subObjects, (subObject) => {
      if(subObject.tags.potential) return
      updatePixiObject(subObject)
    })
  }

  /////////////////////
  /////////////////////
  // CONSTRUCT PARTS
  if(gameObject.constructParts) {
    if((PAGE.resizingMap && !PAGE.loadingScreen) || !gameObject.tags.stationary) {
      gameObject.constructParts.forEach((part) => {
        const partObject = PIXIMAP.convertToPartObject(gameObject, part)
        updatePixiObject(partObject)
      })
    }

    return
  }

  /////////////////////
  /////////////////////
  // GET CHILD
  let pixiChild = PIXIMAP.objectStage.getChildByName(gameObject.id)
  if(!pixiChild) {
    initPixiObject(gameObject)
    return
  }


  /////////////////////
  /////////////////////
  // UPDATE EMITTER
  if(pixiChild.trailEmitter) {
    updatePixiEmitter(pixiChild.trailEmitter, gameObject)
  }

  if(gameObject.tags.emitter) {
    updatePixiEmitter(pixiChild, gameObject)
    return
  } else if(pixiChild.emitter) {
    PIXIMAP.deleteEmitter(pixiChild.emitter)
    delete pixiChild.emitter

    initPixiObject(gameObject)
    return
  }

  if(pixiChild.children && pixiChild.children.length) {
    if(gameObject.tags.rotateable) {
      pixiChild.pivot.set(gameObject.width/2, gameObject.height/2)
      pixiChild.rotation = gameObject.angle || 0
      pixiChild.x = (gameObject.x + gameObject.width/2) * camera.multiplier
      pixiChild.y = (gameObject.y + gameObject.height/2) * camera.multiplier
    } else {
      pixiChild.x = (gameObject.x) * camera.multiplier
      pixiChild.y = (gameObject.y) * camera.multiplier
    }
    pixiChild.children.forEach((child) => {
      updateProperties(child, gameObject)
    })
  } else {
    if(gameObject.tags.rotateable) {
      pixiChild.anchor.set(0.5, 0.5)
      pixiChild.rotation = gameObject.angle || 0
      pixiChild.x = (gameObject.x + gameObject.width/2) * camera.multiplier
      pixiChild.y = (gameObject.y + gameObject.height/2) * camera.multiplier
    } else {
      pixiChild.x = (gameObject.x) * camera.multiplier
      pixiChild.y = (gameObject.y) * camera.multiplier
    }
    updateProperties(pixiChild, gameObject)
  }
}

const updatePixiEmitter = (pixiChild, gameObject) => {
  /////////////////////
  /////////////////////
  // SELECT CAMERA
  let camera = MAP.camera
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  }

  if(gameObject.tags.emitter && !pixiChild.emitter) {
    PIXIMAP.objectStage.removeChild(pixiChild)
    pixiChild = initEmitter(gameObject)
    return
  }

  const emitter = pixiChild.emitter

  /////////////////////
  /////////////////////
  // INVISIBILITY
  const isInvisible = gameObject.tags.outline || gameObject.tags.invisible || gameObject.removed || gameObject.tags.potential || gameObject.constructParts
  // remove if its invisible now
  if (isInvisible && !emitter.persistAfterRemoved) {
    if(emitter) {
      emitter.emit = false
      emitter.cleanup()
    }
    return
  } else {
    if(emitter) emitter.emit = true
  }

  /////////////////////
  /////////////////////
  // ROTATION

  if(emitter.isAnimationEmitter) {
    emitter.updateOwnerPos(gameObject.x * camera.multiplier, gameObject.y * camera.multiplier)
    emitter.spawnPos.x = gameObject.width/2 * camera.multiplier
    emitter.spawnPos.y =  gameObject.height/2 * camera.multiplier
  } else {
    if(gameObject.tags.rotateable) {
      pixiChild.pivot.set(gameObject.width/2, gameObject.height/2)
      pixiChild.rotation = gameObject.angle || 0
      pixiChild.x = (gameObject.x + gameObject.width/2) * camera.multiplier
      pixiChild.y = (gameObject.y + gameObject.height/2) * camera.multiplier
    } else {
      pixiChild.x = (gameObject.x) * camera.multiplier
      pixiChild.y = (gameObject.y) * camera.multiplier
    }
  }

  /////////////////////
  /////////////////////
  // SCAL
  if(emitter.data.scale && emitter.startScale.next) {
    emitter.startScale.value = emitter.data.scale.start * camera.multiplier
    emitter.startScale.next.value = emitter.data.scale.end * camera.multiplier
  }
}

function initEmitter(gameObject, emitterType = 'smallFire', options = {}, isAnimationEmitter) {
  const container = new PIXI.Container()
  PIXIMAP.objectStage.addChild(container)

  let emitter = createDefaultEmitter(container, gameObject, emitterType, options)
  PIXIMAP.objectStage.emitters.push(emitter)
  // container.parentGroup = PixiLights.diffuseGroup

  if(!isAnimationEmitter) container.name = gameObject.id
  container.emitter = emitter
  container.emitter.type = emitterType
  container.emitter.isAnimationEmitter = isAnimationEmitter

  updatePixiEmitter(container, gameObject)

  return container
}

function updateProperties(pixiChild, gameObject) {
  /////////////////////
  /////////////////////
  // INVISIBILITY
  const isInvisible = gameObject.tags.outline || gameObject.tags.invisible || gameObject.removed || gameObject.tags.potential || gameObject.constructParts
  // remove if its invisible now

  if (isInvisible) {
    pixiChild.visible = false
    return
  } else {
    pixiChild.visible = true
  }


  /////////////////////
  /////////////////////
  // CHANGE SPRITE
  if(gameObject.tags.solidColor) {
    pixiChild.texture = PIXIMAP.textures['solidcolorsprite']
  } else {
    if(gameObject.tags.inputDirectionSprites) {
      if(gameObject.inputDirection === 'right') {
        if(gameObject.rightSprite) {
          gameObject.sprite = gameObject.rightSprite
        } else gameObject.sprite = gameObject.defaultSprite
      }
      if(gameObject.inputDirection === 'left') {
        if(gameObject.leftSprite) {
          gameObject.sprite = gameObject.leftSprite
        } else gameObject.sprite = gameObject.defaultSprite
      }
      if(gameObject.inputDirection === 'up') {
        if(gameObject.upSprite) {
          gameObject.sprite = gameObject.upSprite
        } else gameObject.sprite = gameObject.defaultSprite
      }
      if(gameObject.inputDirection === 'down') {
        if(gameObject.downSprite) {
          gameObject.sprite = gameObject.downSprite
        } else gameObject.sprite = gameObject.defaultSprite
      }
    } else {
      if(gameObject.defaultSprite != gameObject.sprite) {
        gameObject.sprite = gameObject.defaultSprite
      }
    }

    if(!pixiChild.texture || gameObject.sprite != pixiChild.texture.id) {
      pixiChild.texture = PIXIMAP.textures[gameObject.sprite]
    }
  }

  /////////////////////
  /////////////////////
  // SELECT CAMERA
  let camera = MAP.camera
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  }

  /////////////////////
  /////////////////////
  // ROTATION
  // if(gameObject.tags.rotateable) {
  //   // pixiChild.pivot.set(gameObject.width/2, gameObject.height/2)
  //
  //   pixiChild.anchor.set(0.5, 0.5)
  //   pixiChild.rotation = gameObject.angle || 0
  //   pixiChild.x = (gameObject.x + gameObject.width/2) * camera.multiplier
  //   pixiChild.y = (gameObject.y + gameObject.height/2) * camera.multiplier
  // } else {
  //   pixiChild.x = (gameObject.x) * camera.multiplier
  //   pixiChild.y = (gameObject.y) * camera.multiplier
  // }

  /////////////////////
  /////////////////////
  // SCALE
  if(!pixiChild.isAnimatingScale) {
    if(gameObject.tags.tilingSprite) {
      pixiChild.transform.scale.x = camera.multiplier
      pixiChild.transform.scale.y = camera.multiplier
    } else if(pixiChild.texture){
      pixiChild.transform.scale.x = (gameObject.width/pixiChild.texture._frame.width) * camera.multiplier
      pixiChild.transform.scale.y = (gameObject.height/pixiChild.texture._frame.height) * camera.multiplier
    }

    // if(gameObject.tags.hero) {
    //   startPulse(pixiChild, gameObject, 'scale')
    // }
  }

  /////////////////////
  /////////////////////
  // COLOR

  if(!pixiChild.isAnimatingColor) {

    setColor(pixiChild, gameObject)

    // if(gameObject.tags.hero) {
    //   startPulse(pixiChild, gameObject, 'darken')
    // }
  }


  if(!pixiChild.isAnimatingAlpha) {
    if(typeof gameObject.opacity === 'number') {
      pixiChild.alpha = gameObject.opacity
    } else {
      pixiChild.alpha = 1
    }

    if(gameObject.tags.hidden) {
      if(gameObject.id === HERO.originalId) {
        pixiChild.alpha = .3
      } else {
        pixiChild.alpha = 0
      }
    }

    if(gameObject.tags.hasTrail && !pixiChild.trailEmitter) {
      pixiChild.trailEmitter = initEmitter(gameObject, 'trail', { scaleToGameObject: true, matchObjectColor: true }, true)
    }
    if(!gameObject.tags.hasTrail && pixiChild.trailEmitter) {
      PIXIMAP.deleteEmitter(pixiChild.trailEmitter)
      delete pixiChild.trailEmitter
    }

    // if(gameObject.tags.hero) {
    //   startPulse(pixiChild, gameObject, 'alpha')
    // }
  }

  /////////////////////
  /////////////////////
  // INTERACT HIGHLIGHT
  if(HERO.id && GAME.heros[HERO.id] && GAME.heros[HERO.id].interactableObject && gameObject.id === GAME.heros[HERO.id].interactableObject.id) {
    pixiChild.filters = [new GlowFilter(12, 0xFFFFFF)];
  } else {
    removeFilter(pixiChild, GlowFilter)
  }
}

const addGameObjectToStage = (gameObject, stage) => {
  /////////////////////
  /////////////////////
  // SELECT CAMERA
  let camera = MAP.camera
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  }

  if(PAGE.role.isHost) gameObject = gameObject.mod()

  /////////////////////
  /////////////////////
  // DEFAULT SPRITE
  if(!gameObject.defaultSprite) {
    gameObject.defaultSprite = 'solidcolorsprite'
  }
  gameObject.sprite = gameObject.defaultSprite

  /////////////////////
  /////////////////////
  // CREATE SPRITE
  const texture = PIXIMAP.textures[gameObject.sprite]
  let sprite
  if(gameObject.tags.tilingSprite) {
    sprite = new PIXI.extras.TilingSprite(texture, gameObject.width, gameObject.height)
  } else {
    sprite = new PIXI.Sprite(texture)
  }
  if(stage === PIXIMAP.objectStage) sprite.parentGroup = PIXIMAP.sortGroup

  /////////////////////
  /////////////////////
  // ADD TO STAGE
  let addedChild = stage.addChild(sprite)


  addedChild.texture = texture

  /////////////////////
  /////////////////////
  // NAME SPRITE FOR LOOKUP
  addedChild.name = gameObject.id

  if(gameObject.id === HERO.id) {
    PIXIMAP.hero = addedChild
  }

  updatePixiObject(gameObject)

  return addedChild
}

const initPixiObject = (gameObject) => {
  const stage = PIXIMAP.objectStage
  if(PAGE.role.isHost) gameObject = gameObject.mod()

  if(gameObject.tags.emitter) {
    initEmitter(gameObject)
    return
  }

  if(gameObject.constructParts) {
    gameObject.constructParts.forEach((part) => {
      const partObject = PIXIMAP.convertToPartObject(gameObject, part)
      const pixiChild = addGameObjectToStage(partObject, PIXIMAP.objectStage)
      pixiChild.ownerName = gameObject.id
    })
    return
  }

  if(gameObject.subObjects) {
    OBJECTS.forAllSubObjects(gameObject.subObjects, (subObject) => {
      if(subObject.tags.potential) return
      const pixiChild = addGameObjectToStage(subObject, PIXIMAP.objectStage)
      pixiChild.ownerName = gameObject.id
    })
  }

  addGameObjectToStage(gameObject, PIXIMAP.objectStage)
}

function addFilter(pixiChild, filter) {
  if(!pixiChild.filters) {
    pixiChild.filters = []
  }
  pixiChild.filters.push(filter)
}

function removeFilter(pixiChild, filterClass) {
  if(pixiChild.filters) {
    pixiChild.filters = pixiChild.filters.filter((filter) => {
      if(filter instanceof filterClass) return false
      return true
    })
  }
}

export {
  initPixiObject,
  updatePixiObject,
  initEmitter,
}

import * as PIXI from 'pixi.js'
import tinycolor from 'tinycolor2'
import { GlowFilter, OutlineFilter, DropShadowFilter } from 'pixi-filters'
import { createDefaultEmitter } from './particles'
import './pixi-layers'
import { setColor, startAnimation, updateSprite, updateChatBox, updateScale, updateColor, getVisibility, getHexColor, startPulse, updatePosition, updateAlpha, getGameObjectStage } from './utils'
import { Ease, ease } from 'pixi-ease'

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
  const stage = getGameObjectStage(gameObject)
  let pixiChild = stage.getChildByName(gameObject.id)
  if(!pixiChild) {
    initPixiObject(gameObject)
    return
  }

  /////////////////////
  /////////////////////
  // UPDATE CHATBOX
  updateChatBox(pixiChild, gameObject)


  /////////////////////
  /////////////////////
  // UPDATE EMITTER
  if(pixiChild.trailEmitter && gameObject.tags.hasTrail) {
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
    updatePosition(pixiChild, gameObject)
    pixiChild.children.forEach((child) => {
      updateProperties(child, gameObject)
    })
  } else {
    updatePosition(pixiChild, gameObject)
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

  const stage = getGameObjectStage(gameObject)

  if(gameObject.tags.emitter && !pixiChild.emitter) {
    stage.removeChild(pixiChild)
    pixiChild = initEmitter(gameObject)
    return
  }

  const emitter = pixiChild.emitter

  /////////////////////
  /////////////////////
  // INVISIBILITY
  const isInvisible = getVisibility(pixiChild, gameObject)
  // remove if its invisible now
  if (isInvisible && !emitter.persistAfterRemoved) {
    if(emitter) {
      emitter._emit = false
      emitter.cleanup()
    }
    return
  } else {
    if(emitter) emitter._emit = true
  }

  /////////////////////
  /////////////////////
  // ROTATION

  emitter.spawnPos.x = gameObject.width/2 * camera.multiplier
  emitter.spawnPos.y =  gameObject.height/2 * camera.multiplier
  if(emitter.isAnimationEmitter) {
    emitter.updateOwnerPos(gameObject.x * camera.multiplier, gameObject.y * camera.multiplier)
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
  // SCALE
  if(emitter.data.scale && emitter.startScale.next) {
    emitter.startScale.value = emitter.data.scale.start * camera.multiplier
    emitter.startScale.next.value = emitter.data.scale.end * camera.multiplier
  }
}

function initEmitter(gameObject, emitterType = 'smallFire', options = {}, isAnimationEmitter) {
  const container = new PIXI.Container()
  const stage = getGameObjectStage(gameObject)
  stage.addChild(container)

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
  const isInvisible = getVisibility(pixiChild, gameObject)
  // remove if its invisible now

  if (isInvisible) {
    pixiChild.visible = false
    return
  } else {
    pixiChild.visible = true
  }

  updateSprite(pixiChild, gameObject)
  updateScale(pixiChild, gameObject)
  updateColor(pixiChild, gameObject)
  updateAlpha(pixiChild, gameObject)

  if(gameObject.tags.hasTrail && !pixiChild.trailEmitter) {
    pixiChild.trailEmitter = initEmitter(gameObject, 'trail', { scaleToGameObject: true, matchObjectColor: true }, true)
  }
  if(!gameObject.tags.hasTrail && pixiChild.trailEmitter) {
    PIXIMAP.deleteEmitter(pixiChild.trailEmitter)
    delete pixiChild.trailEmitter
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

  if(gameObject.tags.fadeInOnInit) {
    startAnimation('fadeIn', addedChild, gameObject)
  }

  return addedChild
}

const initPixiObject = (gameObject) => {
  const stage = getGameObjectStage(gameObject)
  if(PAGE.role.isHost) gameObject = gameObject.mod()

  if(gameObject.tags.emitter) {
    initEmitter(gameObject)
    return
  }

  if(gameObject.constructParts) {
    gameObject.constructParts.forEach((part) => {
      const partObject = PIXIMAP.convertToPartObject(gameObject, part)
      const pixiChild = addGameObjectToStage(partObject, stage)
      pixiChild.ownerName = gameObject.id
    })
    return
  }

  if(gameObject.subObjects) {
    OBJECTS.forAllSubObjects(gameObject.subObjects, (subObject) => {
      if(subObject.tags.potential) return
      const pixiChild = addGameObjectToStage(subObject, stage)
      pixiChild.ownerName = gameObject.id
    })
  }

  addGameObjectToStage(gameObject, stage)
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

import * as PIXI from 'pixi.js'
import tinycolor from 'tinycolor2'
import { GlowFilter, OutlineFilter, DropShadowFilter } from 'pixi-filters'
import { flameEmitter } from './particles'
import './pixi-layers'

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
  // GET CHILD
  let pixiChild = PIXIMAP.objectStage.getChildByName(gameObject.id)
  if(!pixiChild) {
    initPixiObject(gameObject)
    return
  }

  /////////////////////
  /////////////////////
  // UPDATE EMITTER
  if(gameObject.tags.emitter) {
    updatePixiEmitter(pixiChild, gameObject)
    return
  } else if(pixiChild.emitter) {
    pixiChild.emitter.destroy()
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

  if(!pixiChild.emitter) {
    PIXIMAP.objectStage.removeChild(pixiChild)
    pixiChild = initEmitter(gameObject)
    return
  }

  /////////////////////
  /////////////////////
  // INVISIBILITY
  const isInvisible = !gameObject.tags.filled || gameObject.tags.invisible || gameObject.removed || gameObject.tags.potential
  // remove if its invisible now
  if (isInvisible) {
    if(pixiChild.emitter) {
      pixiChild.emitter.emit = false
      pixiChild.emitter.cleanup()
    }
    return
  } else {
    if(pixiChild.emitter) pixiChild.emitter.emit = true
  }

  const emitter = pixiChild.emitter
  // emitter.updateOwnerPos(gameObject.x * camera.multiplier, gameObject.y * camera.multiplier)


  const emitterData = window.particleEmitters[emitter.type]

  /////////////////////
  /////////////////////
  // ROTATION
  if(gameObject.tags.rotateable) {
    pixiChild.pivot.set(gameObject.width/2, gameObject.height/2)
    pixiChild.rotation = gameObject.angle || 0
    pixiChild.x = (gameObject.x + gameObject.width/2) * camera.multiplier
    pixiChild.y = (gameObject.y + gameObject.height/2) * camera.multiplier
  } else {
    pixiChild.x = (gameObject.x) * camera.multiplier
    pixiChild.y = (gameObject.y) * camera.multiplier
  }

  /////////////////////
  /////////////////////
  // SCALE
  emitter.startScale.value = emitterData.scale.start * camera.multiplier
  emitter.startScale.next.value = emitterData.scale.end * camera.multiplier
}

function initEmitter(gameObject) {
  const container = new PIXI.Container()
  container.name = gameObject.id
  PIXIMAP.objectStage.addChild(container)

  let emitter = flameEmitter({stage: container, startPos: {x: gameObject.width/2 * MAP.camera.multiplier, y: gameObject.height/2 * MAP.camera.multiplier}})
  PIXIMAP.objectStage.emitters.push(emitter)
  container.parentGroup = PixiLights.diffuseGroup
  container.emitter = emitter
  container.emitter.type = 'flameEmitter'

  updatePixiEmitter(container, gameObject)

  return container
}

function updateProperties(pixiChild, gameObject) {
  /////////////////////
  /////////////////////
  // CONSTRUCT PARTS
  if(gameObject.constructParts) {
    gameObject.constructParts.forEach((part) => {
      let sprite = part.sprite
      let color = part.color
      if(!part.sprite) {
        sprite = 'solidcolorsprite'
      }
      if(!part.color) {
        color = gameObject.color
      }
      const partObject = {tags: gameObject.tags,  ...part, color: color, sprite: sprite, defaultSprite: 'solidcolorsprite'}
      updatePixiObject(partObject)
    })
    return
  }


  /////////////////////
  /////////////////////
  // INVISIBILITY
  const isInvisible = !gameObject.tags.filled || gameObject.tags.invisible || gameObject.removed || gameObject.tags.potential
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
  if(gameObject.tags.tilingSprite) {
    pixiChild.transform.scale.x = camera.multiplier
    pixiChild.transform.scale.y = camera.multiplier
  } else if(pixiChild.texture){
    pixiChild.transform.scale.x = (gameObject.width/pixiChild.texture._frame.width) * camera.multiplier
    pixiChild.transform.scale.y = (gameObject.height/pixiChild.texture._frame.height) * camera.multiplier
  }

  /////////////////////
  /////////////////////
  // COLOR
  if(gameObject.color) {
    pixiChild.tint = parseInt(tinycolor(gameObject.color).toHex(), 16)
  } else if(GAME.world.defaultObjectColor) {
    pixiChild.tint = parseInt(tinycolor(GAME.world.defaultObjectColor).toHex(), 16)
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
  sprite.parentGroup = PIXIMAP.sortGroup

  /////////////////////
  /////////////////////
  // ADD TO STAGE
  let addedChild = stage.addChild(sprite)

  addedChild.texture = texture

  /////////////////////
  /////////////////////
  // NAME SPRITE FOR LOOKUP
  addedChild.name = gameObject.id

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
    const container = new PIXI.Container()
    gameObject.constructParts.forEach((part) => {
      addGameObjectToStage({tags: gameObject.tags, ...part}, container)
    })
    container.name = gameObject.id
    PIXIMAP.objectStage.addChild(container)
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
}

import tinycolor from 'tinycolor2'
import { updatePixiObject, initPixiObject } from './objects'
import { initPixiApp } from './app'
import gridUtil from '../../utils/grid'
import * as PIXI from 'pixi.js'
import { GlowFilter, OutlineFilter, GodrayFilter, EmbossFilter, ReflectionFilter, ShockwaveFilter } from 'pixi-filters'
import { Ease, ease } from 'pixi-ease'

import { setColor, getHexColor } from './utils'

window.PIXIMAP = {
  textures: {},
  initialized: false,
  app: null,
  stage: null,
}

PIXIMAP.initializePixiObjectsFromGame = function() {
  GAME.objects.forEach((object) => {
    initPixiObject(object)
  })
  GAME.heroList.forEach((hero) => {
    initPixiObject(hero)
  })

  // const refFilter = new ShockwaveFilter()
  // PIXIMAP.hero.filters = [refFilter]

  PIXIMAP.initialized = true
}

PIXIMAP.onAssetsLoaded = function() {
  PIXIMAP.initializeDarknessSprites()
  PIXIMAP.initializePixiObjectsFromGame()
}

PIXIMAP.onGameLoaded = function() {
  // GAME.world.tags.usePixiMap = true

  if(!PIXIMAP.assetsLoaded) {
    setInterval(PIXIMAP.resetDarknessSprites, 200)
    setInterval(PIXIMAP.updateDarknessSprites, 200)
    setInterval(PIXIMAP.updateBlockSprites, 300)
    initPixiApp(MAP.canvas, (app, textures) => {
      window.local.emit('onAssetsLoaded')
      window.local.emit('onGameReady')
    })
  } else if(PIXIMAP.assetsLoaded) {
    PIXIMAP.shadowStage.removeChildren()
    PIXIMAP.objectStage.removeChildren()
    PIXIMAP.initializeDarknessSprites()
    PIXIMAP.initializePixiObjectsFromGame()
    window.local.emit('onGameReady')
  }
}

PIXIMAP.onGameStarted = function() {
  PIXIMAP.initializeDarknessSprites()
  PIXIMAP.resetDarknessSprites()
  window.local.emit('onGameReady')
}

PIXIMAP.onDeleteHero = function(object) {
  PIXIMAP.deleteObject(object)
}

PIXIMAP.onDeleteObject = function(object) {
  PIXIMAP.deleteObject(object)
}

PIXIMAP.onDeleteSubObject = function(object, subObjectName) {
  const subObject = object.subObjects[subObjectName]
  PIXIMAP.deleteObject(subObject)
}

PIXIMAP.deleteObject = function(object) {
  const stage = PIXIMAP.objectStage

  if(object.constructParts) {
    object.constructParts.forEach((part) => {
      PIXIMAP.deleteObject(part)
    })
  }
  const pixiChild = stage.getChildByName(object.id)
  if(!pixiChild) return
  if(pixiChild.children && pixiChild.children.length) {
    pixiChild.children.forEach((child) => {
      if(child.children) child.removeChildren()
    })
    pixiChild.removeChildren()
  }
  if(pixiChild.emitter) {
    PIXIMAP.objectStage.emitters = PIXIMAP.objectStage.emitters.filter((emitter) => {
      if(pixiChild.emitter === emitter) {
        return false
      }
      return true
    })
    pixiChild.emitter.destroy()
    delete pixiChild.emitter
  }
  stage.removeChild(pixiChild)
}

PIXIMAP.addObject = function(object) {
  initPixiObject(object)
}

PIXIMAP.onRender = function() {
  let camera = MAP.camera
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  }

  if(PIXIMAP.assetsLoaded) {
    MAP.canvas.style.backgroundColor = ''
    // PIXIMAP.app.renderer.backgroundColor = getHexColor(GAME.world.backgroundColor)
    if(!PIXIMAP.backgroundOverlay.isAnimatingColor) PIXIMAP.backgroundOverlay.tint = getHexColor(GAME.world.backgroundColor)
    GAME.objects.forEach((object) => {
      updatePixiObject(object, PIXIMAP.stage)
    })
    GAME.heroList.forEach((hero) => {
      updatePixiObject(hero, PIXIMAP.stage)
    })
    PIXIMAP.objectStage.pivot.x = camera.x
    PIXIMAP.objectStage.pivot.y = camera.y
    if(PIXIMAP.shadowStage) {
      PIXIMAP.shadowStage.pivot.x = camera.x
      PIXIMAP.shadowStage.pivot.y = camera.y
    }
    if(PIXIMAP.gridStage) {
      PIXIMAP.gridStage.pivot.x = camera.x
      PIXIMAP.gridStage.pivot.y = camera.y
    }

    // const gameEligibleForLoading = (GAME.grid.width > 80 || GAME.objects.length > 300)
    // const loadingState = (PAGE.resizingMap || PAGE.startingAndStoppingGame)
    // const pixiMapInvisible = gameEligibleForLoading && loadingState
    // if(pixiMapInvisible) {
    //   PIXIMAP.stage.visible = false
    // } else PIXIMAP.stage.visible = true
  }
}

PIXIMAP.resetDarknessSprites = function() {
  if(!PIXIMAP.grid) return

  const nodes = PIXIMAP.grid.nodes

  for(var x = 0; x < nodes.length; x++) {
    let row = nodes[x]
    for(var y = 0; y < row.length; y++) {
      let node = row[y]
      if(node.light > 1) {
        // if(Date.now() < node._illumatedTime + 3000) continue
      }
      node.light = 0
      node._illumatedTime = null
    }
  }
}

PIXIMAP.updateDarknessSprites = function() {
  if(!PIXIMAP.grid) return

  const nodes = PIXIMAP.grid.nodes
  // if(!GAME.gameState.started) return

  let lights = []
  if(GAME.objectsByTag && GAME.objectsByTag['light']) {
    lights =  GAME.objectsByTag['light']
  }
  const lightObjects = [...lights, ...GAME.heroList]
  lightObjects.forEach((object) => {
    if(object.removed) return
    if(object.tags.potential) return

    const { gridX, gridY } = gridUtil.convertToGridXY({x: object.x + PIXIMAP.grid.nodeSize/2, y: object.y + PIXIMAP.grid.nodeSize/2})

    const startGridX = gridX - 5
    const startGridY = gridY - 5
    const endGridX = gridX + 5
    const endGridY = gridY + 5

    for(let x = startGridX; x < endGridX +1; x++) {
      for(let y = startGridY; y < endGridY + 1; y++) {
        let nodeX = nodes[x]
        if(!nodeX) continue
        let node = nodes[x][y]
        if(!node) continue

        // if(x - gridX >= 1 || x - gridX <= -1 ) {
        // }
        // || x - gridX == 6 || x - gridX == -6 || x - gridX == 7 || x - gridX == -7
        if(x - gridX == 5 || x - gridX == -5) {
          if(!node.light) node.light = 1
        // || y - gridY == 6 || y - gridY == -6 || y - gridY == 7 || y - gridY == -7
        } else if(y - gridY == 5 || y - gridY == -5) {
          if(!node.light) node.light = 1
        } else {
          node.light = 2
          node._illumatedTime = Date.now()
        }
        // if(x - gridX === 0 || x - gridX == 1 || x - gridX == -1) {
        //   node.light = 3
        // }


      }
    }
  })

  let ambientLight = GAME.gameState.ambientLight
  if(typeof ambientLight !== 'number') ambientLight = 1

  for(var x = 0; x < nodes.length; x++) {
    let row = nodes[x]
    for(var y = 0; y < row.length; y++) {
      let node = row[y]
      if(!node.darknessSprite) return

      // if(GAME.gameState.ambientLight > 1) {
      //   node.darknessSprite.alpha = ambientLight - 1
      //   node.darknessSprite.tint = getHexColor("orange")
      // } else {
        if(node.light == 1) {
          node.darknessSprite.alpha = .90 - ambientLight
        } else if(node.light == 2) {
          node.darknessSprite.alpha = .60 - ambientLight
        } else if(node.light == 3) {
          node.darknessSprite.alpha = .30 - ambientLight
        } else if(node.light >= 4) {
          node.darknessSprite.alpha = 0 - ambientLight
        } else {
          node.darknessSprite.alpha = 1 - ambientLight
        }
      // }
    }
  }
}

PIXIMAP.initializeDarknessSprites = function() {
  PIXIMAP.grid = _.cloneDeep(GAME.grid)
  PIXIMAP.shadowStage.removeChildren()
  PIXIMAP.gridStage.removeChildren()
  const nodes = PIXIMAP.grid.nodes
  const textures = PIXIMAP.textures
  for(var x = 0; x < nodes.length; x++) {
    let row = nodes[x]
    for(var y = 0; y < row.length; y++) {
      let node = row[y]
      const darknessSprite = new PIXI.Sprite(textures['solidcolorsprite'])
      PIXIMAP.shadowStage.addChild(darknessSprite)
      darknessSprite.x = (node.x) * MAP.camera.multiplier
      darknessSprite.y = (node.y) * MAP.camera.multiplier
      darknessSprite.transform.scale.x = (GAME.grid.nodeSize/textures['solidcolorsprite']._frame.width) * MAP.camera.multiplier
      darknessSprite.transform.scale.y = (GAME.grid.nodeSize/textures['solidcolorsprite']._frame.height) * MAP.camera.multiplier
      darknessSprite.tint = getHexColor("black")

      node.darknessSprite = darknessSprite

      PIXIMAP.initBackgroundSprite(node, node.sprite)
    }
  }
}

PIXIMAP.initBackgroundSprite = function(node, nodeSprite) {
  if(!nodeSprite) {
    return
  }
  const textures = PIXIMAP.textures
  const sprite = new PIXI.Sprite(textures[nodeSprite])
  sprite.x = node.x * MAP.camera.multiplier
  sprite.y = node.y * MAP.camera.multiplier
  sprite.transform.scale.x = (GAME.grid.nodeSize/sprite.texture._frame.width) * MAP.camera.multiplier
  sprite.transform.scale.y = (GAME.grid.nodeSize/sprite.texture._frame.width) * MAP.camera.multiplier
  const backgroundSprite = PIXIMAP.gridStage.addChild(sprite)
  node.backgroundSprite = backgroundSprite
  node.backgroundSprite.name = 'x' + node.gridX + 'y' + node.gridY
}

PIXIMAP.onUpdateGrid = function() {
  if(!window.resettingDarkness) {
    setTimeout(() => {
      if(PIXIMAP.initialized) {
        PIXIMAP.initializeDarknessSprites()
        PIXIMAP.resetDarknessSprites()
        PIXIMAP.updateDarknessSprites()
      }
      window.resettingDarkness = false
    }, 100)
    window.resettingDarkness = true
  }
}

PIXIMAP.onUpdateGridNode = function(x, y, update) {
  const nodes = PIXIMAP.grid.nodes
  if(nodes[x] && nodes[x][y]) {
    Object.assign(nodes[x][y], update)
  }
  PIXIMAP.updateBlockSprites()
}
PIXIMAP.updateBlockSprites = function() {
  if(!PIXIMAP.grid) return

  const nodes = PIXIMAP.grid.nodes
  const hero = GAME.heros[HERO.id]
  const textures = PIXIMAP.textures

  const { gridX, gridY } = gridUtil.convertToGridXY({x: hero.x + PIXIMAP.grid.nodeSize/2, y: hero.y + PIXIMAP.grid.nodeSize/2})

  for(var x = 0; x < nodes.length; x++) {
    const row = nodes[x]
    for(var y = 0; y < row.length; y++) {
      const node = row[y]
      const gridNode = GAME.grid.nodes[x][y]

      // add
      if(gridNode.sprite && !node.backgroundSprite) {
        PIXIMAP.initBackgroundSprite(node, gridNode.sprite)
      }

      // delete
      if((gridNode.sprite === 'none' || !gridNode.sprite) && node.backgroundSprite) {
        PIXIMAP.gridStage.removeChild(node.backgroundSprite)
      }

      // change
      if(node.backgroundSprite) {
        if(node.backgroundSprite.texture.id !== gridNode.sprite) {
          node.backgroundSprite.texture = textures[gridNode.sprite]
        }
        setColor(node.backgroundSprite, node)
      }

      if(Math.abs(gridX - x) > 32) {
        node.darknessSprite.visible = false
        if(node.backgroundSprite) node.backgroundSprite.visible = false
      } else if(Math.abs(gridY - y) > 20) {
        node.darknessSprite.visible = false
        if(node.backgroundSprite) node.backgroundSprite.visible = false
      } else {
        node.darknessSprite.visible = true
        if(node.backgroundSprite) node.backgroundSprite.visible = true
      }
    }
  }
}

PIXIMAP.onObjectAnimation = function(type, objectId, options = {}) {
  const object = OBJECTS.getObjectOrHeroById[objectId]
  if(type === 'flash') {
    if(options.color) {
      object.animationFlashColor = options.color
    } else {
      object.animationFlashColor = 'white'
    }
    setTimeout(() => {
      delete object.animationFlashColor
    }, options.duration || 1000)
  }

  // animationFlashColor: object.animationFlashColor,

  // animationTrail: object.animationTrail,
  // animationFadeIn: object.animationFadeIn,
  // animationFadeOut: object.animationFadeOut,

  // animationExplode: object.animationExplode,
  // animationFireworks
  // animationShake: object.animationShake,
  //
  // animationPulseSize: object.animationPulseSize,
  // animationPulseColor: object.animationPulseColor,
  //
  // animationGlow: object.animationGlow,
  // animationShine: object.animationShine,
  //
  // animationFadeCycle: object.animationFadeCycle,

  // what quake does is it sends out 3 layers. Each layer is less alpha than the last
  //
  // Fade to Color
}

PIXIMAP.onConstructEditorClose = function() {
  resetConstructParts()
}

PIXIMAP.onConstructEditorStart = function() {
  resetConstructParts()
}

PIXIMAP.onResize = function() {
  setTimeout(() => {
    resetConstructParts()
  }, 100)
}

function resetConstructParts() {
  GAME.objects.forEach((gameObject) => {
    /////////////////////
    /////////////////////
    // CONSTRUCT PARTS
    if(gameObject.constructParts) {
      gameObject.constructParts.forEach((part) => {
        let sprite = part.sprite || gameObject.sprite || 'solidcolorsprite'
        let color = part.color || gameObject.color || GAME.world.defaultObjectColor
        let defaultSprite = part.defaultSprite || gameObject.defaultSprite || 'solidcolorsprite'
        const partObject = {tags: {...gameObject.tags},  ...part, color: color, sprite: sprite, defaultSprite: defaultSprite}
        if(gameObject.id === CONSTRUCTEDITOR.objectId) partObject.tags.invisible = true
        updatePixiObject(partObject)
      })

      return
    }
  })
}

PIXIMAP.onConstellationAnimationStart = function() {
  PIXIMAP.backgroundOverlay.isAnimatingColor = true
  const example = ease.add(PIXIMAP.backgroundOverlay, { blend: 0x000000 }, { duration: 1000, ease: 'linear' })
  example.once('complete', () => PIXIMAP.backgroundOverlay.tint = 0x000000)
}

PIXIMAP.onConstellationAnimationEnd = function() {
  const example = ease.add(PIXIMAP.backgroundOverlay, { blend: getHexColor(GAME.world.backgroundColor) }, { duration: 1000, ease: 'linear' })
  example.once('complete', () => {
    PIXIMAP.backgroundOverlay.tint = getHexColor(GAME.world.backgroundColor)
    PIXIMAP.backgroundOverlay.isAnimatingColor = false
  })
}

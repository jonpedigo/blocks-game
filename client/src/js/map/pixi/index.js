import tinycolor from 'tinycolor2'
import { updatePixiObject, initPixiObject, initEmitter } from './objects'
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
  GAME.heroList.forEach((hero) => {
    initPixiObject(hero)
  })

  GAME.objects.forEach((object) => {
    initPixiObject(object)
  })


  if(GAME.objectsById['globalConstructStationaryObstacle']) {
    PIXIMAP.deleteObject(GAME.objectsById['globalConstructStationaryObstacle'])
    initPixiObject(GAME.objectsById['globalConstructStationaryObstacle'])
  }

  if(GAME.objectsById['globalConstructStationaryForeground']) {
    PIXIMAP.deleteObject(GAME.objectsById['globalConstructStationaryForeground'])
    initPixiObject(GAME.objectsById['globalConstructStationaryForeground'])
  }

  if(GAME.objectsById['globalConstructStationaryBackground']) {
    PIXIMAP.deleteObject(GAME.objectsById['globalConstructStationaryBackground'])
    initPixiObject(GAME.objectsById['globalConstructStationaryBackground'])
  }

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
  PIXIMAP.grid = _.cloneDeep(GAME.grid)

  if(!PIXIMAP.assetsLoaded) {
    // setInterval(PIXIMAP.updateBlockSprites, 300)
    initPixiApp(MAP.canvas, (app, textures) => {
      window.local.emit('onAssetsLoaded')
      window.local.emit('onGameReady')
      setInterval(() => {
        PIXIMAP.initializeDarknessSprites()
        PIXIMAP.resetDarkness()
        PIXIMAP.updateDarknessSprites()
      }, 200)
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
  PIXIMAP.resetDarkness()
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
    PIXIMAP.deleteEmitter(pixiChild.emitter)
    delete pixiChild.emitter
  }
  if(pixiChild.trailEmitter) {
    PIXIMAP.deleteEmitter(pixiChild.trailEmitter)
    delete pixiChild.trailEmitter
  }
  stage.removeChild(pixiChild)
}

PIXIMAP.deleteEmitter = function(emitterToDelete) {
  PIXIMAP.objectStage.emitters = PIXIMAP.objectStage.emitters.filter((emitter) => {
    if(emitterToDelete === emitter) {
      return false
    }
    return true
  })
  emitterToDelete.destroy()
}

PIXIMAP.addObject = function(object) {
  initPixiObject(object)
}

PIXIMAP.onResetObjects = function() {
  PIXIMAP.objectStage.removeChildren()
  PIXIMAP.objectStage._reInitialize = true
}

PIXIMAP.onRender = function() {

  if(PAGE.loadingGame) return

  let camera = MAP.camera
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  }

  if(PIXIMAP.assetsLoaded) {
    MAP.canvas.style.backgroundColor = ''
    // PIXIMAP.app.renderer.backgroundColor = getHexColor(GAME.world.backgroundColor)
    if(!PIXIMAP.backgroundOverlay.isAnimatingColor) PIXIMAP.backgroundOverlay.tint = getHexColor(GAME.world.backgroundColor)

    if(PIXIMAP.objectStage._reInitialize) {
      PIXIMAP.objectStage._reInitialize = false
      PIXIMAP.initializePixiObjectsFromGame()
    } else {
      GAME.objects.forEach((object) => {
        updatePixiObject(object, PIXIMAP.stage)
      })
      GAME.heroList.forEach((hero) => {
        updatePixiObject(hero, PIXIMAP.stage)
      })
    }

    const hero = GAME.heros[HERO.id]
    // PIXIMAP.objectStage.rotation = hero.cameraRotation
    PIXIMAP.objectStage.pivot.x = camera.x
    PIXIMAP.objectStage.pivot.y = camera.y
    if(PIXIMAP.shadowStage) {
      // PIXIMAP.shadowStage.rotation = hero.cameraRotation
      PIXIMAP.shadowStage.pivot.x = camera.x
      PIXIMAP.shadowStage.pivot.y = camera.y
    }
    if(PIXIMAP.backgroundStage) {
      PIXIMAP.backgroundOverlay.transform.scale.x = (PIXIMAP.app.view.width/PIXIMAP.backgroundOverlay.texture._frame.width)
      PIXIMAP.backgroundOverlay.transform.scale.y = (PIXIMAP.app.view.width/PIXIMAP.backgroundOverlay.texture._frame.width)
    }

    // const gameEligibleForLoading = (GAME.grid.width > 80 || GAME.objects.length > 300)
    // const loadingState = (PAGE.resizingMap || PAGE.startingAndStoppingGame)
    // const pixiMapInvisible = gameEligibleForLoading && loadingState
    // if(pixiMapInvisible) {
    //   PIXIMAP.stage.visible = false
    // } else PIXIMAP.stage.visible = true
  }
}

PIXIMAP.resetDarkness = function() {
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

  const hero = GAME.heros[HERO.id]

  if(hero) {
    const { startX, endX, startY, endY } = PIXIMAP.getShadowBoundaries(hero)
    for(var x = startX; x < endX; x++) {
      let row = nodes[x]
      for(var y = startY; y < endY; y++) {
        let node = row[y]
        if(!node.darknessSprite) {
          continue
        }

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
}

PIXIMAP.initializeDarknessSprites = function() {
  PIXIMAP.shadowStage.removeChildren()
  // PIXIMAP.gridStage.removeChildren()
  const nodes = PIXIMAP.grid.nodes
  const textures = PIXIMAP.textures

  const hero = GAME.heros[HERO.id]

  if(hero) {
    const { startX, endX, startY, endY } = PIXIMAP.getShadowBoundaries(hero)
    for(var x = startX; x < endX; x++) {
      for(var y = startY; y < endY; y++) {
        const gridNode = PIXIMAP.grid.nodes[x][y]

        const darknessSprite = new PIXI.Sprite(textures['solidcolorsprite'])
        PIXIMAP.shadowStage.addChild(darknessSprite)
        darknessSprite.x = (gridNode.x) * MAP.camera.multiplier
        darknessSprite.y = (gridNode.y) * MAP.camera.multiplier
        darknessSprite.transform.scale.x = (GAME.grid.nodeSize/textures['solidcolorsprite']._frame.width) * MAP.camera.multiplier
        darknessSprite.transform.scale.y = (GAME.grid.nodeSize/textures['solidcolorsprite']._frame.height) * MAP.camera.multiplier
        darknessSprite.tint = getHexColor("black")
        gridNode.darknessSprite = darknessSprite
        gridNode.darknessSprite.alpha = 0
      }
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
  PIXIMAP.grid = _.cloneDeep(GAME.grid)


  if(!window.resettingDarkness) {
    setTimeout(() => {
      if(PIXIMAP.initialized) {
        PIXIMAP.initializeDarknessSprites()
        PIXIMAP.resetDarkness()
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
  // PIXIMAP.updateBlockSprites()
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

      // // add
      // if(gridNode.sprite && !node.backgroundSprite) {
      //   PIXIMAP.initBackgroundSprite(node, gridNode.sprite)
      // }
      //
      // // delete
      // if((gridNode.sprite === 'none' || !gridNode.sprite) && node.backgroundSprite) {
      //   PIXIMAP.gridStage.removeChild(node.backgroundSprite)
      // }
      //
      // // change
      // if(node.backgroundSprite) {
      //   if(node.backgroundSprite.texture.id !== gridNode.sprite) {
      //     node.backgroundSprite.texture = textures[gridNode.sprite]
      //   }
      //   setColor(node.backgroundSprite, node)
      // }

      if(node.darknessSprite) {
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
}

PIXIMAP.onObjectAnimation = function(type, objectId, options = {}) {
  let object = OBJECTS.getObjectOrHeroById(objectId)

  if(!options) options = {}

  let pixiChild = PIXIMAP.objectStage.getChildByName(object.id)
  if(!pixiChild) return

  if(type === 'flash' && !pixiChild.animationFlashColor) {
    if(options.color) {
      pixiChild.animationColor = options.color
    } else {
      pixiChild.animationColor = 'white'
    }
    setTimeout(() => {
      delete pixiChild.animationColor
    }, options.duration || 50)
  }

  if(type === 'explode') {
    pixiChild.explodeEmitter = initEmitter(object, 'explode', { persistAfterRemoved: true, matchObjectColor: true }, true)
    setTimeout(() => {
      PIXIMAP.deleteEmitter(pixiChild.explodeEmitter)
      delete pixiChild.explodeEmitter
    }, 1000)
  }

  if(type === 'spinOff') {
    const explosionEmitter = initEmitter(object, 'spinOff', { persistAfterRemoved: true, scaleToGameObject: true, matchObjectColor: true }, true)
    setTimeout(() => {
      PIXIMAP.deleteEmitter(explosionEmitter)
    }, 1000)
  }

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
        const partObject = PIXIMAP.convertToPartObject(gameObject, part)
        updatePixiObject(partObject)
      })

      return
    }
  })
}

PIXIMAP.onConstellationAnimationStart = function() {
  PIXIMAP.backgroundOverlay.isAnimatingColor = true
  PIXIMAP.shadowStage.visible = false
  const example = ease.add(PIXIMAP.backgroundOverlay, { blend: 0x000000 }, { duration: 1000, ease: 'linear' })
  example.once('complete', () => PIXIMAP.backgroundOverlay.tint = 0x000000)
}

PIXIMAP.onConstellationAnimationEnd = function() {
  const example = ease.add(PIXIMAP.backgroundOverlay, { blend: getHexColor(GAME.world.backgroundColor) }, { duration: 1000, ease: 'linear' })
  example.once('complete', () => {
    PIXIMAP.backgroundOverlay.tint = getHexColor(GAME.world.backgroundColor)
    PIXIMAP.backgroundOverlay.isAnimatingColor = false
    setTimeout(() => {
      PIXIMAP.shadowStage.visible = true
    }, 1500)
  })
}

PIXIMAP.downloadAsImage = function() {
  download_sprite_as_png(PIXIMAP.app.renderer, PIXIMAP.app.stage, 'mapimage.png')
}

function download_sprite_as_png(renderer, sprite, fileName) {
  renderer.render(sprite);
  const data = renderer.view.toDataURL('image/png', 1)
  console.log(data)
  var a = document.createElement("a"); //Create <a>
  a.href = data; //Image Base64 Goes here
  a.download = fileName; //File name Here
  a.click(); //Downloaded file
  a.remove();
}

PIXIMAP.convertCanvasImageToFile = function(cb) {
  const renderer = PIXIMAP.app.renderer
  const sprite = PIXIMAP.app.stage
  const name = `piximapimage-${window.uniqueID()}.png`

  renderer.render(sprite);
  const dataURI = renderer.view.toDataURL('image/png', 1)

  function urltoFile(url, filename, mimeType){
    return (fetch(url)
        .then(function(res){return res.arrayBuffer();})
        .then(function(buf){return new File([buf], filename,{type:mimeType});})
    );
  }

  urltoFile(dataURI, name, 'image/png').then(function(file){ cb(file) });
}

PIXIMAP.getShadowBoundaries = function(hero) {
  const { gridX, gridY, gridWidth, gridHeight } = HERO.getViewBoundaries(hero)
  const padding = GAME.world.chunkRenderPadding || 6
  let startX = gridX - padding
  let endX = gridX + gridWidth + padding
  let startY = gridY - padding
  let endY = gridY + gridHeight + padding
  if(startX < 0) startX = 0
  if(endX > PIXIMAP.grid.width) endX = PIXIMAP.grid.width
  if(startY < 0) startY = 0
  if(endY > PIXIMAP.grid.height) endY = PIXIMAP.grid.height

  return {
    startX,
    startY,
    endX,
    endY
  }
}

PIXIMAP.convertToPartObject = function(gameObject, part) {
  let sprite = part.sprite || gameObject.sprite || 'solidcolorsprite'
  let color = part.color || gameObject.color || GAME.world.defaultObjectColor
  let defaultSprite = part.defaultSprite || gameObject.defaultSprite || 'solidcolorsprite'
  const partObject = {tags: {...gameObject.tags},  ...part, removed: gameObject.removed, color: color, sprite: sprite, defaultSprite: defaultSprite}
  if(gameObject.id === CONSTRUCTEDITOR.objectId) partObject.tags.invisible = true

  return partObject
}

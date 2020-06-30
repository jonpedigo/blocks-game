import tinycolor from 'tinycolor2'
import { updatePixiObject, initPixiObject } from './objects'
import { initPixiApp } from './app'

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

  PIXIMAP.initialized = true
}

PIXIMAP.onAssetsLoaded = function() {
  PIXIMAP.initializePixiObjectsFromGame()
}

PIXIMAP.onGameLoaded = function() {
  // GAME.world.tags.usePixiMap = true

  if(!PIXIMAP.assetsLoaded) {
    initPixiApp(MAP.canvas, (app, textures) => {
      window.local.emit('onAssetsLoaded')
    })
  } else if(PIXIMAP.assetsLoaded) {
    PIXIMAP.stage.removeChildren()
    PIXIMAP.initializePixiObjectsFromGame()
  }
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
  const stage = PIXIMAP.stage

  const pixiChild = stage.getChildByName(object.id)
  if(!pixiChild) return
  if(pixiChild.children && pixiChild.children.length) {
    pixiChild.removeChildren()
  }
  if(pixiChild.emitter) {
    PIXIMAP.stage.emitters = PIXIMAP.stage.emitters.filter((emitter) => {
      if(pixiChild.emitter === emitter) return false
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
    PIXIMAP.app.renderer.backgroundColor = parseInt(tinycolor(GAME.world.backgroundColor).toHex(), 16)
    PIXIMAP.stage.pivot.x = camera.x
    PIXIMAP.stage.pivot.y = camera.y
    GAME.objects.forEach((object) => {
      updatePixiObject(object, PIXIMAP.stage)
    })
    GAME.heroList.forEach((hero) => {
      updatePixiObject(hero, PIXIMAP.stage)
    })
  }
}



// A function to combine different assets of your world object, but give them a common transform by using pixi-layers
// It is of course recommended to create a custom class for this, but this demo just shows the minimal steps required
PIXIMAP.createShadowSprite = function(texture, shadowTexture) {
    var container = new PIXI.Container(); // This represents your final 'sprite'

    // Things that create shadows
    if (shadowTexture) {
        var shadowCastingSprite = new PIXI.Sprite(shadowTexture);
        shadowCastingSprite.parentGroup = PIXI.shadows.casterGroup;
        container.addChild(shadowCastingSprite);
    }

    // The things themselves (their texture)
    var sprite = new PIXI.Sprite(texture);
    container.addChild(sprite);

    return container;
}

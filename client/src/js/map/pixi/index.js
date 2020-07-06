import tinycolor from 'tinycolor2'
import { updatePixiObject, initPixiObject } from './objects'
import { initPixiApp } from './app'
import 'pixi-layers'
import * as PixiLights from "pixi-lights";

window.PIXIMAP = {
  textures: {},
  initialized: false,
  app: null,
  stage: null,
}

PIXIMAP.initializePixiObjectsFromGame = function() {
  const background = new PIXI.extras.TilingSprite(
      PIXI.Texture.from('assets/images/p2.jpeg'),
      2000,
      2000,
  );
  background.parentGroup = PIXIMAP.sortGroup
  PIXIMAP.objectStage.addChild(background);

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
    if(PIXIMAP.shadowStage) PIXIMAP.shadowStage.removeChildren()
    PIXIMAP.objectStage.removeChildren()
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
    pixiChild.children.forEach((child) => {
      if(child.children) child.removeChildren()
    })
    pixiChild.removeChildren()
  }
  if(pixiChild.emitter) {
    PIXIMAP.objectStage.emitters = PIXIMAP.objectStage.emitters.filter((emitter) => {
      if(pixiChild.emitter === emitter) {
        console.log("FPIMD EMITTER")
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
    // MAP.canvas.style.backgroundColor = ''
    // PIXIMAP.app.renderer.backgroundColor = parseInt(tinycolor(GAME.world.backgroundColor).toHex(), 16)
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

PIXIMAP.createSpritePair = function (diffuseTex, normalTex) {
  var container = new PIXI.Container();
  var diffuseSprite = new PIXI.Sprite(diffuseTex);
  diffuseSprite.parentGroup = PixiLights.diffuseGroup;

  var normalSprite = new PIXI.Sprite(normalTex);
  normalSprite.parentGroup = PixiLights.normalGroup;
  container.addChild(diffuseSprite);
  container.addChild(normalSprite);

  return container;
}

PIXIMAP.createLight = function(type, radius, intensity, color) {
    var container = new PIXI.Container();

    if(type === 'point') {
      const pixiLight = new PixiLights.PointLight(color, intensity);
      container.addChild(pixiLight);
    }
    if(type === 'ambient') {
      const pixiLight = new PixiLights.AmbientLight(color, intensity);
      container.addChild(pixiLight);
    }
    if(!GAME.world.tags.shadow) {
      if(type === 'directional') {
        const pixiLight = new PixiLights.DirectionalLight(color, intensity, new PIXI.Point(0, 1));
        container.addChild(pixiLight);
      }
    }

    if(GAME.world.tags.shadow) {
      var shadow = new PIXI.shadows.Shadow(radius, 0.7); // Radius in pixels
      container.addChild(shadow);
    }

    return container;
}

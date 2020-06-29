// how pixi loads and draws game items for a basic map setup
import * as PIXI from 'pixi.js'
import tileset from './tileset.json'
import tinycolor from 'tinycolor2'
import { updatePixiObject, initPixiObject } from './objects'

const textures = {};
let stage

window.PIXIMAP = {
  textures: {},
  initialized: false,
  app: null,
  stage: null,
}

const initPixiApp = (canvasRef, onLoad) => {
  // init pixi app and textures
  const app = new PIXI.Application({
    width: canvasRef.width, height: canvasRef.height,
  });
  document.getElementById('GameContainer').appendChild(app.view);

  stage = app.stage
  PIXIMAP.stage = stage
  PIXIMAP.app = app

  app.stage.emitters = []

  // GAME.world.tags.useFlatColors = true
  // if(GAME.world.tags.useFlatColors) {
  //   app.stage.filters = [new ColorOverlayFilter(parseInt(tinycolor('red').toHex(), 16))]
  // }

  app.ticker.add(function(delta) {
    // console.log(app.stage)
    app.stage.emitters.forEach((emitter) => {
      if(!emitter.emit) return
      emitter.update(2 * 0.001);
    })
  });

  if(PAGE.role.isPlayer) {
    function onResize() {
      MAP.canvasMultiplier = window.innerWidth/640;
      const width = 640 * MAP.canvasMultiplier;
      const height = 320 * MAP.canvasMultiplier;
      app.renderer.resize(width, height);
    }
    window.addEventListener("resize", onResize);
    onResize()
  }

  app.loader.add('assets/images/tileset.png').load(() => {
    tileset.forEach((tile) => {
      let baseTexture = new PIXI.BaseTexture('assets/images/tileset.png');
      baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
      let texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(tile.x, tile.y, tile.width, tile.height));
      texture.id = tile.id
      textures[tile.id] = texture
    })

    app.loader.add(['assets/images/solidcolorsprite.png', 'assets/images/invisiblesprite.png', 'assets/images/firepit-1.png', 'assets/images/entarkia-1.png']).load(() => {
      let texture = PIXI.Texture.from('assets/images/firepit-1.png');
      texture.id = 'firepit-1'
      textures['firepit-1'] = texture

      texture = PIXI.Texture.from('assets/images/entarkia-1.png');
      texture.id = 'entarkia-1'
      textures['entarkia-1'] = texture

      texture = PIXI.Texture.from('assets/images/solidcolorsprite.png');
      texture.id = 'solidcolorsprite'
      textures['solidcolorsprite'] = texture
      texture.scaleMode = PIXI.SCALE_MODES.NEAREST

      const baseTexture = new PIXI.BaseTexture('assets/images/invisiblesprite.png');
      baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
      texture = new PIXI.Texture(baseTexture)
      texture.id = 'invisiblesprite'
      textures['invisiblesprite'] = texture

      texture = PIXI.Texture.from('assets/images/spencer-1.png');
      texture.id = 'spencer-1'
      textures['spencer-1'] = texture
      PIXIMAP.textures = textures
      PIXIMAP.assetsLoaded = true
      onLoad(app, textures)
    })
  })
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

export default {
  initPixiApp,
}

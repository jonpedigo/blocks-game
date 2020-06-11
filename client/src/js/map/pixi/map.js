// how pixi loads and draws game items for a basic map setup
import * as PIXI from 'pixi.js'
import tileset from './tileset.json'
import { flameEmitter } from './particles'
import tinycolor from 'tinycolor2'

const GRID_SIZE = 40
const STAGE_WIDTH = window.innerWidth;
const STAGE_HEIGHT = window.innerHeight;

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
  document.body.appendChild(app.view);

  stage = app.stage
  PIXIMAP.stage = stage
  PIXIMAP.app = app

  app.stage.emitters = []
  app.ticker.add(function(delta) {
    // console.log(app.stage)
    app.stage.emitters.forEach((emitter) => {
      emitter.update(2 * 0.001);
    })
  });
  app.loader.add('assets/images/tileset.png').load(() => {
    tileset.forEach((tile) => {
      let baseTexture = new PIXI.BaseTexture('assets/images/tileset.png');
      let texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(tile.x, tile.y, tile.width, tile.height));
      texture.id = tile.id
      textures[tile.id] = texture
    })

    app.loader.add(['assets/images/firepit-1.png', 'assets/images/entarkia-1.png']).load(() => {
      let texture = PIXI.Texture.from('assets/images/firepit-1.png');
      texture.id = 'firepit-1'
      textures['firepit-1'] = texture

      texture = PIXI.Texture.from('assets/images/entarkia-1.png');
      texture.id = 'entarkia-1'
      textures['entarkia-1'] = texture

      texture = PIXI.Texture.from('assets/images/spencer-1.png');
      texture.id = 'spencer-1'
      textures['spencer-1'] = texture
      PIXIMAP.textures = textures
      PIXIMAP.initialized = true
      onLoad(app, textures)
    })
  })
}


const addGameObjectToStage = (gameObject, stage) => {
  if(!gameObject.sprite) {
    gameObject.sprite = 'tree-1'
  }

  const texture = textures[gameObject.sprite]
  let sprite
  if(gameObject.tags.tilingSprite) {
    sprite = new PIXI.TilingSprite(texture, gameObject.width * MAP.camera.multiplier, gameObject.height * MAP.camera.multiplier)
  } else {
    sprite = new PIXI.Sprite(texture)
    sprite.transform.scale.x = (gameObject.width/8) * MAP.camera.multiplier
    sprite.transform.scale.y = (gameObject.height/8) * MAP.camera.multiplier
  }
  // if(gameObject.angle) {
  //   sprite.rotation = gameObject.angle
  //   sprite.pivot.x = gameObject.height/2 * MAP.camera.multiplier
  //   sprite.pivot.y = gameObject.height/2 * MAP.camera.multiplier
  // }

  sprite.x = (gameObject.x) * MAP.camera.multiplier
  sprite.y = (gameObject.y) * MAP.camera.multiplier

  sprite.name = gameObject.id
  // sprite.oldSprite = gameObject.sprite
  if(gameObject.color) sprite.tint = parseInt(tinycolor(gameObject.color).toHex(), 16)
  const addedChild = stage.addChild(sprite)
  if (gameObject.emitter) {
    let emitter = flameEmitter({stage, startPos: {x: gameObject.x * MAP.camera.multiplier, y: gameObject.y * MAP.camera.multiplier}})
    stage.emitters.push(emitter)
    addedChild.emitter = emitter
  }
}
const initPixiObject = (gameObject) => {
  if (gameObject.invisible) return

  if(gameObject.constructParts) {
    const container = new PIXI.Container()
    gameObject.constructParts.forEach((part) => {
      addGameObjectToStage({tags: gameObject.tags, ...part}, container)
    })
    container.name = gameObject.id
    PIXIMAP.stage.addChild(container)
    return
  }

  if(gameObject.subObjects) {
    OBJECTS.forAllSubObjects(gameObject.subObjects, (subObject) => {
      if(subObject.tags.potential) return
      addGameObjectToStage(subObject, PIXIMAP.stage)
    })
  }

  addGameObjectToStage(gameObject, PIXIMAP.stage)
}

const updatePixiObject = (gameObject) => {
  if(gameObject.constructParts) {
    gameObject.constructParts.forEach((part) => {
      updatePixiObject({tags: gameObject.tags, ...part})
    })
    return
  }
  if(gameObject.subObjects) {
    OBJECTS.forAllSubObjects(gameObject.subObjects, (subObject) => {
      if(subObject.tags.potential) return
      updatePixiObject(subObject)
    })
  }

  const pixiChild = stage.getChildByName(gameObject.id)
  if(!pixiChild) {
    initPixiObject(gameObject)
    return
  }

  // remove if its invisible now
  if (gameObject.tags.invisible || gameObject.removed){
    if(pixiChild.emitter) pixiChild.emitter.emit = false
    pixiChild.visible = false
    return
  }

  if(gameObject.sprite != pixiChild.texture.id) {
    stage.removeChild(pixiChild)
    initPixiObject(gameObject)
    return
  }

  pixiChild.x = (gameObject.x) * MAP.camera.multiplier
  pixiChild.y = (gameObject.y) * MAP.camera.multiplier
  // if(gameObject.angle) pixiChild.rotation = gameObject.angle
  if(!gameObject.tags.tilingSprite) {
    pixiChild.transform.scale.x = (gameObject.width/8) * MAP.camera.multiplier
    pixiChild.transform.scale.y = (gameObject.height/8) * MAP.camera.multiplier
  }
  if(gameObject.color) pixiChild.tint = parseInt(tinycolor(gameObject.color).toHex(), 16)
}

PIXIMAP.initializePixiObjectsFromGame = function() {
  GAME.objects.forEach((object) => {
    object.sprite = 'tree-1'
    initPixiObject(object)
  })
  GAME.heroList.forEach((hero) => {
    hero.sprite = 'entarkia-1'
    initPixiObject(hero)
  })
}

PIXIMAP.onAssetsLoaded = function() {
  PIXIMAP.initializePixiObjectsFromGame()
}

PIXIMAP.onGameLoaded = function() {
  GAME.world.usePixiMap = true
  if(GAME.world.usePixiMap && !PIXIMAP.initialized) {
    initPixiApp(MAP.canvas, (app, textures) => {
      window.local.emit('onAssetsLoaded')
    })
  } else if(PIXIMAP.initialized) {
    PIXIMAP.stage.removeChildren()
    PIXIMAP.initializePixiObjectsFromGame()
  }
}

PIXIMAP.onDeleteObject = function(object) {
  const pixiChild = stage.getChildByName(object.id)
  stage.removeChild(pixiChild)
}

PIXIMAP.onDeleteSubObject = function(object) {
  const pixiChild = stage.getChildByName(object.id)
  stage.removeChild(pixiChild)
}

export default {
  initPixiApp,
  initPixiObject,
  updatePixiObject,
}

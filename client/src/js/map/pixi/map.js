// how pixi loads and draws game items for a basic map setup
import * as PIXI from 'pixi.js'
import { GlowFilter, OutlineFilter } from 'pixi-filters'
import tileset from './tileset.json'
import { flameEmitter } from './particles'
import tinycolor from 'tinycolor2'

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
  MAP.canvas.style.position = 'fixed'

  app.stage.emitters = []

  // GAME.world.tags.useFlatColors = true
  // if(GAME.world.tags.useFlatColors) {
  //   app.stage.filters = [new ColorOverlayFilter(parseInt(tinycolor('red').toHex(), 16))]
  // }

  app.ticker.add(function(delta) {
    // console.log(app.stage)
    app.stage.emitters.forEach((emitter) => {
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

    app.loader.add(['assets/images/solidcolorsprite.png', 'assets/images/outlinesprite.png', 'assets/images/firepit-1.png', 'assets/images/entarkia-1.png']).load(() => {
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

      const baseTexture = new PIXI.BaseTexture('assets/images/outlinesprite.png');
      baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
      texture = new PIXI.Texture(baseTexture)
      texture.id = 'outlinesprite'
      textures['outlinesprite'] = texture

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
  let camera = MAP.camera
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  }
  if(PAGE.role.isHost) gameObject = gameObject.mod()

  if(gameObject.defaultSprite) {
    gameObject.sprite = gameObject.defaultSprite
  } else {
    gameObject.defaultSprite = 'solidcolorsprite'
    gameObject.sprite = gameObject.defaultSprite
  }

  const texture = textures[gameObject.sprite]
  let sprite
  if(gameObject.tags.tilingSprite) {
    sprite = new PIXI.TilingSprite(texture, gameObject.width, gameObject.height)
    sprite.transform.scale.x = camera.multiplier
    sprite.transform.scale.y = camera.multiplier
  } else {
    sprite = new PIXI.Sprite(texture)
    sprite.transform.scale.x = (gameObject.width/texture._frame.width) * camera.multiplier
    sprite.transform.scale.y = (gameObject.height/texture._frame.height) * camera.multiplier
  }

  if(gameObject.tags.rotateable) {
    sprite.anchor.set(0.5, 0.5)
    sprite.rotation = gameObject.angle || 0
    sprite.x = (gameObject.x + gameObject.width/2) * camera.multiplier
    sprite.y = (gameObject.y + gameObject.height/2) * camera.multiplier
  } else {
    sprite.x = (gameObject.x) * camera.multiplier
    sprite.y = (gameObject.y) * camera.multiplier
  }

  sprite.name = gameObject.id
  // sprite.oldSprite = gameObject.sprite
  if(gameObject.color) sprite.tint = parseInt(tinycolor(gameObject.color).toHex(), 16)
  const addedChild = stage.addChild(sprite)
  if (gameObject.emitter) {
    let emitter = flameEmitter({stage, startPos: {x: gameObject.x * camera.multiplier, y: gameObject.y * camera.multiplier}})
    stage.emitters.push(emitter)
    addedChild.emitter = emitter
  }
}

const initPixiObject = (gameObject) => {
  if(PAGE.role.isHost) gameObject = gameObject.mod()

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
  let camera = MAP.camera
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  }

  if(PAGE.role.isHost) gameObject = gameObject.mod()

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

  const isOutline = GAME.world.tags.useFlatColors && !gameObject.tags.filled
  // remove if its invisible now
  if (gameObject.tags.invisible || gameObject.removed || isOutline){
    if(pixiChild.emitter) pixiChild.emitter.emit = false
    pixiChild.visible = false
    return
  }

  // console.log(gameObject.sprite, pixiChild.texture.id)

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

  if(gameObject.sprite != pixiChild.texture.id) {
    pixiChild.texture = PIXIMAP.textures[gameObject.sprite]
  }

  if(gameObject.tags.solidColor) {
    pixiChild.texture = PIXIMAP.textures['solidcolorsprite']
  }

  if(gameObject.tags.rotateable) {
    pixiChild.anchor.set(0.5, 0.5)
    pixiChild.rotation = gameObject.angle || 0
    pixiChild.x = (gameObject.x + gameObject.width/2) * camera.multiplier
    pixiChild.y = (gameObject.y + gameObject.height/2) * camera.multiplier
  } else {
    pixiChild.x = (gameObject.x) * camera.multiplier
    pixiChild.y = (gameObject.y) * camera.multiplier
  }
  if(gameObject.tags.tilingSprite) {
    pixiChild.transform.scale.x = camera.multiplier
    pixiChild.transform.scale.y = camera.multiplier
  } else if(pixiChild.texture){
    pixiChild.transform.scale.x = (gameObject.width/pixiChild.texture._frame.width) * camera.multiplier
    pixiChild.transform.scale.y = (gameObject.height/pixiChild.texture._frame.height) * camera.multiplier
  }
  if(gameObject.color) pixiChild.tint = parseInt(tinycolor(gameObject.color).toHex(), 16)

  if(HERO.id && GAME.heros[HERO.id] && GAME.heros[HERO.id].interactableObject && gameObject.id === GAME.heros[HERO.id].interactableObject.id) {
    pixiChild.filters = [new GlowFilter(3, 0xFFFFFF)];
  } else {
    removeFilter(pixiChild, GlowFilter)
  }
}

function removeFilter(pixiChild, filterClass) {
  if(pixiChild.filters) {
    pixiChild.filters = pixiChild.filters.filter((filter) => {
      if(filter instanceof filterClass) return false
      return true
    })
  }
}

PIXIMAP.initializePixiObjectsFromGame = function() {
  GAME.objects.forEach((object) => {
    if(!object.sprite) object.sprite = 'tree-1'
    initPixiObject(object)
  })
  GAME.heroList.forEach((hero) => {
    if(!hero.sprite) hero.sprite = 'entarkia-1'
    initPixiObject(hero)
  })
}

PIXIMAP.onAssetsLoaded = function() {
  PIXIMAP.initializePixiObjectsFromGame()
}

PIXIMAP.onGameLoaded = function() {
  // GAME.world.tags.usePixiMap = true

  if(GAME.world.tags.usePixiMap && !PIXIMAP.initialized) {
    initPixiApp(MAP.canvas, (app, textures) => {
      window.local.emit('onAssetsLoaded')
    })
  } else if(PIXIMAP.initialized) {
    PIXIMAP.stage.removeChildren()
    PIXIMAP.initializePixiObjectsFromGame()
  }
}

PIXIMAP.onDeleteHero = function(object) {
  const pixiChild = stage.getChildByName(object.id)
  stage.removeChild(pixiChild)
}

PIXIMAP.onDeleteObject = function(object) {
  const pixiChild = stage.getChildByName(object.id)
  stage.removeChild(pixiChild)
}

PIXIMAP.onDeleteSubObject = function(object) {
  const pixiChild = stage.getChildByName(object.id)
  stage.removeChild(pixiChild)
}

PIXIMAP.onRender = function() {
  let camera = MAP.camera
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  }

  if(PIXIMAP.initialized) {
    MAP.canvas.style.backgroundColor = ''
    PIXIMAP.app.renderer.backgroundColor = parseInt(tinycolor(GAME.world.backgroundColor).toHex(), 16)
    PIXIMAP.stage.pivot.x = camera.x
    PIXIMAP.stage.pivot.y = camera.y
    GAME.objects.forEach((object) => {
      updatePixiObject(object)
    })
    GAME.heroList.forEach((hero) => {
      updatePixiObject(hero)
    })
  }
}

export default {
  initPixiApp,
  initPixiObject,
  updatePixiObject,
}

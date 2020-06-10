// how pixi loads and draws game items for a basic map setup
import * as PIXI from 'pixi.js'
import tileset from './tileset.json'
import { flameEmitter } from './particles'

const GRID_SIZE = 40
const STAGE_WIDTH = window.innerWidth;
const STAGE_HEIGHT = window.innerHeight;

const textures = {};
let stage

window.PIXIMAP = {}

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
      onLoad(app, textures)
    })
  })
}

const initPixiObject = (gameObject) => {
  if (gameObject.invisible) return

  if (gameObject.sprite) {
    //   const bunny = new PIXI.Sprite(textures['entarkia-1']);
    let sprite = new PIXI.Sprite(textures[gameObject.sprite])
    sprite.x = (gameObject.x) * MAP.camera.multiplier
    sprite.y = (gameObject.y) * MAP.camera.multiplier
    sprite.transform.scale.x = (gameObject.width/8) * MAP.camera.multiplier
    sprite.transform.scale.y = (gameObject.height/8) * MAP.camera.multiplier
    sprite.name = gameObject.id
    // sprite.oldSprite = gameObject.sprite
    // if(gameObject.tint) sprite.tint = gameObject.tint
    const addedChild = PIXIMAP.app.stage.addChild(sprite)
    // if (gameObject.emitter) {
    //   let emitter = flameEmitter({stage, startPos: {x: gameObject.x, y: gameObject.y }})
    //   stage.emitters.push(emitter)
    //   addedChild.emitter = emitter
    // }
  }
}

const updatePixiObject = (gameObject) => {
  const pixiChild = stage.getChildByName(gameObject.id)
  if(!pixiChild) return

  // remove if its invisible now
  if (gameObject.invisible){
    if(pixiChild.emitter) pixiChild.emitter.emit = false
    stage.removeChild(pixiChild)
    return
  }

  if(gameObject.sprite != pixiChild.texture.id){
    stage.removeChild(pixiChild)
    initPixiObject(gameObject)
    return
  }

  // change to new x
  pixiChild.x = (gameObject.x) * MAP.camera.multiplier
  pixiChild.y = (gameObject.y) * MAP.camera.multiplier
  pixiChild.transform.scale.x = (gameObject.width/8) * MAP.camera.multiplier
  pixiChild.transform.scale.y = (gameObject.height/8) * MAP.camera.multiplier

  //TODO: remove and add pixi item if character has changed
}

export default {
  initPixiApp,
  initPixiObject,
  updatePixiObject,
}

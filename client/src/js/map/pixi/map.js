// how pixi loads and draws game items for a basic map setup

import * as PIXI from 'pixi.js-legacy'
import tileset from './tileset.json'
import { flameEmitter } from './particles'

const GRID_SIZE = 40
const STAGE_WIDTH = window.innerWidth;
const STAGE_HEIGHT = window.innerHeight;

const initPixiApp = ({canvasRef, onLoad}) => {
  // init pixi app and textures
  const textures = {};
  const app = new PIXI.Application({ view: canvasRef.current, width: STAGE_WIDTH, height: STAGE_HEIGHT })
  app.stage.sortableChildren = true
  app.stage.emitters = []
  app.ticker.add(function(delta) {
    // console.log(app.stage)
    app.stage.emitters.forEach((emitter) => {
      emitter.update(2 * 0.001);
    })
  });
  app.loader.add('images/tileset.png').load(() => {
    tileset.forEach((tile) => {
      let baseTexture = new PIXI.BaseTexture('images/tileset.png');
      let texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(tile.x, tile.y, tile.width, tile.height));
      texture.name = tile.name
      textures[tile.name] = texture
    })

    app.loader.add(['images/firepit-1.png', 'images/entarkia-1.png']).load(() => {
      let texture = PIXI.Texture.from('images/firepit-1.png');
      texture.name = 'firepit-1'
      textures['firepit-1'] = texture

      texture = PIXI.Texture.from('images/entarkia-1.png');
      texture.name = 'entarkia-1'
      textures['entarkia-1'] = texture

      texture = PIXI.Texture.from('images/spencer-1.png');
      texture.name = 'spencer-1'
      textures['spencer-1'] = texture
      onLoad({app, textures})
    })
  })
}

const initGameItem = ({gameItem, textures, stage}) => {
  if (gameItem.invisible) return

  if (gameItem.sprite) {
    let sprite = new PIXI.Sprite(textures[gameItem.sprite])
    sprite.transform.position.x = (gameItem.x * GRID_SIZE)
    sprite.transform.position.y = (gameItem.y * GRID_SIZE)
    sprite.transform.scale.x = 5.3
    sprite.transform.scale.y = 5.3
    sprite.name = gameItem.name
    sprite.oldSprite = gameItem.sprite
    sprite.zIndex = gameItem.z
    if(gameItem.tint) sprite.tint = gameItem.tint
    const addedChild = stage.addChild(sprite)
    if (gameItem.emitter) {
      let emitter = flameEmitter({stage, startPos: {x: gameItem.x * GRID_SIZE, y: gameItem.y * GRID_SIZE }})
      stage.emitters.push(emitter)
      addedChild.emitter = emitter
    }
  } else if (gameItem.character) {
    let text = new PIXI.Text(gameItem.character, {fontFamily : 'Courier New', fontSize: GRID_SIZE, fill : '#ff1010', align : 'center'})
    text.transform.position.x = (gameItem.x * GRID_SIZE)
    text.transform.position.y = (gameItem.y * GRID_SIZE)
    text.name = gameItem.name
    text.zIndex = gameItem.z
    stage.addChild(text)
  }
}

const updateGameItem = ({gameItem, textures, stage}) => {
  const pixiChild = stage.getChildByName(gameItem.name)
  if(!pixiChild) return

  // remove if its invisible now
  if (gameItem.invisible){
    console.log(pixiChild.emitter)
    if(pixiChild.emitter) pixiChild.emitter.emit = false
    console.log('removing because invisible')
    stage.removeChild(pixiChild)
    return
  }

  if(gameItem.sprite != pixiChild.texture.name){
    console.log('sprite-changed')
    stage.removeChild(pixiChild)
    initGameItem({gameItem, textures, stage})
    return
  }

  // change to new x
  pixiChild.transform.position.x = (gameItem.x * GRID_SIZE)
  pixiChild.transform.position.y = (gameItem.y * GRID_SIZE)

  //TODO: remove and add pixi item if character has changed
}

export default {
  initPixiApp,
  initGameItem,
  updateGameItem,
}

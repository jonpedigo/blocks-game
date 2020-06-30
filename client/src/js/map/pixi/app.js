import * as PIXI from 'pixi.js'
window.PIXI = PIXI
import 'pixi-layers'
import { GlowFilter, OutlineFilter } from 'pixi-filters'
import tinycolor from 'tinycolor2'
import tileset from './tileset.json'

const textures = {};
let stage

const initPixiApp = (canvasRef, onLoad) => {
  // init pixi app and textures
  const app = new PIXI.Application({
    width: canvasRef.width, height: canvasRef.height,
  });
  document.getElementById('GameContainer').appendChild(app.view);

  // CODE
  app.stage = new PIXI.display.Stage();


  const background = new PIXI.TilingSprite(
      PIXI.Texture.from('assets/images/p2.jpeg'),
      2000,
      2000,
  );
  app.stage.addChild(background);

  ///////////////
  ///////////////
  ///////////////
  // OBJECT STAGE
  PIXIMAP.objectStage = new PIXI.Container();
  app.stage.addChild(PIXIMAP.objectStage);
  PIXIMAP.objectStage.emitters = []

  ///////////////
  ///////////////
  ///////////////
  // LIGHTING
  const lighting = new PIXI.display.Layer();
  lighting.on('display', (element) => {
      element.blendMode = PIXI.BLEND_MODES.ADD;
  });
  lighting.useRenderTexture = true;
  lighting.clearColor = [0.05, 0.05, 0.05, 1]; // ambient gray
  PIXIMAP.lighting = lighting
  PIXIMAP.lightingLayer = app.stage.addChild(lighting);

  const lightingSprite = new PIXI.Sprite(lighting.getRenderTexture());
  lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  app.stage.addChild(lightingSprite);
  PIXIMAP.lightingSprite = lightingSprite
  ///////////////
  ///////////////

  stage = app.stage
  PIXIMAP.stage = stage
  PIXIMAP.app = app


  // GAME.world.tags.useFlatColors = true
  // if(GAME.world.tags.useFlatColors) {
  //   app.stage.filters = [new ColorOverlayFilter(parseInt(tinycolor('red').toHex(), 16))]
  // }

  app.ticker.add(function(delta) {
    // console.log(app.stage)
    PIXIMAP.objectStage.emitters.forEach((emitter) => {
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

export {
  initPixiApp,
}

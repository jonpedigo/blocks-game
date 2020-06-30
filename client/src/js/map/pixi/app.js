import * as PIXI from 'pixi.js'
window.PIXI = PIXI
import 'pixi-layers'
import { GlowFilter, OutlineFilter } from 'pixi-filters'
import tinycolor from 'tinycolor2'
import tileset from './tileset.json'
import "pixi-shadows";

const textures = {};
let stage

const initPixiApp = (canvasRef, onLoad) => {
  // init pixi app and textures
  const app = new PIXI.Application({
    width: canvasRef.width, height: canvasRef.height,
  });
  document.getElementById('GameContainer').appendChild(app.view);

  let world
  if(GAME.world.tags.shadow) {
    world = PIXI.shadows.init(app);
    // PIXI.shadows.filter.ambientLight = .7
  } else {
    world = app.stage
  }

  // CODE

  const background = new PIXI.extras.TilingSprite(
      PIXI.Texture.from('assets/images/p2.jpeg'),
      2000,
      2000,
  );
  world.addChild(background);

  ///////////////
  ///////////////
  ///////////////
  // OBJECT STAGE
  PIXIMAP.objectStage = new PIXI.Container();
  world.addChild(PIXIMAP.objectStage);
  PIXIMAP.objectStage.emitters = []

  PIXIMAP.stage = world
  PIXIMAP.app = app


  // GAME.world.tags.useFlatColors = true
  // if(GAME.world.tags.useFlatColors) {
  //   world.stage.filters = [new ColorOverlayFilter(parseInt(tinycolor('red').toHex(), 16))]
  // }

  app.ticker.add(function(delta) {
    // console.log(world.stage)
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

  app.loader.add('assets/images/tileset.png').load((loaded) => {
    tileset.forEach((tile) => {
      let baseTexture = PIXI.BaseTexture.from('assets/images/tileset.png');
      baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
      let texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(tile.x, tile.y, tile.width, tile.height));
      texture.id = tile.id
      textures[tile.id] = texture
    })

    app.loader.add(['assets/images/solidcolorsprite.png', 'assets/images/invisiblesprite.png', 'assets/images/firepit-1.png', 'assets/images/entarkia-1.png']).load((loaded) => {
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

      // texture = PIXI.Texture.from('assets/images/invisiblesprite.png')
      // texture.id = 'invisiblesprite'
      // textures['invisiblesprite'] = texture
      // texture.scaleMode = PIXI.SCALE_MODES.NEAREST

      texture = PIXI.Texture.from('assets/images/spencer-1.png');
      texture.id = 'spencer-1'
      textures['spencer-1'] = texture
      PIXIMAP.textures = textures
      PIXIMAP.assetsLoaded = true

      onLoad(app, textures)
    })
  })


  if(GAME.world.tags.shadow && PAGE.role.isAdmin) {
    // Create a light that casts shadows
    var shadow = new PIXI.shadows.Shadow(700, 1);
    shadow.position.set(450, 150);
    world.addChild(shadow);

    // Make the light track your mouse
    world.interactive = true;
    world.on("mousemove", function(event) {
        shadow.position.copy(event.data.global);
    });
  }
}

export {
  initPixiApp,
}

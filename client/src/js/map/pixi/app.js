import * as PIXI from 'pixi.js'
window.PIXI = PIXI
import 'pixi-layers'
import { GlowFilter, OutlineFilter } from 'pixi-filters'
import tinycolor from 'tinycolor2'
import tileset from './tileset.json'
import "./pixi-shadows";
import * as PixiLights from "pixi-lights";

const textures = {};
let stage

const initPixiApp = (canvasRef, onLoad) => {
  ///////////////
  ///////////////
  ///////////////
  // INTIIALIZE
  const app = new PIXI.Application({
    width: canvasRef.width, height: canvasRef.height,
    background: 0x000000
  });
  app.view.id = "pixi-canvas"
  document.getElementById('GameContainer').appendChild(app.view);

  let world
  app.stage = new PIXI.display.Stage();
  if(GAME.world.tags.shadow) {
    world = PIXI.shadows.init(app);
    PIXI.shadows.filter.ambientLight = .2

    PIXIMAP.shadowStage = new PIXI.display.Layer()
    world.addChild(PIXIMAP.shadowStage);
  } else {
    world = app.stage
  }

  PIXIMAP.stage = world
  PIXIMAP.app = app


  ///////////////
  ///////////////
  ///////////////
  // OBJECT STAGE
  PIXIMAP.sortGroup = new PIXI.display.Group(0, true);
  PIXIMAP.sortGroup.on('sort', function(sprite) {
      if(sprite.name) {
        const object = OBJECTS.getObjectOrHeroById(sprite.name)
        if(!object) {
          return
        }
        if(object.tags.emitter) {
          sprite.zOrder = -1000000000000;
        }
        if(object.tags.obstacle || object.tags.hero){
          sprite.zOrder = -sprite.y - 10000;
        }
      }
  });
  PIXIMAP.sortGroup.sortPriority = 1;

  PIXIMAP.objectStage = new PIXI.display.Layer(PIXIMAP.sortGroup)
  world.addChild(PIXIMAP.objectStage);



  if(!GAME.world.tags.shadow) {
    // PIXIMAP.objectStage.addChild(
    //   new PIXI.display.Layer(PixiLights.diffuseGroup),
    //   new PIXI.display.Layer(PixiLights.normalGroup),
    //   new PIXI.display.Layer(PixiLights.lightGroup),
    // );
  }


  // GAME.world.tags.useFlatColors = true
  // if(GAME.world.tags.useFlatColors) {
  //   world.stage.filters = [new ColorOverlayFilter(parseInt(tinycolor('red').toHex(), 16))]
  // }

  ///////////////
  ///////////////
  ///////////////
  // EMITTERS
  PIXIMAP.objectStage.emitters = []

  app.ticker.add(function(delta) {
    // console.log(world.stage)
    PIXIMAP.objectStage.emitters.forEach((emitter) => {
      if(!emitter.emit) return
      emitter.update(2 * 0.001);
    })
  });

  ///////////////
  ///////////////
  ///////////////
  // ON RESIZE
  if(PAGE.role.isPlayer) {
    function onResize() {
      MAP.canvasMultiplier = window.innerWidth/640;
      const width = (640 * MAP.canvasMultiplier);
      const height = (320 * MAP.canvasMultiplier);
      app.renderer.resize(width, height);
    }
    if(!GAME.world.tags.shadow) window.addEventListener("resize", onResize);
    onResize()
  }


  ///////////////
  ///////////////
  ///////////////
  // SPRITES
  app.loader.add('assets/images/tileset.png').load((loaded) => {
    tileset.forEach((tile) => {
      let baseTexture = PIXI.BaseTexture.from('assets/images/tileset.png');
      baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
      let texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(tile.x, tile.y, tile.width, tile.height));
      texture.id = tile.id
      textures[tile.id] = texture
    })

    app.loader.add(['assets/images/block.png', 'assets/images/blockNormalMap.png', 'assets/images/solidcolorsprite.png', 'assets/images/solidcolorsprite_n.png', 'assets/images/invisiblesprite.png', 'assets/images/firepit-1.png', 'assets/images/entarkia-1.png']).load((loaded) => {
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

      texture = PIXI.Texture.from('assets/images/solidcolorsprite_n.png');
      texture.id = 'solidcolorsprite_n'
      textures['solidcolorsprite_n'] = texture
      texture.scaleMode = PIXI.SCALE_MODES.NEAREST

      texture = PIXI.Texture.from('assets/images/block.png');
      texture.id = 'block'
      textures['block'] = texture
      texture.scaleMode = PIXI.SCALE_MODES.NEAREST

      texture = PIXI.Texture.from('assets/images/blockNormalMap.png');
      texture.id = 'blockNormalMap'
      textures['blockNormalMap'] = texture
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

      // world.addChild(new PIXI.lights.DirectionalLight(null, 1, block1));
      // world.addChild(light);

      onLoad(app, textures)
    })
  })

    // Create a light that casts shadows
  // var light = PIXIMAP.createLight('point', 700, 4, 0x000000);
  // light.position.set(300, 300);
  // world.addChild(light);

  // Create a light point on click
  // world.on("pointerdown", function(event) {
  //     var light = PIXIMAP.createLight(450, 2, 0xffffff);
  //     light.position.copy(event.data.global);
  //     world.addChild(light);
  // });

  // if(GAME.world.tags.shadow && PAGE.role.isAdmin) {
  //   // Create a light that casts shadows
  //   var shadow = new PIXI.shadows.Shadow(700, 1);
  //   shadow.position.set(450, 150);
  //   world.addChild(shadow);
  //
  //   // Make the light track your mouse
  //   world.interactive = true;
  //   world.on("mousemove", function(event) {
  //       shadow.position.copy(event.data.global);
  //   });
  // }
}

export {
  initPixiApp,
}

import * as PIXI from 'pixi.js'
window.PIXI = PIXI
import './pixi-layers'
import { GlowFilter, ColorMatrixFilter } from 'pixi-filters'
import tinycolor from 'tinycolor2'
import tileset from './tileset.json'

const textures = {};
let stage

const applyFilters = () => {
  /*
  ////////////////////////////////
  ////////////////////////////////
  // PIXI FILTER NOTES

  TWIST filter
  Glow filter
  Outline filter

  —

  Rain graphic ?

  Displacement filter — underwater effect
  + underwater overlay graphic??

  Shockwave filter / Bulge pinch?

  Reflection filter

  Godray filter

  Many of these are really good CAMERA effects
  Dot filter
  Old Film filter
  Pixelate filter
  Color Matrix filter
  Cross Hatch filter
  Crt filter
  Zoom blur filter — Perhaps when you are like low on health??
  */



  // const  grFilter = new GodrayFilter({
  //   angle: 30,
  //   gain: 0.5,
  //   lacunarity: 2.5,
  //   time: 0,
  //   parallel: true,
  //   center: [0, 0],
  // })
  // const refFilter = new ShockwaveFilter()
  //
  // GodrayFilter
  // PIXIMAP.backgroundStage.filters = [
  //   grFilter
  //   // refFilter
  // ]
  // const refFilter = new EmbossFilter()
  // PIXIMAP.backgroundStage.filters = [
  //   // grFilter
  //   refFilter
  // ]


  // shockwave filter ( requires sprites )
  // reflectionFilter ( idk requires a lot of fenagling, could be a mirror )
  // emboss filter ( good frozen in carbonite effect )
  const refFilter = new PIXI.filters.ColorMatrixFilter()
  // You could PERHAPS make a specific COLOR very important to PAPABEAR
  // or another character
  // refFilter.night(.5, 10)
  // refFilter.colorTone()
  // refFilter.predator(.2)
  PIXIMAP.objectStage.filters = [refFilter]


  // const refFilter = new ReflectionFilter()
  // PIXIMAP.cameraStage.filters = [grFilter]
}

const initPixiApp = (canvasRef, onLoad) => {
  ///////////////
  ///////////////
  ///////////////
  // INTIIALIZE
  const app = new PIXI.Application({
    width: canvasRef.width, height: canvasRef.height, resizeTo: canvasRef
  });
  app.view.id = "pixi-canvas"
  document.getElementById('GameContainer').appendChild(app.view);
  PIXIMAP.app = app

  app.stage = new PIXI.display.Stage();

  let world
  world = app.stage

  PIXIMAP.stage = world
  PIXIMAP.app.ticker.maxFPS = 24
  PIXIMAP.app.renderer.preserveDrawingBuffer = true

  ///////////////
  ///////////////
  ///////////////
  // BACKGROUND STAGE
  PIXIMAP.backgroundStage = new PIXI.display.Layer()
  world.addChild(PIXIMAP.backgroundStage);
  PIXIMAP.backgroundOverlay = new PIXI.Sprite(PIXI.Texture.WHITE)
  PIXIMAP.backgroundOverlay.transform.scale.x = (PIXIMAP.app.view.width/PIXIMAP.backgroundOverlay.texture._frame.width)
  PIXIMAP.backgroundOverlay.transform.scale.y = (PIXIMAP.app.view.width/PIXIMAP.backgroundOverlay.texture._frame.width)
  PIXIMAP.backgroundOverlay.tint = parseInt(tinycolor(GAME.world.backgroundColor).toHex(), 16)
  PIXIMAP.backgroundStage.addChild(PIXIMAP.backgroundOverlay)

  PIXIMAP.gridStage = new PIXI.display.Layer()
  world.addChild(PIXIMAP.gridStage);

  ///////////////
  ///////////////
  ///////////////
  // SORT GROUP
  PIXIMAP.sortGroup = new PIXI.display.Group(0, true);
  PIXIMAP.sortGroup.on('sort', function(sprite) {
      // emitters are just kinda messed up and need a high zOrder I guess. They dont have a correct sprite.y?
      // WORK AROUND -> I could put foreground elements on a different higher stage than the emitters
      if(sprite.emitter) {
        sprite.zOrder = 1000000000000
        return
      }

      let object
      if(sprite.ownerName) {
        object = OBJECTS.getObjectOrHeroById(sprite.ownerName)
      } else if(sprite.name) {
        object = OBJECTS.getObjectOrHeroById(sprite.name)
      }

      if(object && object.tags.background) {
        sprite.zOrder = -1
        return
      }

      if(object && object.tags.obstacle){
        sprite.zOrder = sprite.y + 10000
        return
      }
      if(object && object.tags.hero) {
        sprite.zOrder = sprite.y + 100000
        return
      }

      if(object && object.tags.foreground) {
        sprite.zOrder = sprite.y + 1000000
        return
      }

      sprite.zOrder = sprite.y;
  });

  PIXIMAP.sortGroup.enableSort = true;
  ///////////////
  ///////////////
  ///////////////
  // OBJECT STAGE
  PIXIMAP.objectStage = new PIXI.display.Layer(PIXIMAP.sortGroup)
  PIXIMAP.objectStage.sortableChildren = true;
  world.addChild(PIXIMAP.objectStage);


  ///////////////
  ///////////////
  ///////////////
  // SHADOW STAGE
  PIXIMAP.shadowStage = new PIXI.display.Layer()
  world.addChild(PIXIMAP.shadowStage);

  ///////////////
  ///////////////
  ///////////////
  // CAMERA STAGE
  PIXIMAP.cameraStage = new PIXI.display.Layer()
  world.addChild(PIXIMAP.cameraStage);
  PIXIMAP.cameraOverlay = new PIXI.Sprite(PIXI.Texture.from('assets/images/solidcolorsprite.png'))
  PIXIMAP.cameraOverlay.transform.scale.x = (PIXIMAP.app.view.width/PIXIMAP.cameraOverlay.texture._frame.width)
  PIXIMAP.cameraOverlay.transform.scale.y = (PIXIMAP.app.view.width/PIXIMAP.cameraOverlay.texture._frame.width)
  PIXIMAP.cameraOverlay.alpha = 0
  PIXIMAP.cameraOverlay.tint = parseInt(tinycolor("rgb(0, 0, 100)").toHex(), 16)
  PIXIMAP.cameraStage.addChild(PIXIMAP.cameraOverlay)

  ///////////////
  ///////////////
  ///////////////
  // EMITTERS
  PIXIMAP.objectStage.emitters = []


  ///////////////
  ///////////////
  ///////////////
  // UPDATE FILTERS AND EMITTERS
  app.ticker.add(function(delta) {
    PAGE.fps = app.ticker.FPS
    function updateFilters(filter) {
      // if(filter instanceof GodrayFilter) {
      //   filter.time+=delta/100
      // }
      // if(filter instanceof ReflectionFilter) {
      //   filter.time+=delta/100
      // }
      // if(filter instanceof ShockwaveFilter) {
      //   filter.time+=delta/100
      // }
    }

    // console.log(world.stage)
    PIXIMAP.objectStage.emitters.forEach((emitter) => {
      emitter.update(delta/1000);
    })
    if(PIXIMAP.backgroundStage && PIXIMAP.backgroundStage.filters) PIXIMAP.backgroundStage.filters.forEach(updateFilters);
    if(PIXIMAP.cameraStage && PIXIMAP.cameraStage.filters) PIXIMAP.cameraStage.filters.forEach(updateFilters);
    if(PIXIMAP.objectStage && PIXIMAP.objectStage.filters) PIXIMAP.objectStage.filters.forEach(updateFilters);
  });



  ///////////////
  ///////////////
  ///////////////
  // ON RESIZE
  if(PAGE.role.isPlayer) {
    let loadingTimeout
    function onResize() {
      if(loadingTimeout) {
        clearTimeout(loadingTimeout)
      } else {
        window.local.emit('onLoadingScreenStart')
        PAGE.resizingMap = true
      }
      loadingTimeout = setTimeout(() => {
        PAGE.resizingMap = false
        window.local.emit('onLoadingScreenEnd')
      }, 150)
      MAP.canvasMultiplier = window.innerWidth/640;
      const width = (640 * MAP.canvasMultiplier);
      const height = (320 * MAP.canvasMultiplier);
      app.resize(width, height);
      if(!window.resettingDarkness) {
        setTimeout(() => {
          if(PIXIMAP.initialized) {
            PIXIMAP.initializeDarknessSprites()
            PIXIMAP.resetDarkness()
            PIXIMAP.updateDarknessSprites()
          }
          window.resettingDarkness = false
        }, 100)
        window.resettingDarkness = true
      }
      PIXIMAP.resizeToWindow = onResize
      window.local.emit('onResize')
    }
    window.local.on('onZoomChange', () => {
      onResize()
    })
    window.addEventListener("resize", onResize);
    onResize()
  }

  applyFilters()

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

    app.loader.add(['assets/images/firepit-1.png', 'assets/images/entarkia-1.png']).load((loaded) => {
      let texture = PIXI.Texture.from('assets/images/firepit-1.png');
      texture.id = 'firepit-1'
      textures['firepit-1'] = texture

      texture = PIXI.Texture.from('assets/images/entarkia-1.png');
      texture.id = 'entarkia-1'
      textures['entarkia-1'] = texture

      textures['solidcolorsprite'] = PIXI.Texture.WHITE
      PIXI.Texture.WHITE.id = 'solidcolorsprite'
      texture.scaleMode = PIXI.SCALE_MODES.NEAREST

      texture = PIXI.Texture.from('assets/images/spencer-1.png');
      texture.id = 'spencer-1'
      textures['spencer-1'] = texture
      PIXIMAP.textures = textures
      PIXIMAP.assetsLoaded = true
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

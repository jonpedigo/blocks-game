import render from './render'
import Camera from './camera.js'
import constellation from './constellation.js'
import pixiMap from './pixi/map'
import * as PIXI from 'pixi.js'

window.MAP = {
  canvas: null,
  ctx: null,
  camera: new Camera()
}

MAP.onPageLoaded = function() {
  document.getElementById("play-editor").style = 'display:none';

  // Canvas SETUP
  MAP.canvas = document.createElement("canvas");
  MAP.ctx = MAP.canvas.getContext("2d");
  if(PAGE.role.isPlayer) {
    function onResize() {
      MAP.canvasMultiplier = window.innerWidth/640;
      MAP.canvas.width = 640 * MAP.canvasMultiplier;
      MAP.canvas.height = 320 * MAP.canvasMultiplier;
      constellation.onResize(MAP.ctx)
    }
    window.addEventListener("resize", onResize);
    onResize()
  }

  MAP.canvas.id = 'game-canvas'
  // document.body.appendChild(MAP.canvas);

  pixiMap.initPixiApp(MAP.canvas, (app, textures) => {
    // for (let i = 0; i < 25; i++) {
    //   const bunny = new PIXI.Sprite(textures['entarkia-1']);
    //    bunny.anchor.set(0.5);
    //    bunny.x = (i % 5) * 40;
    //    bunny.y = Math.floor(i / 5) * 40;
    //    app.stage.addChild(bunny);
    // }
  })

  if(PIXIMAP.app.view) {
    MAPEDITOR.set(PIXIMAP.app.view.getContext('2d'), PIXIMAP.app.view, MAP.camera)
  } else {
    MAPEDITOR.set(MAP.ctx, MAP.canvas, MAP.camera)
  }
}

MAP.onGameLoaded = function() {
  GAME.objects.forEach((object) => {
    object.sprite = 'entarkia-1'
    pixiMap.initPixiObject(object)
  })
  GAME.heroList.forEach((hero) => {
    hero.sprite = 'tree-1'
    pixiMap.initPixiObject(hero)
  })
}

MAP.onRender = function(delta) {
  let camera = MAP.camera

  //set camera so we render everything in the right place
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  } else {
    camera.set(GAME.heros[HERO.id])
  }

  // render.update()

  PIXIMAP.stage.pivot.x = MAP.camera.x
  PIXIMAP.stage.pivot.y = MAP.camera.y

  GAME.objects.forEach((object) => {
    pixiMap.updatePixiObject(object)
  })
  GAME.heroList.forEach((hero) => {
    pixiMap.updatePixiObject(hero)
  })
  if(PAGE.role.isPlayer && GAME.heros[HERO.id].animationZoomMultiplier) {
    constellation.onRender()
  }
}

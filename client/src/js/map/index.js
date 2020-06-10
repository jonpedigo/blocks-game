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
  document.body.appendChild(MAP.canvas);

  MAPEDITOR.set(MAP.ctx, MAP.canvas, MAP.camera)
}

MAP.onRender = function(delta) {
  const { ctx, canvas } = MAP

  let camera = MAP.camera
  //set camera so we render everything in the right place
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  } else {
    camera.set(GAME.heros[HERO.id])
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(GAME.world.usePixiMap && PIXIMAP.initialized) {
    MAP.canvas.style.backgroundColor = ''
    PIXIMAP.stage.pivot.x = MAP.camera.x
    PIXIMAP.stage.pivot.y = MAP.camera.y
    GAME.objects.forEach((object) => {
      pixiMap.updatePixiObject(object)
    })
    GAME.heroList.forEach((hero) => {
      pixiMap.updatePixiObject(hero)
    })
  } else {
    render.update()
  }

  if(PAGE.role.isPlayer && GAME.heros[HERO.id].animationZoomMultiplier) {
    constellation.onRender()
  }
}

import render from './render'
import Camera from './camera.js'
import Shake from './cameraShake.js'
import constellation from './constellation.js'
import './pixi/index'

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
      if(GAME.world.tags && GAME.world.tags.shadow) return
      MAP.canvasMultiplier = window.innerWidth/640;
      MAP.canvas.width = 640 * MAP.canvasMultiplier;
      MAP.canvas.height = 320 * MAP.canvasMultiplier;
      constellation.onResize(MAP.ctx)
    }
    window.addEventListener("resize", onResize);
    onResize()
  }

  MAP.canvas.id = 'game-canvas'
  MAP.canvas.style.position = 'fixed'
  document.getElementById('GameContainer').appendChild(MAP.canvas);

  MAPEDITOR.set(MAP.ctx, MAP.canvas, MAP.camera)
}

MAP.onWorldCameraEffect = function(type, options = {}) {
  if(type === 'cameraShake') {
    MAP.cameraEffect(type, options)
  }
}

MAP.onHeroCameraEffect = function(type, heroId, options = {}) {
  if(HERO.id === heroId) {
    MAP.cameraEffect(type, options)
  }
}

MAP.cameraEffect = function(type, options) {
  if(type === 'cameraShake' && MAP._readyForShake !== false) {
    MAP.camera.shakeAmplitude = options.amplitude || 32
    const duration = options.duration || 2000
    MAP.camera.xShake = new Shake(duration, options.frequency || 40)
    MAP.camera.yShake = new Shake(duration, options.frequency || 40)
    MAP.camera.xShake.start()
    MAP.camera.yShake.start()
    MAP._readyForShake = false
    setTimeout(() => {
      MAP._readyForShake = true
    }, duration)
  }
}

MAP.onRender = function(delta) {
  const { ctx, canvas } = MAP
  const hero = GAME.heros[HERO.id]

  let camera = MAP.camera
  //set camera so we render everything in the right place
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  } else {
    if(hero) camera.set(hero)
  }

  if(camera.xShake && camera.xShake.isShaking) {
    camera.xShake.update()
  }
  if(camera.yShake && camera.yShake.isShaking) {
    camera.yShake.update()
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(PIXIMAP.assetsLoaded && (!GAME.gameState.paused || CONSTRUCTEDITOR.open)) {
    render.update(camera)
  } else {
    canvas.style.backgroundColor = '#333'
  }

  if(hero && PAGE.role.isPlayer && GAME.heros[HERO.id] && GAME.heros[HERO.id].animationZoomMultiplier) {
    constellation.onRender()
  }
}

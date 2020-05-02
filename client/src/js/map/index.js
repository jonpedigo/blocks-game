import render from './render'
import cameraTool from '../core/camera.js'
import constellation from './constellation.js'

window.MAP = {
  canvas: null,
  ctx: null,
  camera: new cameraTool()
}

function onPageLoad() {
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
}

function onRender(delta) {
  render.update()

  /// DEFAULT GAME FX
  if(GAME.defaultCustomGame) {
    GAME.defaultCustomGame.onRender(MAP.ctx, delta)
  }

  /// CUSTOM GAME FX
  if(GAME.customGame) {
    GAME.customGame.onRender(MAP.ctx, delta)
  }

  /// CUSTOM GAME FX
  if(GAME.liveCustomGame) {
    GAME.liveCustomGame.onRender(MAP.ctx, delta)
  }

  if(PAGE.role.isPlayer && HERO.hero.animationZoomMultiplier) {
    constellation.onRender()
  }
}

export default {
  onPageLoad,
  onRender,
}

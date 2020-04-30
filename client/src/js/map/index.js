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
      constellation.loadStars(MAP.ctx)
    }
    window.addEventListener("resize", onResize);
    onResize()
  }

  MAP.canvas.id = 'game-canvas'
  document.body.appendChild(MAP.canvas);
}

export default {
  onPageLoad,
  render: render.update,
}

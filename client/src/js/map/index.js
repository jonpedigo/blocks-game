import render from './render'
import cameraTool from '../camera.js'

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
      window.canvasMultiplier = window.innerWidth/640;
      window.playerCanvasWidth = 640 * window.canvasMultiplier
      window.playerCanvasHeight = 320 * window.canvasMultiplier
      MAP.canvas.width = window.playerCanvasWidth;
      MAP.canvas.height = window.playerCanvasHeight;
    }
    window.addEventListener("resize", onResize);
    onResize()
  }

  MAP.canvas.id = 'game-canvas'
  document.body.appendChild(window.canvas);
}

export default {
  onPageLoad,
  render: render.update,
}

import collisions from '../../collisions'
import gridTool from '../../grid.js'
import camera from '../../camera.js'
import pathfinding from '../../pathfinding.js'

function init() {

}

function loaded() {
  window.gameState.paused = true
  window.hero.flags.showLives = true;
  window.hero.flags.showScore = true;
}

function start() {
  window.gameState.paused = false
  window.gameState.startTime = Date.now()
  window.resetSpawnAreasAndObjects()
  window.respawnHero()
  window.hero.lives = 3
}

function onKeyDown(keysDown) {
  if(window.gameState.paused) {
    if(32 in keysDown) {
      window.socket.emit('startGame')
    }
  }

  if(window.hero.flags.paused || window.gameState.paused) return
}

function input(keysDown, delta) {

}

function intelligence(object, delta) {

}

function onCollide(agent, collider, result, removeObjects) {

}

function update(delta) {
  if(window.hero.lives === 0) {
    window.gameState.gameOver = true
    window.gameState.paused = true
  }
}

function render(ctx) {
  if(window.gameState.paused) {
    const { minX, maxX, minY, maxY, centerY, centerX, cameraHeight, cameraWidth } = window.getViewBoundaries(window.hero)

    // ctx.fillStyle = 'rgba(0,0,0,0.8)';
    // ctx.fillRect((minX/window.camera.multiplier - window.camera.x), (minY/window.camera.multiplier - window.camera.y), cameraWidth/window.camera.multiplier, cameraHeight/window.camera.multiplier);
    //
    // // function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    // // (minX/window.camera.multiplier - window.camera.x), (minY/window.camera.multiplier - window.camera.y), cameraWidth, cameraHeight
    // ctx.font =`${40/window.camera.multiplier}pt Arial`
    // ctx.fillStyle ='rgba(255,255,255, 0.8)';
    // let text = 'Press space to start'
    // let metrics = ctx.measureText(text)
    // window.wrapText(ctx, text, centerX/window.camera.multiplier - window.camera.x - (metrics.width/2), centerY/window.camera.multiplier - window.camera.y, 600/window.camera.multiplier, 80/window.camera.multiplier)

    let multiplier = ((4000 - (window.hero.animationZoomMultiplier || 0))/4000)
    // since I wanted the growth to occur very fast quickly, I had to decrease the value of the multiplier exponentialy ( it would turn into a decimal... oh god dont delte took me forever)
    multiplier = multiplier * multiplier
    multiplier = multiplier * multiplier
    multiplier = multiplier * multiplier
    multiplier = multiplier * multiplier
    multiplier = multiplier * multiplier
    multiplier = multiplier * multiplier
    multiplier = multiplier * multiplier
    multiplier = multiplier * multiplier

    ctx.fillStyle = `rgba(0,0,0, ${.8 * multiplier})`;
    ctx.fillRect(0, 0, window.CONSTANTS.PLAYER_CANVAS_WIDTH, window.CONSTANTS.PLAYER_CANVAS_HEIGHT);
    ctx.font =`20pt Courier New`
    ctx.fillStyle =`rgba(255,255,255, ${1 * multiplier})`;
    let text = window.gameState.gameOver ? 'Game over. Press space to try again' : 'Press space to start'
    let metrics = ctx.measureText(text)
    ctx.fillText(text, (window.CONSTANTS.PLAYER_CANVAS_WIDTH/2) - (metrics.width/2), (window.CONSTANTS.PLAYER_CANVAS_HEIGHT/2) + 10)
  }
}

export default {
  init,
  loaded,
  start,
  onKeyDown,
  input,
  update,
  intelligence,
  render,
  onCollide,
}

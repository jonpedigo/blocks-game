import collisions from '../../collisions'
import gridTool from '../../grid.js'
import camera from '../../camera.js'
import pathfinding from '../../pathfinding.js'
import particles from '../../particles.js'

// once we have loaded up the game from the server for the first time
// interact with values loaded by the game, the values of other services
// only on client
function onGameLoaded() {

}

function onGameUnloaded() {

}

// called by editor or player
// only on client
function onGameStart() {

}

// only on client
function onKeyDown(keyCode, hero) {
  if(hero.flags.paused || w.game.gameState.paused) return

}

// only on client
function input(hero, keysDown, delta) {
  if(hero.flags.paused || w.game.gameState.paused) return

}

// only on client
function intelligence(object, delta) {

}

// only on client
function onCollide(agent, collider, result, removeObjects, respawnObjects) {

}

// only on client
function onHeroCollide(hero, collider, result, removeObjects, respawnObjects) {

}

// only on client
function onHeroInteract(hero, collider, result, removeObjects, respawnObjects) {

}

// after input, intel, physics, but before render
// only on client
function update(delta) {

}

// only on client
function render(ctx) {
}

export default {
  onGameLoaded,
  onGameUnloaded,
  onGameStart,
  onKeyDown,
  input,
  update,
  intelligence,
  render,
  onCollide,
  onHeroInteract,
  onHeroCollide
}

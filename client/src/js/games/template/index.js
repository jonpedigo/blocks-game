import collisions from '../../collisions'
import gridTool from '../../grid.js'
import camera from '../../camera.js'
import pathfinding from '../../pathfinding.js'
import particles from '../../particles.js'

// Add events, and default values
// happens on every load, including reload
// on client and editor
function init() {

}

// once we have loaded up the game from the server for the first time
// interact with values loaded by the game, the values of other services
// only on client
function loaded() {

}

// called by editor or player
// only on client
function start() {

}

// only on client
function input(hero, keysDown, delta) {
  if(hero.flags.paused || w.game.gameState.paused) return

}

// only on client
function intelligence(object, delta) {

}

// only on client
function onCollide(agent, collider, result, removeObjects) {

}

// after input, intel, physics, but before render
// only on client
function update(delta) {

}

// only on client
function render(ctx) {
}

export default {
  init,
  loaded,
  start,
  input,
  update,
  intelligence,
  render,
  onCollide,
}

window.templateGameString = `// // Add events, and default values
// happens on every load, including reload
// on client and editor
function init() {

}

// once we have loaded up the game from the server for the first time
// interact with values loaded by the game, the values of other services
// only on client
function loaded() {

}

// called by editor or player
// only on client
function start() {

}

// only on client
function input(hero, keysDown, delta) {
  if(hero.flags.paused || w.game.gameState.paused) return

}

// only on client
function intelligence(object, delta) {

}

// only on client
function onCollide(agent, collider, result, removeObjects) {

}

// after input, intel, physics, but before render
// only on client
function update(delta) {

}

// only on client
function render(ctx) {
}`

import collisions from '../../collisions'
import gridTool from '../../grid.js'
import camera from '../../camera.js'
import pathfinding from '../../pathfinding.js'
import particles from '../../particles.js'

// we organize the code on the front end, default values, etc
// happens on every load, including reload
// on client and editor
function init() {

}

// once we have loaded up the game from the server for the first time, not on reload
// interact with other values and setup initial game state
// only on client
function loaded() {

}

// called by editor or player
// only on client
function start() {

}

// only on client
function onKeyDown(keysDown) {
  if(window.hero.flags.paused || window.gameState.paused) return

}

// only on client
function input(keysDown, delta) {
  if(window.hero.flags.paused || window.gameState.paused) return

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
  onKeyDown,
  input,
  update,
  intelligence,
  render,
  onCollide,
}

window.templateGameString = `// we organize the code on the front end, default values, etc
// happens on every load, including reload
// on client and editor
function init() {

}

// once we have loaded up the game from the server for the first time, not on reload
// interact with other values and setup initial game state
// only on client
function loaded() {

}

// called by editor or player
// only on client
function start() {

}

// only on client
function onKeyDown(keysDown) {
  if(window.hero.flags.paused || window.gameState.paused) return

}

// only on client
function input(keysDown, delta) {
  if(window.hero.flags.paused || window.gameState.paused) return

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

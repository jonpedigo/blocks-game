import collisions from '../../utils/collisions'
import gridTool from '../../utils/grid.js'
import pathfinding from '../../utils/pathfinding.js'
import particles from '../../map/particles.js'

// once we have loaded up the game from the server for the first time
// interact with values loaded by the game, the values of other services
function onGameLoaded() {

}

function onGameUnload() {

}

// called by editor or player
function onGameStart() {

}

function onKeyDown(keyCode, hero) {
  if(hero.flags.paused || GAME.gameState.paused) return

}

function onUpdateHero(hero, keysDown, delta) {
  if(hero.flags.paused || GAME.gameState.paused) return

}

function onUpdateObject(object, delta) {

}

function onObjectCollide(agent, collider, result, removeObjects, respawnObjects) {

}

function onHeroCollide(hero, collider, result, removeObjects, respawnObjects) {

}

function onHeroInteract(hero, collider, result, removeObjects, respawnObjects) {

}

function onUpdate(delta) {

}

function onRender(ctx) {

}

export default {
  onGameLoaded,
  onGameUnload,
  onGameStart,
  onKeyDown,
  onUpdateHero,
  onUpdate,
  onUpdateObject,
  onRender,
  onObjectCollide,
  onHeroInteract,
  onHeroCollide
}

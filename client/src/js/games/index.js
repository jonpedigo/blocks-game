import gridTool from '../grid.js'
import physics from '../physics.js'
import camera from '../camera.js'
import pathfinding from '../pathfinding.js'
import collisions from '../collisions.js'
import particles from '../particles.js'
import input from '../input.js'
import modals from '../mapeditor/modals.js'
import drawTools from '../mapeditor/drawTools.js'

import defaultCustomGame from './default'
import defaultCompendium from './default/compendium'
import pacmanGame from './pacman'
import templateGame from './template'

let customGames = {
  default: defaultCustomGame,
  pacman: pacmanGame,
}

let customCompendiums = {
  default: defaultCompendium
}

function init() {
  window.customGame = null
  window.defaultCustomGame = defaultCustomGame

  window.customCompendium = null
  window.defaultCompendium = defaultCompendium

  /// didnt get to init because it wasnt set yet
  if(window.defaultCustomGame) {
    window.defaultCustomGame.init()
  }
}

window.changeGame = function(id) {
  window.customGame = customGames[id]
  window.customCompendium = customCompendiums[id]
  if(window.usePlayEditor){
    document.getElementById('current-game-id').innerHTML = id
    document.getElementById('game-id').value = id
  }
  window.game.id = id
}

window.setLiveCustomFx = function(customFx) {
  customFx = eval(`(function a(pathfinding, gridTool, camera, collisions, particles, drawTools) {
    const w = window
    ${customFx} return { init, loaded, start, input, keyDown, onCollide, intelligence, update, render } })`)
  customFx = customFx(pathfinding, gridTool, camera, collisions, particles, drawTools)
  window.liveCustomGame = customFx
}

export default {
  init
}

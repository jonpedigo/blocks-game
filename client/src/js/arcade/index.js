import gridTool from '../utils/grid.js'
import pathfinding from '../utils/pathfinding.js'
import collisions from '../utils/collisions.js'
import particles from '../map/particles.js'
import input from '../game/input.js'
import modals from '../mapeditor/modals.js'
import drawTools from '../mapeditor/drawTools.js'
import './templateLiveCustomGame.js'

import defaultCustomGame from './default'
import defaultCompendium from './default/compendium'
import pacmanGame from './pacman'
import templateGame from './template'

import spencer1Game from './spencer1'
import spencer1Compendium from './spencer1'

let customGames = {
  default: defaultCustomGame,
  pacman: pacmanGame,
  spencer1: spencer1Game,
}

let customCompendiums = {
  default: defaultCompendium,
  spencer1: spencer1Compendium,
}

function onPageLoad() {
  GAME.customGame = null
  GAME.defaultCustomGame = defaultCustomGame

  window.customCompendium = null
  window.defaultCompendium = defaultCompendium
}

window.changeGame = function(id) {
  GAME.customGame = customGames[id]
  window.customCompendium = customCompendiums[id]
  if(PAGE.role.isPlayEditor){
    document.getElementById('current-game-id').innerHTML = id
    document.getElementById('game-id').value = id
  }
  GAME.id = id
}

window.evalLiveCustomFx = function(customFx) {
  customFx = eval(`(function a(pathfinding, gridTool, camera, collisions, particles, drawTools) {
    const w = window
    ${customFx} return { onGameLoaded, onGameStart, onKeyDown, onUpdate, onUpdateObject, onUpdateHero, onObjectCollide, onHeroCollide, onHeroInteract, onRender, onGameUnloaded } })`)
  return customFx
}

window.setLiveCustomFx = function(customFx) {
  customFx = window.evalLiveCustomFx(customFx)
  customFx = customFx(pathfinding, gridTool, window.camera, collisions, particles, drawTools)
  GAME.liveCustomGame = customFx
}

export default {
  onPageLoad
}

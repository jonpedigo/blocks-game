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

class Arcade{
  constructor() {}

  onPageLoaded() {
    ARCADE.customGame = null
    ARCADE.defaultCustomGame = defaultCustomGame

    ARCADE.customCompendium = null
    ARCADE.defaultCompendium = defaultCompendium
  }

  onUpdateCustomGameFx() {
    if(PAGE.role.isHost) {
      try {
        window.setLiveCustomFx(customFx)
      } catch (e) {
        console.log(e)
      }
    }

    if(PAGE.role.isPlayEditor) {
      window.customFx = customFx
    }
  }

  onCustomFxEvent() {
    if(PAGE.role.isHost && ARCADE.liveCustomGame && ARCADE.liveCustomGame[event]) {
      ARCADE.liveCustomGame[event]()
    }
  }
}

window.ARCADE = new Arcade()

window.changeGame = function(id) {
  ARCADE.customGame = customGames[id]
  ARCADE.customCompendium = customCompendiums[id]
  if(PAGE.role.isPlayEditor){
    document.getElementById('current-game-id').innerHTML = id
    document.getElementById('game-id').value = id
  }
  GAME.id = id
}

window.evalLiveCustomFx = function(customFx) {
  customFx = eval(`(function a(pathfinding, gridTool, camera, collisions, particles, drawTools) {
    const w = window
    ${customFx} return { onGameLoaded, onGameStart, onKeyDown, onUpdate, onUpdateObject, onUpdateHero, onObjectCollide, onHeroCollide, onHeroInteract, onRender, onGameUnload } })`)
  return customFx
}

window.setLiveCustomFx = function(customFx) {
  customFx = window.evalLiveCustomFx(customFx)
  customFx = customFx(pathfinding, gridTool, window.camera, collisions, particles, drawTools)
  ARCADE.liveCustomGame = customFx
}

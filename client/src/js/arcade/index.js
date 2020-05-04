import gridUtil from '../utils/grid.js'
import pathfinding from '../utils/pathfinding.js'
import collisions from '../utils/collisions.js'
import particles from '../map/particles.js'
import input from '../game/input.js'
import modals from '../mapeditor/modals.js'
import drawTools from '../mapeditor/drawTools.js'
import './templateLiveCustomGame.js'

import defaultCustomGame from './default/default'
import defaultCompendium from './default/compendium'
import pacmanGame from './pacman/pacman'
import templateGame from './template/template'

import spencer1Game from './spencer1/spencer1'
import spencer1Compendium from './spencer1/compendium'

let customGames = {
  default: new defaultCustomGame(),
  pacman: new pacmanGame(),
  spencer1: new spencer1Game(),
}

let customCompendiums = {
  default: defaultCompendium,
  spencer1: spencer1Compendium,
}

class Arcade{
  constructor() {}

  onPageLoaded() {
    ARCADE.customGame = null
    ARCADE.defaultCustomGame = customGames.default

    ARCADE.customCompendium = null
    ARCADE.defaultCompendium = defaultCompendium

    if(!PAGE.role.isArcadeMode) {
      window.socket.emit('getCustomGameFx')
    }
  }

  onGetCustomGameFx(customFx) {
    ARCADE.setLiveCustomFx(customFx)
  }

  onUpdateCustomGameFx(customFx) {
    if(PAGE.role.isHost) {
      try {
        ARCADE.setLiveCustomFx(customFx)
      } catch (e) {
        console.log(e)
      }
    }

    if(PAGE.role.isPlayEditor) {
      window.customFx = customFx
    }
  }

  onCustomFxEvent(eventName) {
    if(PAGE.role.isHost && ARCADE.liveCustomGame && ARCADE.liveCustomGame[eventName]) {
      ARCADE.liveCustomGame[eventName]()
    }
  }

  onGameSaved(id) {
    ARCADE.changeGame(id)
  }

  evalLiveCustomFx(customFx) {
    return eval(`(function a(pathfindingUtil, gridUtil, collisionsUtil, drawUtil, particlesUtil) {
        ${customFx}
      return CustomGame })`)
  }

  setLiveCustomFx(customFx) {
    customFx = ARCADE.evalLiveCustomFx(customFx)
    customFx = customFx(pathfinding, gridUtil, collisions, drawTools, particles)
    customFx = new customFx
    ARCADE.liveCustomGame = customFx
  }

  changeGame(id) {
    ARCADE.customGame = customGames[id]
    ARCADE.customCompendium = customCompendiums[id]
    if(PAGE.role.isPlayEditor){
      document.getElementById('current-game-id').innerHTML = id
      document.getElementById('game-id').value = id
    }
    GAME.id = id
  }
}

window.ARCADE = new Arcade()

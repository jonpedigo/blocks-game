import defaultGame from './default'
import defaultCompendium from './default/compendium'
import pacmanGame from './pacman'
import templateGame from './template'

let customGames = {
  default: defaultGame,
  pacman: pacmanGame,
}

let customCompendiums = {
  default: defaultCompendium
}

function init() {
  window.customGame = null
  window.defaultGame = defaultGame

  window.customCompendium = null
  window.defaultCompendium = defaultCompendium

  /// didnt get to init because it wasnt set yet
  if(window.defaultGame) {
    window.defaultGame.init()
  }
}

window.changeGame = function(id) {
  window.customGame = customGames[id]
  window.customCompendium = customCompendiums[id]
  if(window.usePlayEditor){
    document.getElementById('current-game-id').innerHTML = id
    document.getElementById('game-id').value = id
  }
}

export default {
  init
}

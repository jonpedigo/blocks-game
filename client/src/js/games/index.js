import defaultGame from './default'
import pacman from './pacman'

let customGames = {
  default: defaultGame,
  pacman,
  lab: pacman,
}

function init() {
  window.defaultGame = defaultGame
}

window.changeGame = function(id) {
  window.customGame = customGames[id]
}

export default {
  init
}

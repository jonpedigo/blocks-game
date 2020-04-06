import defaultGame from './default'
import pacman from './pacman'

let customGames = {
  default: defaultGame,
  pacman,
  lab: pacman,
}

function init() {
  window.customGame = null
  window.defaultGame = defaultGame
}

window.changeGame = function(id) {
  window.customGame = customGames[id]
  document.getElementById('current-game-id').innerHTML = id
}

export default {
  init
}

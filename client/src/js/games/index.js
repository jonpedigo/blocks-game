import defaultGame from './default'
import pacman from './pacman'
import template from './template'

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
  console.log(id)
  if(window.usePlayEditor){
    document.getElementById('current-game-id').innerHTML = id
    document.getElementById('game-id').value = id
  }
}

export default {
  init
}

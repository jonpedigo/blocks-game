import defaultGame from './default'
import pacman from './pacman'

function init() {
  window.defaultGame = defaultGame
  window.customGame = pacman
}

export default {
  init
}

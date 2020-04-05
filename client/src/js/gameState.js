function init() {
  window.defaultGameState = {
    paused : false,
  }
  window.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
}

export default {
  init
}

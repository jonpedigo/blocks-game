function setDefault() {
  window.defaultGameState = {
    paused : false,
    started: false,
    loaded: false,
  }
  if(!localStorage.getItem('gameStates')) {
    localStorage.setItem('gameStates', JSON.stringify({}))
  }
}

export default {
  setDefault
}

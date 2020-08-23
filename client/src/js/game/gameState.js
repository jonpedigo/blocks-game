function setDefault() {
  window.defaultGameState = {
    paused : false,
    started: false,
    loaded: false,
    sequenceQueue: [],
    timeouts: [],
    timeoutsById: {},
    activeMods: {},
    activeModList: [],
    ambientLight: .2,
    dayNightCycle: {},
    logs: [],
  }
  if(!localStorage.getItem('gameStates')) {
    localStorage.setItem('gameStates', JSON.stringify({}))
  }
}

export default {
  setDefault
}

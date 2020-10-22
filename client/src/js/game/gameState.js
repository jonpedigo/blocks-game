function setDefault() {
  window.defaultGameState = {
    paused : false,
    started: false,
    loaded: false,
    sequenceQueue: [],
    trackers: [],
    timeouts: [],
    timeoutsById: {},
    trackers: {},
    goals: {},
    activeMods: {},
    activeModList: [],
    ambientLight: .2,
    dayNightCycle: {},
    logs: [],
    branch: false,
    branchName: null,
  }
  if(!localStorage.getItem('gameStates')) {
    localStorage.setItem('gameStates', JSON.stringify({}))
  }
}

export default {
  setDefault
}

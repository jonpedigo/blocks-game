function setDefault() {
  window.defaultDayNightCycle = {
    ambientLightDelta: null,
    dayLength: 6,
    dayAmbientLight: 2,
    nightLength: 6,
    nightAmbientLight: 0,
    transitionTime: 6,
  }
}

function onGameLoaded(options = {}) {
  GAME.gameState.dayNightCycle = { ...JSON.parse(JSON.stringify(window.defaultDayNightCycle)), ...options }
  GAME.gameState.dayNightCycle.currentTime = options.startTime || 0
}

function calculateCurrentTOD() {
  const cycle = GAME.gameState.dayNightCycle

  const totalLength = cycle.dayLength + cycle.nightLength + (cycle.transitionTime + cycle.transitionTime)
  const remainder = cycle.currentTime % totalLength

  if(remainder > cycle.dayLength + cycle.transitionTime + cycle.nightLength) {
    // console.log('sunrise', remainder)
    return 'sunrise'
  } if(remainder > cycle.dayLength + cycle.transitionTime) {
    // console.log('night', remainder)
    return 'night'
  } if(remainder > cycle.dayLength) {
    // console.log('sunset', remainder)
    return 'sunset'
  } else {
    // console.log('day', remainder)
    return 'day'
  }
}

function update(delta) {
  GAME.gameState.dayNightCycle.currentTime += delta
  const { dayAmbientLight, nightAmbientLight, transitionTime, ambientLightDelta } = GAME.gameState.dayNightCycle
  const newTOD = calculateCurrentTOD()
  const currentTOD = GAME.gameState.dayNightCycle.currentTOD

  if(ambientLightDelta) {
    if(GAME.gameState.ambientLight <= 1 && GAME.gameState.ambientLight >= 0) {
      GAME.gameState.ambientLight += (ambientLightDelta * delta)
    }
  }

  if(currentTOD === 'day' && newTOD === 'sunset') {
    // console.log('day -> sunset')
    const currentAmbientLight = GAME.gameState.ambientLight
    const goalAmbientLight = nightAmbientLight
    const ambientLightDelta = (goalAmbientLight - currentAmbientLight)/transitionTime
    GAME.gameState.dayNightCycle.ambientLightDelta = ambientLightDelta
  }

  if(currentTOD === 'sunset' && newTOD === 'night') {
    // console.log('sunset -> night')
    GAME.gameState.ambientLight = 0
    GAME.gameState.dayNightCycle.ambientLightDelta = null
  }

  if(currentTOD === 'night' && newTOD === 'sunrise') {
    // console.log('night -> sunrise')
    const currentAmbientLight = GAME.gameState.ambientLight
    const goalAmbientLight = dayAmbientLight
    const ambientLightDelta = (goalAmbientLight - currentAmbientLight)/transitionTime
    GAME.gameState.dayNightCycle.ambientLightDelta = ambientLightDelta
  }

  if(currentTOD === 'sunrise' && newTOD === 'day') {
    // console.log('sunrise -> day')
    GAME.gameState.ambientLight = 1
    GAME.gameState.dayNightCycle.ambientLightDelta = null
  }



  GAME.gameState.dayNightCycle.currentTOD = newTOD
}

export default {
  setDefault,
  onGameLoaded,
  update
}

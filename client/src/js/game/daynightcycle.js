function setDefault() {
  window.defaultDayNightCycle = {
    dayLength: 2,
    dayAmbientLight: 2,
    nightLength: 30,
    nightAmbientLight: 0,
    transitionTime: 6,
  }
}

function onGameLoaded(options = {}) {
  GAME.gameState.ambientLight = 1
  GAME.gameState.ambientLightDelta = null
  GAME.gameState.currentTime = options.startTime || 0
  GAME.gameState.currentTimeOfDay = ''
  GAME.world.dayNightCycle = { ...JSON.parse(JSON.stringify(window.defaultDayNightCycle)), ...options }
}

function calculateCurrentTOD() {
  const cycle = GAME.world.dayNightCycle
  const currentTime = GAME.gameState.currentTime

  const totalLength = cycle.dayLength + cycle.nightLength + (cycle.transitionTime + cycle.transitionTime)
  const remainder = currentTime % totalLength

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
  GAME.gameState.currentTime += delta
  const { dayAmbientLight, nightAmbientLight, transitionTime} = GAME.world.dayNightCycle
  const newTOD = calculateCurrentTOD()
  const currentTOD = GAME.gameState.currentTimeOfDay
  const ambientLightDelta = GAME.gameState.ambientLightDelta

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
    GAME.gameState.ambientLightDelta = ambientLightDelta
  }

  if(currentTOD === 'sunset' && newTOD === 'night') {
    // console.log('sunset -> night')
    GAME.gameState.ambientLight = 0
    GAME.gameState.ambientLightDelta = null
  }

  if(currentTOD === 'night' && newTOD === 'sunrise') {
    // console.log('night -> sunrise')
    const currentAmbientLight = GAME.gameState.ambientLight
    const goalAmbientLight = dayAmbientLight
    const ambientLightDelta = (goalAmbientLight - currentAmbientLight)/transitionTime
    GAME.gameState.ambientLightDelta = ambientLightDelta
  }

  if(currentTOD === 'sunrise' && newTOD === 'day') {
    // console.log('sunrise -> day')
    GAME.gameState.ambientLight = 1
    GAME.gameState.ambientLightDelta = null
  }

  GAME.gameState.currentTimeOfDay = newTOD
}

export default {
  setDefault,
  onGameLoaded,
  update
}

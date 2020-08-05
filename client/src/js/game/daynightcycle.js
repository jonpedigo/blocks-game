function setDefault() {
  window.defaultDayNightCycle = {
    dayLength: 2,
    dayAmbientLight: 1,
    nightLength: 30,
    nightAmbientLight: 0,
    transitionTime: 6,
    alwaysDay: false,
    alwaysNight: false,
    auto: false,
  }
}

function onGameLoaded(options = {}) {
  GAME.gameState.ambientLight = 1
  GAME.gameState.ambientLightDelta = null
  GAME.gameState.currentTime = options.startTime || 0
  GAME.gameState.currentTimeOfDay = ''
  if(!GAME.world.dayNightCycle) {
    GAME.world.dayNightCycle = { ...JSON.parse(JSON.stringify(window.defaultDayNightCycle)), ...options }
  }
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
  const cycle = GAME.world.dayNightCycle
  const { autoCycle, dayAmbientLight, nightAmbientLight, transitionTime } = GAME.world.dayNightCycle
  const currentTOD = GAME.gameState.currentTimeOfDay
  const ambientLightDelta = GAME.gameState.ambientLightDelta
  if (ambientLightDelta) {
    if (GAME.gameState.ambientLight <= dayAmbientLight && GAME.gameState.ambientLight >= nightAmbientLight) {
      GAME.gameState.ambientLight += (ambientLightDelta * delta)
    }
  }

  if(autoCycle) {
    const newTOD = calculateCurrentTOD()
    setTimeOfDay(currentTOD, newTOD)
  }
}

function setTimeOfDay(currentTOD, newTOD) {
  const { alwaysNight, alwaysDay, dayAmbientLight, nightAmbientLight, transitionTime } = GAME.world.dayNightCycle

  if (currentTOD === 'day' && newTOD === 'sunset') {
    // console.log('day -> sunset')
    const currentAmbientLight = GAME.gameState.ambientLight
    const goalAmbientLight = nightAmbientLight
    const ambientLightDelta = (goalAmbientLight - currentAmbientLight) / transitionTime
    GAME.gameState.ambientLightDelta = ambientLightDelta
  }

  if (newTOD === 'night' || alwaysNight) {
    // console.log('sunset -> night')
    GAME.gameState.ambientLight = nightAmbientLight
    GAME.gameState.ambientLightDelta = null
  }

  if (currentTOD === 'night' && newTOD === 'sunrise') {
    // console.log('night -> sunrise')
    const currentAmbientLight = GAME.gameState.ambientLight
    const goalAmbientLight = dayAmbientLight
    const ambientLightDelta = (goalAmbientLight - currentAmbientLight) / transitionTime
    GAME.gameState.ambientLightDelta = ambientLightDelta
  }

  if (newTOD === 'day' || alwaysDay) {
    // console.log('sunrise -> day')
    GAME.gameState.ambientLight = dayAmbientLight
    GAME.gameState.ambientLightDelta = null
  }

  GAME.gameState.currentTimeOfDay = newTOD
}

export default {
  setDefault,
  onGameLoaded,
  update
}

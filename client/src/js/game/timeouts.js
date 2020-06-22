function setDefault() {
  if(GAME.gameState) {
    GAME.gameState.timeouts = []
    GAME.gameState.timeoutsById = {}
  }
}

function onUpdate(delta) {
  GAME.gameState.timeouts = GAME.gameState.timeouts.filter((timeout) => {
    timeout.timeRemaining -= delta
    if(timeout.timeRemaining <= 0) {
      if(timeout.fx) timeout.fx()
      else console.log('timeout without fx...')
      return false
    }
    return true
  })
}

function addTimeout(id, numberOfSeconds, fx) {
  if(PAGE.role.isHost) {
    if(numberOfSeconds <= 0) {
      fx()
    } else {
      let timeout = {
        id,
        timeRemaining: numberOfSeconds,
        totalTime: numberOfSeconds,
        fx,
        resetTotal: 0,
      }
      GAME.gameState.timeouts.push(timeout)
      GAME.gameState.timeoutsById[id] = timeout
      return id
    }
  }
}

function addOrResetTimeout(id, numberOfSeconds, fx) {
  if(!GAME.gameState.timeoutsById[id] || (GAME.gameState.timeoutsById[id] && GAME.gameState.timeoutsById[id].timeRemaining <= 0)) {
    GAME.addTimeout(id, numberOfSeconds, fx)
  } else {
    GAME.resetTimeout(id, numberOfSeconds)
  }
}

function resetTimeout(id, numberOfSeconds) {
  GAME.gameState.timeoutsById[id].timeRemaining = numberOfSeconds
  GAME.gameState.timeoutsById[id].totalTime = numberOfSeconds
  GAME.gameState.timeoutsById[id].resetTotal++
}

function incrementTimeout(id, numberOfSeconds) {
  GAME.gameState.timeoutsById[id].timeRemaining+= numberOfSeconds
  GAME.gameState.timeoutsById[id].totalTime+= numberOfSeconds
}

function completeTimeout(id) {
  GAME.gameState.timeoutsById[id].timeRemaining = 0
}

export default {
  setDefault,
  onUpdate,
  addTimeout,
  completeTimeout,
  incrementTimeout,
  resetTimeout,
  addOrResetTimeout,
}

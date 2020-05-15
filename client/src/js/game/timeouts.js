function setDefault() {
  GAME.timeouts = []
  GAME.timeoutsById = {}
}

function onUpdate(delta) {
  GAME.timeouts = GAME.timeouts.filter((timeout) => {
    timeout.timeRemaining -= delta
    if(timeout.timeRemaining <= 0) {
      if(timeout.fx) timeout.fx()
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
      GAME.timeouts.push(timeout)
      GAME.timeoutsById[id] = timeout
    }
  }
}

function addOrResetTimeout(id, numberOfSeconds, fx) {

  if(!GAME.timeoutsById[id] || (GAME.timeoutsById[id] && GAME.timeoutsById[id].timeRemaining <= 0)) {
    GAME.addTimeout(id, numberOfSeconds, fx)
  } else {
    GAME.resetTimeout(id, numberOfSeconds)
  }
}

function resetTimeout(id, numberOfSeconds) {
  GAME.timeoutsById[id].timeRemaining = numberOfSeconds
  GAME.timeoutsById[id].totalTime = numberOfSeconds
  GAME.timeoutsById[id].resetTotal++
}

function incrementTimeout(id, numberOfSeconds) {
  GAME.timeoutsById[id].timeRemaining+= numberOfSeconds
  GAME.timeoutsById[id].totalTime+= numberOfSeconds
}

export default {
  setDefault,
  onUpdate,
  addTimeout,
  incrementTimeout,
  resetTimeout,
  addOrResetTimeout,
}

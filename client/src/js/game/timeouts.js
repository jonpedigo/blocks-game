function setDefault() {
  GAME.timeouts = []
  GAME.timeoutsById = {}
}

function update(delta) {
  GAME.timeouts = GAME.timeouts.filter((timeout) => {
    timeout.timeRemaining -= delta
    if(timeout.timeRemaining <= 0) {
      if(timeout.fx) timeout.fx()
      return false
    }
    return true
  })
}

window.addTimeout = function(id, numberOfSeconds, fx) {
  if(PAGE.role.isHost) {
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

window.addOrResetTimeout = function(id, numberOfSeconds, fx) {

  if(!GAME.timeoutsById[id] || (GAME.timeoutsById[id] && GAME.timeoutsById[id].timeRemaining <= 0)) {
    window.addTimeout(id, numberOfSeconds, fx)
  } else {
    window.resetTimeout(id, numberOfSeconds)
  }
}

window.resetTimeout = function(id, numberOfSeconds) {
  GAME.timeoutsById[id].timeRemaining = numberOfSeconds
  GAME.timeoutsById[id].totalTime = numberOfSeconds
  GAME.timeoutsById[id].resetTotal++
}

window.incrementTimeout = function(id, numberOfSeconds) {
  GAME.timeoutsById[id].timeRemaining+= numberOfSeconds
  GAME.timeoutsById[id].totalTime+= numberOfSeconds
}

export default {
  setDefault,
  update,
}

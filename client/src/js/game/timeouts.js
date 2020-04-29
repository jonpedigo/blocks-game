function setDefault() {
  window.timeouts = []
  window.timeoutsById = {}
}

function update(delta) {
  window.timeouts = window.timeouts.filter((timeout) => {
    timeout.timeRemaining -= delta
    if(timeout.timeRemaining <= 0) {
      if(timeout.fx) timeout.fx()
      return false
    }
    return true
  })
}

window.addTimeout = function(id, numberOfSeconds, fx) {
  if(role.isHost) {
    let timeout = {
      id,
      timeRemaining: numberOfSeconds,
      totalTime: numberOfSeconds,
      fx,
      resetTotal: 0,
    }
    window.timeouts.push(timeout)
    window.timeoutsById[id] = timeout
  }
}

window.addOrResetTimeout = function(id, numberOfSeconds, fx) {

  if(!window.timeoutsById[id] || (window.timeoutsById[id] && window.timeoutsById[id].timeRemaining <= 0)) {
    window.addTimeout(id, numberOfSeconds, fx)
  } else {
    window.resetTimeout(id, numberOfSeconds)
  }
}

window.resetTimeout = function(id, numberOfSeconds) {
  window.timeoutsById[id].timeRemaining = numberOfSeconds
  window.timeoutsById[id].totalTime = numberOfSeconds
  window.timeoutsById[id].resetTotal++
}

window.incrementTimeout = function(id, numberOfSeconds) {
  window.timeoutsById[id].timeRemaining+= numberOfSeconds
  window.timeoutsById[id].totalTime+= numberOfSeconds
}

export default {
  setDefault,
  update,
}

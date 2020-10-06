function check(agent, objects, onCollide = () => {}) {
  let illegal = false
  // Are they touching?
  for(let i = 0; i < objects.length; i++){
    const object = objects[i]
    if(object.mod().removed) continue
    if(agent.id === object.id) continue
    if(object.constructParts) {
      object.constructParts.forEach((part) => {
        checkObject(agent, part, () => {
          if(object.tags.obstacle) illegal = true
          if(onCollide) onCollide(object)
        })
      })
    } else {
      checkObject(agent, object, () => {
        if(object.tags.obstacle) illegal = true
        if(onCollide) onCollide(object)
      })
    }
  }

  return illegal
}

function checkAnything(agent, objects, onCollide = () => {}) {
  let illegal = false
  // Are they touching?
  for(let i = 0; i < objects.length; i++){
    const object = objects[i]
    if(object.mod().removed) continue
    if(agent.id === object.id) continue
    if(object.constructParts) {
      object.constructParts.forEach((part) => {
        checkObject(agent, part, () => {
          illegal = true
          if(onCollide) onCollide(object)
        })
      })
    } else {
      checkObject(agent, object, () => {
        illegal = true
        if(onCollide) onCollide(object)
      })
    }
  }

  return illegal
}

function checkObject(agent, object, onCollide) {
  if (
    agent.x < (object.x + object.width)
    && object.x < (agent.x + agent.width)
    && agent.y < (object.y + object.height)
    && object.y < (agent.y + agent.height)
  ) {
    if(onCollide) onCollide()
    return true
  }

  return false
}

export default {
  check,
  checkAnything,
  checkObject,
}

function check(agent, objects, onCollide = () => {}) {
  let illegal = false
  // Are they touching?
  for(let i = 0; i < objects.length; i++){
    if(objects[i].mod().removed) continue
    if(agent.id === objects[i].id) continue
    checkObject(agent, objects[i], () => {
      if(objects[i].tags.obstacle) illegal = true
      if(onCollide) onCollide(objects[i])
    })
  }

  return illegal
}

function checkAnything(agent, objects, onCollide = () => {}) {
  let illegal = false
  // Are they touching?
  for(let i = 0; i < objects.length; i++){
    if(objects[i].mod().removed) continue
    if(agent.id === objects[i].id) continue
    checkObject(agent, objects[i], () => {
      illegal = true
      if(onCollide) onCollide(objects[i])
    })
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

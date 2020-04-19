function check(agent, objects, onCollide) {
  let illegal = false
  // Are they touching?
  for(let i = 0; i < objects.length; i++){
    if(objects[i].removed) continue
    if(agent.id === objects[i].id) continue
    checkObject(agent, objects[i], () => {
      if(objects[i].tags.obstacle) illegal = true
      if(objects[i].onCollide) objects[i].onCollide()
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
    onCollide()
    return true
  }
}

function shouldEffect(agent, collider) {
  if(collider.idRequirement) {
    if(agent.id === collider.idRequirement) {
      return true
    } else {
      return false
    }
  } else if(collider.tagRequirements && collider.tagRequirements) {
    if(collider.needsAllTagRequirements) {
      if(collider.tagRequirements.all((requirement) => {
        return agent.tags[requirement]
      })) {
        return true
      } else return false
    } else {
      if(collider.tagRequirements.some((requirement) => {
        return agent.tags[requirement]
      })) {
        return true
      } else return false
    }
  }

  return true
}

export default {
  check,
  checkObject,
  shouldEffect
}

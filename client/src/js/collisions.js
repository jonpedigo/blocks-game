function check(agent, objects) {
  let illegal = false
  // Are they touching?
  for(let i = 0; i < objects.length; i++){
    if(agent.id === objects[i].id) continue
    checkObject(agent, objects[i], () => {
      if(objects[i].obstacle) illegal = true
      if(objects[i].onCollide) objects[i].onCollide()
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
  }
}

export default {
  check,
  checkObject,
}

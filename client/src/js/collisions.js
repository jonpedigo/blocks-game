function check(agent, objects) {
  let illegal = false
  // Are they touching?
  for(let i = 0; i < objects.length; i++){
    if(agent.name === objects[i].name) continue
    checkObject(agent, objects[i], () => {
      if(objects[i].obstacle) illegal = true
      if(objects[i].onCollide) objects[i].onCollide()
    })
  }

  return illegal
}

function checkObject(agent, object, onCollide) {
  if (
    agent._x < (object.x + object.width)
    && object.x < (agent._x + agent.width)
    && agent._y < (object.y + object.height)
    && object.y < (agent._y + agent.height)
  ) {
    onCollide()
  }
}

export default {
  check,
  checkObject,
}

export default function onObjectCollide(agent, collider, result) {
  if(agent.tags['monsterDestroyer'] && collider.tags['monster']) {
    collider._destroyedBy = agent
    if(collider.spawnPointX >= 0 && collider.tags['respawn']) {
      collider._respawn = true
    } else {
      collider._remove = true
    }
  }

  if(collider.tags['objectUpdate'] && collider.objectUpdate && shouldEffect(po.gameObject, collider)) {
    if(agent.lastHeroUpdateId !== collider.id) {
      window.mergeDeep(agent, {...collider.objectUpdate})
      agent.lastHeroUpdateId = collider.id
    }
  } else {
    agent.lastHeroUpdateId = null
  }

  if(agent.tags['monsterVictim'] && collider.tags['monster']) {
    agent._destroyedBy = collider
    if(agent.spawnPointX >= 0 && agent.tags['respawn']) {
      agent._respawn = true
    } else {
      agent._remove = true
    }
  }

  if(collider.tags && agent.tags && collider.tags['bullet'] && agent.tags['monster']) {
    agent._remove = true
    hero.score++
  }

  if(agent.tags && agent.tags['goomba'] && collider.tags && collider.tags['obstacle']) {
    if(result.overlap_x === 1 && agent.direction === 'right') {
      agent.direction = 'left'
    }
    if(result.overlap_x === -1 && agent.direction === 'left') {
      agent.direction = 'right'
    }
  }

  if(agent.tags && agent.tags['goombaSideways'] && collider.tags && collider.tags['obstacle']) {
    if(result.overlap_y === 1 && agent.direction === 'down') {
      agent.direction = 'up'
    }
    if(result.overlap_y === -1 && agent.direction === 'up') {
      agent.direction = 'down'
    }
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

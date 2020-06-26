export default function onObjectCollide(agent, collider, result) {
  if(agent.mod().tags['monsterDestroyer'] && collider.mod().tags['monster']) {
    collider._destroyedBy = agent
    if(collider.mod().spawnPointX >= 0 && collider.mod().tags['respawn']) {
      collider._respawn = true
    } else {
      collider._remove = true
    }
  }

  // if(collider.mod().tags['objectUpdate'] && collider.objectUpdate && shouldEffect(po.gameObject, collider)) {
  //   if(agent.lastHeroUpdateId !== collider.id) {
  //     window.mergeDeep(agent, {...collider.objectUpdate})
  //     agent.lastHeroUpdateId = collider.id
  //   }
  // } else {
  //   agent.lastHeroUpdateId = null
  // }

  if(agent.mod().tags['monsterVictim'] && collider.mod().tags['monster']) {
    agent._destroyedBy = collider
    if(agent.mod().spawnPointX >= 0 && agent.mod().tags['respawn']) {
      agent._respawn = true
    } else {
      agent._remove = true
    }
  }

  if(collider.tags && agent.tags && collider.mod().tags['bullet'] && agent.mod().tags['monster']) {
    agent._remove = true
    hero.score++
  }

  if(agent.tags && agent.mod().tags['goomba'] && collider.tags && collider.mod().tags['obstacle']) {
    if(result.overlap_x === 1 && agent.direction === 'right') {
      agent.direction = 'left'
    }
    if(result.overlap_x === -1 && agent.direction === 'left') {
      agent.direction = 'right'
    }
  }

  if(agent.tags && agent.mod().tags['goombaSideways'] && collider.tags && collider.mod().tags['obstacle']) {
    if(result.overlap_y === 1 && agent.direction === 'down') {
      agent.direction = 'up'
    }
    if(result.overlap_y === -1 && agent.direction === 'up') {
      agent.direction = 'down'
    }
  }
}
//
// function shouldEffect(agent, collider) {
//   if(collider.idRequirement) {
//     if(agent.id === collider.idRequirement) {
//       return true
//     } else {
//       return false
//     }
//   } else if(collider.tagRequirements && collider.tagRequirements) {
//     if(collider.needsAllTagRequirements) {
//       if(collider.tagRequirements.all((requirement) => {
//         return agent.mod().tags[requirement]
//       })) {
//         return true
//       } else return false
//     } else {
//       if(collider.tagRequirements.some((requirement) => {
//         return agent.mod().tags[requirement]
//       })) {
//         return true
//       } else return false
//     }
//   }
//
//   return true
// }

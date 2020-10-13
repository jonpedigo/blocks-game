export default function onObjectCollide(agent, collider, result) {
  if(agent.mod().tags['monsterDestroyer'] && collider.mod().tags['monster']) {
    collider._destroyedById = agent.id
    if(typeof collider.mod().spawnPointX == 'number' && collider.mod().tags['respawn']) {
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
    agent._destroyedById = collider.id
    if(typeof agent.mod().spawnPointX == 'number' && agent.mod().tags['respawn']) {
      agent._respawn = true
    } else {
      agent._remove = true
    }
  }

  if(collider.tags && agent.tags && collider.mod().tags['bullet'] && agent.mod().tags['monster']) {
    agent._remove = true
    hero.score++
  }

  if(agent.tags && agent.mod().tags['goomba'] && collider.tags && (collider.mod().tags['obstacle'] || collider.mod().tags['onlyHeroAllowed'])) {
    if(result.overlap_x === 1 && agent._goalDirection === 'right') {
      agent._goalDirection = 'left'
    }
    if(result.overlap_x === -1 && agent._goalDirection === 'left') {
      agent._goalDirection = 'right'
    }
  }

  if(agent.tags && agent.mod().tags['goombaSideways'] && collider.tags && (collider.mod().tags['obstacle'] || collider.mod().tags['onlyHeroAllowed'])) {
    if(result.overlap_y === 1 && agent._goalDirection === 'down') {
      agent._goalDirection = 'up'
    }
    if(result.overlap_y === -1 && agent._goalDirection === 'up') {
      agent._goalDirection = 'down'
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

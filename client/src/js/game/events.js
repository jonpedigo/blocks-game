import heroTool from './hero.js'

window.local.on('onHeroInteract', (hero, interactor, result, removeObjects, respawnObjects) => {
  onEffectHero(hero, interactor, result, removeObjects, respawnObjects, { fromInteractButton: true })

  /// DEFAULT GAME FX
  if(window.defaultCustomGame) {
    window.defaultCustomGame.onHeroInteract(hero, interactor, result, removeObjects, respawnObjects)
  }

  /// CUSTOM GAME FX
  if(window.customGame) {
    window.customGame.onHeroInteract(hero, interactor, result, removeObjects, respawnObjects)
  }

  /// LIVE CUSTOM GAME FX
  if(window.liveCustomGame) {
    window.liveCustomGame.onHeroInteract(hero, interactor, result, removeObjects, respawnObjects)
  }
})

window.local.on('onHeroCollide', (hero, collider, result, removeObjects, respawnObjects) => {
  if(collider.tags['requireActionButton']) return

  onEffectHero(hero, collider, result, removeObjects, respawnObjects, { fromInteractButton: false })

  /// DEFAULT GAME FX
  if(window.defaultCustomGame) {
    window.defaultCustomGame.onHeroCollide(hero, collider, result, removeObjects, respawnObjects)
  }

  /// CUSTOM GAME FX
  if(window.customGame) {
    window.customGame.onHeroCollide(hero, collider, result, removeObjects, respawnObjects)
  }

  /// LIVE CUSTOM GAME FX
  if(window.liveCustomGame) {
    window.liveCustomGame.onHeroCollide(hero, collider, result, removeObjects, respawnObjects)
  }
})

window.local.on('onObjectCollide', (agent, collider, result, removeObjects, respawnObjects) => {
  if(agent.tags['monsterDestroyer'] && collider.tags['monster']) {
    window.local.emit('onDestroyMonster', agent, collider, result, removeObjects, respawnObjects)
    if(collider.spawnPointX >= 0 && collider.tags['respawn']) {
      respawnObjects.push(collider)
    } else {
      removeObjects.push(collider)
    }
  }

  if(collider.tags['objectUpdate'] && collider.objectUpdate && shouldEffect(po.gameObject, collider)) {
    if(agent.lastPowerUpId !== collider.id) {
      window.mergeDeep(agent, {...collider.objectUpdate})
      agent.lastPowerUpId = collider.id
    }
  } else {
    agent.lastPowerUpId = null
  }

  if(agent.tags['victim'] && collider.tags['monster']) {
    window.local.emit('onMonsterDestroyVictim', agent, collider)
    if(agent.spawnPointX >= 0 && agent.tags['respawn']) {
      respawnObjects.push(agent)
    } else {
      removeObjects.push(agent)
    }
  }

  if(collider.tags && agent.tags && collider.tags['bullet'] && agent.tags['monster']) {
    removeObjects.push(agent)
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

  /// DEFAULT GAME FX
  if(window.defaultCustomGame) {
    window.defaultCustomGame.onCollide(agent, collider, result, removeObjects, respawnObjects)
  }

  /// CUSTOM GAME FX
  if(window.customGame) {
    window.customGame.onCollide(agent, collider, result, removeObjects, respawnObjects)
  }

  /// LIVE CUSTOM GAME FX
  if(window.liveCustomGame) {
    window.liveCustomGame.onCollide(agent, collider, result, removeObjects, respawnObjects)
  }
})

function onEffectHero(hero, collider, result, removeObjects, respawnObjects, options = { fromInteractButton: false }) {
  if(collider.tags && collider.tags['monster']) {
    // if(hero.tags['monsterDestroyer']) {
    //   window.local.emit('onHeroDestroyMonster', hero, collider, result, removeObjects, respawnObjects, options)
    //   if(collider.spawnPointX >= 0 && collider.tags['respawn']) {
    //     respawnObjects.push(collider)
    //   } else {
    //     removeObjects.push(collider)
    //   }
    // } else {
      // hero.lives--
      respawnObjects.push(hero)
    // }
  }

  if(collider.tags && collider.tags['coin']) {
    hero.score++
  }

  if(collider.tags && collider.tags['heroUpdate'] && collider.heroUpdate) {
    if(collider.id !== hero.lastPowerUpId) {
      heroUpdate(hero, collider)
      if(!options.fromInteractButton) hero.lastPowerUpId = collider.id
      window.addOrResetTimeout(hero.id+'.lastPowerUpId', 3, () => {
        hero.lastPowerUpId = null
      })
    }
  } else if(collider.ownerId !== hero.id){
    // if it collides with anything that it doesn't own..
    hero.lastPowerUpId = null
  }

  if(collider.tags && collider.tags.deleteAfter) {
    removeObjects.push(collider)
  }
}

function heroUpdate (hero, collider) {
  if(!hero.timeouts) hero.timeouts = {}
  if(!hero.updateHistory) {
    hero.updateHistory = []
  }
  let timeoutId = hero.id+collider.id
  if(collider.fromCompendiumId) {
    timeoutId = hero.id+collider.fromCompendiumId
  }

  if(collider.tags['revertAfterTimeout'] && window.timeoutsById[timeoutId] && window.timeoutsById[timeoutId].timeRemaining > 0) {
    if(collider.tags['incrementRevertTimeout']) {
      window.incrementTimeout(timeoutId, collider.powerUpTimer || 3)
    } else {
      window.resetTimeout(timeoutId, collider.powerUpTimer || 3)
    }
    return
  }

  // only have 5 edits in the history at a time
  if(hero.updateHistory.length >= 5) {
    hero.updateHistory.shift()
  }

  let heroUpdate = collider.heroUpdate
  let update = {
    update: heroUpdate,
    prev: {},
    id: collider.fromCompendiumId || collider.id,
  }
  for(var prop in heroUpdate) {
    if(prop == 'flags' || prop == 'tags') {
      let ags = heroUpdate[prop]
      update.prev[prop] = {}
      for(let ag in ags) {
        update.prev[prop][ag] = hero[prop][ag]
      }
    } else {
      update.prev[prop] = hero[prop]
    }
  }
  hero.updateHistory.push(update)

  window.mergeDeep(hero, JSON.parse(JSON.stringify(collider.heroUpdate)))
  if(heroUpdate.chat && collider.name) {
    hero.chatName = collider.name
  } else {
    hero.chatName = null
  }

  if(collider.tags['revertAfterTimeout']) {
    setRevertUpdateTimeout(timeoutId, hero, collider)
  }
}

function setRevertUpdateTimeout(id, hero, collider) {
  let timeoutFx = () => {
    hero.updateHistory = hero.updateHistory.filter((update) => {
      if(collider.fromCompendiumId) {
        if(collider.fromCompendiumId === update.id) {
          window.mergeDeep(hero, {...update.prev})
          return false
        }
      }

      if(collider.id === update.id) {
        window.mergeDeep(hero, {...update.prev})
        return false
      }

      return true
    })
  }

  window.addOrResetTimeout(id, collider.powerUpTimer || 3, timeoutFx)
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

export default function onEffectHero(hero, collider, result, removeObjects, respawnObjects, options = { fromInteractButton: false }) {

  if(collider.tags && collider.tags['monster']) {
    if(hero.tags['monsterDestroyer']) {
      window.local.emit('onHeroDestroyMonster', hero, collider, result, removeObjects, respawnObjects, options)
      if(collider.spawnPointX >= 0 && collider.tags['respawn']) {
        respawnObjects.push(collider)
      } else {
        removeObjects.push(collider)
      }
    } else {
      // hero.lives--
      respawnObjects.push(hero)
    }
  }

  if(collider.tags && collider.tags['coin']) {
    hero.score++
  }

  if(collider.tags && collider.tags['heroUpdate'] && collider.heroUpdate) {
    if(collider.id !== hero.lastPowerUpId) {
      heroUpdate(hero, collider)
      if(collider.tags['oneTimeUpdate']) collider.tags['heroUpdate'] = false
      if(!options.fromInteractButton) hero.lastPowerUpId = collider.id
      GAME.addOrResetTimeout(hero.id+'.lastPowerUpId', 3, () => {
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

  if(collider.tags['revertAfterTimeout'] && GAME.timeoutsById[timeoutId] && GAME.timeoutsById[timeoutId].timeRemaining > 0) {
    if(collider.tags['incrementRevertTimeout']) {
      GAME.incrementTimeout(timeoutId, collider.powerUpTimer || 3)
    } else {
      GAME.resetTimeout(timeoutId, collider.powerUpTimer || 3)
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

  GAME.addOrResetTimeout(id, collider.powerUpTimer || 3, timeoutFx)
}

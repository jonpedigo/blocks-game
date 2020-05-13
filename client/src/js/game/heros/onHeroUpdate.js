export default function onHeroUpdate(hero, collider, result, removeObjects, respawnObjects, options) {
  if(collider.tags && collider.tags['heroUpdate'] && collider.heroUpdate) {
    if(collider.id !== hero.lastHeroUpdateId) {
      heroUpdate(hero, collider, collider.heroUpdate)
      if(collider.tags['oneTimeHeroUpdate']) collider.tags['heroUpdate'] = false
      if(!options.fromInteractButton) hero.lastHeroUpdateId = collider.id
      GAME.addOrResetTimeout(hero.id+'.lastHeroUpdateId', 3, () => {
        hero.lastHeroUpdateId = null
      })
    }
  }
}

function heroUpdate (hero, collider, heroUpdate) {
  if(!hero.timeouts) hero.timeouts = {}
  if(!hero.updateHistory) {
    hero.updateHistory = []
  }
  let timeoutId = hero.id+collider.id
  if(collider.fromCompendiumId) {
    timeoutId = hero.id+collider.fromCompendiumId
  }

  if(collider.tags['revertHeroUpdateAfterTimeout'] && GAME.timeoutsById[timeoutId] && GAME.timeoutsById[timeoutId].timeRemaining > 0) {
    if(collider.tags['incrementRevertHeroUpdateTimeout']) {
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

  if(collider.tags['revertHeroUpdateAfterTimeout']) {
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

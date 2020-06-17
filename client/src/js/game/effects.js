import onTalk from './heros/onTalk'

function processEffect(effect, object, effector) {
  const { effectName, effectValue, mutationJSON } = effect
  if(effectName === 'mutate' && mutationJSON) {
    window.mergeDeep(object, mutationJSON)
  }

  // if(effectName === 'talkToHero' && hero) {
  //   onTalk(hero, owner)
  // }
  //
  // if(effectName === 'heroQuestStart' && hero) {
  //   startQuest(hero, effectValue)
  // }
  //
  // if(effectName === 'heroQuestComplete' && hero) {
  //   completeQuest(hero, effectValue)
  // }

  if(effectName === 'dialogue') {
    object.dialogue = effect.text
  }

  if(effectName === 'destroy') {
    object._destroyedBy = effector
    object._destroy = true
  }

  if(effectName === 'respawn') {
    OBJECTS.respawnObject(object)
  }
  if(effectName === 'remove') {
    OBJECTS.removeObject(object)
  }

  if(effectName === 'spawnTotalIncrement') {
    object.spawnTotal += effectValue || 1
  }

  //
  // if(effectName === 'spawnTotalRemove') {
  //   object.spawnTotal = -1
  // }

  if(effectName === 'spawnPoolIncrement') {
    object.spawnPool += effectValue || 1
    // object.spawnWait=false
    // if(object.spawnWaitTimerId) delete GAME.timeoutsById[object.spawnWaitTimerId]
  }

  if(effectName === 'tagAdd') {
    let tag = effectValue
    object.tags[tag] = false
  }

  if(effectName === 'tagRemove') {
    let tag = effectValue
    object.tags[tag] = true
  }

  if(effectName === 'tagToggle') {
    let tag = effectValue
    object.tags[tag] = !object.tags[tag]
  }
}

export default {
  processEffect
}
